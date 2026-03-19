// ============================================================
// FINGERPRINT DB — Script Anti-Duplication System
// Tracks generated scripts and prevents duplicates
// ============================================================

/**
 * Generate a fingerprint for a script based on its key characteristics.
 * Used to detect similar scripts and prevent duplicates.
 * 
 * @param {object} params - { script, config, poseSequence, variationProfile }
 * @returns {object} Fingerprint object
 */
export function createFingerprint({ script, config, poseSequence, variationProfile }) {
    const now = new Date().toISOString();

    // Extract pose IDs in order
    const poseIds = (poseSequence || []).map(p => p.id || p.name);

    // Build signature string: category + audience + level + flow + first 5 poses
    const signatureBase = [
        config.category || '',
        config.niche?.audience || '',
        config.niche?.level || '',
        config.poses?.flow || '',
        config.language || '',
        ...poseIds.slice(0, 5),
    ].join('|');

    // Extract key phrases from intro (first 200 chars)
    const introText = (script || '').slice(0, 200).toLowerCase();
    const introWords = introText
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3)
        .slice(0, 10);

    return {
        id: generateId(),
        created: now,
        signatureBase,

        // Content markers
        category: config.category,
        audience: config.niche?.audience,
        level: config.niche?.level,
        language: config.language,
        flow: config.poses?.flow,
        poseCount: poseIds.length,
        poseIds,
        poseSet: new Set(poseIds), // For Jaccard comparison

        // Text markers
        introWords,
        scriptLength: (script || '').length,

        // Variation profile
        variationProfile: variationProfile || null,

        // Quality (filled later by audit)
        qualityScore: null,

        // Config snapshot
        configSnapshot: {
            category: config.category,
            niche: config.niche,
            session: config.session,
            language: config.language,
        },
    };
}

/**
 * Calculate similarity between two fingerprints (0-1 scale)
 * Uses weighted multi-factor comparison
 * 
 * @returns {{ total: number, breakdown: object }}
 */
export function compareFingerprintsDetailed(fpA, fpB) {
    const breakdown = {};

    // 1. Category match (weight: 15%)
    breakdown.category = fpA.category === fpB.category ? 1 : 0;

    // 2. Audience match (weight: 10%)
    breakdown.audience = fpA.audience === fpB.audience ? 1 : 0;

    // 3. Level match (weight: 5%)
    breakdown.level = fpA.level === fpB.level ? 1 : 0;

    // 4. Flow match (weight: 10%)
    breakdown.flow = fpA.flow === fpB.flow ? 1 : 0;

    // 5. Pose sequence similarity — Jaccard index (weight: 30%)
    const setA = new Set(fpA.poseIds || []);
    const setB = new Set(fpB.poseIds || []);
    const intersection = [...setA].filter(x => setB.has(x)).length;
    const union = new Set([...setA, ...setB]).size;
    breakdown.poseSimilarity = union > 0 ? intersection / union : 0;

    // 6. Pose ORDER similarity — longest common subsequence ratio (weight: 15%)
    breakdown.poseOrder = lcsRatio(fpA.poseIds || [], fpB.poseIds || []);

    // 7. Intro words overlap (weight: 10%)
    const wordsA = new Set(fpA.introWords || []);
    const wordsB = new Set(fpB.introWords || []);
    const wordIntersection = [...wordsA].filter(x => wordsB.has(x)).length;
    const wordUnion = new Set([...wordsA, ...wordsB]).size;
    breakdown.introOverlap = wordUnion > 0 ? wordIntersection / wordUnion : 0;

    // 8. Language match (weight: 5%)
    breakdown.language = fpA.language === fpB.language ? 1 : 0;

    // Weighted total
    const weights = {
        category: 0.15,
        audience: 0.10,
        level: 0.05,
        flow: 0.10,
        poseSimilarity: 0.30,
        poseOrder: 0.15,
        introOverlap: 0.10,
        language: 0.05,
    };

    let total = 0;
    for (const [key, weight] of Object.entries(weights)) {
        total += (breakdown[key] || 0) * weight;
    }

    return { total, breakdown };
}

/**
 * Check if a config would create a duplicate against existing fingerprints
 * Returns the most similar existing fingerprint if similarity > threshold
 * 
 * @param {object} newConfig - The proposed script config
 * @param {Array} existingFingerprints - Array of existing fingerprints
 * @param {number} threshold - Similarity threshold (default 0.75)
 * @returns {{ isDuplicate: boolean, similarity: number, match: object|null, suggestion: string }}
 */
