/**
 * TEXT PROVIDER — Provider-agnostic text generation abstraction
 *
 * Supports:
 *   - google-vertex (projectId|AQ.xxx) → Google AI endpoint with Gemini models
 *   - google-ai (AIzaSy...) → Google AI Direct
 *   - vertex-key (vai-...) → vertex-key.com service
 *
 * Note: google-vertex uses the same Google AI endpoint (generativelanguage.googleapis.com)
 * because AQ.xxx keys work with both Imagen API and Google AI text endpoint.
 */

import { log } from '../logger.js';

// ============================================================
// API ENDPOINTS
// ============================================================

const GOOGLE_AI_BASE = '/api/google-ai/v1beta/models';
const VERTEX_KEY_BASE = '/api/vertex-key/api/v1';

// ============================================================
// TEXT MODEL DEFINITIONS
// ============================================================

export const TEXT_MODELS = {
    'vertex-key': {
        models: {
            'gem/gemini-3-flash-nothinking': {
                name: 'Gemini 3 Flash (Fast)',
                costPer1M: { input: 1, output: 6 },
                maxTokens: 8192,
                recommended: true,
            },
            'gem/gemini-3.1-pro-preview': {
                name: 'Gemini 3.1 Pro',
                costPer1M: { input: 3, output: 18 },
                maxTokens: 8192,
            },
            'flash/claude-sonnet-4-6': {
                name: 'Claude Sonnet 4.6 ⚡',
                costPer1M: { input: 3, output: 15 },
                maxTokens: 8192,
            },
        },
    },
    'google-ai': {
        models: {
            'gemini-2.5-flash-lite': {
                name: 'Gemini 2.5 Flash Lite ⚡',
                costPer1M: { input: 0.075, output: 0.3 },
                maxTokens: 8192,
                recommended: true,
            },
            'gemini-2.5-flash': {
                name: 'Gemini 2.5 Flash',
                costPer1M: { input: 0.15, output: 0.6 },
                maxTokens: 8192,
            },
        },
    },
    'google-vertex': {
        models: {
            'gemini-2.5-flash-lite': {
                name: 'Gemini 2.5 Flash Lite ⚡',
                costPer1M: { input: 0.075, output: 0.3 },
                maxTokens: 8192,
                recommended: true,
            },
            'gemini-2.5-flash': {
                name: 'Gemini 2.5 Flash',
                costPer1M: { input: 0.15, output: 0.6 },
                maxTokens: 8192,
            },
        },
    },
};

// ============================================================
// MAIN API — generateText()
// ============================================================

/**
 * Generate text using the appropriate provider.
 *
 * @param {string} systemPrompt - System instructions
 * @param {string} userPrompt - User content
 * @param {string} apiKey - API key (auto-detects provider)
 * @param {Object} options
 * @param {string} options.model - Model identifier
 * @param {number} options.maxTokens - Max output tokens (default: 4096)
 * @param {number} options.temperature - Temperature 0-1 (default: 0.7)
 * @param {string} options.provider - Force provider
 * @returns {Promise<string>} Generated text content
 */
export async function generateText(systemPrompt, userPrompt, apiKey, options = {}) {
    const provider = options.provider || detectTextProvider(apiKey);
    const {
        model,
        maxTokens = 4096,
        temperature = 0.7,
    } = options;

    log.group(`📝 [TextProvider] provider=${provider}`);
    log.debug(`📋 System(${systemPrompt.length} chars), User(${userPrompt.length} chars)`);
    log.time('⏱️ Text generation');

    try {
        let result;

        switch (provider) {
            case 'vertex-key':
                result = await vertexKeyChat(systemPrompt, userPrompt, apiKey, {
                    model: model || 'gem/gemini-3-flash-nothinking',
                    maxTokens, temperature,
                });
                break;

            case 'google-ai':
                result = await googleAiChat(systemPrompt, userPrompt, apiKey, {
                    model: model || 'gemini-2.5-flash-lite',
                    maxTokens, temperature,
                });
                break;

            case 'google-vertex':
                result = await googleVertexChat(systemPrompt, userPrompt, apiKey, {
                    model: model || 'gemini-2.5-flash-lite',
                    maxTokens, temperature,
                });
                break;

            default:
                throw new Error(`Unknown text provider: ${provider}`);
        }

        log.debug(`✅ Result: ${result.length} chars`);
        log.timeEnd('⏱️ Text generation');
        log.groupEnd();
        return result;

    } catch (err) {
        log.error('❌ [TextProvider] Error:', err.message);
        log.timeEnd('⏱️ Text generation');
        log.groupEnd();
        throw err;
    }
}

