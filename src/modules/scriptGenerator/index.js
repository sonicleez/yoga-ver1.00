/**
 * SCRIPT GENERATOR — Main Orchestrator (Index)
 * 
 * Coordinates all sub-modules to generate a complete yoga script:
 *   1. Apply template → get config
 *   2. Build pose sequence → flowStrategies
 *   3. Build prompts → promptBuilder
 *   4. Generate text → textProvider
 *   5. Return formatted script
 * 
 * This is the ONLY entry point for script generation.
 */

import { log } from '../logger.js';
import { buildPoseSequence, calculatePoseCount, getFlowOptions } from './flowStrategies.js';
import { buildSystemPrompt, buildUserPrompt } from './promptBuilder.js';
import { generateText, detectTextProvider, getTextModels, getDefaultTextModel } from './textProvider.js';
import { getTemplateOptions, getTemplate, applyTemplate } from './scriptTemplates.js';
import { getLanguageOptions, getLanguage } from './languages.js';
import { getPoseCount, findPoses, getPosesGrouped, POSE_CATEGORIES, AUDIENCE_TAGS, FOCUS_AREAS } from './poseDatabase.js';

// Phase 2 — Quality System
import { generateVariation, variationToPromptHints, profileSimilarity, getVariationDimensions, getTotalCombinations } from './variationEngine.js';
import { createFingerprint, checkDuplicate, buildSmartContext, getFingerprints, saveFingerprint, updateFingerprintScore, getFingerprintCount, clearFingerprints } from './fingerprintDB.js';
import { runRuleAudit, runAIAudit, runFullAudit } from './auditAgent.js';
import { diagnose, fixFormat, fixWithAI, autoFix } from './autoFixer.js';

// Phase 3 — Series & Playlist
import { buildSeriesConfigs, buildPlaylistConfigs, executeBatch, getSeriesPresets, getPlaylistThemes, getSeriesPreset, getPlaylistTheme } from './seriesGenerator.js';

// Phase 3.2 — Gamification
import { recordGeneration, recordBatchCompletion, getCurrentLevel, getStats, getSkillPacks, getSkillPack, getSkillPackPoses, markSkillPackUsed, getUnlockedAchievements, getAllAchievements, getRecentXP, generateTags, resetGamification, SKILL_PACKS, LEVELS, ACHIEVEMENTS, XP_REWARDS } from './gamification.js';

// Phase 3.3 — History & Templates
import { addToHistory, getHistory, getHistoryItem, toggleFavorite, deleteHistoryItem, clearHistory, getFavorites, saveUserTemplate, getUserTemplates, getUserTemplate, deleteUserTemplate, getHistoryStats } from './historyManager.js';

// ============================================================
// DEFAULT CONFIG
// ============================================================

export const DEFAULT_SCRIPT_CONFIG = {
    // Generation mode
    mode: 'single',               // single | series | playlist

    // Category (ties to template selection)
    category: 'bedtime',

    // Niche configuration
    niche: {
        level: 'beginner',        // beginner | intermediate | advanced
        audience: 'adults',
        ageRange: 'adult',
        focusArea: 'relaxation',
        bodyFocus: 'full-body',
    },

    // Instructor personality
    instructor: {
        name: '',
        personality: 'gentle',    // gentle | energetic | calm | playful | coaching
        voiceTone: 'warm',        // warm | bright | soothing | direct | nurturing
    },

    // Character integration
    characterMode: 'none',        // none | light | deep
    characterDescription: '',

    // Script format (voice style)
    scriptFormat: 'solo',         // solo | teacher_student | two_friends | parent_child | narrator_inner

    // Session parameters
    session: {
        duration: 15,             // minutes
        poseCount: 12,
        includeIntro: true,
        includeOutro: true,
        narrationStyle: 'short',  // minimal | short | detailed | poetic
        breathCues: true,
        transitionCues: true,
    },

    // Pose selection
    poses: {
        source: 'auto',          // auto | manual | mixed
        flow: 'progressive',     // progressive | warm_to_cool | cool_to_warm | body_scan | chakra | themed_animals | random
        selectedPoses: [],
        excludePoses: [],
        mustInclude: ['savasana'],
    },

    // Language
    language: 'en',

    // AI settings
    ai: {
        model: '',                // Auto-detect if empty
        temperature: 0.7,
        creativity: 'balanced',   // conservative | balanced | creative
    },
};

