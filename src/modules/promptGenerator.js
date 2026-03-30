/**
 * ============================================================
 * PROMPT GENERATOR v2 — Start/End Frame Architecture
 * ============================================================
 * 
 * THAY ĐỔI LỚN so với v1:
 * - Mỗi pose output 2 prompt: START FRAME + END FRAME
 * - Start = tư thế chuẩn bị / bắt đầu chuyển động
 * - End   = tư thế hoàn thành / giữ (hold position)
 * - Dùng cho video: interpolate giữa 2 frame → animation mượt
 * 
 * Output hiện tại bao gồm startFrame, endFrame và videoPrompt (dành cho Veo 3 hoặc AI Video Generator khác)
 * 
 * OUTPUT PER SCENE:
 * {
 *   sceneName: "Cat Cow",
 *   startFrame: { ... },
 *   endFrame: { ... },
 *   videoPrompt: "A 3D cartoon girl on a purple yoga mat. Action: The character starts by... Then, seamlessly... and holds..."
 * }
 * 
 * TẠI SAO CẦN 2 FRAME?
 * ┌────────────────┐        ┌────────────────┐
 * │  START FRAME   │───────▶│   END FRAME    │
 * │                │  video │                │
 * │  Tư thế bắt   │  tween │  Tư thế hoàn   │
 * │  đầu / chuẩn  │        │  thành / giữ   │
 * │  bị           │        │                │
 * └────────────────┘        └────────────────┘
 * 
 * Ví dụ: "Standing Forward Fold"
 *   Start: Đứng thẳng (Mountain Pose)
 *   End:   Gập người về phía trước, đầu cúi xuống
 */

import { analyzeScene } from './scriptParser.js';
import { log } from './logger.js';

// ============================================================
// STYLE PRESETS
// ============================================================

export const STYLE_PRESETS = {
    '3d-cartoon': {
        name: '3D Cartoon (Pixar-like)',
        description: 'Phong cách 3D hoạt hình như Pixar/Disney',
        stylePrompt: '3D rendered cartoon character, Pixar animation style, soft studio lighting, smooth textures, vibrant colors, clean white background',
    },
    'watercolor': {
        name: 'Watercolor Illustration',
        description: 'Phong cách vẽ màu nước nhẹ nhàng',
        stylePrompt: 'beautiful watercolor illustration, soft pastel colors, delicate brush strokes, gentle gradients, dreamy atmosphere, white paper background',
    },
    'flat-vector': {
        name: 'Flat Vector',
        description: 'Phong cách vector phẳng hiện đại',
        stylePrompt: 'modern flat vector illustration, clean geometric shapes, bold colors, minimalist design, simple background',
    },
    'anime': {
        name: 'Anime/Manga',
        description: 'Phong cách anime Nhật Bản',
        stylePrompt: 'anime illustration style, detailed character, soft shading, cel shading, Japanese animation aesthetic, clean background',
    },
    'realistic-3d': {
        name: 'Realistic 3D',
        description: 'Phong cách 3D chân thực',
        stylePrompt: '3D rendered character, photorealistic lighting, subsurface scattering, high quality textures, studio photography lighting, clean white background',
    },
};

// ============================================================
// POSE KNOWLEDGE BASE — START/END FRAME PAIRS
// ============================================================

/**
 * Mỗi pose có:
 * - start: Tư thế bắt đầu / chuẩn bị
 * - end:   Tư thế hoàn thành / giữ (hold)
 * - transition: Mô tả chuyển động (để tham khảo)
 * - view: Góc camera tốt nhất
 */
