// ============================================================
// VARIATION ENGINE — 12-Dimension Forced Creativity
// Forces each script to be unique across multiple dimensions
// ============================================================

/**
 * 12 dimensions of variation to ensure creative diversity
 * Each dimension has multiple options that get randomly selected
 * or rotated based on history
 */
export const VARIATION_DIMENSIONS = {
    // 1. Intro Style — How the script opens
    introStyle: {
        options: [
            { id: 'welcoming', label: 'Warm Welcome', hint: 'Start with a warm, inviting greeting' },
            { id: 'sensory', label: 'Sensory Scene', hint: 'Open with vivid sensory imagery (sounds, feelings, temperature)' },
            { id: 'breath', label: 'Breath Focus', hint: 'Begin with a breathing exercise to center' },
            { id: 'story', label: 'Mini Story', hint: 'Open with a very short story or metaphor' },
            { id: 'question', label: 'Reflective Question', hint: 'Start by asking the viewer a thoughtful question' },
            { id: 'gratitude', label: 'Gratitude', hint: 'Begin with an expression of gratitude for showing up' },
            { id: 'body_scan', label: 'Quick Body Scan', hint: 'Start with a brief awareness of body sensations' },
            { id: 'visualization', label: 'Visualization', hint: 'Open with a guided visualization of a peaceful place' },
        ],
    },

    // 2. Metaphor Theme — Running metaphor throughout
    metaphorTheme: {
        options: [
            { id: 'nature', label: 'Nature', hint: 'Use nature metaphors: trees, rivers, mountains, sky' },
            { id: 'water', label: 'Water Flow', hint: 'Water metaphors: flowing, waves, ocean, rain, stream' },
            { id: 'light', label: 'Light & Shadow', hint: 'Light metaphors: sunshine, candle, glow, dawn' },
            { id: 'garden', label: 'Garden', hint: 'Garden metaphors: planting, growing, blooming, roots' },
            { id: 'journey', label: 'Journey', hint: 'Journey metaphors: path, steps, exploration, destination' },
            { id: 'season', label: 'Seasons', hint: 'Seasonal metaphors matching the mood' },
            { id: 'sky', label: 'Sky & Space', hint: 'Sky metaphors: clouds, stars, moon, expansive sky' },
            { id: 'none', label: 'No Metaphor', hint: 'Keep narration simple and direct without metaphors' },
        ],
    },

    // 3. Pacing Pattern — How energy flows through the session
    pacingPattern: {
        options: [
            { id: 'steady', label: 'Steady', hint: 'Maintain consistent pace throughout' },
            { id: 'wave', label: 'Wave', hint: 'Alternate between active and restful, like ocean waves' },
            { id: 'build_release', label: 'Build & Release', hint: 'Gradually build intensity then release' },
            { id: 'slow_start', label: 'Slow Start', hint: 'Begin very gently, gradually increase energy' },
            { id: 'peak_valley', label: 'Peak & Valley', hint: 'One clear peak moment, gentle before and after' },
        ],
    },

    // 4. Sensory Focus — Which senses to emphasize
    sensoryFocus: {
        options: [
            { id: 'breath_sound', label: 'Breath & Sound', hint: 'Focus on breath sounds, ambient sounds, silence' },
            { id: 'touch_texture', label: 'Touch & Texture', hint: 'Focus on physical sensations, mat texture, air on skin' },
            { id: 'visual', label: 'Visual Imagery', hint: 'Paint pictures with words, colors, light, scenes' },
            { id: 'body_awareness', label: 'Body Awareness', hint: 'Focus on muscle engagement, weight, gravity' },
            { id: 'temperature', label: 'Temperature', hint: 'Notice warmth, coolness, the energy heat in muscles' },
            { id: 'mixed', label: 'Multi-sensory', hint: 'Blend multiple senses throughout' },
        ],
    },

    // 5. Emotional Arc — The emotional journey
    emotionalArc: {
        options: [
            { id: 'calm_to_peace', label: 'Calm → Peace', hint: 'From gentle calm to deep inner peace' },
            { id: 'tension_to_release', label: 'Tension → Release', hint: 'Acknowledge tension, then release it' },
            { id: 'joy_gratitude', label: 'Joy & Gratitude', hint: 'Build feelings of joy and thankfulness' },
            { id: 'curious_explore', label: 'Curiosity', hint: 'Approach each pose with curiosity and wonder' },
            { id: 'empowerment', label: 'Empowerment', hint: 'Build confidence and inner strength' },
            { id: 'letting_go', label: 'Letting Go', hint: 'Theme of releasing, surrendering, making space' },
        ],
    },

    // 6. Transition Style — How to move between poses
    transitionStyle: {
        options: [
            { id: 'breath_led', label: 'Breath-Led', hint: 'Each transition is guided by inhale/exhale' },
            { id: 'flowing', label: 'Flowing', hint: 'Smooth, dance-like transitions between poses' },
            { id: 'mindful_pause', label: 'Mindful Pause', hint: 'Pause between poses for awareness' },
            { id: 'counting', label: 'Counted', hint: 'Use breath counts for transitions (3 breaths to move...)' },
            { id: 'natural', label: 'Natural', hint: 'Simple, direct movement cues' },
        ],
    },

    // 7. Cue Depth — How detailed the pose instructions are
    cueDepth: {
        options: [
            { id: 'minimal', label: 'Minimal', hint: 'Just the pose name and basic position' },
            { id: 'alignment', label: 'Alignment Focus', hint: 'Detailed alignment cues for each pose' },
            { id: 'sensation', label: 'Sensation Focus', hint: 'Focus on what the pose should feel like' },
            { id: 'modification', label: 'Modifications', hint: 'Include easier/harder variations' },
            { id: 'benefit', label: 'Benefit-Focused', hint: 'Explain what each pose does for the body' },
        ],
    },

    // 8. Voice Tone Variation — Narration voice style
    voiceTone: {
        options: [
            { id: 'warm_nurturing', label: 'Warm & Nurturing', hint: 'Gentle, caring, like a supportive friend' },
            { id: 'calm_meditative', label: 'Calm & Meditative', hint: 'Very still, spacious, contemplative' },
            { id: 'encouraging', label: 'Encouraging', hint: 'Motivating, uplifting, "you can do this!"' },
            { id: 'poetic', label: 'Poetic', hint: 'Lyrical, beautiful language, almost musical' },
            { id: 'casual_friendly', label: 'Casual & Friendly', hint: 'Like chatting with a friend in class' },
            { id: 'professional', label: 'Professional', hint: 'Clear, precise, teacher-like' },
        ],
    },

    // 9. Outro Style — How the session closes
    outroStyle: {
        options: [
            { id: 'gratitude', label: 'Gratitude Close', hint: 'Close with thanks and appreciation' },
            { id: 'intention', label: 'Set Intention', hint: 'Carry a positive intention into the day/night' },
            { id: 'affirmation', label: 'Affirmation', hint: 'End with a positive affirmation or mantra' },
            { id: 'gentle_return', label: 'Gentle Return', hint: 'Slowly bring awareness back, wiggle fingers/toes' },
            { id: 'namaste', label: 'Namaste', hint: 'Traditional closing with namaste' },
            { id: 'reflection', label: 'Reflection', hint: 'Invite a moment of quiet reflection' },
        ],
    },

    // 10. Breath Pattern — Which breathing techniques to use
    breathPattern: {
        options: [
            { id: 'simple', label: 'Simple In/Out', hint: 'Basic deep breathing' },
            { id: 'counted', label: '4-7-8 Count', hint: 'Inhale 4, hold 7, exhale 8' },
            { id: 'ujjayi', label: 'Ujjayi', hint: 'Ocean breath with slight throat constriction' },
            { id: 'box', label: 'Box Breathing', hint: 'Equal inhale-hold-exhale-hold (4-4-4-4)' },
            { id: 'belly', label: 'Belly Breath', hint: 'Deep diaphragmatic breathing, belly rise/fall' },
            { id: 'alternate', label: 'Alternate Nostril', hint: 'Nadi Shodhana style' },
        ],
    },

    // 11. Language Flair — Writing style nuances
    languageFlair: {
        options: [
            { id: 'simple_clear', label: 'Simple & Clear', hint: 'Short sentences, easy vocabulary' },
            { id: 'descriptive', label: 'Descriptive', hint: 'Rich adjectives and sensory language' },
            { id: 'rhythmic', label: 'Rhythmic', hint: 'Sentences that have a musical rhythm' },
            { id: 'sparse', label: 'Sparse', hint: 'Very few words, lots of silence implied' },
            { id: 'conversational', label: 'Conversational', hint: 'Like talking to someone, use "you" often' },
        ],
    },

    // 12. Special Element — A unique creative touch
    specialElement: {
        options: [
            { id: 'quote', label: 'Wisdom Quote', hint: 'Include a relevant yoga/mindfulness quote' },
            { id: 'fun_fact', label: 'Pose Fun Fact', hint: 'Share an interesting fact about a pose' },
            { id: 'challenge', label: 'Mini Challenge', hint: 'Include one optional challenge moment' },
            { id: 'partner_cue', label: 'Partner Option', hint: 'Mention a partner variation for one pose' },
            { id: 'sound', label: 'Sound Cue', hint: 'Include a humming, sighing, or om moment' },
            { id: 'none', label: 'None', hint: 'No special element' },
        ],
    },
};

