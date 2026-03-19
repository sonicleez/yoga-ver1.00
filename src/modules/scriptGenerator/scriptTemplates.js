/**
 * SCRIPT TEMPLATES — Pre-defined configurations for common use cases
 * 
 * Each template pre-fills the config with the best settings for a specific
 * use case (bedtime, morning, kids, etc.) while allowing user customization.
 */

// ============================================================
// TEMPLATE DEFINITIONS
// ============================================================

export const SCRIPT_TEMPLATES = {
    // ─────────── CATEGORY-BASED ───────────

    bedtime_gentle: {
        name: '🌙 Bedtime — Gentle Wind-down',
        description: 'Calming poses that progressively relax the body for sleep.',
        category: 'bedtime',
        config: {
            niche: {
                level: 'beginner',
                audience: 'adults',
                ageRange: 'adult',
                focusArea: 'relaxation',
                bodyFocus: 'full-body',
            },
            session: {
                duration: 15,
                poseCount: 12,
                narrationStyle: 'short',
                breathCues: true,
                transitionCues: true,
            },
            poses: {
                flow: 'warm_to_cool',
                mustInclude: ['savasana'],
                excludePoses: [],
            },
            ai: { temperature: 0.7, creativity: 'balanced' },
        },
        systemPromptHints: 'Write in a very calm, soothing voice. Use imagery of moonlight, stillness, warmth, and comfort. Make the listener want to close their eyes and drift off.',
    },

    morning_energize: {
        name: '☀️ Morning — Wake Up Flow',
        description: 'Energizing sequence to start the day with vitality.',
        category: 'morning',
        config: {
            niche: {
                level: 'beginner',
                audience: 'adults',
                ageRange: 'adult',
                focusArea: 'energy',
                bodyFocus: 'full-body',
            },
            session: {
                duration: 15,
                poseCount: 12,
                narrationStyle: 'short',
                breathCues: true,
                transitionCues: true,
            },
            poses: {
                flow: 'cool_to_warm',
                mustInclude: ['mountain_pose', 'savasana'],
                excludePoses: [],
            },
            ai: { temperature: 0.7, creativity: 'balanced' },
        },
        systemPromptHints: 'Write with bright, clear, motivating energy. Use sunlight, morning freshness, and awakening imagery. Make listenrs feel ready to conquer the day.',
    },

    kids_adventure: {
        name: '👶 Kids — Animal Adventure',
        description: 'Fun, playful yoga with animal poses for children.',
        category: 'kids',
        config: {
            niche: {
                level: 'beginner',
                audience: 'kids',
                ageRange: 'child',
                focusArea: 'balance',
                bodyFocus: 'full-body',
            },
            session: {
                duration: 10,
                poseCount: 8,
                narrationStyle: 'short',
                breathCues: true,
                transitionCues: true,
            },
            poses: {
                flow: 'themed_animals',
                mustInclude: ['savasana'],
                excludePoses: [],
            },
            ai: { temperature: 0.8, creativity: 'creative' },
        },
        systemPromptHints: 'Write in a fun, playful, exciting voice. Use animal sounds, adventure stories, and imagination. Make kids laugh and play while stretching. Short sentences only.',
    },

    meditation_mindfulness: {
        name: '🧘 Meditation & Mindfulness',
        description: 'Gentle seated practices focusing on breath awareness.',
        category: 'meditation',
        config: {
            niche: {
                level: 'beginner',
                audience: 'adults',
                ageRange: 'adult',
                focusArea: 'meditation',
                bodyFocus: 'full-body',
            },
            session: {
                duration: 20,
                poseCount: 8,
                narrationStyle: 'detailed',
                breathCues: true,
                transitionCues: true,
            },
            poses: {
                flow: 'chakra',
                mustInclude: ['easy_pose', 'seated_meditation', 'savasana'],
                excludePoses: [],
            },
            ai: { temperature: 0.6, creativity: 'balanced' },
        },
        systemPromptHints: 'Write in a deeply peaceful, meditative voice. Longer pauses between instructions. Use sensory awareness, body scanning, and present-moment imagery.',
    },

    power_strength: {
        name: '💪 Power — Strength Building',
        description: 'Active vinyasa-style flow for strength and stamina.',
        category: 'power',
        config: {
            niche: {
                level: 'intermediate',
                audience: 'adults',
                ageRange: 'adult',
                focusArea: 'strength',
                bodyFocus: 'full-body',
            },
            session: {
                duration: 20,
                poseCount: 15,
                narrationStyle: 'minimal',
                breathCues: true,
                transitionCues: true,
            },
            poses: {
                flow: 'progressive',
                mustInclude: ['warrior_1', 'warrior_2', 'plank_pose', 'savasana'],
                excludePoses: [],
            },
            ai: { temperature: 0.7, creativity: 'balanced' },
        },
        systemPromptHints: 'Write with confident, motivating energy. Short, direct instructions. Encourage strength and power. Use fire, warrior, and champion imagery.',
    },

    // ─────────── AUDIENCE-BASED ───────────

    senior_gentle: {
        name: '👴 Senior — Gentle & Safe',
        description: 'Low-impact, accessible yoga for older adults.',
        category: 'senior',
        config: {
            niche: {
                level: 'beginner',
                audience: 'seniors',
                ageRange: 'senior',
                focusArea: 'flexibility',
                bodyFocus: 'full-body',
            },
            session: {
                duration: 15,
                poseCount: 10,
                narrationStyle: 'detailed',
                breathCues: true,
                transitionCues: true,
            },
            poses: {
                flow: 'progressive',
                mustInclude: ['easy_pose', 'savasana'],
                excludePoses: ['warrior_3', 'eagle_pose', 'dancer_pose', 'half_moon', 'boat_pose', 'bow_pose', 'camel_pose'],
            },
            ai: { temperature: 0.6, creativity: 'moderate' },
        },
        systemPromptHints: 'Write with extra care for safety. Always mention modifications. Encourage going at their own pace. Warm, supportive, not patronizing.',
    },

    office_desk: {
        name: '🪑 Office — Desk Yoga Break',
        description: 'Quick stretches you can do at your desk.',
        category: 'office',
        config: {
            niche: {
                level: 'beginner',
                audience: 'office-workers',
                ageRange: 'adult',
                focusArea: 'stress-relief',
                bodyFocus: 'upper-body',
            },
            session: {
                duration: 10,
                poseCount: 8,
                narrationStyle: 'short',
                breathCues: true,
                transitionCues: true,
            },
            poses: {
                flow: 'body_scan',
                mustInclude: ['gentle_neck_stretch', 'shoulder_rolls'],
                excludePoses: ['savasana', 'downward_facing_dog', 'plank_pose', 'cobra_pose'],
            },
            ai: { temperature: 0.7, creativity: 'balanced' },
        },
        systemPromptHints: 'These poses are done at or near a desk/chair. Mention "at your desk" or "in your chair" where appropriate. Quick, practical, refreshing.',
    },

    prenatal_safe: {
        name: '🤰 Prenatal — Safe & Supportive',
        description: 'Gentle, pregnancy-safe poses with modifications.',
        category: 'prenatal',
        config: {
            niche: {
                level: 'beginner',
                audience: 'pregnant',
                ageRange: 'adult',
                focusArea: 'relaxation',
                bodyFocus: 'full-body',
            },
            session: {
                duration: 15,
                poseCount: 10,
                narrationStyle: 'detailed',
                breathCues: true,
                transitionCues: true,
            },
            poses: {
                flow: 'warm_to_cool',
                mustInclude: ['butterfly_pose', 'cat_cow', 'savasana'],
                excludePoses: ['cobra_pose', 'locust_pose', 'bow_pose', 'boat_pose', 'fish_pose', 'happy_baby'],
            },
            ai: { temperature: 0.6, creativity: 'moderate' },
        },
        systemPromptHints: 'Always prioritize safety. Mention modifications for pregnancy (props, pillows). Warm, nurturing, empowering voice. Avoid any pose on belly.',
    },

    yin_deep_stretch: {
        name: '🌿 Yin — Deep Stretch & Release',
        description: 'Slow held poses (3-5 min each) for deep flexibility.',
        category: 'yin',
        config: {
            niche: {
                level: 'beginner',
                audience: 'adults',
                ageRange: 'adult',
                focusArea: 'flexibility',
                bodyFocus: 'full-body',
            },
            session: {
                duration: 30,
                poseCount: 8,
                narrationStyle: 'poetic',
                breathCues: true,
                transitionCues: true,
            },
            poses: {
                flow: 'warm_to_cool',
                mustInclude: ['butterfly_pose', 'pigeon_pose', 'sleeping_pigeon', 'savasana'],
                excludePoses: ['plank_pose', 'chair_pose', 'warrior_3'],
            },
            ai: { temperature: 0.8, creativity: 'creative' },
        },
        systemPromptHints: 'Write poetically with longer narration per pose. Each pose is held for 3-5 minutes. Use imagery of melting, releasing, letting go. Describe sensations.',
    },

    athlete_recovery: {
        name: '🏃 Athlete — Post-Workout Recovery',
        description: 'Targeted stretching for athletic recovery.',
        category: 'recovery',
        config: {
            niche: {
                level: 'beginner',
                audience: 'athletes',
                ageRange: 'adult',
                focusArea: 'flexibility',
                bodyFocus: 'full-body',
            },
            session: {
                duration: 15,
                poseCount: 12,
                narrationStyle: 'short',
                breathCues: true,
                transitionCues: true,
            },
            poses: {
                flow: 'body_scan',
                mustInclude: ['pigeon_pose', 'seated_forward_fold', 'supine_twist', 'savasana'],
                excludePoses: [],
            },
            ai: { temperature: 0.6, creativity: 'moderate' },
        },
        systemPromptHints: 'Write with a supportive, coaching voice. Focus on muscle recovery, tension release, and body awareness. Use sports-friendly language.',
    },
};