const POSE_FRAMES_DB = {

    'easy pose': {
        start: 'kneeling upright on the yoga mat, hands resting on thighs, back straight',
        end: 'sitting cross-legged on the mat, palms on knees, spine tall, shoulders relaxed',
        transition: 'slowly lowers hips and crosses legs into seated position',
        view: 'front',
    },

    'downward facing dog': {
        start: 'on all fours, hands under shoulders, knees under hips, tabletop position',
        end: 'inverted V-shape, hips high, arms and legs straight, heels toward mat, head between arms',
        transition: 'tucks toes and lifts hips up and back, straightening arms and legs',
        view: 'side',
    },

    'tree pose': {
        start: 'standing tall, feet together, arms at sides, Mountain Pose',
        end: 'standing on left leg, right foot on inner left thigh, hands at heart center',
        transition: 'shifts weight to left foot, lifts right foot to inner thigh, brings palms together',
        view: 'front',
    },

    'warrior 1': {
        start: 'standing tall at front of mat, feet together, arms at sides',
        end: 'front knee bent 90 degrees, back leg straight, both arms reaching overhead, chest lifted',
        transition: 'steps right foot back, bends front knee, sweeps both arms overhead',
        view: 'three-quarter',
    },

    'warrior 2': {
        start: 'standing in wide stance, arms at sides, feet wide apart',
        end: 'front knee bent 90 degrees, back leg straight, arms extended parallel to floor, looking over front hand',
        transition: 'bends front knee, extends arms out to sides at shoulder height, turns head forward',
        view: 'side',
    },

    'cobra pose': {
        start: 'lying face down, hands flat under shoulders, elbows tucked, legs straight back',
        end: 'chest and head lifted off mat, arms slightly bent, pelvis on mat, gentle backbend',
        transition: 'presses into hands, slowly curls chest upward off the mat',
        view: 'side',
    },

    'bridge pose': {
        start: 'lying on back, knees bent, feet flat hip-width apart, arms by sides',
        end: 'hips lifted high, thighs parallel to floor, arms pressing into mat, chest open',
        transition: 'presses feet into mat, lifts hips and lower back off the floor',
        view: 'side',
    },

    'gentle neck stretch': {
        start: 'sitting cross-legged, spine tall, head centered, shoulders relaxed',
        end: 'sitting cross-legged, head tilted right, right ear toward right shoulder, shoulders level',
        transition: 'slowly tilts head to the right side',
        view: 'front',
    },

    'cat cow': {
        start: 'on all fours, hands under shoulders, knees under hips, spine flat and neutral',
        end: 'on all fours, spine rounded into high arch, chin tucked to chest, belly pulled in',
        transition: 'rounds spine upward, tucks chin and tailbone, engages core',
        view: 'side',
    },

    "child's pose": {
        start: 'kneeling upright, sitting on heels, hands at sides, back straight',
        end: 'kneeling with torso folded forward, forehead on mat, arms extended forward, hips on heels',
        transition: 'slowly folds torso forward over thighs, lowers forehead to mat',
        view: 'side',
    },

    'standing forward fold': {
        start: 'standing tall, feet hip-width apart, arms at sides, spine straight',
        end: 'standing with torso folded forward at hips, head hanging, hands toward floor',
        transition: 'hinges at hips with flat back, folds torso forward and down',
        view: 'side',
    },

    'half lift': {
        start: 'standing in forward fold, torso hanging, hands near floor',
        end: 'standing with flat back parallel to floor, hands on shins, spine long and extended',
        transition: 'lifts torso halfway up, extends spine flat like a table',
        view: 'side',
    },

    'low lunge': {
        start: 'standing in forward fold, hands on mat beside feet',
        end: 'right foot forward in deep lunge, left knee on mat, torso upright, arms overhead',
        transition: 'steps right foot forward, lowers left knee, lifts arms overhead',
        view: 'side',
    },

    'gentle lizard pose': {
        start: 'in low lunge, right foot forward, hands on mat beside front foot, back knee down',
        end: 'deep lunge with forearms on mat inside front foot, hips sinking low, back leg extended',
        transition: 'walks hands inside front foot, lowers forearms to mat, sinks hips deeper',
        view: 'side',
    },

    'seated forward fold': {
        start: 'sitting upright, both legs straight forward, feet flexed, spine tall',
        end: 'torso folded forward over straight legs, hands reaching toward feet, head relaxed',
        transition: 'hinges at hips, folds torso forward over legs toward feet',
        view: 'side',
    },

    'butterfly pose': {
        start: 'sitting upright, legs extended forward, hands by sides',
        end: 'sitting tall, soles of feet together, knees open outward, hands holding feet',
        transition: 'draws feet together, lets knees fall open to sides like butterfly wings',
        view: 'front',
    },

    'supine twist': {
        start: 'lying flat on back facing up, both knees bent pointing toward ceiling, feet flat on mat, both arms extended straight out to sides in T-shape, shoulders pressed into mat',
        end: 'lying on back facing up, both bent knees dropped together to the left side touching the mat, right shoulder staying grounded, head turned to look right, arms still in T-shape flat on mat',
        transition: 'lets both knees drop gently to the left while keeping shoulders grounded',
        view: 'three-quarter-above',
    },

    'knees to chest': {
        start: 'lying flat on back facing up, legs extended straight along mat, arms resting by sides',
        end: 'lying flat on back facing up, both knees bent and hugged tightly to chest, arms wrapped around shins, chin slightly tucked, lower back pressing into mat',
        transition: 'draws both knees up and hugs them tightly to chest',
        view: 'side',
    },

    'happy baby': {
        start: 'lying flat on back facing up, knees bent, feet flat on mat, arms resting at sides',
        end: 'lying on back facing up, knees bent and drawn wide apart toward armpits, both hands grabbing the outer edges of feet from inside, soles of feet facing ceiling, lower back pressed into mat',
        transition: 'lifts feet up, grasps outer edges of feet, opens knees wide',
        view: 'three-quarter-above',
    },

    'legs up the wall': {
        start: 'sitting on floor with right hip touching a wall, legs bent, preparing to swing legs up',
        end: 'lying flat on back with buttocks touching wall, both legs extended straight up resting against the wall surface, body forming L-shape, arms relaxed at sides palms up',
        transition: 'swings both legs up the wall while lying back on mat',
        view: 'side',
    },

    'savasana': {
        start: 'lying flat on back facing up, legs extended straight, arms resting by sides with palms facing down, eyes open, head centered',
        end: 'lying flat on back facing up, legs slightly apart and relaxed, arms at sides with palms facing up, eyes closed, face peaceful, completely still and relaxed like sleeping',
        transition: 'releases all muscle tension, body melts into the mat',
        view: 'three-quarter-above',
    },

    'ragdoll pose': {
        start: 'standing tall with feet hip-width apart, knees slightly bent, arms hanging loosely at sides',
        end: 'standing with upper body folded forward at hips, knees bent, torso hanging down toward thighs, arms dangling loosely toward floor, head and neck completely relaxed hanging heavy, swaying gently',
        transition: 'bends knees and folds forward, letting upper body hang like a ragdoll',
        view: 'side',
    },

    'wall straddle': {
        start: 'sitting on floor with back near a wall, legs extended forward, about to lie back and swing legs up',
        end: 'lying on back with buttocks against wall, legs spread wide apart in V-shape resting against the wall, arms relaxed at sides or overhead, hips open',
        transition: 'lies back and swings legs up the wall, then opens legs wide into straddle',
        view: 'front',
    },

    'reclined figure four': {
        start: 'lying flat on back facing up, both knees bent, feet flat on mat, arms at sides',
        end: 'lying on back, right ankle crossed over left thigh creating figure-4 shape, hands clasped behind left thigh pulling both legs toward chest, head and shoulders on mat',
        transition: 'crosses right ankle over left thigh, threads hands behind left thigh, pulls legs toward chest',
        view: 'side',
    },

    'figure four': {
        start: 'lying flat on back facing up, both knees bent, feet flat on mat, arms at sides',
        end: 'lying on back, right ankle crossed over left thigh creating figure-4 shape, hands clasped behind left thigh pulling both legs toward chest, head and shoulders on mat',
        transition: 'crosses right ankle over left thigh, threads hands behind left thigh, pulls legs toward chest',
        view: 'side',
    },
};

