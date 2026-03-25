/**
 * PROMPT BUILDER — Constructs system + user prompts for AI script generation
 * 
 * Combines template hints, pose data, language config, character mode,
 * narration style, and flow strategy into comprehensive prompts.
 */

import { getLanguage, getLanguageInstruction, getBreathWords } from './languages.js';
import { FLOW_STRATEGIES } from './flowStrategies.js';
import { POSE_CATEGORIES } from './poseDatabase.js';

// ============================================================
// FORMAT SPEC — output the AI must follow
// ============================================================

function buildOutputFormatSpec(poseCount) {
    return `
OUTPUT FORMAT REQUIREMENTS — ABSOLUTE STRICT MANDATORY:

You MUST output the script in EXACTLY this format. No deviations.

Intro

[Insert an engaging, welcoming introduction. Size depends on the narration style, but MUST fully set the tone and prepare the user.]

1. [Exact Pose Name from the sequence]

[Insert comprehensive narration for this pose. Clearly describe how to enter the pose, what to feel, breath cues, and how to hold it. Size MUST match the requested narration style length.]

2. [Exact Pose Name from the sequence]

[Insert comprehensive narration for this pose...]

... (continue for ALL ${poseCount} poses)

Outro

[Insert a thoughtful, relaxing closing narration. Include final breath cues and closing remarks.]

CRITICAL RULES:
- MANDATORY: You MUST write exactly ${poseCount} numbered poses (1 through ${poseCount}). Not ${poseCount - 1}, not ${poseCount - 2}. EXACTLY ${poseCount}.
- MANDATORY: Use the EXACT pose name from the POSE SEQUENCE provided. Do NOT rename, merge, or substitute poses.
- Each section separated by exactly ONE blank line
- Pose names MUST be numbered: "1. Easy Pose", "2. Cat Cow", etc.
- The FIRST section must be titled "Intro" (no number)
- The LAST section must be titled "Outro" (no number)
- DO NOT include any headers, markdown, bullet points, or special formatting
- DO NOT include section titles like "## Warm-up" — just the pose names
- The length of each narration block MUST strictly follow the NARRATION STYLE and NARRATION OPTIONS guides
- You MUST generate the narration for ALL ${poseCount} poses. DO NOT skip any poses. DO NOT summarize. DO NOT stop early.
- Include breath cues naturally woven into narration (if enabled)
- Include smooth transitions between poses (if enabled)
- EXPAND YOUR LEXICON. Do not use repetitive phrases. Provide rich, highly detailed language.
- BEFORE finishing, mentally verify: Did I write Intro + ${poseCount} numbered poses + Outro? If not, continue writing.
`;
}

// Category-specific creative directions
const CATEGORY_CREATIVE_ANCHORS = {
    bedtime: 'CREATIVE THEME: This is a BEDTIME/SLEEP session. Your tone must be dreamy, gentle, and deeply soothing. Use sleep-inducing imagery: moonlight, starry skies, floating clouds, warm blankets, gentle waves. Pace should be slow and hypnotic. Guide the practitioner toward deep relaxation and sleep.',
    morning: 'CREATIVE THEME: This is a MORNING/ENERGIZING session. Your tone must be bright, invigorating, and uplifting. Use sunrise imagery: golden light, fresh breeze, new beginnings. Pace should gradually build energy. Wake up the body and mind progressively.',
    kids: 'CREATIVE THEME: This is a KIDS session. Your tone must be playful, fun, and imaginative. Use animal sounds, stories, adventure themes, and colorful imagery. SHORT simple sentences. Make every pose feel like a game or adventure!',
    meditation: 'CREATIVE THEME: This is a MEDITATION session. Your tone must be deeply contemplative, mindful, and present. Use stillness imagery: calm water, smooth stones, vast sky. Focus on inner awareness, breath, and mental clarity.',
    power: 'CREATIVE THEME: This is a POWER/STRENGTH session. Your tone must be motivating, empowering, and athletic. Use strength imagery: mountain, fire, warrior spirit. Encourage holding longer, engaging muscles, building heat.',
    senior: 'CREATIVE THEME: This is a SENIOR session. Your tone must be warm, patient, and reassuring. Always mention modifications. Use gentle imagery: garden, gentle stream, sunrise walk. Safety first, comfort always.',
    office: 'CREATIVE THEME: This is an OFFICE/DESK YOGA session. Your tone must be practical, refreshing, and energizing. Reference workspace setting. Focus on tension spots: neck, shoulders, lower back, wrists.',
    prenatal: 'CREATIVE THEME: This is a PRENATAL session. Your tone must be nurturing, empowering, and safe. Always mention modifications. Connect practice to the growing baby. Gentle, supportive imagery.',
    yin: 'CREATIVE THEME: This is a YIN YOGA session. Your tone must be slow, meditative, and deeply introspective. Long holds, passive stretching. Guide attention inward. Use stillness and surrender imagery.',
    recovery: 'CREATIVE THEME: This is a RECOVERY session. Your tone must be gentle, healing, and restorative. Focus on releasing tension, improving circulation, gentle movement. Use healing imagery.',
    vinyasa: 'CREATIVE THEME: This is a VINYASA FLOW session. Your tone must be rhythmic, flowing, and dynamic. Link breath to movement. Create a continuous flow feeling. Use ocean wave imagery.',
    hatha: 'CREATIVE THEME: This is a HATHA YOGA session. Your tone must be balanced, traditional, and instructive. Equal emphasis on strength and flexibility. Classic yoga language.',
    family: 'CREATIVE THEME: This is a FAMILY session. Your tone must be inclusive, fun, and collaborative. Use activities everyone can do together. Encourage interaction between family members.',
};