// ============================================================
// API
// ============================================================

/**
 * Get all template options for UI
 */
export function getTemplateOptions() {
    return Object.entries(SCRIPT_TEMPLATES).map(([id, t]) => ({
        id,
        name: t.name,
        description: t.description,
        category: t.category,
    }));
}

/**
 * Get a specific template config
 */
export function getTemplate(templateId) {
    return SCRIPT_TEMPLATES[templateId] || null;
}

/**
 * Get templates filtered by category
 */
export function getTemplatesByCategory(category) {
    return Object.entries(SCRIPT_TEMPLATES)
        .filter(([_, t]) => t.category === category)
        .map(([id, t]) => ({ id, ...t }));
}

/**
 * Apply template config to current config (merge, don't replace globals)
 */
export function applyTemplate(templateId, currentConfig = {}) {
    const template = getTemplate(templateId);
    if (!template) return currentConfig;

    return {
        ...currentConfig,
        ...template.config,
        niche: { ...(currentConfig.niche || {}), ...template.config.niche },
        session: { ...(currentConfig.session || {}), ...template.config.session },
        poses: { ...(currentConfig.poses || {}), ...template.config.poses },
        ai: { ...(currentConfig.ai || {}), ...template.config.ai },
        _templateId: templateId,
        _templateHints: template.systemPromptHints,
    };
}