/**
 * Generate a variation profile — a unique combination of dimensions
 * @param {object} options - { history: [], forceOptions: {} }
 * @returns {object} Variation profile with selected options for each dimension
 */
export function generateVariation(options = {}) {
    const { history = [], forceOptions = {} } = options;
    const profile = {};

    for (const [dimension, dimConfig] of Object.entries(VARIATION_DIMENSIONS)) {
        // If forced, use that
        if (forceOptions[dimension]) {
            profile[dimension] = dimConfig.options.find(o => o.id === forceOptions[dimension])
                || dimConfig.options[0];
            continue;
        }

        // Gather recently used options for this dimension
        const recentlyUsed = history
            .slice(-5)
            .map(h => h?.[dimension]?.id)
            .filter(Boolean);

        // Filter out recently used options (avoid repetition)
        let available = dimConfig.options.filter(o => !recentlyUsed.includes(o.id));

        // If all options have been used recently, use all
        if (available.length === 0) {
            available = dimConfig.options;
        }

        // Random selection from available
        profile[dimension] = available[Math.floor(Math.random() * available.length)];
    }

    return profile;
}

/**
 * Convert a variation profile into prompt hints for the AI
 * @param {object} profile - Generated variation profile
 * @returns {string} Text block to inject into the AI prompt
 */