// Intro/Outro frame definitions
const SPECIAL_FRAMES = {
    intro: {
        start: 'standing at front of yoga mat, feet together, hands at sides, Mountain Pose',
        end: 'standing tall, hands pressed together at heart center, slight bow, Namaste',
        transition: 'brings palms together at heart center and gives a gentle bow',
        view: 'front',
    },
    outro: {
        start: 'sitting cross-legged, bringing hands together at heart center',
        end: 'sitting cross-legged, hands at heart center in Namaste, gentle bow',
        transition: 'presses palms together at heart and bows head in gratitude',
        view: 'front',
    },
};

// ============================================================
// DEFAULT SETTINGS
// ============================================================

export const DEFAULT_SETTINGS = {
    characterDescription: 'a cute 3D cartoon girl with long purple braided hair in a high bun, wearing a white sleeveless crop top with gold accents and white yoga leggings with gold trim, barefoot',
    environment: 'on a purple yoga mat, clean white background, minimal scene',
    stylePreset: '3d-cartoon',
    aspectRatio: '16:9',
    imageSize: '2K',
    usePoseDatabase: true,
};

// ============================================================
// MAIN: GENERATE START/END FRAME PROMPTS
// ============================================================

/**
 * Generate START + END frame prompts cho 1 scene.
 * 
 * @param {Object} scene - Scene từ scriptParser
 * @param {Object} settings - Prompt settings
 * @returns {Object} { sceneName, startFrame, endFrame, transition, metadata }
 */