export function checkDuplicate(newConfig, existingFingerprints, threshold = 0.75) {
    if (!existingFingerprints || existingFingerprints.length === 0) {
        return { isDuplicate: false, similarity: 0, match: null, suggestion: '' };
    }

    // Create a lightweight fingerprint from config for comparison
    const tempFp = {
        category: newConfig.category,
        audience: newConfig.niche?.audience,
        level: newConfig.niche?.level,
        flow: newConfig.poses?.flow,
        language: newConfig.language,
        poseIds: [], // Will be filled later
        introWords: [],
    };

    let maxSimilarity = 0;
    let bestMatch = null;

    for (const existing of existingFingerprints) {
        // Quick pre-filter: skip if category AND audience AND language all differ
        if (existing.category !== tempFp.category
            && existing.audience !== tempFp.audience
            && existing.language !== tempFp.language) {
            continue;
        }

        const { total } = compareFingerprintsDetailed(tempFp, existing);
        if (total > maxSimilarity) {
            maxSimilarity = total;
            bestMatch = existing;
        }
    }

    const isDuplicate = maxSimilarity >= threshold;
    let suggestion = '';

    if (isDuplicate && bestMatch) {
        suggestion = buildDuplicationSuggestion(newConfig, bestMatch);
    }

    return { isDuplicate, similarity: maxSimilarity, match: bestMatch, suggestion };
}

/**
 * Build a smart context summary from the last N fingerprints.
 * This is sent to the AI to help it avoid duplicating recent scripts.
 * IMPORTANT: Stays ~1000 tokens regardless of DB size!
 * 
 * @param {Array} fingerprints - All fingerprints, sorted by created date
 * @param {number} maxRecent - Number of recent scripts to summarize
 * @returns {string} Context summary for the AI prompt
 */
export function buildSmartContext(fingerprints, maxRecent = 10) {
    if (!fingerprints || fingerprints.length === 0) return '';

    const recent = fingerprints.slice(-maxRecent);

    const lines = ['=== ANTI-DUPLICATION CONTEXT ==='];
    lines.push(`You have generated ${fingerprints.length} scripts total.`);
    lines.push('Recent scripts used these approaches (DO NOT repeat them):');
    lines.push('');

    for (const fp of recent) {
        const profile = fp.variationProfile || {};
        const introStyle = profile.introStyle?.label || 'unknown';
        const metaphor = profile.metaphorTheme?.label || 'unknown';
        const voiceTone = profile.voiceTone?.label || 'unknown';
        const firstPoses = (fp.poseIds || []).slice(0, 3).join(', ');

        lines.push(
            `- ${fp.category}/${fp.audience}: intro="${introStyle}", metaphor="${metaphor}", ` +
            `tone="${voiceTone}", poses=[${firstPoses}...]`
        );
    }

    // Aggregate: most overused categories
    const catCounts = {};
    for (const fp of fingerprints) {
        catCounts[fp.category] = (catCounts[fp.category] || 0) + 1;
    }
    const overused = Object.entries(catCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat, count]) => `${cat}(${count})`)
        .join(', ');

    lines.push('');
    lines.push(`Most produced categories: ${overused}`);
    lines.push('');
    lines.push('Use DIFFERENT intros, metaphors, pacing, and sensory focus than listed above.');

    return lines.join('\n');
}

// ============================================================
// STORAGE — localStorage-based fingerprint persistence
// ============================================================

const STORAGE_KEY = 'yogakids_script_fingerprints';

/**
 * Get all saved fingerprints from localStorage
 */
export function getFingerprints() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

/**
 * Save a new fingerprint
 */
export function saveFingerprint(fingerprint) {
    const existing = getFingerprints();
    existing.push(fingerprint);

    // Keep max 500 fingerprints (oldest get trimmed)
    if (existing.length > 500) {
        existing.splice(0, existing.length - 500);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return existing;
}

/**
 * Update quality score on an existing fingerprint
 */
export function updateFingerprintScore(fingerprintId, score) {
    const fps = getFingerprints();
    const fp = fps.find(f => f.id === fingerprintId);
    if (fp) {
        fp.qualityScore = score;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fps));
    }
}

/**
 * Get fingerprint count
 */
export function getFingerprintCount() {
    return getFingerprints().length;
}

/**
 * Clear all fingerprints
 */
export function clearFingerprints() {
    localStorage.removeItem(STORAGE_KEY);
}

// ============================================================
// HELPERS
// ============================================================

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Longest Common Subsequence ratio between two arrays
 */
function lcsRatio(arrA, arrB) {
    if (arrA.length === 0 || arrB.length === 0) return 0;

    const m = arrA.length;
    const n = arrB.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (arrA[i - 1] === arrB[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    return dp[m][n] / Math.max(m, n);
}

function buildDuplicationSuggestion(newConfig, existingFp) {
    const suggestions = [];

    if (newConfig.category === existingFp.category) {
        suggestions.push(`Try a different category (you already have ${existingFp.category})`);
    }
    if (newConfig.niche?.audience === existingFp.audience) {
        suggestions.push(`Try a different audience (you already have ${existingFp.audience})`);
    }
    if (newConfig.poses?.flow === existingFp.flow) {
        suggestions.push(`Try a different flow strategy (you already used ${existingFp.flow})`);
    }

    return suggestions.length > 0
        ? 'To avoid duplicates: ' + suggestions.join('; ')
        : 'Consider changing more configuration options for variety.';
}
