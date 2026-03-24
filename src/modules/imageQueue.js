/**
 * IMAGE QUEUE — Sequential Image Generation Manager
 * 
 * Đảm bảo các request generate ảnh chạy tuần tự (1 lần 1 request),
 * không bị spam, có thể cancel, và có progress tracking.
 * 
 * Cơ chế hoạt động:
 * - Tất cả request generate ảnh đều push vào queue
 * - Queue tự động xử lý tuần tự từng item
 * - Nếu đang generate mà bấm thêm, request sẽ xếp hàng
 * - Có thể cancel toàn bộ queue hoặc từng item
 * - Tự động rate-limit giữa các request
 */

import { generateSceneImages } from './imageGenerator.js';
import { log } from './logger.js';

// ============================================================
// QUEUE STATE
// ============================================================

/** @typedef {'pending'|'generating'|'done'|'error'|'cancelled'} QueueItemStatus */

/**
 * @typedef {Object} QueueItem
 * @property {string} id - Unique ID
 * @property {number} sceneIndex - Scene index
 * @property {string} sceneName - Scene name for display
 * @property {Object} framePrompt - The frame prompt object
 * @property {Object} options - Generation options (provider, model, etc.)
 * @property {QueueItemStatus} status
 * @property {Object|null} result - Generated images result
 * @property {string|null} error - Error message if failed
 * @property {number} retryCount - Number of retries attempted
 */

const queue = [];
let isProcessing = false;
let isCancelled = false;
let currentAbortController = null;

// Config
const CONFIG = {
    delayBetweenScenes: 2500,    // ms giữa mỗi scene (bao gồm cả start+end)
    delayBetweenFrames: 1500,    // ms giữa start frame và end frame (trong generateSceneImages)
    maxRetries: 2,               // Số lần retry khi lỗi
    retryDelay: 5000,            // ms chờ trước khi retry
};

// Callbacks
let onProgressCallback = null;
let onItemCompleteCallback = null;
let onItemErrorCallback = null;
let onQueueCompleteCallback = null;
let onQueueStartCallback = null;

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Thêm 1 scene vào queue để generate
 */
export function enqueue(sceneIndex, sceneName, framePrompt, options = {}) {
    // Kiểm tra xem scene này đã có trong queue pending chưa
    const existing = queue.find(
        item => item.sceneIndex === sceneIndex &&
            (item.status === 'pending' || item.status === 'generating')
    );
    if (existing) {
        log.debug(`📦 [Queue] Scene #${sceneIndex} "${sceneName}" already in queue (status: ${existing.status}), skipping`);
        return existing.id;
    }

    const id = `gen_${sceneIndex}_${Date.now()}`;
    const item = {
        id,
        sceneIndex,
        sceneName,
        framePrompt,
        options,
        status: 'pending',
        result: null,
        error: null,
        retryCount: 0,
    };

    queue.push(item);
    log.debug(`➕ [Queue] Enqueued: #${sceneIndex} "${sceneName}" (${id}). Queue pending: ${getPendingCount()}, total: ${queue.length}`);

    // Tự động bắt đầu xử lý nếu chưa đang chạy
    if (!isProcessing) {
        processQueue();
    }

    return id;
}

/**
 * Thêm nhiều scene cùng lúc (cho "Generate All")
 */
export function enqueueAll(framePrompts, options = {}) {
    // Clear any previous pending items
    clearPending();

    const ids = [];
    for (const fp of framePrompts) {
        const id = enqueue(fp.sceneIndex, fp.sceneName, fp, options);
        ids.push(id);
    }

    log.debug(`➕ [Queue] Enqueued ${ids.length} scenes for bulk generation. Queue total: ${queue.length}`);
    return ids;
}

/**
 * Cancel toàn bộ queue
 */