export function generateFramePrompts(scene, settings = {}) {
    log.group(`🎨 [PromptGen] Scene #${scene.index}: "${scene.name}" (${scene.type})`);

    const config = { ...DEFAULT_SETTINGS, ...settings };
    const stylePreset = STYLE_PRESETS[config.stylePreset] || STYLE_PRESETS['3d-cartoon'];
    log.debug(`🎭 [PromptGen] Style: ${config.stylePreset} | View: ${config.aspectRatio} | Size: ${config.imageSize}`);

    const analysis = analyzeScene(scene);
    log.debug(`🔍 [PromptGen] Analysis:`, { standing: analysis.isStanding, sitting: analysis.isSitting, lying: analysis.isLying, suggestedView: analysis.suggestedView, bodyParts: analysis.bodyParts });

    // Get frame data from DB
    const frames = getFrameData(scene, config);

    // Build START frame prompt
    const startFrame = buildFramePrompt({
        frameType: 'start',
        frameData: frames.start,
        config,
        stylePreset,
        view: frames.view,
    });
    log.debug(`🟢 [PromptGen] START prompt (${startFrame.prompt.length} chars): "${startFrame.prompt.substring(0, 80)}..."`);

    // Build END frame prompt
    const endFrame = buildFramePrompt({
        frameType: 'end',
        frameData: frames.end,
        config,
        stylePreset,
        view: frames.view,
    });
    // Build VIDEO / VEO 3 prompt
    const videoPrompt = buildVideoPrompt({
        frames: frames,
        scene
    });
    log.debug(`🎬 [PromptGen] VIDEO prompt (${videoPrompt.length} chars): "${videoPrompt.substring(0, 80)}..."`);

    log.groupEnd();

    return {
        sceneIndex: scene.index,
        sceneName: scene.name,
        sceneType: scene.type,
        poseNumber: scene.number,
        startFrame,
        endFrame,
        videoPrompt,
        transition: frames.transition || '',
        metadata: {
            aspectRatio: config.aspectRatio,
            imageSize: config.imageSize,
            stylePreset: config.stylePreset,
            view: frames.view,
        },
    };
}

/**
 * Generate frame prompts cho TẤT CẢ scenes.
 */
export function generateAllFramePrompts(parsedScript, settings = {}) {
    log.group(`🎨 [PromptGen] generateAllFramePrompts — ${parsedScript.scenes.length} scenes`);
    log.time('⏱️ generateAllFramePrompts duration');

    const results = parsedScript.scenes.map(scene =>
        generateFramePrompts(scene, settings)
    );

    log.debug(`✅ [PromptGen] Generated ${results.length} scene prompts (${results.length * 2} total frames)`);
    log.timeEnd('⏱️ generateAllFramePrompts duration');
    log.groupEnd();

    return results;
}

// ============================================================
// FRAME BUILDERS
// ============================================================

/**
 * Build Veo 3 Video Prompt (Simple start→end movement description)
 *
 * Veo 3 works best with SHORT, CLEAR motion descriptions.
 * Format: "Start: [pose]. End: [pose]. Movement: [simple transition]."
 */
function buildVideoPrompt({ frames }) {
    // Keep it simple: just describe start pose, end pose, and the movement
    return `Start: ${frames.start}. End: ${frames.end}. Slow, smooth yoga transition.`;
}

/**
 * Build 1 frame prompt (start or end)
 * ARCHITECTURE: Simple, focused prompts for better pose accuracy
 *
 * Problem: Long, complex prompts confuse AI and cause weird anatomy (extra limbs, wrong poses)
 * Solution: Keep it SHORT. Pose + Character + Environment only. No redundant style/composition.
 */
