import { getState, setState } from './state.js';
import { generateImage, PROVIDERS, base64ToBlobUrl } from './imageGenerator.js';
import { log } from './logger.js';
import { showToast } from '../main.js'; // Note: need to export showToast from main.js or move it

const LS_PRESET_KEY = 'yk_thumbnail_presets';

const DEFAULT_PRESETS = [
    {
        name: 'YouTube Clickbait Kids',
        style: 'bright colorful background, 4k resolution, hyper-detailed, 3d cartoon Pixar style, cinematic lighting, eye-catching text space'
    },
    {
        name: 'Zen Minimalist',
        style: 'clean minimalist background, soft natural lighting, pastel colors, peaceful atmosphere, high quality 3d render'
    },
    {
        name: 'Cinematic Epic',
        style: 'dramatic lighting, shallow depth of field, cinematic color grading, epic camera angle, 8k resolution octane render'
    }
];

let currentPresets = [];

export function initThumbnailStudio() {
    log.group('🍿 [Thumbnail] initThumbnailStudio');
    
    // Load presets
    loadPresets();
    
    // Bind UI events
    const $ = id => document.getElementById(id);
    
    $('btn-save-preset')?.addEventListener('click', savePreset);
    $('btn-delete-preset')?.addEventListener('click', deletePreset);
    $('thumbnail-preset-select')?.addEventListener('change', applyPreset);
    $('btn-generate-thumbnail')?.addEventListener('click', handleGenerateThumbnail);
    
    $('btn-download-thumbnail')?.addEventListener('click', () => {
        const state = getState();
        if (state.thumbnail) {
            const a = document.createElement('a');
            a.href = base64ToBlobUrl(state.thumbnail);
            a.download = `yogakids_thumbnail_${Date.now()}.png`;
            a.click();
        }
    });

    $('thumb-title')?.addEventListener('input', triggerThumbnailRender);
    $('thumb-tagline')?.addEventListener('input', triggerThumbnailRender);
    $('thumb-layout')?.addEventListener('change', triggerThumbnailRender);
    $('thumb-title-color')?.addEventListener('input', triggerThumbnailRender);
    $('thumb-title-stroke')?.addEventListener('input', triggerThumbnailRender);
    $('thumb-tagline-color')?.addEventListener('input', triggerThumbnailRender);
    $('thumb-font')?.addEventListener('change', triggerThumbnailRender);
    $('thumb-scale')?.addEventListener('input', triggerThumbnailRender);
    $('thumb-offset-x')?.addEventListener('input', triggerThumbnailRender);
    $('thumb-offset-y')?.addEventListener('input', triggerThumbnailRender);

    log.groupEnd();
}

/**
 * Renders the pose checkboxes based on the current parse script
 */
export function renderThumbnailPoseSelectors() {
    const state = getState();
    const container = document.getElementById('thumbnail-poses-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!state.parsedScript || !state.parsedScript.scenes || state.parsedScript.scenes.length === 0) {
        container.innerHTML = '<span class="text-tertiary" style="font-size: 0.8rem;">Chưa có kịch bản. Hãy quay lại bước Script.</span>';
        return;
    }
    
    state.parsedScript.scenes.forEach((scene, index) => {
        if (scene.type === 'pose') {
            const label = document.createElement('label');
            label.className = 'pose-checkbox-label';
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.gap = '8px';
            label.style.cursor = 'pointer';
            label.style.fontSize = '0.85rem';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = scene.name || `Pose ${index}`;
            checkbox.className = 'thumbnail-pose-cb';
            
            const text = document.createElement('span');
            text.textContent = scene.name || `Pose ${index}`;
            
            label.appendChild(checkbox);
            label.appendChild(text);
            container.appendChild(label);
        }
    });
}

function loadPresets() {
    try {
        const saved = localStorage.getItem(LS_PRESET_KEY);
        if (saved) {
            currentPresets = JSON.parse(saved);
        } else {
            currentPresets = [...DEFAULT_PRESETS];
            localStorage.setItem(LS_PRESET_KEY, JSON.stringify(currentPresets));
        }
    } catch (e) {
        log.error('Failed to load presets, using defaults', e);
        currentPresets = [...DEFAULT_PRESETS];
    }
    
    updatePresetDropdown();
}

