/**
 * TEXT PROVIDER — Provider-agnostic text generation abstraction
 * 
 * Wraps all current and future AI providers for text generation (chat completions).
 * Currently supports:
 *   - Vertex Key (vai-*) → /api/vertex-key/api/v1/chat/completions
 *   - Google AI Direct (AIza*) → /api/google-ai/v1beta/models
 * 
 * Reuses the same proxy endpoints as imageGenerator.js to avoid duplication.
 */

import { log } from '../logger.js';
import { GoogleGenAI } from '@google/genai';

// ============================================================
// API ENDPOINTS (same proxy layer as imageGenerator)
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
                costPer1M: { input: 1, output: 6 }, // USD
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
    'vertex-ai': {
        models: {
            'gemini-3.1-pro-preview': {
                name: 'Gemini 3.1 Pro (Vertex AI)',
                costPer1M: { input: 3, output: 18 },
                maxTokens: 8192,
                recommended: true,
            },
            'gemini-2.5-flash': {
                name: 'Gemini 2.5 Flash (Vertex AI)',
                costPer1M: { input: 0.075, output: 0.3 },
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
 * @param {string} options.provider - Force provider (google-ai, vertex-key)
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

            case 'vertex-ai':
                result = await vertexAiChat(systemPrompt, userPrompt, apiKey, {
                    model: model || 'gemini-3.1-pro-preview',
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
 */
export function detectTextProvider(apiKey) {
    if (!apiKey) throw new Error('No API key provided for text generation.');

    // Vertex AI key format: "projectId|AQ.xxx" or "AQ.xxx"
    // These work with Google AI endpoint (generativelanguage.googleapis.com)
    if (apiKey.includes('|AQ.') || apiKey.startsWith('AQ.')) {
        return 'google-ai'; // Route to google-ai endpoint which works with AQ keys
    }

    // gommo provider doesn't support text generation
    if (apiKey.includes('|')) return 'vertex-key'; // fallback to vertex-key which has text
    if (apiKey.startsWith('vai-')) return 'vertex-key';

    // Both google-ai and vertex-ai use AIzaSy... keys → route the same way
    if (apiKey.startsWith('AIza')) return 'google-ai';

    return 'google-ai'; // default fallback instead of vertex-key to be safe
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
 * Get the recommended (cheapest fast) model for a provider
 */
export function getDefaultTextModel(provider) {
    const models = getTextModels(provider);
    return models.find(m => m.recommended)?.id || models[0]?.id || '';
}

// ============================================================
// VERTEX KEY CHAT
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
// GOOGLE AI DIRECT CHAT
// ============================================================

async function googleAiChat(systemPrompt, userPrompt, apiKey, options) {
    const { model, maxTokens, temperature } = options;

    // Extract token from composite key format: "projectId|AQ.xxx" → "AQ.xxx"
    let token = apiKey;
    if (apiKey.includes('|')) {
        const parts = apiKey.split('|');
        token = parts.slice(1).join('|'); // Get everything after first |
    }

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
        throw new Error(error?.error?.message || `Google AI chat error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ============================================================
// VERTEX AI SDK CHAT
// ============================================================

async function vertexAiChat(systemPrompt, userPrompt, apiKey, options) {
    const { model, maxTokens, temperature } = options;

    const ai = new GoogleGenAI({ apiKey });
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUSER SUMMARY: ${userPrompt}` : userPrompt;

    log.debug(`[VertexAI] Generating text with model ${model}`);
    const response = await ai.models.generateContent({
        model: model,
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        config: {
            maxOutputTokens: maxTokens,
            temperature,
        }
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
}


