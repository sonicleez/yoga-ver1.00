/**
 * IMAGE GENERATOR — Multi-Provider Support
 *
 * Provider 1: Google AI Direct (generativelanguage.googleapis.com)
 *   - Model: gemini-3.1-flash-image-preview
 *   - Auth: API key in URL param
 *   - Response: inline base64 image
 *
 * Provider 2: Vertex Key (vertex-key.com)
 *   - Models: gemini-image-1k/2k/4k, gemini-3.1-flash-image-*
 *   - Auth: Bearer token (vai-...)
 *   - Endpoint: /api/v1/images/generations
 *   - Response: url or b64_json
 *   - Also: /api/v1/chat/completions for AI analysis
 *
 * Provider 3: Google Vertex (via @google/genai SDK)
 *   - Uses official Google GenAI SDK
 *   - Models: gemini-3-pro-image-preview, gemini-3.1-flash-image-preview
 *   - Auth: Google AI Studio API Key (AIzaSy...)
 *   - Response: inline base64 image
 */

import { log } from './logger.js';
import { GoogleGenAI } from '@google/genai';

// ============================================================
// API ROUTING (via proxy)
// Dev: Vite proxy handles /api/* → external APIs
// Prod: Vercel serverless functions handle /api/* → external APIs
// ============================================================

const GOOGLE_AI_BASE = '/api/google-ai/v1beta/models';
const VERTEX_KEY_BASE = '/api/vertex-key/api/v1';
const GOMMO_BASE = '/api/gommo';

// ============================================================
// PROVIDER DEFINITIONS
// ============================================================