function updatePresetDropdown() {
    const select = document.getElementById('thumbnail-preset-select');
    if (!select) return;
    
    // Keep the first option
    select.innerHTML = '<option value="">-- Mẫu tuỳ chỉnh --</option>';
    
    currentPresets.forEach((p, idx) => {
        const opt = document.createElement('option');
        opt.value = idx.toString();
        opt.textContent = p.name;
        select.appendChild(opt);
    });
}

function applyPreset() {
    const select = document.getElementById('thumbnail-preset-select');
    const idx = select.value;
    const textarea = document.getElementById('thumbnail-style');
    
    if (idx !== "" && currentPresets[idx]) {
        textarea.value = currentPresets[idx].style;
    } else {
        textarea.value = "";
    }
}

function savePreset() {
    const style = document.getElementById('thumbnail-style')?.value.trim();
    if (!style) {
        alert("Vui lòng nhập Phong cách (Style) trước khi lưu!");
        return;
    }
    
    const select = document.getElementById('thumbnail-preset-select');
    const currentIdx = select.value;
    
    if (currentIdx !== "" && currentPresets[currentIdx]) {
        // Update existing
        const name = prompt("Cập nhật Preset này? Nhập tên mới (hoặc giữ nguyên):", currentPresets[currentIdx].name);
        if (name) {
            currentPresets[currentIdx] = { name, style };
            savePresetsToStorage();
        }
    } else {
        // Create new
        const name = prompt("Tạo Preset mới. Nhập tên Preset:");
        if (name) {
            currentPresets.push({ name, style });
            savePresetsToStorage();
            select.value = (currentPresets.length - 1).toString();
        }
    }
}

function deletePreset() {
    const select = document.getElementById('thumbnail-preset-select');
    const currentIdx = select.value;
    if (currentIdx === "") return;
    
    if (confirm(`Bạn có chắc muốn xoá Preset "${currentPresets[currentIdx].name}"?`)) {
        currentPresets.splice(currentIdx, 1);
        savePresetsToStorage();
        select.value = "";
        document.getElementById('thumbnail-style').value = "";
    }
}

function savePresetsToStorage() {
    localStorage.setItem(LS_PRESET_KEY, JSON.stringify(currentPresets));
    updatePresetDropdown();
    // alert("Đã lưu Preset!");
}

