/**
 * Test v2 — Start/End Frame Prompt Generator
 * Run: node test_logic.js
 */

import { parseScript, formatSceneLabel, getScriptStats } from './src/modules/scriptParser.js';
import { generateFramePrompts, generateAllFramePrompts, STYLE_PRESETS } from './src/modules/promptGenerator.js';

const SAMPLE_SCRIPT = `
Intro

Welcome to this gentle bedtime yoga session.
Tonight we'll move slowly through relaxing poses to help your body unwind.
Let your breath become calm and steady.
There's no need to rush—just move softly and listen to your body.
Find a comfortable space, and let's begin.

1. Easy Pose

Sit comfortably with a tall but relaxed spine.
Take a slow deep breath in, and gently breathe out.
Stay still here for a few calm breaths.

2. Gentle Neck Stretch

Slowly tilt your head to one side.
Relax your shoulders and breathe slowly.
After a few breaths, switch to the other side.

3. Cat Cow

Place your hands and knees on the mat.
Inhale as you gently arch your back.
Exhale as you round your spine and relax your neck.

4. Child's Pose

Lower your hips toward your heels.
Rest your forehead down and stretch your arms forward.
Take slow and calming breaths.

5. Standing Forward Fold

Stand tall, then slowly fold forward.
Let your head and neck relax.
Stay here and breathe gently.

6. Half Lift

Lift halfway up with a long, straight back.
Keep your gaze softly toward the mat.
Breathe slowly and stay steady.

7. Low Lunge

Step one foot forward into a gentle lunge.
Lower your hips and open your chest slightly.
Take a few slow breaths, then switch sides.

8. Gentle Lizard Pose

Place both hands inside your front foot.
Let your hips soften and relax downward.
Breathe slowly and stay calm.

9. Seated Forward Fold

Sit down and extend both legs forward.
Fold gently toward your legs.
Relax and breathe slowly.

10. Butterfly Pose

Bring the soles of your feet together.
Sit tall and relax your knees downward.
Take slow, comfortable breaths.

11. Supine Twist

Lie on your back and gently drop your knees to one side.
Keep your shoulders relaxed on the mat.
Breathe slowly, then switch sides.

12. Knees to Chest

Hug your knees toward your chest.
Feel your lower back gently relax.
Breathe deeply and softly.

13. Happy Baby

Hold your feet with your hands.
Open your knees wide and relax your back.
Take slow, peaceful breaths.

14. Legs Up the Wall

Extend your legs up against the wall.
Rest your arms comfortably by your sides.
Let your breath become slow and calm.

15. Savasana

Lie comfortably on your back.
Close your eyes and relax your whole body.
Take a slow breath in… and a long breath out.

Outro

Your body is now calm and relaxed.
Stay here for a moment and enjoy the peaceful feeling.
Allow your breath to stay slow and gentle.
Thank you for practicing tonight.
Sleep well and have a peaceful night.
`;

// ============================================================
console.log('═'.repeat(70));
console.log(' YOGAKIDS v2 — Start/End Frame Prompt Generator Test');
console.log('═'.repeat(70));

// 1. Parse
const parsed = parseScript(SAMPLE_SCRIPT);
const stats = getScriptStats(parsed);
console.log(`\n📊 Parsed: ${stats.totalScenes} scenes (${stats.poseCount} poses)\n`);

// 2. Generate all frame prompts
const allFrames = generateAllFramePrompts(parsed);

// 3. Display each scene
for (const scene of allFrames) {
    const label = formatSceneLabel(parsed.scenes[scene.sceneIndex]);
    const divider = scene.sceneType === 'pose' ? '─' : '═';

    console.log(`\n${divider.repeat(70)}`);
    console.log(`  ${label}  [${scene.sceneType}]  view: ${scene.metadata.view}`);
    console.log(`${divider.repeat(70)}`);

    console.log(`\n  🟢 START FRAME:`);
    console.log(`  └─ Pose: ${scene.startFrame.poseDescription}`);
    console.log(`  └─ Prompt (${scene.startFrame.prompt.length} chars):`);
    console.log(`     ${wrapText(scene.startFrame.prompt, 65)}`);

    console.log(`\n  🔴 END FRAME:`);
    console.log(`  └─ Pose: ${scene.endFrame.poseDescription}`);
    console.log(`  └─ Prompt (${scene.endFrame.prompt.length} chars):`);
    console.log(`     ${wrapText(scene.endFrame.prompt, 65)}`);

    if (scene.transition) {
        console.log(`\n  ⏩ Transition: ${scene.transition}`);
    }
}

// 4. Summary
console.log(`\n${'═'.repeat(70)}`);
console.log(` ✅ RESULTS SUMMARY`);
console.log(`${'═'.repeat(70)}`);
console.log(`\n  Total scenes:        ${allFrames.length}`);
console.log(`  Total image prompts: ${allFrames.length * 2} (${allFrames.length} start + ${allFrames.length} end)`);
console.log(`  Style presets:       ${Object.keys(STYLE_PRESETS).join(', ')}`);
console.log(`  Avg prompt length:   ${Math.round(allFrames.reduce((sum, s) => sum + s.startFrame.prompt.length + s.endFrame.prompt.length, 0) / (allFrames.length * 2))} chars`);
console.log(`\n  📁 Output structure per scene:`);
console.log(`     { sceneName, startFrame: { prompt, layers }, endFrame: { prompt, layers }, transition }`);
console.log(`\n  🚀 Ready for NanoBanana 2 image generation!\n`);

// Helper
function wrapText(text, width) {
    const words = text.split(' ');
    let line = '';
    const lines = [];
    for (const word of words) {
        if ((line + ' ' + word).length > width) {
            lines.push(line);
            line = word;
        } else {
            line = line ? line + ' ' + word : word;
        }
    }
    if (line) lines.push(line);
    return lines.join('\n     ');
}