export function variationToPromptHints(profile) {
    const lines = ['=== CREATIVE VARIATION GUIDE ==='];
    lines.push('Follow these creative directions to make this script unique:');
    lines.push('');

    const labelMap = {
        introStyle: '🎬 INTRO STYLE',
        metaphorTheme: '🌿 METAPHOR THEME',
        pacingPattern: '⏱️ PACING',
        sensoryFocus: '👁️ SENSORY FOCUS',
        emotionalArc: '💫 EMOTIONAL ARC',
        transitionStyle: '🔗 TRANSITIONS',
        cueDepth: '📏 CUE DEPTH',
        voiceTone: '🎤 VOICE TONE',
        outroStyle: '🎬 OUTRO STYLE',
        breathPattern: '🌬️ BREATH PATTERN',
        languageFlair: '✍️ LANGUAGE STYLE',
        specialElement: '⭐ SPECIAL ELEMENT',
    };

    for (const [dim, selection] of Object.entries(profile)) {
        if (selection && labelMap[dim]) {
            lines.push(`${labelMap[dim]}: ${selection.label}`);
            lines.push(`  → ${selection.hint}`);
        }
    }

    lines.push('');
    lines.push('IMPORTANT: These directions are mandatory. Do NOT default to generic yoga script style.');

    return lines.join('\n');
}

/**
 * Calculate similarity between two variation profiles (0-1)
 * @returns {number} 0 = completely different, 1 = identical
 */
export function profileSimilarity(profileA, profileB) {
    if (!profileA || !profileB) return 0;

    const dimensions = Object.keys(VARIATION_DIMENSIONS);
    let matches = 0;

    for (const dim of dimensions) {
        if (profileA[dim]?.id === profileB[dim]?.id) {
            matches++;
        }
    }

    return matches / dimensions.length;
}

/**
 * Get total possible combinations
 */
export function getTotalCombinations() {
    return Object.values(VARIATION_DIMENSIONS).reduce(
        (total, dim) => total * dim.options.length, 1
    );
}

/**
 * Get available dimensions for UI display
 */
export function getVariationDimensions() {
    return Object.entries(VARIATION_DIMENSIONS).map(([key, value]) => ({
        id: key,
        options: value.options,
    }));
}