/**
 * Detect provider from API key format
 *
 * google-vertex: projectId|AQ.xxx or AQ.xxx → Google Cloud Vertex AI
 * google-ai: AIzaSy... → Google AI Studio
 * vertex-key: vai-... → vertex-key.com service
 */
export function detectTextProvider(apiKey) {
    if (!apiKey) throw new Error('No API key provided for text generation.');

    // vertex-key.com service
    if (apiKey.startsWith('vai-')) return 'vertex-key';

    // Google Vertex AI key format: "projectId|AQ.xxx" or "AQ.xxx"
    if (apiKey.includes('|AQ.') || apiKey.startsWith('AQ.')) {
        return 'google-vertex';
    }

    // Gommo format (domain|token) - doesn't support text, fallback to vertex-key
    if (apiKey.includes('|') && apiKey.split('|')[0].includes('.')) {
        return 'vertex-key';
    }

    // Google AI Studio keys (AIzaSy...)
    if (apiKey.startsWith('AIza')) return 'google-ai';

    return 'google-ai'; // default fallback
}

/**
 * Get available text models for a provider
 */
export function getTextModels(provider) {
    const providerConfig = TEXT_MODELS[provider];
    if (!providerConfig) return [];
    return Object.entries(providerConfig.models).map(([id, m]) => ({ id, ...m }));
}

/**
 * Get the recommended model for a provider
 */
export function getDefaultTextModel(provider) {
    const models = getTextModels(provider);
    return models.find(m => m.recommended)?.id || models[0]?.id || '';
}

// ============================================================
// VERTEX KEY CHAT (vertex-key.com)
// ============================================================

async function vertexKeyChat(systemPrompt, userPrompt, apiKey, options) {
    const { model, maxTokens, temperature } = options;

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

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error?.message || `Vertex Key chat error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

// ============================================================
// GOOGLE AI DIRECT CHAT (AIzaSy... keys)
// ============================================================

async function googleAiChat(systemPrompt, userPrompt, apiKey, options) {
    const { model, maxTokens, temperature } = options;

    const url = `${GOOGLE_AI_BASE}/${model}:generateContent?key=${apiKey}`;
    const body = {
        system_instruction: {
            parts: [{ text: systemPrompt }],
        },
        contents: [
            {
                role: 'user',
                parts: [{ text: userPrompt }],
            },
        ],
        generationConfig: {
            maxOutputTokens: maxTokens,
            temperature,
        },
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error?.message || `Google AI chat error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ============================================================
// GOOGLE VERTEX CHAT (projectId|AQ.xxx keys)
// Uses Google AI endpoint (generativelanguage.googleapis.com)
// because AQ.xxx keys work with this endpoint
// ============================================================

async function googleVertexChat(systemPrompt, userPrompt, apiKey, options) {
    const { model, maxTokens, temperature } = options;

    // Extract token from composite key format: "projectId|AQ.xxx" → "AQ.xxx"
    let token = apiKey;
    if (apiKey.includes('|')) {
        const parts = apiKey.split('|');
        token = parts.slice(1).join('|'); // Get everything after first |
    }

    log.debug(`[GoogleVertex] Text generation with model ${model}`);

    const url = `${GOOGLE_AI_BASE}/${model}:generateContent?key=${token}`;
    const body = {
        system_instruction: {
            parts: [{ text: systemPrompt }],
        },
        contents: [
            {
                role: 'user',
                parts: [{ text: userPrompt }],
            },
        ],
        generationConfig: {
            maxOutputTokens: maxTokens,
            temperature,
        },
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error?.message || `Google Vertex chat error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}
