/**
 * SERIES & PLAYLIST GENERATOR
 * 
 * Generates multiple related yoga scripts in batch:
 * 
 * Series Mode:  Progressive difficulty (beginner → intermediate → advanced)
 *               Perfect for YouTube series: "7-Day Yoga Challenge"
 * 
 * Playlist Mode: Same theme, varied content (no progression)
 *                Perfect for collections: "5 Bedtime Yoga Sessions"
 * 
 * Uses the existing generateScript() pipeline for each individual script,
 * ensuring every script gets quality auditing + anti-duplication.
 */

import { log } from '../logger.js';
import { SCRIPT_TEMPLATES } from './scriptTemplates.js';
import { getFingerprints } from './fingerprintDB.js';

// ============================================================
// SERIES PRESETS
// ============================================================

export const SERIES_PRESETS = {
    '7day_beginner': {
        name: '📅 7-Day Beginner Challenge',
        description: 'Week-long series from basic to confident. Each day builds on the last.',
        totalScripts: 7,
        progressionType: 'gradual',
        baseCategory: 'morning',
        baseAudience: 'adults',
        startLevel: 'beginner',
        endLevel: 'beginner',    // stays beginner but adds complexity
        durationProgression: [10, 10, 12, 12, 15, 15, 15],
        poseCountProgression: [6, 7, 8, 9, 10, 11, 12],
        themes: ['Foundation', 'Balance', 'Flexibility', 'Strength', 'Flow', 'Challenge', 'Integration'],
    },
    '14day_transform': {
        name: '🔥 14-Day Transformation',
        description: 'Two-week progressive journey from beginner to intermediate.',
        totalScripts: 14,
        progressionType: 'gradual',
        baseCategory: 'power',
        baseAudience: 'adults',
        startLevel: 'beginner',
        endLevel: 'intermediate',
        durationProgression: null, // auto-calculate
        poseCountProgression: null,
        themes: [
            'Day 1: Foundation', 'Day 2: Breath', 'Day 3: Balance', 'Day 4: Core',
            'Day 5: Flexibility', 'Day 6: Rest & Restore', 'Day 7: Review',
            'Day 8: Flow Intro', 'Day 9: Warrior Series', 'Day 10: Backbends',
            'Day 11: Inversions Prep', 'Day 12: Full Flow', 'Day 13: Peak Challenge',
            'Day 14: Integration & Celebration'
        ],
    },
    '30day_journey': {
        name: '🌟 30-Day Yoga Journey',
        description: 'A month-long comprehensive program covering all aspects.',
        totalScripts: 30,
        progressionType: 'wave',  // intensity goes up and down
        baseCategory: 'mixed',
        baseAudience: 'adults',
        startLevel: 'beginner',
        endLevel: 'intermediate',
        durationProgression: null,
        poseCountProgression: null,
        themes: null, // auto-generate
    },
    'kids_week': {
        name: '🧒 Kids Week Adventure',
        description: '5 fun animal-themed sessions for children.',
        totalScripts: 5,
        progressionType: 'thematic',
        baseCategory: 'kids',
        baseAudience: 'kids',
        startLevel: 'beginner',
        endLevel: 'beginner',
        durationProgression: [8, 8, 10, 10, 10],
        poseCountProgression: [5, 6, 6, 7, 8],
        themes: ['Ocean Animals', 'Jungle Safari', 'Farm Friends', 'Dinosaur World', 'Space Adventure'],
    },
    'sleep_better': {
        name: '🌙 5-Night Sleep Better',
        description: '5 different bedtime sessions for better sleep.',
        totalScripts: 5,
        progressionType: 'thematic',
        baseCategory: 'bedtime',
        baseAudience: 'adults',
        startLevel: 'beginner',
        endLevel: 'beginner',
        durationProgression: [12, 15, 15, 15, 20],
        poseCountProgression: [8, 10, 10, 10, 12],
        themes: ['Moonlight Calm', 'Starry Release', 'Ocean Waves', 'Forest Twilight', 'Deep Rest'],
    },
};

// ============================================================
// PLAYLIST THEMES
// ============================================================