// ============================================================
// BUILD SYSTEM PROMPT
// ============================================================

/**
 * Build the system prompt for script generation
 * 
 * @param {Object} config - Script configuration
 * @returns {string} Complete system prompt
 */
export function buildSystemPrompt(config) {
    const parts = [];
    const poseCount = config.session?.poseCount || 12;

    // Role declaration — strong and specific
    parts.push('You are a world-class yoga instructor and professional script writer for guided yoga video narration.');
    parts.push('Your task is to write a COMPLETE yoga video script with natural, engaging, and THEMATICALLY CONSISTENT narration.');
    parts.push(`You MUST write exactly ${poseCount} numbered poses with Intro and Outro. This is non-negotiable.`);
    parts.push('');

    // Category-specific creative anchor (CRITICAL for on-topic scripts)
    const category = config.category || 'general';
    const anchor = CATEGORY_CREATIVE_ANCHORS[category];
    if (anchor) {
        parts.push(anchor);
        parts.push('');
    }

    // Language instruction
    const langCode = config.language || 'en';
    parts.push(`LANGUAGE: ${getLanguageInstruction(langCode)}`);
    parts.push('');

    // Audience & tone 
    parts.push(buildAudienceSection(config));
    parts.push('');

    // Narration style
    parts.push(buildNarrationStyleSection(config));
    parts.push('');

    // Character integration 
    if (config.characterMode && config.characterMode !== 'none') {
        parts.push(buildCharacterSection(config));
        parts.push('');
    }

    // Script format (solo, teacher-student, etc.)
    if (config.scriptFormat && config.scriptFormat !== 'solo') {
        parts.push(buildScriptFormatSection(config));
        parts.push('');
    }

    // Template-specific creative hints
    if (config._templateHints) {
        parts.push(`ADDITIONAL CREATIVE DIRECTION: ${config._templateHints}`);
        parts.push('');
    }

    // Breath cues
    if (config.session?.breathCues !== false) {
        const breathWords = getBreathWords(langCode);
        parts.push(`BREATH CUES: Naturally include breath instructions throughout.`);
        parts.push(`Use variations like: "${breathWords.inhale}", "${breathWords.exhale}", "${breathWords.hold}"`);
        parts.push('');
    }

    // Output format with dynamic pose count
    parts.push(buildOutputFormatSpec(poseCount));

    return parts.join('\n');
}

// ============================================================
// BUILD USER PROMPT
// ============================================================

/**
 * Build the user prompt containing specific session details
 * 
 * @param {Object} config - Script configuration  
 * @param {Array} poseSequence - Ordered list of poses from flowStrategies
 * @returns {string} Complete user prompt
 */
