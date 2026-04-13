/**
 * FLOW STRATEGIES — Pose sequencing logic
 * 
 * Defines how poses are arranged in a session based on energy curve,
 * body focus progression, or thematic grouping.
 */

import { findPoses, POSE_CATEGORIES } from './poseDatabase.js';

// ============================================================
// STRATEGY DEFINITIONS
// ============================================================

export const FLOW_STRATEGIES = {
    progressive: {
        name: 'Progressive Flow',
        icon: '📈',
        description: 'Warm-up → Standing → Peak → Floor → Cool-down → Rest',
        phases: [
            { name: 'Warm-up', categories: ['warmup', 'breathing'], ratio: 0.15 },
            { name: 'Standing', categories: ['standing', 'balancing'], ratio: 0.25 },
            { name: 'Peak', categories: ['backbend', 'inversion', 'hip_opener'], ratio: 0.20 },
            { name: 'Floor', categories: ['floor', 'seated', 'twist'], ratio: 0.20 },
            { name: 'Cool-down', categories: ['cooldown', 'supine'], ratio: 0.10 },
            { name: 'Rest', categories: ['restorative'], ratio: 0.10 },
        ],
    },

    warm_to_cool: {
        name: 'Warm to Cool',
        icon: '🌙',
        description: 'Energy decreases gradually — perfect for bedtime/evening',
        phases: [
            { name: 'Gentle Start', categories: ['warmup', 'seated', 'breathing'], ratio: 0.20 },
            { name: 'Light Movement', categories: ['standing', 'floor'], ratio: 0.20 },
            { name: 'Deepening', categories: ['seated', 'hip_opener', 'twist'], ratio: 0.25 },
            { name: 'Winding Down', categories: ['supine', 'cooldown'], ratio: 0.20 },
            { name: 'Rest', categories: ['restorative'], ratio: 0.15 },
        ],
    },

    cool_to_warm: {
        name: 'Cool to Warm',
        icon: '☀️',
        description: 'Energy increases gradually — perfect for morning/energizing',
        phases: [
            { name: 'Wake Up', categories: ['warmup', 'breathing'], ratio: 0.15 },
            { name: 'Build', categories: ['standing', 'balancing'], ratio: 0.30 },
            { name: 'Peak Energy', categories: ['backbend', 'inversion', 'standing'], ratio: 0.30 },
            { name: 'Integration', categories: ['twist', 'seated'], ratio: 0.15 },
            { name: 'Close', categories: ['restorative'], ratio: 0.10 },
        ],
    },

    body_scan: {
        name: 'Body Scan Flow',
        icon: '🔍',
        description: 'Head → Shoulders → Core → Hips → Legs → Full body',
        phases: [
            { name: 'Head & Neck', bodyParts: ['neck', 'head'], ratio: 0.10 },
            { name: 'Shoulders & Arms', bodyParts: ['shoulders', 'arms'], ratio: 0.15 },
            { name: 'Spine & Core', bodyParts: ['spine', 'core'], ratio: 0.25 },
            { name: 'Hips & Pelvis', bodyParts: ['hips', 'groin', 'inner-thighs'], ratio: 0.20 },
            { name: 'Legs & Feet', bodyParts: ['legs', 'hamstrings', 'calves'], ratio: 0.20 },
            { name: 'Full Body Rest', bodyParts: ['full-body'], ratio: 0.10 },
        ],
    },

    chakra: {
        name: 'Chakra Flow',
        icon: '🔮',
        description: 'Root → Sacral → Solar → Heart → Throat → Crown',
        phases: [
            { name: 'Root (Muladhara)', focusAreas: ['balance', 'strength'], ratio: 0.15 },
            { name: 'Sacral (Svadhisthana)', focusAreas: ['flexibility'], ratio: 0.15 },
            { name: 'Solar Plexus (Manipura)', focusAreas: ['core', 'energy'], ratio: 0.15 },
            { name: 'Heart (Anahata)', focusAreas: ['posture'], ratio: 0.15 },
            { name: 'Throat (Vishuddha)', focusAreas: ['breathing'], ratio: 0.10 },
            { name: 'Third Eye & Crown', focusAreas: ['mindfulness', 'meditation', 'relaxation'], ratio: 0.30 },
        ],
    },

    themed_animals: {
        name: 'Animal Theme (Kids)',
        icon: '🦁',
        description: 'Poses named after animals — fun for children',
        phases: [
            { name: 'On the Farm', categories: ['warmup'], ratio: 0.15 },
            { name: 'Safari', categories: ['standing', 'floor', 'backbend', 'balancing', 'hip_opener', 'inversion'], ratio: 0.60, animalOnly: true },
            { name: 'Sleepy Animals', categories: ['supine', 'restorative'], ratio: 0.25 },
        ],
    },

    random: {
        name: 'Random Mix',
        icon: '🎲',
        description: 'Random selection from available poses',
        phases: [], // Will be handled specially
    },
};