export const PLAYLIST_THEMES = {
    'relaxation_mix': {
        name: '🧘 Relaxation Mix',
        description: 'Varied relaxation sessions — different styles, same calm feeling.',
        variety: 'high',
        categories: ['bedtime', 'meditation', 'yin'],
        flows: ['warm_to_cool', 'body_scan', 'chakra'],
    },
    'energy_boost': {
        name: '⚡ Energy Boost Collection',
        description: 'Various energizing sessions for different needs.',
        variety: 'medium',
        categories: ['morning', 'power'],
        flows: ['cool_to_warm', 'progressive'],
    },
    'family_friendly': {
        name: '👨‍👩‍👧‍👦 Family Friendly Pack',
        description: 'Sessions for the whole family — kids, adults, seniors.',
        variety: 'high',
        categories: ['kids', 'bedtime', 'senior'],
        flows: ['themed_animals', 'progressive', 'warm_to_cool'],
    },
    'office_breaks': {
        name: '💼 Office Break Pack',
        description: 'Quick desk-friendly sessions for work breaks.',
        variety: 'medium',
        categories: ['office'],
        flows: ['body_scan'],
    },
    'deep_stretch': {
        name: '🌊 Deep Stretch Collection',
        description: 'Yin-style deep stretching for flexibility.',
        variety: 'medium',
        categories: ['yin', 'recovery'],
        flows: ['warm_to_cool', 'body_scan'],
    },
};

// ============================================================
// CORE: SERIES CONFIG BUILDER
// ============================================================

/**
 * Build an array of configs for a series (progression-based).
 * 
 * @param {Object} seriesConfig - Series parameters
 * @param {number} seriesConfig.totalScripts - Number of scripts (7, 14, 30)
 * @param {string} seriesConfig.progressionType - gradual | wave | thematic
 * @param {string} seriesConfig.baseCategory - Base category for the series
 * @param {string} seriesConfig.baseAudience - Target audience
 * @param {string} seriesConfig.startLevel - Starting difficulty
 * @param {string} seriesConfig.endLevel - Ending difficulty
 * @param {string} seriesConfig.seriesTitle - Overall series title
 * @param {string} seriesConfig.language - Language code
 * @param {Object} seriesConfig.baseConfig - Shared config overrides
 * @returns {Array<Object>} Array of individual script configs
 */
export function buildSeriesConfigs(seriesConfig) {
    const {
        totalScripts = 7,
        progressionType = 'gradual',
        baseCategory = 'morning',
        baseAudience = 'adults',
        startLevel = 'beginner',
        endLevel = 'intermediate',
        seriesTitle = '',
        language = 'en',
        baseConfig = {},
        durationProgression = null,
        poseCountProgression = null,
        themes = null,
    } = seriesConfig;

    const configs = [];

    // Ensure category rotation for mixed series
    const categoryPool = baseCategory === 'mixed'
        ? ['morning', 'power', 'meditation', 'bedtime', 'yin', 'recovery']
        : [baseCategory];

    for (let i = 0; i < totalScripts; i++) {
        const progress = i / Math.max(1, totalScripts - 1); // 0.0 → 1.0

        // --- Level progression ---
        const level = getLevelAtProgress(startLevel, endLevel, progress, progressionType, i);

        // --- Duration progression ---
        const duration = durationProgression
            ? durationProgression[i] || durationProgression[durationProgression.length - 1]
            : Math.round(lerp(10, 20, progress));

        // --- Pose count progression ---
        const poseCount = poseCountProgression
            ? poseCountProgression[i] || poseCountProgression[poseCountProgression.length - 1]
            : Math.round(lerp(6, 14, progress));

        // --- Category rotation ---
        const category = categoryPool[i % categoryPool.length];

        // --- Flow rotation ---
        const flows = ['progressive', 'warm_to_cool', 'cool_to_warm', 'body_scan', 'chakra'];
        const flow = flows[i % flows.length];

        // --- Narration style progression ---
        const narrationStyles = ['short', 'short', 'detailed', 'short', 'detailed', 'poetic'];
        const narrationStyle = narrationStyles[i % narrationStyles.length];

        // --- Theme ---
        const theme = themes
            ? themes[i] || `Session ${i + 1}`
            : `Session ${i + 1}`;

        // --- Build individual config ---
        configs.push({
            ...baseConfig,
            mode: 'single',
            category,
            language,
            niche: {
                ...(baseConfig.niche || {}),
                level,
                audience: baseAudience,
                focusArea: getFocusForIndex(i),
            },
            session: {
                ...(baseConfig.session || {}),
                duration,
                poseCount,
                narrationStyle,
                includeIntro: true,
                includeOutro: true,
                breathCues: true,
                transitionCues: true,
            },
            poses: {
                ...(baseConfig.poses || {}),
                flow,
                mustInclude: ['savasana'],
            },
            ai: {
                ...(baseConfig.ai || {}),
                temperature: lerp(0.6, 0.85, progress),
                creativity: progress > 0.7 ? 'creative' : 'balanced',
            },
            // Series metadata
            _seriesIndex: i,
            _seriesTotal: totalScripts,
            _seriesTitle: seriesTitle,
            _seriesTheme: theme,
            _seriesDay: `Day ${i + 1}`,
        });
    }

    return configs;
}

