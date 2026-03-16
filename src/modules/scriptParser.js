/**
 * ============================================================
 * SCRIPT PARSER — Xử lý kịch bản yoga đầu vào
 * ============================================================
 * 
 * MỤC TIÊU:
 * Biến raw text script thành structured data (scenes) để tạo prompt ảnh.
 * 
 * CƠ CHẾ PARSE:
 * 1. Detect "Intro" section → scene đặc biệt (type: intro)
 * 2. Detect numbered poses "N. Pose Name" → scene chính (type: pose)
 * 3. Detect "Outro" section → scene đặc biệt (type: outro)
 * 4. Các dòng text giữa 2 headers → thuộc về scene trước đó
 * 
 * OUTPUT FORMAT:
 * {
 *   title: "Bedtime Yoga",
 *   totalScenes: 17,
 *   scenes: [
 *     { type: "intro", number: 0, name: "Intro", lines: [...], rawText: "..." },
 *     { type: "pose", number: 1, name: "Easy Pose", lines: [...], rawText: "..." },
 *     ...
 *     { type: "outro", number: 16, name: "Outro", lines: [...], rawText: "..." }
 *   ]
 * }
 */

// ============================================================
// REGEX PATTERNS
// ============================================================

import { log } from './logger.js';

/** Detect numbered pose: "1. Easy Pose" or "12. Cat Cow" */
const POSE_PATTERN = /^(\d+)\.\s+(.+)$/;

/** Detect Intro (case-insensitive, standalone or with trailing text) */
const INTRO_PATTERN = /^intro\s*$/i;

/** Detect Outro (case-insensitive, standalone or with trailing text) */
const OUTRO_PATTERN = /^outro\s*$/i;

// ============================================================
// MAIN PARSER
// ============================================================

/**
 * Parse raw yoga script thành structured scene data.
 * 
 * @param {string} rawScript - Raw text script (paste từ document/chat)
 * @returns {ParsedScript} Structured script data
 * 
 * @example
 * const script = parseScript(`
 *   Intro
 *   Welcome to this gentle bedtime yoga session.
 *   Tonight we'll move slowly through relaxing poses.
 *   
 *   1. Easy Pose
 *   Sit comfortably with a tall but relaxed spine.
 *   Take a slow deep breath in.
 *   
 *   2. Cat Cow
 *   Place your hands and knees on the mat.
 *   
 *   Outro
 *   Your body is now calm and relaxed.
 * `);
 * 
 * log.debug(script.scenes);
 * // [
 * //   { type: "intro", number: 0, name: "Intro", lines: ["Welcome to..."] },
 * //   { type: "pose",  number: 1, name: "Easy Pose", lines: ["Sit comfortably..."] },
 * //   { type: "pose",  number: 2, name: "Cat Cow", lines: ["Place your hands..."] },
 * //   { type: "outro", number: 3, name: "Outro", lines: ["Your body is..."] }
 * // ]
 */
export function parseScript(rawScript) {
  log.group('📝 [ScriptParser] parseScript()');
  log.time('⏱️ parseScript duration');

  if (!rawScript || typeof rawScript !== 'string') {
    log.warn('⚠️ [ScriptParser] Empty or invalid script input');
    log.groupEnd();
    return { title: '', totalScenes: 0, scenes: [] };
  }

  const lines = rawScript.split('\n');
  log.debug(`📄 [ScriptParser] Input: ${lines.length} lines, ${rawScript.length} chars`);

  const scenes = [];
  let currentScene = null;
  let sceneCounter = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Skip empty lines (nhưng không kết thúc scene)
    if (!line) continue;

    // ---- CHECK: Is this an Intro header? ----
    if (INTRO_PATTERN.test(line)) {
      log.debug(`🎬 [ScriptParser] Detected INTRO header`);
      if (currentScene) {
        scenes.push(finalizeScene(currentScene));
      }
      currentScene = createScene('intro', sceneCounter++, 'Intro');
      continue;
    }

    // ---- CHECK: Is this an Outro header? ----
    if (OUTRO_PATTERN.test(line)) {
      log.debug(`🎬 [ScriptParser] Detected OUTRO header`);
      if (currentScene) {
        scenes.push(finalizeScene(currentScene));
      }
      currentScene = createScene('outro', sceneCounter++, 'Outro');
      continue;
    }

    // ---- CHECK: Is this a numbered pose? (e.g. "3. Cat Cow") ----
    const poseMatch = line.match(POSE_PATTERN);
    if (poseMatch) {
      const poseNumber = parseInt(poseMatch[1], 10);
      const poseName = poseMatch[2].trim();
      log.debug(`🧘 [ScriptParser] Detected POSE #${poseNumber}: "${poseName}"`);
      if (currentScene) {
        scenes.push(finalizeScene(currentScene));
      }
      currentScene = createScene('pose', sceneCounter++, poseName, poseNumber);
      continue;
    }

    // ---- DEFAULT: This is a content line, add to current scene ----
    if (currentScene) {
      currentScene.lines.push(line);
    } else {
      // Lines before any header → treat as implicit intro
      currentScene = createScene('intro', sceneCounter++, 'Intro');
      currentScene.lines.push(line);
    }
  }

  // Push last scene
  if (currentScene) {
    scenes.push(finalizeScene(currentScene));
  }

  const result = {
    title: inferTitle(scenes),
    totalScenes: scenes.length,
    scenes,
  };

  log.debug(`✅ [ScriptParser] Result: ${result.totalScenes} scenes total`);
  log.table(scenes.map(s => ({ index: s.index, type: s.type, name: s.name, lines: s.lineCount })));
  log.timeEnd('⏱️ parseScript duration');
  log.groupEnd();

  return result;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Tạo scene object mới
 */