async function handleGenerateThumbnail() {
    const state = getState();
    
    // Get checked poses
    const poseCheckboxes = document.querySelectorAll('.thumbnail-pose-cb:checked');
    const selectedPoses = Array.from(poseCheckboxes).map(cb => cb.value);
    
    if (selectedPoses.length === 0) {
        alert("⚠️ Hãy chọn ít nhất 1 Pose để tạo Thumbnail!");
        return;
    }
    
    // Get style
    const styleDesc = document.getElementById('thumbnail-style').value.trim();
    if (!styleDesc) {
        alert("⚠️ Hãy nhập Phong cách (hoặc chọn 1 Preset)!");
        return;
    }
    
    // Get Char & Env
    const charDesc = state.characterDescription || "";
    if (!charDesc) {
        alert("⚠️ Chưa có Mô tả Nhân vật. Hãy quay lại Bước 2.");
        return;
    }
    const envDesc = state.environment || "";
    
    // Build Prompt
    const poseString = selectedPoses.join(" and ");
    const fullPrompt = `${charDesc}. Environment: ${envDesc}. The character is beautifully posing: ${poseString}. STYLE: ${styleDesc}. Create a high quality YouTube thumbnail layout. Do NOT generate any text, letters, or words in the image. Keep it purely visual.`;
    
    // Get Settings
    const arOverride = document.getElementById('thumbnail-ar').value;
    const providerOverride = document.getElementById('thumbnail-provider').value;
    
    const activeProvider = providerOverride === "inherit" ? state.provider : providerOverride;
    
    // Model fallback logic (similar to main queue)
    let activeModel = "";
    if (providerOverride !== "inherit") {
        activeModel = Object.keys(PROVIDERS[activeProvider]?.models || {})[0] || "";
    } else {
        activeModel = state.imageModel;
    }
    
    // Get API Key
    let apiKey = state.apiKeys?.[activeProvider] || state.apiKey;
    if (!apiKey) {
        alert(`⚠️ Thiếu API Key cho provider: ${activeProvider}`);
        return;
    }
    
    // UI Loading state
    const btn = document.getElementById('btn-generate-thumbnail');
    const emptyState = document.getElementById('thumbnail-empty-state');
    const imgPreview = document.getElementById('thumbnail-preview-img');
    const btnDownload = document.getElementById('btn-download-thumbnail');
    
    btn.disabled = true;
    btn.innerHTML = '⏳ Đang tạo... (Có thể mất 30s)';
    emptyState.style.display = 'flex';
    emptyState.innerHTML = '<span class="empty-icon" style="animation: spin 2s linear infinite;">⏳</span><p>AI đang vẽ Thumbnail...</p>';
    imgPreview.style.display = 'none';
    btnDownload.style.display = 'none';
    
    log.info(`🎨 [Thumbnail] Generating with ${activeProvider}...`);
    log.debug(`Prompt:`, fullPrompt);
    
    try {
        const refs = [...(state.referenceImages || []), ...(state.envReferenceImages || [])];
        const result = await generateImage(
            fullPrompt,
            apiKey,
            {
                provider: activeProvider,
                model: activeModel,
                aspectRatio: arOverride || state.aspectRatio || '16:9',
                referenceImages: refs
            }
        );
        if (result && result.base64) {
            log.info(`✅ [Thumbnail] Image generated. Applying Text Overlay...`);
            
            // Reusable render function for live updates
            setState('thumbnailRawBase64', result.base64); // Store pristine AI image
            await triggerThumbnailRender();
            
            emptyState.style.display = 'none';
            btnDownload.style.display = 'inline-flex';
        } else {
            throw new Error("Không nhận được dữ liệu ảnh từ API");
        }
    } catch (err) {
        log.error(`❌ [Thumbnail] Error:`, err);
        emptyState.innerHTML = `<span class="empty-icon">❌</span><p style="color:var(--accent-danger)">Lỗi: ${err.message}</p>`;
    } finally {
        btn.disabled = false;
        btn.innerHTML = '✨ Generate Thumbnail';
    }
}

/**
 * Triggers re-render of canvas on top of existing raw AI base64 
 */
export async function triggerThumbnailRender() {
    const state = getState();
    if (!state.thumbnailRawBase64) return;
    
    const title = document.getElementById('thumb-title').value.trim();
    const tagline = document.getElementById('thumb-tagline').value.trim();
    const layout = document.getElementById('thumb-layout').value;
    const titleColor = document.getElementById('thumb-title-color').value;
    const titleStroke = document.getElementById('thumb-title-stroke').value;
    const taglineColor = document.getElementById('thumb-tagline-color').value;
    const font = document.getElementById('thumb-font')?.value || 'Montserrat';
    const fontScale = (parseFloat(document.getElementById('thumb-scale')?.value) || 100) / 100;
    const offsetX = parseFloat(document.getElementById('thumb-offset-x')?.value) || 0;
    const offsetY = parseFloat(document.getElementById('thumb-offset-y')?.value) || 0;

    const finalBase64 = await applyThumbnailOverlay(
        state.thumbnailRawBase64, 
        title, tagline, layout, 
        titleColor, titleStroke, taglineColor,
        font, fontScale, offsetX, offsetY
    );
    
    setState('thumbnail', finalBase64);
    const imgPreview = document.getElementById('thumbnail-preview-img');
    imgPreview.src = `data:image/png;base64,${finalBase64}`;
    imgPreview.style.display = 'block';
}

/**
 * Applies text overlays onto the AI generated base image using HTML5 Canvas
 */