// ============================================================
// MAIN API
// ============================================================

/**
 * Build a complete pose sequence based on config
 * 
 * @param {Object} config
 * @param {number} config.poseCount - Total number of poses
 * @param {string} config.flow - Flow strategy key
 * @param {string} config.level - Max difficulty level
 * @param {string} config.audience - Target audience filter
 * @param {string} config.focusArea - Optional focus area filter
 * @param {string[]} config.exclude - Pose IDs to exclude
 * @param {string[]} config.mustInclude - Pose IDs that must appear
 * @returns {Array<{id: string, name: string, phase: string, ...}>}
 */
export function buildPoseSequence(config) {
    const {
        poseCount = 12,
        flow = 'progressive',
        level = 'beginner',
        audience,
        focusArea,
        exclude = [],
        mustInclude = ['savasana'],
    } = config;

    const strategy = FLOW_STRATEGIES[flow] || FLOW_STRATEGIES.progressive;

    if (flow === 'random') {
        return buildRandomSequence(poseCount, { level, audience, focusArea, exclude, mustInclude });
    }

    if (flow === 'themed_animals') {
        return buildAnimalSequence(poseCount, { level, audience, exclude, mustInclude });
    }

    return buildPhaseSequence(strategy, poseCount, { level, audience, focusArea, exclude, mustInclude });
}

/**
 * Get all available flow strategy options
 */
export function getFlowOptions() {
    return Object.entries(FLOW_STRATEGIES).map(([id, s]) => ({
        id,
        name: s.name,
        icon: s.icon,
        description: s.description,
    }));
}

// ============================================================
// SEQUENCE BUILDERS
// ============================================================

function buildPhaseSequence(strategy, totalCount, filters) {
    const sequence = [];
    const usedIds = new Set();
    const { mustInclude = [] } = filters;

    // Reserve spots for mustInclude poses
    const reservedCount = mustInclude.filter(id => {
        // Only count mustInclude poses that actually exist in the DB
        return findPoses({ exclude: [] }).some(p => p.id === id);
    }).length;
    const availableSlots = totalCount - reservedCount;

    // ── Compute per-phase slot counts with rounding correction ──
    // Use floor() for each phase, then distribute remaining slots to
    // phases with the highest fractional portion (largest-remainder method).
    const rawCounts = strategy.phases.map(phase => availableSlots * phase.ratio);
    const floorCounts = rawCounts.map(c => Math.max(1, Math.floor(c)));
    let allocated = floorCounts.reduce((a, b) => a + b, 0);
    let remainder = availableSlots - allocated;

    // Sort by fractional part descending and give +1 to those phases
    if (remainder > 0) {
        const fractions = rawCounts.map((c, i) => ({ i, frac: c - Math.floor(c) }));
        fractions.sort((a, b) => b.frac - a.frac);
        for (let k = 0; k < remainder && k < fractions.length; k++) {
            floorCounts[fractions[k].i]++;
        }
    }

    for (let phaseIdx = 0; phaseIdx < strategy.phases.length; phaseIdx++) {
        const phase = strategy.phases[phaseIdx];
        const phaseCount = floorCounts[phaseIdx];

        // Build filter for this phase
        const phaseFilter = { ...filters };
        if (phase.categories) {
            phaseFilter.category = phase.categories;
        }
        if (phase.bodyParts) {
            phaseFilter.bodyPart = phase.bodyParts[0]; // Primary body part
        }
        if (phase.focusAreas) {
            phaseFilter.focusArea = phase.focusAreas[0]; // Primary focus
        }
        // Always exclude already-used poses and must-include (added separately)
        phaseFilter.exclude = [...(filters.exclude || []), ...usedIds, ...mustInclude];

        const available = findPoses(phaseFilter);

        // Shuffle and pick up to phaseCount (may pick fewer if not enough available)
        const shuffled = shuffleArray(available);
        const picked = shuffled.slice(0, phaseCount);

        for (const pose of picked) {
            sequence.push({ ...pose, phase: phase.name });
            usedIds.add(pose.id);
        }
    }

    // ── Fallback fill: if phases didn't produce enough poses, pull from anywhere ──
    if (sequence.length < availableSlots) {
        const fallbackFilter = {
            level: filters.level,
            audience: filters.audience,
            exclude: [...(filters.exclude || []), ...usedIds, ...mustInclude],
        };
        const fallbackPoses = shuffleArray(findPoses(fallbackFilter));
        for (const pose of fallbackPoses) {
            if (sequence.length >= availableSlots) break;
            sequence.push({ ...pose, phase: 'General' });
            usedIds.add(pose.id);
        }
    }

    // Add mustInclude poses at appropriate positions
    for (const poseId of mustInclude) {
        const pose = findPoses({ exclude: [] }).find(p => p.id === poseId);
        if (pose && !usedIds.has(poseId)) {
            // Savasana always at end, others at their natural position
            if (poseId === 'savasana') {
                sequence.push({ ...pose, phase: 'Rest' });
            } else {
                // Insert at a reasonable position based on category order
                const catOrder = POSE_CATEGORIES[pose.category]?.order || 6;
                const insertIdx = Math.min(
                    Math.round((catOrder / 13) * sequence.length),
                    sequence.length
                );
                sequence.splice(insertIdx, 0, { ...pose, phase: 'Custom' });
            }
            usedIds.add(poseId);
        }
    }

    // Final trim to exact requested count (safety guard)
    return sequence.slice(0, totalCount);
}