export function cancelAll() {
    log.warn('🚫 [Queue] Cancelling all pending items...');
    isCancelled = true;

    // Abort current request if possible
    if (currentAbortController) {
        currentAbortController.abort();
    }

    // Mark all pending items as cancelled
    for (const item of queue) {
        if (item.status === 'pending') {
            item.status = 'cancelled';
        }
    }
    const cancelledCount = queue.filter(i => i.status === 'cancelled').length;
    log.warn(`🚫 [Queue] Cancelled ${cancelledCount} items`);
}

/**
 * Cancel 1 scene cụ thể (nếu đang pending)
 */
export function cancelItem(sceneIndex) {
    const item = queue.find(
        i => i.sceneIndex === sceneIndex && i.status === 'pending'
    );
    if (item) {
        item.status = 'cancelled';
        log.debug(`[Queue] Cancelled: ${item.sceneName}`);
        return true;
    }
    return false;
}

/**
 * Xóa tất cả item pending khỏi queue
 */
export function clearPending() {
    for (let i = queue.length - 1; i >= 0; i--) {
        if (queue[i].status === 'pending' || queue[i].status === 'cancelled') {
            queue.splice(i, 1);
        }
    }
}

/**
 * Xóa toàn bộ queue (reset)
 */
export function clearAll() {
    cancelAll();
    queue.length = 0;
    isProcessing = false;
    isCancelled = false;
}

/**
 * Lấy trạng thái queue
 */
export function getQueueStatus() {
    return {
        isProcessing,
        isCancelled,
        total: queue.length,
        pending: getPendingCount(),
        generating: queue.filter(i => i.status === 'generating').length,
        done: queue.filter(i => i.status === 'done').length,
        error: queue.filter(i => i.status === 'error').length,
        cancelled: queue.filter(i => i.status === 'cancelled').length,
        items: [...queue],
    };
}

/**
 * Kiểm tra xem đang generate không
 */
export function isQueueProcessing() {
    return isProcessing;
}

/**
 * Lấy item đang generating hiện tại
 */
export function getCurrentItem() {
    return queue.find(i => i.status === 'generating') || null;
}

// ============================================================
// CALLBACKS REGISTRATION
// ============================================================

/**
 * Register callbacks for queue events
 * @param {Object} callbacks
 * @param {Function} callbacks.onProgress - (completedCount, totalCount, currentItem) => void
 * @param {Function} callbacks.onItemComplete - (item, result) => void
 * @param {Function} callbacks.onItemPartial - (item, partialResult) => void
 * @param {Function} callbacks.onItemError - (item, error) => void
 * @param {Function} callbacks.onQueueComplete - (stats) => void
 * @param {Function} callbacks.onQueueStart - (totalCount) => void
 */
export function setCallbacks(callbacks = {}) {
    onProgressCallback = callbacks.onProgress || null;
    onItemCompleteCallback = callbacks.onItemComplete || null;
    onItemPartialCallback = callbacks.onItemPartial || null;
    onItemErrorCallback = callbacks.onItemError || null;
    onQueueCompleteCallback = callbacks.onQueueComplete || null;
    onQueueStartCallback = callbacks.onQueueStart || null;
}

/**
 * Update config
 */
export function setConfig(newConfig = {}) {
    Object.assign(CONFIG, newConfig);
}

// ============================================================
// QUEUE PROCESSOR (PRIVATE)
// ============================================================

