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

const OUTPUT_FORMAT_SPEC = `
OUTPUT FORMAT REQUIREMENTS — STRICT:

You MUST output the script in EXACTLY this format. No deviations.

Intro

[Insert an engaging, welcoming introduction. Size depends on the narration style, but MUST fully set the tone and prepare the user.]

1. [Pose Name]

[Insert comprehensive narration for this pose. Clearly describe how to enter the pose, what to feel, breath cues, and how to hold it. Size MUST match the requested narration style length.]

2. [Pose Name]

[Insert comprehensive narration for this pose...]

... (continue for all poses)

Outro

[Insert a thoughtful, relaxing closing narration. Include final breath cues and closing remarks.]

RULES:
- Each section separated by exactly ONE blank line
- Pose names MUST be numbered: "1. Easy Pose", "2. Cat Cow", etc.
- The FIRST section must be titled "Intro" (no number)
- The LAST section must be titled "Outro" (no number)
- DO NOT include any headers, markdown, bullet points, or special formatting
- DO NOT include section titles like "## Warm-up" — just the pose names
- The length of each narration block MUST strictly follow the NARRATION STYLE and NARRATION OPTIONS guides
- You MUST generate the narration for ALL requested poses provided in the sequence. DO NOT skip any poses. DO NOT summarize. DO NOT stop early. Failure to output the complete sequence is unacceptable.
- Include breath cues naturally woven into narration (if enabled)
- Include smooth transitions between poses (if enabled)
- EXPAND YOUR LEXICON. Do not use repetitive phrases. Provide rich, highly detailed language to ensure a high-quality, high-token script.
`;

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

    // Role declaration
    parts.push('You are an expert yoga instructor and script writer for guided yoga video narration.');
    parts.push('Your task is to write a complete yoga video script with natural, engaging narration.');
    parts.push('');

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
        parts.push(`CREATIVE DIRECTION: ${config._templateHints}`);
        parts.push('');
    }

    // Breath cues
    if (config.session?.breathCues !== false) {
        const breathWords = getBreathWords(langCode);
        parts.push(`BREATH CUES: Naturally include breath instructions throughout.`);
        parts.push(`Use variations like: "${breathWords.inhale}", "${breathWords.exhale}", "${breathWords.hold}"`);
        parts.push('');
    }

    // Output format
    parts.push(OUTPUT_FORMAT_SPEC);

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

    // Session overview
    const duration = config.session?.duration || 15;
    const lang = getLanguage(config.language || 'en');
    const flow = FLOW_STRATEGIES[config.poses?.flow] || FLOW_STRATEGIES.progressive;

    parts.push(`Please write a ${duration}-minute ${config.category || 'yoga'} yoga script.`);
    parts.push('');

    // Session details
    parts.push('SESSION DETAILS:');
    parts.push(`- Category: ${config.category || 'general yoga'}`);
    parts.push(`- Duration: ~${duration} minutes`);
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

    // Pose sequence
    parts.push(`POSE SEQUENCE (${poseSequence.length} poses):`);;
    parts.push('Write narration for each pose in this exact order:');
    parts.push('');

    for (let i = 0; i < poseSequence.length; i++) {
        const pose = poseSequence[i];
        const hint = getRelevantNarrationHint(pose, config);

        let poseLine = `${i + 1}. ${pose.name}`;
        if (pose.sanskrit) poseLine += ` (${pose.sanskrit})`;
        poseLine += ` — ${POSE_CATEGORIES[pose.category]?.name || pose.category}`;
        if (pose.phase) poseLine += ` [${pose.phase}]`;
        parts.push(poseLine);

        // Add hints if available
        if (hint) {
            parts.push(`   Hint: ${hint}`);
        }
        // Duration hint
        if (pose.duration) {
            parts.push(`   Hold time: ${pose.duration.min}-${pose.duration.max} seconds`);
        }
        // Body parts
        if (pose.bodyParts?.length) {
            parts.push(`   Target: ${pose.bodyParts.join(', ')}`);
        }
    }

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