// ============================================================
// CORE: PLAYLIST CONFIG BUILDER
// ============================================================

/**
 * Build an array of configs for a playlist (varied, no progression).
 * 
 * @param {Object} playlistConfig
 * @param {number} playlistConfig.totalScripts - Number of scripts
 * @param {string} playlistConfig.playlistTitle - Playlist name
 * @param {string} playlistConfig.theme - Theme preset key or custom
 * @param {string} playlistConfig.variety - low | medium | high
 * @param {string} playlistConfig.language - Language code
 * @param {Object} playlistConfig.baseConfig - Shared config overrides
 * @returns {Array<Object>} Array of individual script configs
 */
export function buildPlaylistConfigs(playlistConfig) {
    const {
        totalScripts = 5,
        playlistTitle = '',
        theme = '',
        variety = 'medium',
        language = 'en',
        baseConfig = {},
    } = playlistConfig;

    const themePreset = PLAYLIST_THEMES[theme] || null;
    const configs = [];

    // Category pool
    const categories = themePreset?.categories || [baseConfig.category || 'bedtime'];
    // Flow pool  
    const flows = themePreset?.flows || ['progressive', 'warm_to_cool', 'body_scan'];
    // Narration styles
    const narrations = ['short', 'detailed', 'poetic', 'minimal', 'short'];
    // Durations
    const durations = variety === 'high' ? [10, 12, 15, 15, 20] : [15, 15, 15, 15, 15];
    // Personalities
    const personalities = ['gentle', 'calm', 'energetic', 'playful', 'coaching'];
    // Focus areas
    const focusAreas = ['relaxation', 'flexibility', 'balance', 'strength', 'meditation', 'energy'];

    for (let i = 0; i < totalScripts; i++) {
        const category = categories[i % categories.length];
        const flow = flows[i % flows.length];
        const narration = variety === 'low' ? 'short' : narrations[i % narrations.length];
        const duration = durations[i % durations.length];
        const personality = variety === 'high'
            ? personalities[i % personalities.length]
            : (baseConfig.instructor?.personality || 'gentle');
        const focus = focusAreas[i % focusAreas.length];

        configs.push({
            ...baseConfig,
            mode: 'single',
            category,
            language,
            niche: {
                ...(baseConfig.niche || {}),
                level: baseConfig.niche?.level || 'beginner',
                audience: baseConfig.niche?.audience || 'adults',
                focusArea: focus,
            },
            instructor: {
                ...(baseConfig.instructor || {}),
                personality,
            },
            session: {
                ...(baseConfig.session || {}),
                duration,
                poseCount: Math.round(duration * 0.7) + 2,
                narrationStyle: narration,
                includeIntro: true,
                includeOutro: true,
                breathCues: true,
                transitionCues: true,
            },
            poses: {
                ...(baseConfig.poses || {}),
                flow,
                mustInclude: ['savasana'],
            },
            ai: {
                ...(baseConfig.ai || {}),
                temperature: lerp(0.65, 0.85, Math.random()),
                creativity: variety === 'high' ? 'creative' : 'balanced',
            },
            // Playlist metadata
            _playlistIndex: i,
            _playlistTotal: totalScripts,
            _playlistTitle: playlistTitle,
            _playlistTheme: themePreset?.name || theme || 'Custom',
        });
    }

    return configs;
}

// ============================================================
// BATCH EXECUTION
// ============================================================

/**
 * Execute batch generation — runs generateScript() for each config.
 * 
 * @param {Array<Object>} configs - Array of individual script configs
 * @param {string} apiKey - API key
 * @param {Function} generateFn - The generateScript function
 * @param {Object} callbacks
 * @param {Function} callbacks.onProgress - (index, total, result) => void
 * @param {Function} callbacks.onError - (index, error) => void
 * @param {Function} callbacks.onComplete - (results) => void
 * @returns {Promise<Array>} Array of results
 */