// ============================================================
// MAIN API
// ============================================================

/**
 * Generate a complete yoga script.
 * 
 * @param {Object} config - Script configuration (merged with defaults)
 * @param {string} apiKey - API key for text generation
 * @param {Object} callbacks - Optional progress callbacks
 * @param {function} callbacks.onStatus - (status: string) => void
 * @param {function} callbacks.onPoseSequence - (poses: Array) => void
 * @returns {Promise<{script: string, poseSequence: Array, meta: Object}>}
 */
export async function generateScript(config, apiKey, callbacks = {}) {
    const startTime = Date.now();

    log.group('📝 [ScriptGenerator] Starting generation');

    try {
        // 1. Merge config with defaults
        const mergedConfig = mergeConfig(config);
        log.debug('📋 Config:', JSON.stringify(mergedConfig, null, 2).substring(0, 500));

        callbacks.onStatus?.('Building pose sequence...');

        // 2. Auto-calculate pose count if needed
        if (!mergedConfig.session.poseCount || mergedConfig.session.poseCount === 0) {
            mergedConfig.session.poseCount = calculatePoseCount(
                mergedConfig.session.duration,
                mergedConfig.session.narrationStyle
            );
        }

        // 3. Build pose sequence
        const poseSequence = buildPoseSequence({
            poseCount: mergedConfig.session.poseCount,
            flow: mergedConfig.poses.flow,
            level: mergedConfig.niche.level,
            audience: mergedConfig.niche.audience,
            focusArea: mergedConfig.niche.focusArea,
            exclude: mergedConfig.poses.excludePoses,
            mustInclude: mergedConfig.poses.mustInclude,
        });

        log.info(`🧘 Pose sequence: ${poseSequence.map(p => p.name).join(' → ')}`);
        callbacks.onPoseSequence?.(poseSequence);

        // Save pose names for audit cross-checking
        mergedConfig._poseNames = poseSequence.map(p => p.name);

        // 4. Generate variation profile (Phase 2)
        callbacks.onStatus?.('Creating unique variation profile...');
        const existingFingerprints = getFingerprints();
        const variationHistory = existingFingerprints.slice(-5).map(fp => fp.variationProfile).filter(Boolean);
        const variationProfile = generateVariation({ history: variationHistory });
        log.info(`🎨 Variation: intro=${variationProfile.introStyle?.id}, metaphor=${variationProfile.metaphorTheme?.id}`);

        // 5. Check for duplicates (Phase 2)
        const dupCheck = checkDuplicate(mergedConfig, existingFingerprints);
        if (dupCheck.isDuplicate) {
            log.warn(`⚠️ Similar script detected (${(dupCheck.similarity * 100).toFixed(0)}% match). ${dupCheck.suggestion}`);
        }

        callbacks.onStatus?.('Building AI prompts...');

        // 6. Build prompts with variation hints + anti-dup context
        const systemPrompt = buildSystemPrompt(mergedConfig);
        const variationHints = variationToPromptHints(variationProfile);
        const smartContext = buildSmartContext(existingFingerprints, 8);
        // Place variation hints BEFORE the main user prompt so they don't dilute pose enforcement
        const userPrompt = (variationHints ? variationHints + '\n\n' : '')
            + (smartContext ? smartContext + '\n\n' : '')
            + buildUserPrompt(mergedConfig, poseSequence);

        log.debug(`📝 System prompt: ${systemPrompt.length} chars`);
        log.debug(`📝 User prompt: ${userPrompt.length} chars (variation + context + poses)`);
        log.info(`📝 Pose count mandate: ${poseSequence.length} poses`);

        callbacks.onStatus?.('Generating script with AI...');

        // 7. Detect provider & model
        const provider = detectTextProvider(apiKey);
        const model = mergedConfig.ai.model || getDefaultTextModel(provider);

        const tempMap = { conservative: -0.15, balanced: 0, creative: 0.15 };
        const temperature = Math.max(0.1, Math.min(1.0,
            mergedConfig.ai.temperature + (tempMap[mergedConfig.ai.creativity] || 0)
        ));

        // Dynamic maxTokens — scale based on pose count and narration style
        const narrationMultiplier = {
            minimal: 300,    // ~300 tokens per pose
            short: 450,      // ~450 tokens per pose
            detailed: 700,   // ~700 tokens per pose
            poetic: 750,     // ~750 tokens per pose
        };
        const tokensPerPose = narrationMultiplier[mergedConfig.session?.narrationStyle] || 450;
        const introOutroTokens = 600; // Intro + Outro
        const calculatedTokens = (poseSequence.length * tokensPerPose) + introOutroTokens;
        const maxTokens = Math.min(16384, Math.max(4096, calculatedTokens));
        log.info(`📊 maxTokens calculated: ${maxTokens} (${poseSequence.length} poses × ${tokensPerPose} + ${introOutroTokens} overhead)`);

        let script = await generateText(systemPrompt, userPrompt, apiKey, {
            model,
            maxTokens,
            temperature,
            provider,
        });

        log.info(`✅ Script generated — ${script.length} chars`);

        // 9. Create fingerprint (Phase 2)
        const fingerprint = createFingerprint({
            script, config: mergedConfig, poseSequence, variationProfile
        });

        // 10. Audit — Phase 1 (rule-based, FREE)
        callbacks.onStatus?.('Running quality audit...');
        const auditResult = await runFullAudit(script, mergedConfig, apiKey);
        log.info(`📊 Audit score: ${auditResult.totalScore}/100 — ${auditResult.grade.label}`);

        // 11. Auto-fix if needed (Phase 2)
        let fixResult = null;
        if (auditResult.status === 'needs_fix' || auditResult.status === 'needs_rewrite') {
            callbacks.onStatus?.('Auto-fixing issues...');
            fixResult = await autoFix(script, auditResult, mergedConfig, apiKey);
            script = fixResult.fixedScript;
            log.info(`🔧 Auto-fix applied: ${fixResult.changes.length} changes`);
        }

        // 12. Save fingerprint with quality score
        fingerprint.qualityScore = auditResult.totalScore;
        saveFingerprint(fingerprint);

        const elapsed = Date.now() - startTime;
        log.info(`✅ Complete in ${(elapsed / 1000).toFixed(1)}s`);
        callbacks.onStatus?.('Script generated!');

        const actualPoseCount = (script.match(/^\d+\.\s+.+/gm) || []).length;

        // 13. Build metadata
        const meta = {
            generatedAt: new Date().toISOString(),
            elapsedMs: elapsed,
            provider,
            model,
            temperature,
            poseCount: actualPoseCount > 0 ? actualPoseCount : poseSequence.length,
            scriptLength: script.length,
            language: mergedConfig.language,
            category: mergedConfig.category,
            audience: mergedConfig.niche.audience,
            level: mergedConfig.niche.level,
            flow: mergedConfig.poses.flow,
            // Phase 2 data
            variationProfile,
            fingerprint: fingerprint.id,
            auditResult: {
                score: auditResult.totalScore,
                grade: auditResult.grade,
                status: auditResult.status,
                summary: auditResult.summary,
            },
            fixResult: fixResult ? {
                changes: fixResult.changes,
                attempts: fixResult.attempts,
            } : null,
            duplicateWarning: dupCheck.isDuplicate ? dupCheck.suggestion : null,
        };

        log.groupEnd();

        return { script, poseSequence, meta, config: mergedConfig, auditResult };

    } catch (err) {
        log.error('❌ [ScriptGenerator] Generation failed:', err.message);
        log.groupEnd();
        callbacks.onStatus?.(`Error: ${err.message}`);
        throw err;
    }
}