export const PROVIDERS = {
    'google-ai': {
        name: 'Google AI Direct',
        description: 'Google Generative AI API trực tiếp',
        keyPrefix: 'AIza',
        keyPlaceholder: 'AIzaSy...',
        models: {
            'gemini-3.1-flash-image-preview': {
                name: 'Gemini 3.1 Flash Image Preview',
                resolution: 'Auto',
                price: 'Free tier / Pay-as-you-go',
            },
        },
    },
    'vertex-key': {
        name: 'Vertex Key',
        description: 'Vertex Key API Gateway (vertex-key.com)',
        keyPrefix: 'vai-',
        keyPlaceholder: 'vai-your-api-key-here',
        models: {
            'max/gemini-3.1-image-1k': {
                name: 'Max Gemini 3.1 Image 1K',
                resolution: '1408×768',
                price: '$0.49/req',
            },
            'max/gemini-3.1-image-2k': {
                name: 'Max Gemini 3.1 Image 2K ⭐',
                resolution: '2816×1536',
                price: '$0.65/req',
            },
            'max/gemini-3.1-image-4k': {
                name: 'Max Gemini 3.1 Image 4K',
                resolution: '5632×3072',
                price: '$0.81/req',
            },
            'max/nano-banana-2-2k': {
                name: 'Max Nano Banana 2 (2K)',
                resolution: '2816×1536',
                price: '$0.81/req',
            },
            'gemini-image-2k': {
                name: 'Gemini Image Preview 2K (Stnd)',
                resolution: '2816×1536',
                price: '$0.45/req',
            },
            'gemini-2.5-flash-image': {
                name: 'Gemini 2.5 Flash Image',
                resolution: '1024×1024',
                price: '$0.25/req',
                fast: true,
            },
            'gemini-3.1-flash-image-1k': {
                name: 'Gemini 3.1 Flash Image 1K ⚡',
                resolution: '1408×768',
                price: '$0.40/req',
                fast: true,
            },
            'gemini-3.1-flash-image-2k': {
                name: 'Gemini 3.1 Flash Image 2K ⚡',
                resolution: '2816×1536',
                price: '$0.55/req',
                fast: true,
            },
        },
    },
    'gommo': {
        name: 'Gommo AI (Google Nano)',
        description: 'Gommo API cho Google Nano Banana, Z-Image, Kling',
        keyPrefix: '',
        keyPlaceholder: 'domain.net|access_token',
        models: {
            'google_nano_banana_pro': {
                name: 'Google Nano Banana Pro ⭐',
                resolution: '1K',
                price: '1 credit',
                recommended: true,
            },
            'google_nano_banana_2': {
                name: 'Google Nano Banana 2',
                resolution: '1K',
                price: '1 credit',
            },
            'z-image': {
                name: 'Z-Image',
                resolution: '1K',
                price: '1 credit',
            },
            'kling-o1': {
                name: 'Kling O1',
                resolution: '1K',
                price: '1 credit',
            },
        },
    },
<<<<<<< HEAD
    'vertex-ai': {
        name: 'Google Vertex AI (NanoBanana)',
        description: 'Google AI Studio key → Gemini image models via @google/genai SDK',
        keyPrefix: 'AIza',
        keyPlaceholder: 'AIzaSy... (Google AI Studio key)',
        models: {
            'gemini-3-pro-image-preview': {
                name: 'Nano Banana Pro ⭐ (Gemini 3 Pro)',
=======
    'google-vertex': {
        name: 'Google Vertex AI (SDK)',
        description: 'Google GenAI SDK trực tiếp - hỗ trợ reference images',
        keyPrefix: 'AIza',
        keyPlaceholder: 'AIzaSy...',
        models: {
            'gemini-3-pro-image-preview': {
                name: 'Gemini 3 Pro Image (Nano Banana Pro) ⭐',
>>>>>>> 92db139 (feat(provider): add Google Vertex AI provider using @google/genai SDK)
                resolution: 'Auto',
                price: 'Pay-as-you-go',
                recommended: true,
            },
            'gemini-3.1-flash-image-preview': {
<<<<<<< HEAD
                name: 'Nano Banana 2 (Gemini 3.1 Flash)',
=======
                name: 'Gemini 3.1 Flash Image (Nano Banana 2)',
>>>>>>> 92db139 (feat(provider): add Google Vertex AI provider using @google/genai SDK)
                resolution: 'Auto',
                price: 'Pay-as-you-go',
            },
        },
    },
};

// Vertex Key analysis models (for AI-enhanced prompts)
export const ANALYSIS_MODELS = {
    'flash/claude-sonnet-4-6': {
        name: 'Claude Sonnet 4.6 ⚡',
        provider: 'Anthropic',
        price: '$3/$15 per 1M',
    },
    'gem/gemini-3.1-pro-preview': {
        name: 'Gemini 3.1 Pro ⭐',
        provider: 'Google',
        price: '$3/$18 per 1M',
    },
    'gem/gemini-3-flash-nothinking': {
        name: 'Gemini 3 Flash (Fast)',
        provider: 'Google',
        price: '$1/$6 per 1M',
        cheap: true,
    },
};

// ============================================================
// MAIN: Generate Image (routes to correct provider)
// ============================================================

/**
 * @param {string} prompt 
 * @param {string} apiKey
 * @param {Object} options - { provider, model, aspectRatio, imageSize, referenceImages }
 * @returns {Promise<{base64: string|null, blobUrl: string, imageUrl: string|null}>}
 */
export async function generateImage(prompt, apiKey, options = {}) {
    const provider = options.provider || detectProvider(apiKey);
    log.debug(`🖼️ [ImageGen] generateImage() → Provider: ${provider}, Model: ${options.model || 'default'}`);
    log.debug(`🖼️ [ImageGen] Prompt (${prompt.length} chars): "${prompt.substring(0, 100)}..."`);
    if (options.referenceImages?.length) {
        log.debug(`🖼️ [ImageGen] Reference images: ${options.referenceImages.length} provided`);
    }

    if (provider === 'vertex-key') {
        return generateImageVertexKey(prompt, apiKey, options);
    } else if (provider === 'gommo') {
        return generateImageGommo(prompt, apiKey, options);
<<<<<<< HEAD
    } else if (provider === 'vertex-ai') {
        return generateImageVertexAI(prompt, apiKey, options);
=======
    } else if (provider === 'google-vertex') {
        return generateImageGoogleVertex(prompt, apiKey, options);
>>>>>>> 92db139 (feat(provider): add Google Vertex AI provider using @google/genai SDK)
    }
    return generateImageGoogleAI(prompt, apiKey, options);
}

/**
 * Verify API key for a provider
 */
export async function verifyApiKey(apiKey, provider = null) {
    const prov = provider || detectProvider(apiKey);

    if (prov === 'gommo') {
        log.debug('🔍 [Verify] Gommo API Key...');
        let domain = '10xyoutube.net';
        let token = apiKey;
        if (apiKey.includes('|')) {
            const parts = apiKey.split('|');
            domain = parts[0];
            token = parts.slice(1).join('|');
        }

        const body = new URLSearchParams();
        body.append('access_token', token);
        body.append('domain', domain);

        try {
            const res = await fetch(`${GOMMO_BASE}/api/apps/go-mmo/ai/me`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body.toString()
            });
            const data = await res.json();

            if (!res.ok || data.error || !data.userInfo) {
                let errStr = data.message || data.error || 'Failed to authenticate';
                return { valid: false, message: `Gommo Error: ${errStr}` };
            }

            const aiC = data.balancesInfo?.credits_ai ?? 0;
            return { valid: true, message: `Success! Balance: ${aiC.toLocaleString()} AI credits` };
        } catch (err) {
            return { valid: false, message: `Request Error: ${err.message}` };
        }
    }

    // For Vertex Key and Google AI, no direct balance check endpoint implemented yet
    if (prov === 'vertex-key' || prov === 'vertex-ai') {
        return { valid: true, message: 'Google/Vertex APIs do not support direct balance check yet. Assume valid.' };
    }

    return { valid: true, message: 'API key format valid. Try generating.' };
}

/**
 * Auto-detect provider from API key format
 * vertex-ai: AIzaSy... key — explicitly selected by user (same format as google-ai but routed via SDK)
 * google-ai: AIzaSy... key — default if provider not forced
 * vertex-key: vai-... key
 * gommo: domain|accessToken
 */
function detectProvider(apiKey) {
    if (apiKey.includes('|')) return 'gommo';
    if (apiKey.startsWith('vai-')) return 'vertex-key';
    if (apiKey.startsWith('AQ.')) return 'vertex-ai';
    // AIzaSy keys default to google-ai; vertex-ai must be explicitly selected via options.provider
    return 'google-ai';
}

// ============================================================
// PROVIDER 1: Google AI Direct
// ============================================================

async function generateImageGoogleAI(prompt, apiKey, options = {}) {
    const {
        model = 'gemini-3.1-flash-image-preview',
        aspectRatio = '16:9',
        imageSize = '2K',
        referenceImages = [],
    } = options;

    log.group(`🌐 [GoogleAI] generateImageGoogleAI()`);
    log.debug(`📋 Model: ${model} | AR: ${aspectRatio} | Size: ${imageSize}`);
    log.debug(`📎 Reference images: ${referenceImages.length}`);
    log.time('⏱️ GoogleAI API call');

    const API_BASE = GOOGLE_AI_BASE;

    // Build parts
    const parts = [{ text: prompt }];
    for (const refImg of referenceImages) {
        parts.push({
            inline_data: { mime_type: 'image/png', data: refImg },
        });
    }

    const body = {
        contents: [{ parts }],
        generationConfig: {
            responseModalities: ['IMAGE'],
        },
    };

    if (aspectRatio || imageSize) {
        body.generationConfig.imageConfig = {};
        if (aspectRatio) body.generationConfig.imageConfig.aspectRatio = aspectRatio;
        if (imageSize) body.generationConfig.imageConfig.imageSize = imageSize;
    }

    const url = `${API_BASE}/${model}:generateContent`;
    log.debug(`🔗 [GoogleAI] URL: ${url} (key=***)`);
    const bodyStr = JSON.stringify(body);
    log.info(`📦 [GoogleAI] Request body size: ${Math.round(bodyStr.length / 1024)}KB`);
    const fetchStart = Date.now();

    const response = await fetch(`${API_BASE}/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr,
    });
    log.info(`📡 [GoogleAI] Fetch completed in ${((Date.now() - fetchStart) / 1000).toFixed(1)}s → status: ${response.status}`);

    log.debug(`📡 [GoogleAI] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
        log.error(`❌ [GoogleAI] Error response... parsing error:`);
        log.timeEnd('⏱️ GoogleAI API call');
        log.groupEnd();
        let errorData = {};
        try {
            errorData = await response.json();
        } catch (e) {}
        
        const errorMsg = errorData?.error?.message || `Google AI error: HTTP ${response.status} ${response.statusText}`;
        throw new Error(errorMsg);
    }

    const data = await response.json();
    const candidates = data.candidates || [];
    if (candidates.length === 0) {
        log.error('❌ [GoogleAI] No candidates in response');
        log.timeEnd('⏱️ GoogleAI API call');
        log.groupEnd();
        throw new Error('No image generated');
    }

    const partsOut = candidates[0].content?.parts || [];
    const imagePart = partsOut.find(p => p.inlineData);
    if (!imagePart) {
        const textPart = partsOut.find(p => p.text);
        log.error('❌ [GoogleAI] No image part found, text response:', textPart?.text);
        log.timeEnd('⏱️ GoogleAI API call');
        log.groupEnd();
        throw new Error(textPart?.text || 'No image in response');
    }

    const base64 = imagePart.inlineData.data;
    log.debug(`✅ [GoogleAI] Image received: ${Math.round(base64.length / 1024)}KB base64`);
    log.timeEnd('⏱️ GoogleAI API call');
    log.groupEnd();
    return { base64, blobUrl: base64ToBlobUrl(base64), imageUrl: null };
}

// ============================================================
<<<<<<< HEAD
// PROVIDER 1b: Google Vertex AI (via @google/genai SDK)
// Same key as Google AI (AIzaSy...) but uses SDK + supports
// reference images as inline parts (multi-reference identity lock)
// ============================================================

async function generateImageVertexAI(prompt, apiKey, options = {}) {
=======
// PROVIDER 4: Google Vertex AI (via @google/genai SDK)
// ============================================================

/**
 * Retry wrapper for transient API errors (500, 503, 429)
 */
async function withRetry(fn, operationName, maxRetries = 2) {
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            const errorMessage = String(error?.message || error).toLowerCase();

            // Policy violations should NOT be retried
            const isPolicyViolation =
                errorMessage.includes('policy') ||
                errorMessage.includes('safety') ||
                errorMessage.includes('blocked') ||
                errorMessage.includes('harmful') ||
                errorMessage.includes('inappropriate') ||
                errorMessage.includes('prohibited') ||
                errorMessage.includes('violation') ||
                errorMessage.includes('content filter');

            if (isPolicyViolation) {
                log.error(`[GoogleVertex] ❌ Policy violation — NOT retrying:`, errorMessage.substring(0, 100));
                throw error;
            }

            // Non-retryable auth errors
            const isAuthError =
                errorMessage.includes('unauthorized') ||
                errorMessage.includes('forbidden') ||
                errorMessage.includes('invalid api key') ||
                errorMessage.includes('permission_denied');

            if (isAuthError) {
                throw error;
            }

            // Retryable transient errors
            const isRetryable =
                errorMessage.includes('500') ||
                errorMessage.includes('503') ||
                errorMessage.includes('429') ||
                errorMessage.includes('overloaded') ||
                errorMessage.includes('unavailable') ||
                errorMessage.includes('internal') ||
                errorMessage.includes('resource_exhausted');

            if (!isRetryable || attempt === maxRetries) {
                throw error;
            }

            const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 500;
            log.warn(`[GoogleVertex] ⚠️ Attempt ${attempt}/${maxRetries} failed (transient). Retrying in ${(waitTime / 1000).toFixed(1)}s...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    throw lastError;
}

async function generateImageGoogleVertex(prompt, apiKey, options = {}) {
>>>>>>> 92db139 (feat(provider): add Google Vertex AI provider using @google/genai SDK)
    const {
        model = 'gemini-3-pro-image-preview',
        aspectRatio = '16:9',
        referenceImages = [],
    } = options;

<<<<<<< HEAD
    log.group(`🟢 [VertexAI] generateImageVertexAI()`);
    log.debug(`📋 Model: ${model} | AR: ${aspectRatio}`);
    log.debug(`📎 Reference images: ${referenceImages.length}`);
    log.time('⏱️ VertexAI SDK call');

    const trimmedKey = apiKey?.trim();
    if (!trimmedKey) {
        log.error('❌ [VertexAI] No API key provided');
        log.timeEnd('⏱️ VertexAI SDK call');
        log.groupEnd();
        throw new Error('Google Vertex AI API key chưa được cấu hình.');
    }

    const ai = new GoogleGenAI({ apiKey: trimmedKey });

    // Build parts: reference images FIRST, then text prompt
    // (Gemini processes images before text for better context)
    const fullParts = [];

    // Add reference images as inline data parts
    for (let i = 0; i < referenceImages.length; i++) {
        const refImg = referenceImages[i];
        if (!refImg || refImg.length < 100) {
            log.warn(`⚠️ [VertexAI] Skipping ref image ${i + 1} — too small or empty`);
            continue;
        }
        // Strip data URI prefix if present
        const base64Data = refImg.startsWith('data:') ? refImg.split(',')[1] : refImg;
        const mimeType = refImg.startsWith('data:image/png') ? 'image/png'
            : refImg.startsWith('data:image/webp') ? 'image/webp'
            : 'image/jpeg';
        fullParts.push({ inlineData: { data: base64Data, mimeType } });
        log.debug(`📎 [VertexAI] Added ref image ${i + 1}: ${Math.round(base64Data.length / 1024)}KB (${mimeType})`);
    }

    // Add text prompt last
    if (prompt) {
        fullParts.push({ text: prompt });
    }

    log.debug(`🔧 [VertexAI] Parts: ${fullParts.filter(p => p.inlineData).length} images + 1 text`);

    // Map model aliases (from scense_director compatibility)
=======
    log.group(`🟢 [GoogleVertex] generateImageGoogleVertex()`);
    log.debug(`📋 Model: ${model} | AR: ${aspectRatio}`);
    log.debug(`📎 Reference images: ${referenceImages.length}`);
    log.time('⏱️ GoogleVertex SDK call');

    const ai = new GoogleGenAI({ apiKey });

    // Build parts: REFERENCE IMAGES FIRST, then TEXT PROMPT
    const fullParts = [];

    // Step 1: Add reference images FIRST (important for consistency)
    if (referenceImages && referenceImages.length > 0) {
        for (let i = 0; i < referenceImages.length; i++) {
            let base64Data = referenceImages[i];
            let mimeType = 'image/png';

            // Strip data URI prefix if present
            if (base64Data.startsWith('data:')) {
                const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
                if (match) {
                    mimeType = match[1];
                    base64Data = match[2];
                }
            }

            // Add label for reference image
            fullParts.push({ text: `Reference image ${i + 1}:` });
            fullParts.push({
                inlineData: { data: base64Data, mimeType }
            });
        }
        log.debug(`[GoogleVertex] 📎 ${referenceImages.length} reference image(s) loaded`);
    }

    // Step 2: Text prompt LAST (after all images)
    fullParts.push({ text: prompt });

    // Map model names if needed
    let finalModel = model;
>>>>>>> 92db139 (feat(provider): add Google Vertex AI provider using @google/genai SDK)
    const MODEL_MAP = {
        'google-nano-banana-pro': 'gemini-3-pro-image-preview',
        'google-nano-banana-2': 'gemini-3.1-flash-image-preview',
    };
<<<<<<< HEAD
    const finalModel = MODEL_MAP[model] || model;
    if (finalModel !== model) {
        log.debug(`🔄 [VertexAI] Model mapped: ${model} → ${finalModel}`);
    }

    // Retry wrapper for transient errors (500/503/429)
    const callWithRetry = async (attempt = 1, maxAttempts = 3) => {
        try {
            return await ai.models.generateContent({
                model: finalModel,
                contents: [{ parts: fullParts }],
                config: {
                    responseModalities: ['TEXT', 'IMAGE'],
                    imageConfig: {
                        aspectRatio: aspectRatio || '16:9',
                    },
                },
            });
        } catch (err) {
            const msg = String(err?.message || err).toLowerCase();
            const isPolicyViolation = ['policy', 'safety', 'blocked', 'harmful', 'inappropriate', 'prohibited', 'violation'].some(k => msg.includes(k));
            const isAuthError = ['unauthorized', 'forbidden', 'invalid api key', 'permission_denied'].some(k => msg.includes(k));
            const isRetryable = ['500', '503', '429', 'overloaded', 'unavailable', 'internal', 'resource_exhausted'].some(k => msg.includes(k));

            if (isPolicyViolation || isAuthError || !isRetryable || attempt >= maxAttempts) {
                throw err;
            }
            const waitMs = Math.pow(2, attempt) * 1000 + Math.random() * 500;
            log.warn(`⚠️ [VertexAI] Attempt ${attempt}/${maxAttempts} failed (transient). Retrying in ${(waitMs/1000).toFixed(1)}s...`);
            await new Promise(r => setTimeout(r, waitMs));
            return callWithRetry(attempt + 1, maxAttempts);
        }
    };

    const response = await callWithRetry();

    // Extract image from response
    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (imagePart?.inlineData) {
        const base64 = imagePart.inlineData.data;
        log.debug(`✅ [VertexAI] Image received: ${Math.round(base64.length / 1024)}KB base64`);
        log.timeEnd('⏱️ VertexAI SDK call');
=======
    if (MODEL_MAP[model]) {
        finalModel = MODEL_MAP[model];
        log.debug(`[GoogleVertex] 🔄 Model mapped: ${model} → ${finalModel}`);
    }

    const response = await withRetry(async () => {
        return await ai.models.generateContent({
            model: finalModel,
            contents: [{ parts: fullParts }],
            config: {
                responseModalities: ["TEXT", "IMAGE"],
                imageConfig: {
                    aspectRatio: aspectRatio,
                }
            },
        });
    }, 'GoogleVertexImageGen', 2);

    // Extract image from response parts
    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (imagePart?.inlineData) {
        const base64 = imagePart.inlineData.data;
        log.debug(`✅ [GoogleVertex] Image received: ${Math.round(base64.length / 1024)}KB base64`);
        log.timeEnd('⏱️ GoogleVertex SDK call');
>>>>>>> 92db139 (feat(provider): add Google Vertex AI provider using @google/genai SDK)
        log.groupEnd();
        return { base64, blobUrl: base64ToBlobUrl(base64), imageUrl: null };
    }

<<<<<<< HEAD
    // Check block reason
    const blockReason = response.candidates?.[0]?.finishReason;
    if (blockReason && blockReason !== 'STOP') {
        log.error(`❌ [VertexAI] Generation blocked: ${blockReason}`);
        log.timeEnd('⏱️ VertexAI SDK call');
        log.groupEnd();
        throw new Error(`Vertex AI: Generation blocked (${blockReason}). Hãy thử prompt khác.`);
    }

    // Fallback: check text part for error message
    const textPart = response.candidates?.[0]?.content?.parts?.find(p => p.text);
    log.error('❌ [VertexAI] No image in response, text:', textPart?.text);
    log.timeEnd('⏱️ VertexAI SDK call');
    log.groupEnd();
    throw new Error(textPart?.text || 'Không nhận được ảnh từ Vertex AI. Hãy thử lại.');
=======
    // Check if response was blocked
    const blockReason = response.candidates?.[0]?.finishReason;
    if (blockReason && blockReason !== 'STOP') {
        log.error(`❌ [GoogleVertex] Generation blocked: ${blockReason}`);
        log.timeEnd('⏱️ GoogleVertex SDK call');
        log.groupEnd();
        throw new Error(`Google Vertex: Generation blocked (${blockReason}). Hãy thử prompt khác.`);
    }

    log.error('❌ [GoogleVertex] No image in response');
    log.timeEnd('⏱️ GoogleVertex SDK call');
    log.groupEnd();
    throw new Error("Không nhận được ảnh từ Google Vertex API. Hãy thử lại.");
>>>>>>> 92db139 (feat(provider): add Google Vertex AI provider using @google/genai SDK)
}

// ============================================================
// PROVIDER 2: Vertex Key
// ============================================================

async function generateImageVertexKey(prompt, apiKey, options = {}) {
    const {
        model = 'gemini-image-2k',
        aspectRatio = '16:9',
        referenceImages = [],
    } = options;

    log.group(`🔑 [VertexKey] generateImageVertexKey()`);
    log.debug(`📋 Model: ${model} | AR: ${aspectRatio}`);
    log.debug(`📋 Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING'}`);
    log.time('⏱️ VertexKey API call');

    const VERTEX_BASE = VERTEX_KEY_BASE;

    if (referenceImages.length > 0) {
        log.warn('⚠️ [VertexKey] /images/generations endpoint does not support reference images. Ignoring them for this generation.');
    }

    // Determine size string mapped from aspect ratio and model capability
    let sizeStr = "1024x1024"; // 1:1 default fallback
    const is4k = model.includes('4k');
    const is2k = model.includes('2k') || model.includes('banana-2-2k');
    const is1k = model.includes('1k');

    if (aspectRatio === '16:9') {
        sizeStr = is4k ? "5632x3072" : is2k ? "2816x1536" : is1k ? "1408x768" : "1792x1024";
    } else if (aspectRatio === '9:16') {
        sizeStr = is4k ? "3072x5632" : is2k ? "1536x2816" : is1k ? "768x1408" : "1024x1792";
    } else if (aspectRatio === '1:1') {
        sizeStr = is4k ? "4096x4096" : is2k ? "2048x2048" : is1k ? "1024x1024" : "1024x1024";
    }

    const body = {
        model,
        prompt: prompt,
        n: 1,
        size: sizeStr
    };

    const url = `${VERTEX_BASE}/images/generations`;
    log.debug(`🔗 [VertexKey] URL: ${url} (images/generations endpoint)`);
    const bodyStr = JSON.stringify(body);
    log.info(`📦 [VertexKey] Request body size: ${Math.round(bodyStr.length / 1024)}KB`);
    const fetchStart = Date.now();

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: bodyStr,
    });
    log.info(`📡 [VertexKey] Fetch completed in ${((Date.now() - fetchStart) / 1000).toFixed(1)}s → status: ${response.status}`);

    log.debug(`📡 [VertexKey] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        log.error('❌ [VertexKey] Error response:', error);
        log.timeEnd('⏱️ VertexKey API call');
        log.groupEnd();
        throw new Error(error?.error?.message || `Vertex Key error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    if (typeof text === 'string' && text.length > 0) {
        log.debug(`📦 [VertexKey] Response text (${text.length} chars): "${text.substring(0, 150)}..."`);
    }

    // Method 1: Gemini image models return markdown image URLs like ![...](https://...)
    // Also protect against `text` being undefined or not a string if response is pure OpenAI format
    const imageUrlMatch = typeof text === 'string' ? text.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/) : null;
    if (imageUrlMatch) {
        const imageUrl = imageUrlMatch[1];
        log.debug(`🔗 [VertexKey] Found markdown image URL: ${imageUrl.substring(0, 80)}...`);
        try {
            const imgRes = await fetch(imageUrl);
            const imgBlob = await imgRes.blob();
            const base64 = await blobToBase64(imgBlob);
            log.debug(`✅ [VertexKey] Downloaded & converted: ${Math.round(base64.length / 1024)}KB`);
            log.timeEnd('⏱️ VertexKey API call');
            log.groupEnd();
            return { base64, blobUrl: URL.createObjectURL(imgBlob), imageUrl };
        } catch (dlErr) {
            log.warn(`⚠️ [VertexKey] Download failed, using URL directly:`, dlErr.message);
            log.timeEnd('⏱️ VertexKey API call');
            log.groupEnd();
            return { base64: null, blobUrl: imageUrl, imageUrl };
        }
    }

    // Method 2: Check for bare URL (no markdown format)
    const bareUrlMatch = typeof text === 'string' ? text.match(/(https?:\/\/[^\s"'<>]+\.(?:png|jpg|jpeg|webp|gif)[^\s"'<>]*)/i) : null;
    if (bareUrlMatch) {
        const imageUrl = bareUrlMatch[1];
        log.debug(`🔗 [VertexKey] Found bare image URL: ${imageUrl.substring(0, 80)}...`);
        try {
            const imgRes = await fetch(imageUrl);
            const imgBlob = await imgRes.blob();
            const base64 = await blobToBase64(imgBlob);
            log.debug(`✅ [VertexKey] Downloaded: ${Math.round(base64.length / 1024)}KB`);
            log.timeEnd('⏱️ VertexKey API call');
            log.groupEnd();
            return { base64, blobUrl: URL.createObjectURL(imgBlob), imageUrl };
        } catch {
            log.timeEnd('⏱️ VertexKey API call');
            log.groupEnd();
            return { base64: null, blobUrl: imageUrl, imageUrl };
        }
    }

    // Method 3: Check for inline base64 data
    const base64Match = typeof text === 'string' ? text.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/) : null;
    if (base64Match) {
        const base64 = base64Match[1];
        log.debug(`✅ [VertexKey] Found inline base64: ${Math.round(base64.length / 1024)}KB`);
        log.timeEnd('⏱️ VertexKey API call');
        log.groupEnd();
        return { base64, blobUrl: base64ToBlobUrl(base64), imageUrl: null };
    }

    // Method 4: Check OpenAI-style response format
    if (data.data?.[0]?.b64_json) {
        const base64 = data.data[0].b64_json;
        log.debug(`✅ [VertexKey] Got b64_json: ${Math.round(base64.length / 1024)}KB`);
        log.timeEnd('⏱️ VertexKey API call');
        log.groupEnd();
        return { base64, blobUrl: base64ToBlobUrl(base64), imageUrl: null };
    }
    if (data.data?.[0]?.url) {
        const imageUrl = data.data[0].url;
        log.debug(`🔗 [VertexKey] Found direct image URL: ${imageUrl.substring(0, 80)}...`);
        try {
            const imgRes = await fetch(imageUrl);
            const imgBlob = await imgRes.blob();
            const base64 = await blobToBase64(imgBlob);
            log.debug(`✅ [VertexKey] Downloaded OpenAI URL: ${Math.round(base64.length / 1024)}KB`);
            log.timeEnd('⏱️ VertexKey API call');
            log.groupEnd();
            return { base64, blobUrl: URL.createObjectURL(imgBlob), imageUrl };
        } catch (dlErr) {
            log.warn(`⚠️ [VertexKey] Download failed, using URL directly:`, dlErr.message);
            log.timeEnd('⏱️ VertexKey API call');
            log.groupEnd();
            return { base64: null, blobUrl: imageUrl, imageUrl };
        }
    }

    log.error('❌ [VertexKey] No image found. Full data:', data);
    let errMsg = `No image in response.`;
    if (data.error) {
        errMsg += ` Error: ${data.error.message || JSON.stringify(data.error)}`;
    } else if (data.choices?.[0]?.finish_reason) {
        errMsg += ` Finish reason: ${data.choices[0].finish_reason}`;
    } else if (data.message) {
        errMsg += ` Message: ${data.message}`;
    }
    log.timeEnd('⏱️ VertexKey API call');
    log.groupEnd();
    throw new Error(errMsg);
}

// ============================================================
// PROVIDER 3: Gommo AI
// ============================================================

async function generateImageGommo(prompt, apiKey, options = {}) {
    const {
        model = 'google_nano_banana_pro',
        aspectRatio = '16:9',
        referenceImages = [],
    } = options;

    log.group(`🍌 [Gommo] generateImageGommo()`);
    log.debug(`📋 Model: ${model}`);
    log.time('⏱️ Gommo API call');

    // Parse apiKey string which may contain domain (domain.net|access_token)
    let domain = '10xyoutube.net';
    let token = apiKey;
    if (apiKey.includes('|')) {
        const parts = apiKey.split('|');
        domain = parts[0];
        token = parts.slice(1).join('|');
    }

    // Map aspect ratio 16:9 -> 16_9 (doc: ratio=9_16|16_9|1_1)
    const ratioMap = {
        '16:9': '16_9',
        '9:16': '9_16',
        '1:1': '1_1'
    };
    const mappedRatio = ratioMap[aspectRatio] || '16_9';

    // Build payload — strictly per API doc "Create Image"
    const body = new URLSearchParams();
    body.append('access_token', token);
    body.append('domain', domain);
    body.append('action_type', 'create');
    body.append('model', model);
    body.append('prompt', prompt);
    body.append('ratio', mappedRatio);
    body.append('project_id', 'YogaKids');
    // Note: 'resolution' is NOT in Create Image doc, only in Create Video

    // Upload & attach reference images as subjects
    // Strategy: Upload → URL strings array → (fallback) base64 data URI → (fallback) no subjects
    let subjectUrls = [];   // uploaded URLs for Strategy 1
    let base64Refs = [];    // base64 data URIs for Strategy 2 fallback
    if (referenceImages && referenceImages.length > 0) {
        try {
            for (let i = 0; i < referenceImages.length; i++) {
                let base64Raw = referenceImages[i];
                // Strip data URI prefix if present — Gommo Upload expects raw base64
                if (base64Raw.startsWith('data:')) {
                    base64Raw = base64Raw.split(',')[1];
                }

                const sizeKB = Math.round((base64Raw.length * 0.75) / 1024);
                log.debug(`📤 [Gommo] Processing ref image ${i + 1}/${referenceImages.length} (${sizeKB}KB)...`);

                // Skip tiny/invalid images (< 1KB is likely broken)
                if (sizeKB < 1) {
                    log.warn(`⚠️ [Gommo] Ref image ${i + 1} too small (${sizeKB}KB), skipping`);
                    continue;
                }

                // Keep base64 data URI for Strategy 2 fallback
                base64Refs.push(`data:image/png;base64,${base64Raw}`);

                // Upload image to get URL for Strategy 1
                const uploadBody = new URLSearchParams();
                uploadBody.append('access_token', token);
                uploadBody.append('domain', domain);
                uploadBody.append('data', base64Raw);
                uploadBody.append('project_id', 'YogaKids');
                uploadBody.append('file_name', `ref_${Date.now()}_${i}.jpg`);
                uploadBody.append('size', String(Math.round(base64Raw.length * 0.75)));

                const uploadRes = await fetch(`${GOMMO_BASE}/ai/image-upload`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: uploadBody.toString()
                });

                const uploadData = await uploadRes.json();
                if (!uploadRes.ok || uploadData.error || !uploadData.imageInfo?.url) {
                    log.warn(`⚠️ [Gommo] Upload ref ${i + 1} failed:`, uploadData.message || uploadData.error);
                    continue;
                }

                log.debug(`✅ [Gommo] Ref ${i + 1} uploaded → ${uploadData.imageInfo.url}`);
                subjectUrls.push(uploadData.imageInfo.url);
            }
        } catch (err) {
            log.warn('⚠️ [Gommo] Subject upload error:', err.message);
        }
    }

    // Attach subjects as array of URL strings (NOT objects with {url:...})
    if (subjectUrls.length > 0) {
        body.append('subjects', JSON.stringify(subjectUrls));
        log.debug(`📎 [Gommo] Strategy 1: Attached ${subjectUrls.length} subject URL(s): ${JSON.stringify(subjectUrls)}`);
    }

    // Helper: call Create Image then poll for result
    async function createAndPoll(requestBody) {
        const reqStr = requestBody.toString();
        log.info(`📦 [Gommo] Create request body size: ${Math.round(reqStr.length / 1024)}KB`);
        const createStart = Date.now();
        const createRes = await fetch(`${GOMMO_BASE}/ai/generateImage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: reqStr,
        });
        log.info(`📡 [Gommo] Create request completed in ${((Date.now() - createStart) / 1000).toFixed(1)}s → status: ${createRes.status}`);

        const data = await createRes.json();
        if (!createRes.ok || data.error) {
            throw new Error(data.message || data.error || `Gommo API create failure: ${createRes.status}`);
        }

        const idBase = data.imageInfo?.id_base;
        if (!idBase) throw new Error('No id_base returned from Gommo');

        // Check if image is already done (some models return SUCCESS immediately)
        if (data.imageInfo.status === 'SUCCESS' && data.imageInfo.url) {
            log.debug(`✅ [Gommo] Image ready immediately: ${idBase}`);
            return data.imageInfo.url;
        }

        log.debug(`✅ [Gommo] Job created: ${idBase}, polling...`);

        // Poll Check Image Status endpoint
        const maxRetries = 60;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const checkBody = new URLSearchParams();
            checkBody.append('access_token', token);
            checkBody.append('domain', domain);
            checkBody.append('id_base', idBase);

            const checkRes = await fetch(`${GOMMO_BASE}/ai/image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: checkBody.toString(),
            });

            const checkData = await checkRes.json();
            // Response may or may not be wrapped in imageInfo
            const s = checkData.imageInfo || checkData;

            if (s.status === 'SUCCESS' && s.url) {
                return s.url;
            } else if (s.status === 'ERROR') {
                throw new Error(s.error || s.message || s.reason || 'Gommo image generation failed');
            }

            log.debug(`[Gommo] Poll ${attempt}/${maxRetries}… status: ${s.status}`);
            await sleep(3000);
        }

        throw new Error('Timeout waiting for Gommo image');
    }

    // Multi-strategy execution:
    // Strategy 1: URL strings in subjects (from upload)
    // Strategy 2: base64 data URI in subjects (skip upload)
    // Strategy 3: no subjects (final fallback)
    try {
        let imageUrl;
        try {
            // Strategy 1: try with uploaded URL subjects
            imageUrl = await createAndPoll(body);
        } catch (firstErr) {
            const isSubjectError = /phân tích|subjects|thành phần|parse/i.test(firstErr.message);

            if (isSubjectError && base64Refs.length > 0) {
                // Strategy 2: try with base64 data URI subjects
                log.warn(`⚠️ [Gommo] Strategy 1 (URL subjects) failed: "${firstErr.message}"`);
                log.debug(`🔄 [Gommo] Strategy 2: Trying with base64 data URI subjects...`);
                body.delete('subjects');
                body.append('subjects', JSON.stringify(base64Refs));

                try {
                    imageUrl = await createAndPoll(body);
                } catch (secondErr) {
                    const isSubjectError2 = /phân tích|subjects|thành phần|parse/i.test(secondErr.message);
                    if (isSubjectError2) {
                        // Strategy 3: no subjects at all
                        log.warn(`⚠️ [Gommo] Strategy 2 (base64 subjects) also failed: "${secondErr.message}"`);
                        log.debug(`🔄 [Gommo] Strategy 3: Generating WITHOUT subjects (no character reference)...`);
                        body.delete('subjects');
                        imageUrl = await createAndPoll(body);
                    } else {
                        throw secondErr;
                    }
                }
            } else if (isSubjectError && subjectUrls.length > 0) {
                // Strategy 3: no subjects
                log.warn(`⚠️ [Gommo] Subject error: "${firstErr.message}". Retrying WITHOUT subjects...`);
                body.delete('subjects');
                imageUrl = await createAndPoll(body);
            } else {
                throw firstErr;
            }
        }

        log.debug(`🔗 [Gommo] Image URL: ${imageUrl.substring(0, 80)}...`);

        // Download image to base64 for IndexedDB storage
        const dlStart = Date.now();
        log.info(`⬇️ [Gommo] Downloading generated image from URL...`);
        const imgRes = await fetch(imageUrl);
        log.info(`⬇️ [Gommo] Download response in ${((Date.now() - dlStart) / 1000).toFixed(1)}s → status: ${imgRes.status}`);
        const imgBlob = await imgRes.blob();
        log.info(`⬇️ [Gommo] Blob size: ${Math.round(imgBlob.size / 1024)}KB`);

        let base64 = null;
        try {
            base64 = await blobToBase64(imgBlob);
            log.debug(`✅ [Gommo] Downloaded & converted: ${Math.round(base64.length / 1024)}KB`);
        } catch (e) {
            log.warn('⚠️ [Gommo] base64 conversion failed, using URL directly', e);
        }

        log.timeEnd('⏱️ Gommo API call');
        log.groupEnd();
        return { base64, blobUrl: URL.createObjectURL(imgBlob), imageUrl };

    } catch (err) {
        log.error('❌ [Gommo] Error:', err);
        log.timeEnd('⏱️ Gommo API call');
        log.groupEnd();
        throw err;
    }
}

// ============================================================
// VERTEX KEY: Chat Completions (AI Analysis)
// ============================================================

/**
 * Use Vertex Key chat models for script analysis / prompt enhancement.
 */
export async function chatCompletion(systemPrompt, userPrompt, apiKey, options = {}) {
    const {
        model = 'gem/gemini-3-flash-nothinking',
        maxTokens = 2048,
        temperature = 0.7,
    } = options;

    log.group(`💬[ChatCompletion] model: ${model}`);
    log.debug(`📋 System prompt(${systemPrompt.length} chars): "${systemPrompt.substring(0, 80)}..."`);
    log.debug(`📋 User prompt(${userPrompt.length} chars): "${userPrompt.substring(0, 80)}..."`);
    log.debug(`⚙️ maxTokens: ${maxTokens}, temperature: ${temperature}`);
    log.time('⏱️ ChatCompletion API call');

    const url = `${VERTEX_KEY_BASE}/chat/completions`;
    const body = {
        model,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
        max_tokens: maxTokens,
        temperature,
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
    });

    log.debug(`📡[ChatCompletion] Response status: ${response.status}`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        log.error('❌ [ChatCompletion] Error:', error);
        log.timeEnd('⏱️ ChatCompletion API call');
        log.groupEnd();
        throw new Error(error?.error?.message || `Chat error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    log.debug(`✅[ChatCompletion] Response(${content.length} chars): "${content.substring(0, 100)}..."`);
    log.timeEnd('⏱️ ChatCompletion API call');
    log.groupEnd();
    return content;
}

// ============================================================
// SCENE IMAGE GENERATION
// ============================================================

/**
 * Generate start + end frame images for a scene.
 */
export async function generateSceneImages(framePrompt, apiKey, options = {}) {
    log.group(`🎬[SceneImages] Scene #${framePrompt.sceneIndex}: "${framePrompt.sceneName}"`);
    log.time(`⏱️ Scene "${framePrompt.sceneName}" total`);

    let startResult = undefined;
    let endResult = undefined;

    // Override with scene-specific reference image if available
    const effectiveOptions = { ...options };
    if (framePrompt.customReferenceImage && (!options.targetFrame || options.targetFrame === 'start')) {
        effectiveOptions.referenceImages = [framePrompt.customReferenceImage];
        log.debug(`📎[SceneImages] Using CUSTOM reference image for this scene`);
    }

    if (options.envReferenceImages && options.envReferenceImages.length > 0) {
        effectiveOptions.referenceImages = [...(effectiveOptions.referenceImages || []), ...options.envReferenceImages];
        log.debug(`🏞️[SceneImages] Attached ${options.envReferenceImages.length} environment reference images`);
    }

    if (!effectiveOptions.targetFrame || effectiveOptions.targetFrame === 'start') {
        // 1. Generate start frame using original character image from options
        log.debug(`🟢[SceneImages] Generating START frame...`);
        log.debug(`📎[SceneImages] Reference images from options: ${effectiveOptions.referenceImages?.length || 0}`);
        startResult = await generateImage(
            framePrompt.startFrame.prompt,
            apiKey,
            effectiveOptions
        );
        log.debug(`✅[SceneImages] START frame done — base64: ${startResult.base64 ? Math.round(startResult.base64.length / 1024) + 'KB' : 'null'}, blobUrl: ${startResult.blobUrl ? 'yes' : 'no'}`);

        if (!options.targetFrame) {
            // Rate limit delay
            log.debug(`⏳[SceneImages] Rate limit delay 1500ms...`);
            await sleep(1500);
        }
    }

    if (!options.targetFrame || options.targetFrame === 'end') {
        // 2. Generate end frame using the start frame as reference
        log.debug(`🔴[SceneImages] Generating END frame...`);
        const endOptions = { ...options };

        if (options.targetFrame === 'end') {
            // we are generating only END. Use the options.referenceImages (which should be prepared by caller)
        } else {
            if (startResult?.base64) {
                endOptions.referenceImages = [startResult.base64];
                if (options.envReferenceImages && options.envReferenceImages.length > 0) {
                    endOptions.referenceImages.push(...options.envReferenceImages);
                }
                log.debug(`📎[SceneImages] Using START frame + ENV as reference for END frame(${endOptions.referenceImages.length} refs total)`);
            } else {
                endOptions.referenceImages = [];
                log.warn(`⚠️[SceneImages] No base64 from START frame, END frame has no reference`);
            }
        }

        endResult = await generateImage(
            framePrompt.endFrame.prompt,
            apiKey,
            endOptions
        );
        log.debug(`✅[SceneImages] END frame done — base64: ${endResult.base64 ? Math.round(endResult.base64.length / 1024) + 'KB' : 'null'}, blobUrl: ${endResult.blobUrl ? 'yes' : 'no'} `);
    }

    log.timeEnd(`⏱️ Scene "${framePrompt.sceneName}" total`);
    log.groupEnd();

    const result = {};
    if (startResult !== undefined) result.start = startResult;
    if (endResult !== undefined) result.end = endResult;
    return result;
}
// ============================================================
// PROVIDER 4: Vertex AI via @google/genai SDK
// Uses Google AI Studio API key (AIzaSy...) — same as google-ai
// but routed via @google/genai SDK for Gemini image models
// (NanoBanana Pro / NanoBanana 2)
// Reference: Scene Director VertexAIProvider.ts
// ============================================================

async function generateImageVertexAI(prompt, apiKey, options = {}) {
    const {
        model = 'gemini-3-pro-image-preview',
        aspectRatio = '16:9',
        referenceImages = [],
    } = options;

    log.group(`🟢 [VertexAI-SDK] generateImageVertexAI()`);
    log.debug(`📋 Model: ${model} | AR: ${aspectRatio}`);
    log.debug(`📎 Reference images: ${referenceImages.length}`);
    log.time('⏱️ VertexAI SDK call');

    try {
        // Dynamic import @google/genai (ESM)
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey });

        // Build parts: reference images first, then text prompt
        // This is the Scene Director pattern for NanoBanana consistency
        const fullParts = [];

        for (const refImg of referenceImages) {
            let base64Raw = refImg;
            let mimeType = 'image/png';
            if (base64Raw.startsWith('data:')) {
                const parts = base64Raw.split(';base64,');
                mimeType = parts[0].replace('data:', '') || 'image/png';
                base64Raw = parts[1];
            }
            fullParts.push({
                inlineData: { data: base64Raw, mimeType }
            });
        }

        // Text prompt last (after images)
        if (prompt) {
            fullParts.push({ text: prompt });
        }

        log.debug(`🔗 [VertexAI-SDK] Calling ai.models.generateContent — model: ${model}`);
        log.debug(`📦 Parts: ${fullParts.filter(p => p.inlineData).length} img + ${fullParts.filter(p => p.text).length} text`);

        const response = await ai.models.generateContent({
            model,
            contents: [{ parts: fullParts }],
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
                imageConfig: {
                    aspectRatio: aspectRatio || '16:9',
                },
            },
        });

        // Extract image from response
        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

        if (!imagePart?.inlineData) {
            const blockReason = response.candidates?.[0]?.finishReason;
            if (blockReason && blockReason !== 'STOP') {
                throw new Error(`Vertex AI blocked generation (${blockReason}). Thử prompt khác.`);
            }
            log.error('❌ [VertexAI-SDK] No image in response:', JSON.stringify(response).substring(0, 500));
            throw new Error('Không nhận được ảnh từ Vertex AI. Thử lại.');
        }

        const base64 = imagePart.inlineData.data;
        const mimeType = imagePart.inlineData.mimeType || 'image/png';
        const dataUrl = `data:${mimeType};base64,${base64}`;

        log.debug(`✅ [VertexAI-SDK] Image received: ${Math.round(base64.length / 1024)}KB base64`);
        log.timeEnd('⏱️ VertexAI SDK call');
        log.groupEnd();

        return { base64, blobUrl: base64ToBlobUrl(base64, mimeType), imageUrl: dataUrl };

    } catch (err) {
        log.error('❌ [VertexAI-SDK] Error:', err.message || err);
        log.timeEnd('⏱️ VertexAI SDK call');
        log.groupEnd();
        throw err;
    }
}

// ============================================================
// UTILITIES
// ============================================================

export function base64ToBlobUrl(base64, mimeType = 'image/png') {
    const byteChars = atob(base64);
    const byteNums = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
        byteNums[i] = byteChars.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNums);
    const blob = new Blob([byteArray], { type: mimeType });
    return URL.createObjectURL(blob);
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