async function applyThumbnailOverlay(base64Image, title, tagline, layout, titleColor='#ffffff', titleStroke='#000000', taglineColor='#fde047', font='Montserrat', floatScale=1, dx=0, dy=0) {
    if (layout === 'none' || (!title && !tagline)) return base64Image;

    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            
            // Draw base image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Base layout sizes relative to height 1080
            const scale = canvas.height / 1080;
            const offsetX = dx * scale;
            const offsetY = dy * scale;
            
            if (layout === 'left-dark') {
                // Draw dark gradient on the left
                const grad = ctx.createLinearGradient(0, 0, canvas.width * 0.6, 0);
                grad.addColorStop(0, 'rgba(0,0,0,0.85)');
                grad.addColorStop(0.5, 'rgba(0,0,0,0.5)');
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw Text
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                
                // Title
                if (title) {
                    ctx.font = `900 ${100 * scale * floatScale}px "${font}", "Segoe UI", sans-serif`;
                    ctx.fillStyle = titleColor;
                    ctx.shadowColor = titleStroke;
                    ctx.shadowBlur = 15;
                    ctx.fillText(title.toUpperCase(), 80 * scale + offsetX, canvas.height / 2 - (tagline ? 30*scale*floatScale : 0) + offsetY);
                }
                
                // Tagline
                if (tagline) {
                    ctx.font = `600 ${45 * scale * floatScale}px "${font}", "Segoe UI", sans-serif`;
                    ctx.fillStyle = taglineColor;
                    ctx.shadowBlur = 10;
                    ctx.fillText(tagline, 80 * scale + offsetX, canvas.height / 2 + (title ? 60*scale*floatScale : 0) + offsetY);
                }

            } else if (layout === 'center-pop') {
                // Centered text with big stroke
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Title
                if (title) {
                    ctx.font = `900 ${140 * scale * floatScale}px "${font}", "Segoe UI", sans-serif`;
                    ctx.lineWidth = 15 * scale * floatScale;
                    ctx.strokeStyle = titleStroke;
                    ctx.fillStyle = titleColor;
                    ctx.strokeText(title.toUpperCase(), canvas.width / 2 + offsetX, canvas.height / 2 - (tagline ? 40*scale*floatScale : 0) + offsetY);
                    ctx.fillText(title.toUpperCase(), canvas.width / 2 + offsetX, canvas.height / 2 - (tagline ? 40*scale*floatScale : 0) + offsetY);
                }
                
                // Tagline
                if (tagline) {
                    ctx.font = `700 ${60 * scale * floatScale}px "${font}", "Segoe UI", sans-serif`;
                    ctx.lineWidth = 10 * scale * floatScale;
                    ctx.strokeStyle = titleStroke;
                    ctx.fillStyle = taglineColor;
                    ctx.strokeText(tagline, canvas.width / 2 + offsetX, canvas.height / 2 + (title ? 80*scale*floatScale : 0) + offsetY);
                    ctx.fillText(tagline, canvas.width / 2 + offsetX, canvas.height / 2 + (title ? 80*scale*floatScale : 0) + offsetY);
                }

            } else if (layout === 'bottom-bar') {
                // Bottom Solid Bar
                const barHeight = 180 * scale;
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);
                
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Title
                if (title) {
                    ctx.font = `800 ${65 * scale * floatScale}px "${font}", "Segoe UI", sans-serif`;
                    ctx.fillStyle = titleColor;
                    ctx.fillText(title.toUpperCase(), canvas.width / 2 + offsetX, canvas.height - barHeight + 70*scale + offsetY);
                }
                
                // Tagline
                if (tagline) {
                    ctx.font = `500 ${35 * scale * floatScale}px "${font}", "Segoe UI", sans-serif`;
                    ctx.fillStyle = taglineColor;
                    ctx.fillText(tagline, canvas.width / 2 + offsetX, canvas.height - barHeight + 130*scale + offsetY);
                }
            }
            
            // Export base64 (remove data prefix since state stores raw base64 usually)
            const finalDataUri = canvas.toDataURL('image/png');
            resolve(finalDataUri.split(',')[1]);
        };
        img.src = `data:image/png;base64,${base64Image}`;
    });
}