// ============================================================
// CONFIG UTILITIES
// ============================================================

/**
 * Merge user config with defaults (deep merge)
 */
export function mergeConfig(userConfig = {}) {
    return {
        ...DEFAULT_SCRIPT_CONFIG,
        ...userConfig,
        niche: { ...DEFAULT_SCRIPT_CONFIG.niche, ...(userConfig.niche || {}) },
        instructor: { ...DEFAULT_SCRIPT_CONFIG.instructor, ...(userConfig.instructor || {}) },
        session: { ...DEFAULT_SCRIPT_CONFIG.session, ...(userConfig.session || {}) },
        poses: { ...DEFAULT_SCRIPT_CONFIG.poses, ...(userConfig.poses || {}) },
        ai: { ...DEFAULT_SCRIPT_CONFIG.ai, ...(userConfig.ai || {}) },
    };
}

/**
 * Quick generate with template — convenience wrapper
 */
export async function generateFromTemplate(templateId, apiKey, overrides = {}, callbacks = {}) {
    const templateConfig = applyTemplate(templateId, overrides);
    return generateScript(templateConfig, apiKey, callbacks);
}

// ============================================================
// SERIES & PLAYLIST GENERATION (Phase 3)
// ============================================================

/**
 * Generate a series of scripts with progressive difficulty.
 * 
 * @param {Object} seriesConfig - Series configuration
 * @param {string} apiKey - API key
 * @param {Object} callbacks - Progress callbacks
 * @returns {Promise<{results: Array, summary: Object}>}
 */