function createScene(type, index, name, poseNumber = null) {
  return {
    type,          // "intro" | "pose" | "outro"
    index,         // Thứ tự trong toàn bộ script (0-based)
    number: poseNumber ?? index, // Số pose gốc từ script (giữ nguyên)
    name,          // Tên pose / section
    lines: [],     // Các dòng mô tả
    rawText: '',   // Full text joined (tạo khi finalize)
  };
}

/**
 * Finalize scene: join lines thành rawText, clean up
 */
function finalizeScene(scene) {
  return {
    ...scene,
    rawText: scene.lines.join('\n'),
    lineCount: scene.lines.length,
  };
}

/**
 * Infer script title từ nội dung
 */
function inferTitle(scenes) {
  const firstPose = scenes.find(s => s.type === 'pose');
  if (firstPose) {
    return `Yoga Script (${scenes.filter(s => s.type === 'pose').length} poses)`;
  }
  return 'Yoga Script';
}

// ============================================================
// SCENE ANALYSIS — Phân tích nội dung scene để hướng dẫn prompt
// ============================================================

/**
 * Phân tích scene content để extract thông tin hữu ích cho prompt.
 * 
 * Ví dụ: scene "Cat Cow" với lines:
 *   "Place your hands and knees on the mat."
 *   "Inhale as you gently arch your back."
 *   "Exhale as you round your spine and relax your neck."
 * 
 * → Returns:
 *   {
 *     bodyPosition: "hands and knees on the mat",
 *     actions: ["arch your back", "round your spine"],
 *     mood: "gentle",
 *     breathingCue: true
 *   }
 */
export function analyzeScene(scene) {
  const text = scene.rawText.toLowerCase();

  return {
    // Body position keywords
    isStanding: /stand|standing/.test(text),
    isSitting: /sit|seated|sitting/.test(text),
    isLying: /lie|lying|supine|back/.test(text),
    isKneeling: /knee|kneel|hands and knees/.test(text),
    isFolding: /fold|forward fold/.test(text),
    isLunging: /lunge|lunging/.test(text),

    // Mood/energy indicators
    isCalm: /calm|relax|gentle|soft|slow|peaceful/.test(text),
    isActive: /active|energy|strong|power/.test(text),

    // Body parts mentioned
    bodyParts: extractBodyParts(text),

    // View suggestion based on pose type
    suggestedView: suggestCameraView(scene),
  };
}

/**
 * Extract body parts mentioned in text
 */
function extractBodyParts(text) {
  const parts = [];
  const keywords = {
    'head': /head|neck/,
    'shoulders': /shoulder/,
    'arms': /arm|hand|finger/,
    'chest': /chest|heart/,
    'back': /back|spine/,
    'hips': /hip|pelvis/,
    'legs': /leg|knee|thigh/,
    'feet': /foot|feet|toe|sole/,
  };

  for (const [part, regex] of Object.entries(keywords)) {
    if (regex.test(text)) parts.push(part);
  }
  return parts;
}

/**
 * Suggest camera view based on pose type
 */
function suggestCameraView(scene) {
  const name = scene.name.toLowerCase();

  // Poses tốt nhất khi nhìn từ phía trước
  if (/easy pose|butterfly|savasana|knees to chest|happy baby/.test(name)) {
    return 'front';
  }
  // Poses tốt nhất khi nhìn từ bên cạnh
  if (/cat cow|child|forward fold|half lift|lunge|lizard/.test(name)) {
    return 'side';
  }
  // Poses nằm → nhìn từ trên hoặc nghiêng
  if (/supine|legs up|savasana/.test(name)) {
    return 'three-quarter';
  }

  return 'three-quarter'; // default
}

// ============================================================
// EXPORT utilities
// ============================================================

/**
 * Format scene cho display
 */
export function formatSceneLabel(scene) {
  if (scene.type === 'intro') return '🎬 Intro';
  if (scene.type === 'outro') return '🎬 Outro';
  return `${scene.number}. ${scene.name}`;
}

/**
 * Get summary stats
 */
export function getScriptStats(parsedScript) {
  const poses = parsedScript.scenes.filter(s => s.type === 'pose');
  const hasIntro = parsedScript.scenes.some(s => s.type === 'intro');
  const hasOutro = parsedScript.scenes.some(s => s.type === 'outro');

  return {
    totalScenes: parsedScript.totalScenes,
    poseCount: poses.length,
    hasIntro,
    hasOutro,
    poseNames: poses.map(p => p.name),
  };
}