export function buildUserPrompt(config, poseSequence) {
    const parts = [];

    // Session overview — strong and clear
    const duration = config.session?.duration || 15;
    const lang = getLanguage(config.language || 'en');
    const flow = FLOW_STRATEGIES[config.poses?.flow] || FLOW_STRATEGIES.progressive;

    parts.push(`Write a COMPLETE ${duration}-minute ${config.category || 'yoga'} yoga script with EXACTLY ${poseSequence.length} poses.`);
    parts.push('');

    // Session details
    parts.push('SESSION DETAILS:');
    parts.push(`- Category: ${config.category || 'general yoga'}`);
    parts.push(`- Duration: ~${duration} minutes`);
    parts.push(`- Total poses: ${poseSequence.length} (MANDATORY — do not write fewer)`);
    parts.push(`- Level: ${config.niche?.level || 'beginner'}`);
    parts.push(`- Audience: ${config.niche?.audience || 'adults'}`);
    parts.push(`- Focus: ${config.niche?.focusArea || 'general'}`);
    parts.push(`- Flow: ${flow.name} — ${flow.description}`);
    parts.push(`- Language: ${lang.name}`);
    parts.push('');

    // Instructor personality
    if (config.instructor?.name || config.instructor?.personality) {
        parts.push('INSTRUCTOR:');
        if (config.instructor.name) parts.push(`- Name: ${config.instructor.name}`);
        parts.push(`- Personality: ${config.instructor.personality || 'gentle'}`);
        parts.push(`- Voice tone: ${config.instructor.voiceTone || 'warm'}`);
        parts.push('');
    }

    // Pose sequence — explicit and numbered, minimal hints to save tokens
    parts.push(`═══════════════════════════════════════`);
    parts.push(`MANDATORY POSE SEQUENCE — ${poseSequence.length} POSES:`);
    parts.push(`You MUST write narration for EVERY SINGLE pose below, in this EXACT order.`);
    parts.push(`═══════════════════════════════════════`);
    parts.push('');

    for (let i = 0; i < poseSequence.length; i++) {
        const pose = poseSequence[i];
        const hint = getRelevantNarrationHint(pose, config);

        let poseLine = `${i + 1}. ${pose.name}`;
        if (pose.sanskrit) poseLine += ` (${pose.sanskrit})`;
        poseLine += ` — ${POSE_CATEGORIES[pose.category]?.name || pose.category}`;
        if (pose.phase) poseLine += ` [${pose.phase}]`;
        parts.push(poseLine);

        // Compact hints — one line only to save tokens
        const hints = [];
        if (hint) hints.push(hint);
        if (pose.duration) hints.push(`Hold: ${pose.duration.min}-${pose.duration.max}s`);
        if (hints.length > 0) {
            parts.push(`   → ${hints.join(' | ')}`);
        }
    }

    parts.push('');

    // Final enforcement
    parts.push(`═══════════════════════════════════════`);
    parts.push(`⚠️ VERIFICATION CHECKLIST (complete ALL before finishing):`);
    parts.push(`✅ Did I write "Intro" section? (REQUIRED)`);
    parts.push(`✅ Did I write poses 1 through ${poseSequence.length}? (ALL ${poseSequence.length} REQUIRED)`);
    parts.push(`✅ Did I write "Outro" section? (REQUIRED)`);
    parts.push(`✅ Does each pose narration match the requested narration style length?`);
    parts.push(`✅ Is the tone consistent with the ${config.category || 'yoga'} category?`);
    parts.push(`═══════════════════════════════════════`);
    parts.push('');

    // Options checklist
    parts.push('NARRATION OPTIONS:');
    parts.push(`- Include Intro: ${config.session?.includeIntro !== false ? 'YES' : 'NO'}`);
    parts.push(`- Include Outro: ${config.session?.includeOutro !== false ? 'YES' : 'NO'}`);
    parts.push(`- Breath cues: ${config.session?.breathCues !== false ? 'YES' : 'NO'}`);
    parts.push(`- Transition cues: ${config.session?.transitionCues !== false ? 'YES' : 'NO'}`);
    parts.push(`- Narration length per pose: ${getNarrationLengthGuide(config.session?.narrationStyle)}`);

    return parts.join('\n');
}

// ============================================================
// SECTION BUILDERS
// ============================================================

function buildAudienceSection(config) {
    const audience = config.niche?.audience || 'adults';
    const level = config.niche?.level || 'beginner';

    const audienceGuides = {
        kids: 'Target: Children ages 3-10. Use playful language, animal sounds, stories, and imagination. SHORT sentences only. Make it fun!',
        teens: 'Target: Teenagers. Use relatable, not childish language. Encourage body confidence and stress management.',
        adults: 'Target: General adult audience. Professional but warm. Clear instructions with optional anatomical references.',
        seniors: 'Target: Older adults 60+. Extra emphasis on safety, modifications, and going at their own pace. Warm and encouraging.',
        pregnant: 'Target: Pregnant women. Safety first. Always mention modifications. Nurturing, empowering tone. Never force.',
        athletes: 'Target: Athletes and fitness enthusiasts. Direct, coaching style. Performance-oriented language.',
        beginners: 'Target: Complete beginners. Explain everything clearly. No yoga jargon without explanation. Encouraging.',
        'office-workers': 'Target: Office workers. Quick, practical. Reference desk/chair. Focus on tension relief.',
        'limited-mobility': 'Target: People with limited mobility. Always provide seated/chair alternatives. Very gentle.',
    };

    const levelGuides = {
        beginner: 'Pose instructions should be detailed and reassuring. No advanced variations.',
        intermediate: 'Moderate detail. Can mention deeper expressions of poses and optional challenges.',
        advanced: 'Concise cues. Advanced variations and binds encouraged. Challenge-oriented.',
    };

    return [
        `AUDIENCE: ${audienceGuides[audience] || audienceGuides.adults}`,
        `LEVEL: ${levelGuides[level] || levelGuides.beginner}`,
    ].join('\n');
}