export async function generateSeries(seriesConfig, apiKey, callbacks = {}) {
    log.group('🎬 [ScriptGenerator] Starting SERIES generation');
    
    const configs = buildSeriesConfigs(seriesConfig);
    log.info(`📋 Built ${configs.length} series configs`);
    
    const result = await executeBatch(configs, apiKey, generateScript, callbacks);
    
    log.groupEnd();
    return result;
}

/**
 * Generate a playlist of varied scripts.
 * 
 * @param {Object} playlistConfig - Playlist configuration
 * @param {string} apiKey - API key
 * @param {Object} callbacks - Progress callbacks
 * @returns {Promise<{results: Array, summary: Object}>}
 */
export async function generatePlaylist(playlistConfig, apiKey, callbacks = {}) {
    log.group('🎵 [ScriptGenerator] Starting PLAYLIST generation');
    
    const configs = buildPlaylistConfigs(playlistConfig);
    log.info(`📋 Built ${configs.length} playlist configs`);
    
    const result = await executeBatch(configs, apiKey, generateScript, callbacks);
    
    log.groupEnd();
    return result;
}

// ============================================================
// RE-EXPORTS for convenience
// ============================================================

export {
    // Phase 1 — Core
    getTemplateOptions,
    getTemplate,
    applyTemplate,
    getFlowOptions,
    calculatePoseCount,
    getLanguageOptions,
    getLanguage,
    getPoseCount,
    findPoses,
    getPosesGrouped,
    getTextModels,
    getDefaultTextModel,
    detectTextProvider,
    POSE_CATEGORIES,
    AUDIENCE_TAGS,
    FOCUS_AREAS,

    // Phase 2 — Quality System
    generateVariation,
    variationToPromptHints,
    profileSimilarity,
    getVariationDimensions,
    getTotalCombinations,
    createFingerprint,
    checkDuplicate,
    buildSmartContext,
    getFingerprints,
    saveFingerprint,
    updateFingerprintScore,
    getFingerprintCount,
    clearFingerprints,
    runRuleAudit,
    runAIAudit,
    runFullAudit,
    diagnose,
    fixFormat,
    fixWithAI,
    autoFix,

    // Phase 3 — Series & Playlist
    buildSeriesConfigs,
    buildPlaylistConfigs,
    executeBatch,
    getSeriesPresets,
    getPlaylistThemes,
    getSeriesPreset,
    getPlaylistTheme,

    // Phase 3.2 — Gamification
    recordGeneration,
    recordBatchCompletion,
    getCurrentLevel,
    getStats,
    getSkillPacks,
    getSkillPack,
    getSkillPackPoses,
    markSkillPackUsed,
    getUnlockedAchievements,
    getAllAchievements,
    getRecentXP,
    generateTags,
    resetGamification,
    SKILL_PACKS,
    LEVELS,
    ACHIEVEMENTS,
    XP_REWARDS,

    // Phase 3.3 — History & Templates
    addToHistory,
    getHistory,
    getHistoryItem,
    toggleFavorite,
    deleteHistoryItem,
    clearHistory,
    getFavorites,
    saveUserTemplate,
    getUserTemplates,
    getUserTemplate,
    deleteUserTemplate,
    getHistoryStats,
};