export async function executeBatch(configs, apiKey, generateFn, callbacks = {}) {
    const results = [];
    const startTime = Date.now();
    let cancelled = false;

    log.group(`🎬 [SeriesGen] Starting batch: ${configs.length} scripts`);

    // Expose cancel function
    const cancelToken = {
        cancel: () => { cancelled = true; },
    };

    for (let i = 0; i < configs.length; i++) {
        if (cancelled) {
            log.warn(`⚠️ Batch cancelled at ${i}/${configs.length}`);
            break;
        }

        const config = configs[i];
        const label = config._seriesTheme || config._playlistTheme || `Script ${i + 1}`;

        log.info(`📝 [${i + 1}/${configs.length}] Generating: ${label}`);

        try {
            const result = await generateFn(config, apiKey, {
                onStatus: (status) => {
                    callbacks.onProgress?.(i, configs.length, { status, label });
                },
            });

            results.push({
                index: i,
                label,
                config,
                result,
                status: 'success',
                score: result.auditResult?.totalScore || null,
            });

            callbacks.onProgress?.(i, configs.length, {
                status: 'done',
                label,
                score: result.auditResult?.totalScore,
            });

        } catch (error) {
            log.error(`❌ Script ${i + 1} failed:`, error.message);
            results.push({
                index: i,
                label,
                config,
                result: null,
                status: 'error',
                error: error.message,
            });
            callbacks.onError?.(i, error);
        }

        // Small delay between scripts to avoid rate limiting
        if (i < configs.length - 1 && !cancelled) {
            await new Promise(r => setTimeout(r, 1500));
        }
    }

    const elapsed = Date.now() - startTime;
    const successCount = results.filter(r => r.status === 'success').length;
    const avgScore = results
        .filter(r => r.score !== null)
        .reduce((sum, r) => sum + r.score, 0) / Math.max(1, successCount);

    log.info(`✅ Batch complete: ${successCount}/${configs.length} success, avg score: ${avgScore.toFixed(0)}`);
    log.groupEnd();

    const summary = {
        totalScripts: configs.length,
        successCount,
        errorCount: results.filter(r => r.status === 'error').length,
        averageScore: Math.round(avgScore),
        totalTimeMs: elapsed,
        avgTimePerScript: Math.round(elapsed / configs.length),
    };

    callbacks.onComplete?.(results, summary);

    return { results, summary, cancelToken };
}

// ============================================================
// HELPERS
// ============================================================

function lerp(a, b, t) {
    return a + (b - a) * Math.max(0, Math.min(1, t));
}

function getLevelAtProgress(startLevel, endLevel, progress, type, index) {
    const levels = ['beginner', 'intermediate', 'advanced'];
    const startIdx = levels.indexOf(startLevel);
    const endIdx = levels.indexOf(endLevel);

    if (type === 'wave') {
        // Sine wave: goes up and down
        const wave = Math.sin(progress * Math.PI * 2) * 0.5 + 0.5;
        const levelIdx = Math.round(lerp(startIdx, endIdx, wave));
        return levels[Math.max(0, Math.min(2, levelIdx))];
    }

    if (type === 'thematic') {
        return startLevel; // Keep same level for thematic series
    }

    // Gradual (default)
    const levelIdx = Math.round(lerp(startIdx, endIdx, progress));
    return levels[Math.max(0, Math.min(2, levelIdx))];
}

function getFocusForIndex(index) {
    const focuses = ['relaxation', 'balance', 'flexibility', 'strength', 'meditation', 'energy', 'stress-relief'];
    return focuses[index % focuses.length];
}

// ============================================================
// EXPORTS
// ============================================================

export function getSeriesPresets() {
    return Object.entries(SERIES_PRESETS).map(([id, p]) => ({
        id,
        name: p.name,
        description: p.description,
        totalScripts: p.totalScripts,
    }));
}

export function getPlaylistThemes() {
    return Object.entries(PLAYLIST_THEMES).map(([id, t]) => ({
        id,
        name: t.name,
        description: t.description,
    }));
}

export function getSeriesPreset(id) {
    return SERIES_PRESETS[id] || null;
}

export function getPlaylistTheme(id) {
    return PLAYLIST_THEMES[id] || null;
}