function buildNarrationStyleSection(config) {
    const style = config.session?.narrationStyle || 'short';

    const styleGuides = {
        minimal: 'NARRATION STYLE: Minimal — 2-3 sentences per pose. Provide safe, essential instruction and nothing more.',
        short: 'NARRATION STYLE: Short — 3-4 sentences per pose. Clear instruction for getting into the pose + one or two breath cues. Simple and direct.',
        detailed: 'NARRATION STYLE: Detailed — 6-9 sentences per pose. Extremely comprehensively describe anatomy, alignment, body awareness, deep breath cues, and safety modifications. Ensure the script is very long, detailed, and clear.',
        poetic: 'NARRATION STYLE: Poetic — 6-9 sentences per pose. Deeply immersive! Use rich sensory language, descriptive metaphors, emotional visualization, and deep mind-body connection cues.',
    };

    return styleGuides[style] || styleGuides.short;
}

function buildCharacterSection(config) {
    const mode = config.characterMode;
    const charDesc = config.characterDescription || '';

    if (mode === 'light') {
        return [
            'CHARACTER INTEGRATION (Light):',
            `A character described as "${charDesc}" is performing the poses.`,
            'Occasionally reference the character in third person (e.g., "Watch as she...", "Notice how he...").',
            'Keep character references subtle — focus on the yoga instruction, not the character story.',
        ].join('\n');
    }

    if (mode === 'deep') {
        return [
            'CHARACTER INTEGRATION (Deep):',
            `The main character is: "${charDesc}".`,
            'Write the script as if the character is guiding the viewer through their own practice.',
            'Include personality, reactions, and interactions with the viewer.',
            'Make the character feel alive and present in every pose.',
        ].join('\n');
    }

    return '';
}

function buildScriptFormatSection(config) {
    const format = config.scriptFormat;

    const formatGuides = {
        teacher_student: [
            'SCRIPT FORMAT: Teacher + Student dialog.',
            'Use [Teacher] and [Student] prefixes.',
            'Teacher gives instruction, student asks occasional questions or makes comments.',
            'Keep the dialog natural and warm.',
        ],
        two_friends: [
            'SCRIPT FORMAT: Two friends practicing together.',
            'Use [A] and [B] prefixes.',
            'They chat casually while practicing. Encouraging each other.',
        ],
        parent_child: [
            'SCRIPT FORMAT: Parent teaching their child.',
            'Use [Parent] and [Child] prefixes.',
            'Parent guides patiently, child responds with wonder and excitement.',
        ],
        narrator_inner: [
            'SCRIPT FORMAT: Narrator + Inner Voice.',
            'Use [Narrator] for external instruction and [Inner Voice] for internal sensations.',
            'Narrator gives physical cues, Inner Voice describes feelings and mindfulness.',
        ],
    };

    const guide = formatGuides[format];
    return guide ? guide.join('\n') : '';
}

// ============================================================
// HELPERS
// ============================================================

function getRelevantNarrationHint(pose, config) {
    if (!pose.narrationHints) return '';

    const audience = config.niche?.audience || 'adults';
    const focusArea = config.niche?.focusArea || '';
    const level = config.niche?.level || 'beginner';

    // Priority: audience-specific > focus-specific > level > generic
    return pose.narrationHints[audience]
        || pose.narrationHints[focusArea]
        || pose.narrationHints[level]
        || pose.narrationHints.beginner
        || '';
}

function getNarrationLengthGuide(style) {
    switch (style) {
        case 'minimal': return '2-3 sentences (bare essentials)';
        case 'short': return '3-4 sentences (instruction + breath)';
        case 'detailed': return '6-9 sentences (VERY DETAILED instruction + anatomy + imagery + modifications)';
        case 'poetic': return '6-9 sentences (RICH sensory language + deep connection + metaphors)';
        default: return '3-4 sentences';
    }
}