function buildAnimalSequence(totalCount, filters) {
    const animalPattern = /cat|cow|cobra|dog|eagle|fish|frog|butterfly|camel|crow|pigeon|lizard|rabbit|locust/i;

    const allPoses = findPoses({ level: filters.level, audience: filters.audience, exclude: filters.exclude });
    const animalPoses = allPoses.filter(p => animalPattern.test(p.name));
    const nonAnimalPoses = allPoses.filter(p => !animalPattern.test(p.name));

    const sequence = [];
    const usedIds = new Set();

    // Start with 1-2 warmup poses
    const warmups = nonAnimalPoses.filter(p => p.category === 'warmup');
    const warmupPick = shuffleArray(warmups).slice(0, Math.min(2, warmups.length));
    for (const p of warmupPick) {
        sequence.push({ ...p, phase: 'Warm-up' });
        usedIds.add(p.id);
    }

    // Fill middle with animal poses
    const middleSlots = totalCount - warmupPick.length - 1; // -1 for savasana
    const shuffledAnimals = shuffleArray(animalPoses).filter(p => !usedIds.has(p.id));
    for (let i = 0; i < Math.min(middleSlots, shuffledAnimals.length); i++) {
        sequence.push({ ...shuffledAnimals[i], phase: 'Animal Safari' });
        usedIds.add(shuffledAnimals[i].id);
    }

    // Fallback: fill remaining middle slots from non-animal poses if not enough animals
    if (sequence.length < totalCount - 1) {
        const extraPoses = shuffleArray(nonAnimalPoses).filter(
            p => !usedIds.has(p.id) && p.category !== 'restorative'
        );
        for (const pose of extraPoses) {
            if (sequence.length >= totalCount - 1) break;
            sequence.push({ ...pose, phase: 'General' });
            usedIds.add(pose.id);
        }
    }

    // End with savasana (always last)
    const savasana = findPoses({}).find(p => p.id === 'savasana');
    if (savasana && !usedIds.has('savasana')) {
        sequence.push({ ...savasana, phase: 'Rest' });
    }

    return sequence.slice(0, totalCount);
}

function buildRandomSequence(totalCount, filters) {
    const mustInclude = filters.mustInclude || [];

    // Exclude mustInclude from random pool — they'll be added explicitly at the end
    const available = findPoses({
        level: filters.level,
        audience: filters.audience,
        focusArea: filters.focusArea,
        exclude: [...(filters.exclude || []), ...mustInclude],
    });

    const shuffled = shuffleArray(available);
    // Reserve exact slots for mustInclude poses that actually exist
    const existingMustInclude = mustInclude.filter(id =>
        findPoses({ exclude: [] }).some(p => p.id === id)
    );
    const sequence = shuffled.slice(0, totalCount - existingMustInclude.length);

    // Add mustInclude at the end (savasana always last)
    const savasanaIds = existingMustInclude.filter(id => id === 'savasana');
    const otherMustInclude = existingMustInclude.filter(id => id !== 'savasana');

    for (const poseId of otherMustInclude) {
        const pose = findPoses({ exclude: [] }).find(p => p.id === poseId);
        if (pose) sequence.push({ ...pose, phase: 'Custom' });
    }
    for (const poseId of savasanaIds) {
        const pose = findPoses({ exclude: [] }).find(p => p.id === poseId);
        if (pose) sequence.push({ ...pose, phase: 'Rest' });
    }

    return sequence.slice(0, totalCount).map(p => ({ ...p, phase: p.phase || 'Random' }));
}

// ============================================================
// DURATION CALCULATOR
// ============================================================

/**
 * Auto-calculate optimal pose count based on duration and narration style
 */
export function calculatePoseCount(durationMinutes, narrationStyle = 'short') {
    // Average time per pose (narration + hold)
    const avgTimePerPose = {
        minimal: 45,   // seconds
        short: 60,     // seconds
        detailed: 80,  // seconds
        poetic: 90,    // seconds
    };

    const introOutroTime = 60; // ~30s each
    const availableTime = (durationMinutes * 60) - introOutroTime;
    const perPose = avgTimePerPose[narrationStyle] || 60;

    return Math.max(3, Math.min(30, Math.round(availableTime / perPose)));
}

// ============================================================
// UTILITIES
// ============================================================

function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