function buildFramePrompt({ frameType, frameData, config, stylePreset, view }) {
    // frameData is now a simple string (pose description)
    const poseDesc = typeof frameData === 'string' ? frameData : (frameData.body || frameData);

    const layers = {
        pose: poseDesc,
        character: config.characterDescription,
        environment: config.environment,
        style: stylePreset.stylePrompt,
        composition: getCompositionForView(view),
    };

    // Build prompt with ALL layers for consistency
    // Order: Style + Character + Pose + Environment + Composition
    const prompt = [
        stylePreset.stylePrompt,           // Style FIRST for visual consistency
        config.characterDescription,        // Character description
        poseDesc,                           // Pose/action
        config.environment,                 // Environment/background
        getCompositionForView(view),        // Camera/composition
    ].filter(Boolean).join(', ') + '.';

    return {
        type: frameType,
        prompt,
        layers,
        poseDescription: poseDesc,
    };
}

/**
 * Get frame data (start/end) từ DB hoặc fallback
 */
function getFrameData(scene, config) {
    // Special scenes (intro/outro)
    if (scene.type === 'intro') {
        log.debug(`📌 [PromptGen] Using SPECIAL_FRAMES.intro`);
        return SPECIAL_FRAMES.intro;
    }
    if (scene.type === 'outro') {
        log.debug(`📌 [PromptGen] Using SPECIAL_FRAMES.outro`);
        return SPECIAL_FRAMES.outro;
    }

    // Tìm trong pose DB
    const poseName = scene.name.toLowerCase().trim();
    if (config.usePoseDatabase) {
        const poseData = findPoseInDB(poseName);
        if (poseData) {
            log.debug(`✅ [PromptGen] DB HIT for "${poseName}" → found in POSE_FRAMES_DB`);
            return poseData;
        }
        log.warn(`⚠️ [PromptGen] DB MISS for "${poseName}" → using fallback`);
    }

    // Fallback: tự tạo từ script text
    return buildFallbackFrames(scene);
}

/**
 * Fallback: tạo start/end frames từ script lines khi pose không có trong DB
 */
function buildFallbackFrames(scene) {
    const lines = scene.lines.filter(l => l.trim().length > 0);

    // Start = first line instruction, End = main descriptive line
    const startDesc = lines.length > 0
        ? lines[0]
        : `preparing for ${scene.name}`;
    const endDesc = lines.length > 1
        ? lines.slice(0, 2).join(', ')
        : startDesc;

    return {
        start: `preparing for ${scene.name}, ${startDesc.toLowerCase()}`,
        end: `holding ${scene.name} pose, ${endDesc.toLowerCase()}`,
        transition: `moves into ${scene.name} pose`,
        view: 'three-quarter',
    };
}

/**
 * Get composition string from view type
 */
function getCompositionForView(view) {
    const viewMap = {
        'front': 'front view, full body shot, centered composition',
        'side': 'side profile view, full body shot, clean composition',
        'three-quarter': 'three-quarter view, full body shot, dynamic angle',
        'three-quarter-above': 'three-quarter view from slightly above, full body visible, clear composition',
    };
    return viewMap[view] || viewMap['three-quarter'];
}

/**
 * Find pose in DB (fuzzy matching)
 */
function findPoseInDB(poseName) {
    if (POSE_FRAMES_DB[poseName]) return POSE_FRAMES_DB[poseName];
    for (const [key, value] of Object.entries(POSE_FRAMES_DB)) {
        if (poseName.includes(key) || key.includes(poseName)) return value;
    }
    return null;
}

// ============================================================
// EDITING UTILITIES
// ============================================================

/**
 * Override 1 layer trong start hoặc end frame
 */
export function overrideFrameLayer(framePrompts, frameType, layerName, newValue) {
    const frame = frameType === 'start' ? framePrompts.startFrame : framePrompts.endFrame;
    const newLayers = { ...frame.layers, [layerName]: newValue };
    const newPrompt = Object.values(newLayers).filter(Boolean).join('. ') + '.';

    const updatedFrame = { ...frame, prompt: newPrompt, layers: newLayers };
    return {
        ...framePrompts,
        [frameType === 'start' ? 'startFrame' : 'endFrame']: updatedFrame,
    };
}

/**
 * Set custom prompt cho 1 frame (bypass layers)
 */
export function setCustomFramePrompt(framePrompts, frameType, customPrompt) {
    const key = frameType === 'start' ? 'startFrame' : 'endFrame';
    return {
        ...framePrompts,
        [key]: { ...framePrompts[key], prompt: customPrompt, isCustom: true },
    };
}

// Keep backward compatibility
export { POSE_FRAMES_DB, SPECIAL_FRAMES };