async function processQueue() {
    if (isProcessing) {
        log.debug('[Queue] Already processing, skip');
        return;
    }

    isProcessing = true;
    isCancelled = false;

    const totalAtStart = getPendingCount() + getGeneratingCount();
    let completed = 0;

    log.group(`📦 [Queue] Starting processing. ${totalAtStart} items in queue.`);
    log.time('⏱️ Queue total processing');

    if (onQueueStartCallback) {
        onQueueStartCallback(totalAtStart);
    }

    while (true) {
        // Tìm item pending tiếp theo
        const nextItem = queue.find(i => i.status === 'pending');
        if (!nextItem || isCancelled) break;

        // Mark as generating
        nextItem.status = 'generating';
        log.group(`🎨 [Queue] Processing item ${completed + 1}/${totalAtStart}: "${nextItem.sceneName}" (scene #${nextItem.sceneIndex})`);
        log.time(`⏱️ Queue item "${nextItem.sceneName}"`);

        // Notify progress
        if (onProgressCallback) {
            onProgressCallback(completed, totalAtStart, nextItem);
        }

        try {
            const result = await generateSceneImages(
                nextItem.framePrompt,
                nextItem.options.apiKey,
                nextItem.options,
                (partialResult) => {
                    // Update intermediate result
                    nextItem.result = { ...nextItem.result, ...partialResult };
                    if (options && typeof options.onItemPartial === 'function') {
                        options.onItemPartial(nextItem, partialResult);
                    } else if (onItemPartialCallback) {
                        onItemPartialCallback(nextItem, partialResult);
                    }
                }
            );

            if (isCancelled) {
                nextItem.status = 'cancelled';
                break;
            }

            nextItem.status = 'done';
            nextItem.result = result;
            completed++;

            log.debug(`✅ [Queue] Done: "${nextItem.sceneName}" — start: ${result.start?.base64 ? Math.round(result.start.base64.length / 1024) + 'KB' : 'N/A'}, end: ${result.end?.base64 ? Math.round(result.end.base64.length / 1024) + 'KB' : 'N/A'}`);
            log.timeEnd(`⏱️ Queue item "${nextItem.sceneName}"`);
            log.groupEnd();

            if (onItemCompleteCallback) {
                onItemCompleteCallback(nextItem, result);
            }

        } catch (err) {
            if (isCancelled) {
                nextItem.status = 'cancelled';
                break;
            }

            log.error(`❌ [Queue] Error for "${nextItem.sceneName}":`, err.message);
            log.error(`❌ [Queue] Full error:`, err);

            // Retry logic
            if (nextItem.retryCount < CONFIG.maxRetries) {
                nextItem.retryCount++;
                nextItem.status = 'pending';
                log.warn(`🔄 [Queue] Retrying "${nextItem.sceneName}" (attempt ${nextItem.retryCount}/${CONFIG.maxRetries}) after ${CONFIG.retryDelay}ms delay...`);
                log.timeEnd(`⏱️ Queue item "${nextItem.sceneName}"`);
                log.groupEnd();
                await sleep(CONFIG.retryDelay);
                continue;
            }

            nextItem.status = 'error';
            nextItem.error = err.message;
            completed++;
            log.timeEnd(`⏱️ Queue item "${nextItem.sceneName}"`);
            log.groupEnd();

            if (onItemErrorCallback) {
                onItemErrorCallback(nextItem, err);
            }
        }

        // Rate-limit delay between scenes
        const hasMore = queue.some(i => i.status === 'pending');
        if (hasMore && !isCancelled) {
            log.debug(`⏳ [Queue] Rate-limit delay: ${CONFIG.delayBetweenScenes}ms before next scene...`);
            await sleep(CONFIG.delayBetweenScenes);
        }
    }

    isProcessing = false;

    // Final stats
    const stats = getQueueStatus();
    log.debug(`\n🏁 [Queue] Processing complete:`);
    log.debug(`   ✅ Done: ${stats.done} | ❌ Error: ${stats.error} | 🚫 Cancelled: ${stats.cancelled} | ⏳ Pending: ${stats.pending}`);
    log.timeEnd('⏱️ Queue total processing');
    log.groupEnd();

    if (onQueueCompleteCallback) {
        onQueueCompleteCallback(stats);
    }
}

// ============================================================
// HELPERS
// ============================================================

function getPendingCount() {
    return queue.filter(i => i.status === 'pending').length;
}

function getGeneratingCount() {
    return queue.filter(i => i.status === 'generating').length;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
