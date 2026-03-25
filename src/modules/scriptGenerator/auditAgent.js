// ============================================================
// AUDIT AGENT — 2-Phase Script Quality Scoring
// Phase 1: Rule-based checks (FREE, instant) → /40 points
// Phase 2: AI-powered review (1 API call) → /60 points
// Total: /100
// ============================================================

import { generateText } from './textProvider.js';
import { detectTextProvider, getDefaultTextModel } from './textProvider.js';

// ============================================================
// PHASE 1: RULE-BASED AUDIT (FREE)
// ============================================================

/**
 * Run rule-based checks on a generated script
 * @param {string} script - The generated script text
 * @param {object} config - The script config used for generation
 * @returns {{ score: number, maxScore: 40, checks: Array, passed: boolean }}
 */
export function runRuleAudit(script, config) {
    const checks = [];
    let score = 0;

    // 1. FORMAT CHECK — Numbered sections exist (max 8 pts)
    const sectionPattern = /^\d+\.\s+.+/gm;
    const sections = script.match(sectionPattern) || [];
    const expectedPoses = config.session?.poseCount || 10;

    if (sections.length >= expectedPoses) {
        score += 8;
        checks.push({ name: 'Section Format', score: 8, max: 8, status: 'pass', detail: `${sections.length}/${expectedPoses} numbered sections found` });
    } else if (sections.length >= expectedPoses - 1) {
        score += 5;
        checks.push({ name: 'Section Format', score: 5, max: 8, status: 'warn', detail: `${sections.length}/${expectedPoses} sections — missing ${expectedPoses - sections.length} pose(s)` });
    } else if (sections.length >= expectedPoses * 0.7) {
        const pts = Math.round((sections.length / expectedPoses) * 5);
        score += pts;
        checks.push({ name: 'Section Format', score: pts, max: 8, status: 'warn', detail: `Only ${sections.length}/${expectedPoses} sections found. Script truncated?` });
    } else {
        score -= 30; // Massive penalty for abruptly skipping chunks
        checks.push({ name: 'Section Format', score: -30, max: 8, status: 'fail', detail: `CRITICAL: Skipped too many poses! Expected ${expectedPoses}, got ${sections.length}` });
    }

    // 1b. POSE NAME CHECK — Verify requested pose names appear in script (max 7 pts bonus)
    if (config.poses?.selectedPoses?.length > 0 || config._poseNames?.length > 0) {
        const poseNames = config._poseNames || [];
        const scriptLower = script.toLowerCase();
        let matchCount = 0;
        const missingPoses = [];
        for (const name of poseNames) {
            if (scriptLower.includes(name.toLowerCase())) {
                matchCount++;
            } else {
                missingPoses.push(name);
            }
        }
        const matchRatio = poseNames.length > 0 ? matchCount / poseNames.length : 1;
        if (matchRatio >= 0.9) {
            score += 7;
            checks.push({ name: 'Pose Name Match', score: 7, max: 7, status: 'pass', detail: `${matchCount}/${poseNames.length} requested pose names found in script` });
        } else if (matchRatio >= 0.7) {
            score += 4;
            checks.push({ name: 'Pose Name Match', score: 4, max: 7, status: 'warn', detail: `${matchCount}/${poseNames.length} found. Missing: ${missingPoses.slice(0, 3).join(', ')}` });
        } else {
            checks.push({ name: 'Pose Name Match', score: 0, max: 7, status: 'fail', detail: `Only ${matchCount}/${poseNames.length} pose names found! Missing: ${missingPoses.slice(0, 5).join(', ')}` });
        }
    }

    // 2. INTRO CHECK — Has an introduction (max 5 pts)
    const hasIntro = /^(intro|welcome|hello|xin chào|chào mừng)/im.test(script)
        || script.toLowerCase().startsWith('welcome')
        || /^intro/im.test(script);
    if (hasIntro) {
        score += 5;
        checks.push({ name: 'Has Intro', score: 5, max: 5, status: 'pass', detail: 'Introduction section found' });
    } else {
        checks.push({ name: 'Has Intro', score: 0, max: 5, status: 'warn', detail: 'No clear intro detected' });
    }

    // 3. OUTRO CHECK — Has closing section (max 5 pts)
    const hasOutro = /\b(outro|namaste|savasana|thank|cảm ơn|farewell|rest|bye|goodbye)\b/im.test(script);
    if (hasOutro) {
        score += 5;
        checks.push({ name: 'Has Outro', score: 5, max: 5, status: 'pass', detail: 'Closing section found' });
    } else {
        checks.push({ name: 'Has Outro', score: 0, max: 5, status: 'warn', detail: 'No clear outro detected' });
    }

    // 4. BREATH CUES — Mentions breathing (max 6 pts)
    const breathWords = /\b(breath|inhale|exhale|hít|thở|breathe|breathing|hơi thở)\b/gi;
    const breathCount = (script.match(breathWords) || []).length;
    if (breathCount >= 5) {
        score += 6;
        checks.push({ name: 'Breath Cues', score: 6, max: 6, status: 'pass', detail: `${breathCount} breath cues found` });
    } else if (breathCount >= 2) {
        score += 3;
        checks.push({ name: 'Breath Cues', score: 3, max: 6, status: 'warn', detail: `Only ${breathCount} breath cues (need 5+)` });
    } else {
        checks.push({ name: 'Breath Cues', score: 0, max: 6, status: 'fail', detail: `Only ${breathCount} breath cues` });
    }

    // 5. LENGTH CHECK — Script isn't too short or too long (max 6 pts)
    const wordCount = script.split(/\s+/).length;
    const durationMin = config.session?.duration || 15;
    const expectedMin = durationMin * 15; // ~15 words per minute minimum
    const expectedMax = durationMin * 120; // ~120 words per minute maximum (to allow highly detailed scripts)

    if (wordCount >= expectedMin && wordCount <= expectedMax) {
        score += 6;
        checks.push({ name: 'Script Length', score: 6, max: 6, status: 'pass', detail: `${wordCount} words (target: ${expectedMin}-${expectedMax})` });
    } else if (wordCount >= expectedMin * 0.5 && wordCount <= expectedMax * 1.5) {
        score += 3;
        checks.push({ name: 'Script Length', score: 3, max: 6, status: 'warn', detail: `${wordCount} words (target: ${expectedMin}-${expectedMax})` });
    } else {
        checks.push({ name: 'Script Length', score: 0, max: 6, status: 'fail', detail: `${wordCount} words (target: ${expectedMin}-${expectedMax})` });
    }

    // 6. POSE NAMES — Actual yoga pose names present (max 5 pts)
    const poseNames = /\b(pose|asana|warrior|tree|cobra|child|downward|mountain|bridge|cat|cow|pigeon|plank|lotus|triangle|standing|seated|supine)\b/gi;
    const poseCount = new Set((script.match(poseNames) || []).map(p => p.toLowerCase())).size;
    if (poseCount >= 4) {
        score += 5;
        checks.push({ name: 'Pose Names', score: 5, max: 5, status: 'pass', detail: `${poseCount} unique pose-related terms found` });
    } else if (poseCount >= 2) {
        score += 2;
        checks.push({ name: 'Pose Names', score: 2, max: 5, status: 'warn', detail: `${poseCount} pose terms (need 4+)` });
    } else {
        checks.push({ name: 'Pose Names', score: 0, max: 5, status: 'fail', detail: `Only ${poseCount} pose terms found` });
    }

    // 7. SAFETY — No dangerous instructions (max 5 pts)
    const dangerousWords = /\b(force|push through pain|ignore|never stop|no pain no gain|endure pain)\b/gi;
    const dangerCount = (script.match(dangerousWords) || []).length;
    if (dangerCount === 0) {
        score += 5;
        checks.push({ name: 'Safety Check', score: 5, max: 5, status: 'pass', detail: 'No unsafe language detected' });
    } else {
        checks.push({ name: 'Safety Check', score: 0, max: 5, status: 'fail', detail: `${dangerCount} potentially unsafe phrases detected` });
    }

    return {
        score,
        maxScore: 40,
        checks,
        passed: score >= 25, // Minimum to proceed to Phase 2
    };
}

// ============================================================
// PHASE 2: AI-POWERED AUDIT (~$0.002 per call)
// ============================================================

const AUDIT_SYSTEM_PROMPT = `You are a professional yoga video script quality auditor.

Score this script on the following 6 criteria (0-10 each, total max 60):

1. **Flow Coherence** (0-10): Do poses flow logically? Is the sequence safe and natural?
2. **Audience Fit** (0-10): Does the language, difficulty, and style match the target audience?
3. **Creativity & Freshness** (0-10): Is the script creative, engaging, and not generic?
4. **Pacing & Timing** (0-10): Does the pacing feel natural? Not too rushed or too slow?
5. **Narration Quality** (0-10): Is the narration well-written, clear, and pleasant to hear?
6. **Engagement Factor** (0-10): Would a viewer enjoy this? Is it memorable?

Respond ONLY in this exact JSON format:

\`\`\`json
{
  "flowCoherence": { "score": 8, "feedback": "..." },
  "audienceFit": { "score": 9, "feedback": "..." },
  "creativity": { "score": 7, "feedback": "..." },
  "pacing": { "score": 8, "feedback": "..." },
  "narrationQuality": { "score": 8, "feedback": "..." },
  "engagementFactor": { "score": 7, "feedback": "..." },
  "overallFeedback": "One sentence summary of the script quality",
  "topImprovements": ["improvement 1", "improvement 2", "improvement 3"]
}
\`\`\`

Be honest but constructive. Grade the script strictly on its own merits. An excellent, highly detailed, and immersive script should score 8-10. A generic or repetitive script should score 5-6.
Match your feedback language to the script language (if script is Vietnamese, write in Vietnamese).`;

/**
 * Run AI-powered quality audit
 * @param {string} script - The generated script
 * @param {object} config - The script config
 * @param {string} apiKey - AI API key
 * @returns {Promise<{ score: number, maxScore: 60, criteria: object, feedback: string, improvements: string[] }>}
 */
export async function runAIAudit(script, config, apiKey) {
    const provider = detectTextProvider(apiKey);
    const model = getDefaultTextModel(provider);

    const userPrompt = `Script category: ${config.category}
Target audience: ${config.niche?.audience || 'adults'}
Level: ${config.niche?.level || 'beginner'}
Language: ${config.language || 'en'}
Duration: ${config.session?.duration || 15} minutes

=== SCRIPT TO AUDIT ===
${script.slice(0, 4000)}`;

    try {
        const response = await generateText(
            AUDIT_SYSTEM_PROMPT,
            userPrompt,
            apiKey,
            { model, maxTokens: 1024, temperature: 0.3, provider }
        );

        // Parse JSON from response
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/)
            || response.match(/\{[\s\S]*"flowCoherence"[\s\S]*\}/);

        let result;
        if (jsonMatch) {
            const jsonStr = jsonMatch[1] || jsonMatch[0];
            result = JSON.parse(jsonStr);
        } else {
            throw new Error('Could not parse audit response');
        }

        // Calculate total score
        const criteria = {
            flowCoherence: result.flowCoherence || { score: 5, feedback: '' },
            audienceFit: result.audienceFit || { score: 5, feedback: '' },
            creativity: result.creativity || { score: 5, feedback: '' },
            pacing: result.pacing || { score: 5, feedback: '' },
            narrationQuality: result.narrationQuality || { score: 5, feedback: '' },
            engagementFactor: result.engagementFactor || { score: 5, feedback: '' },
        };

        let score = 0;
        for (const c of Object.values(criteria)) {
            score += Math.min(10, Math.max(0, c.score || 0));
        }

        return {
            score,
            maxScore: 60,
            criteria,
            feedback: result.overallFeedback || '',
            improvements: result.topImprovements || [],
        };
    } catch (err) {
        // Fallback: return neutral scores if AI fails
        return {
            score: 35,
            maxScore: 60,
            criteria: {
                flowCoherence: { score: 6, feedback: 'Could not evaluate' },
                audienceFit: { score: 6, feedback: 'Could not evaluate' },
                creativity: { score: 6, feedback: 'Could not evaluate' },
                pacing: { score: 6, feedback: 'Could not evaluate' },
                narrationQuality: { score: 6, feedback: 'Could not evaluate' },
                engagementFactor: { score: 5, feedback: 'Could not evaluate' },
            },
            feedback: `AI audit error: ${err.message}`,
            improvements: ['Manual review recommended'],
            error: err.message,
        };
    }
}

// ============================================================
// COMBINED AUDIT — Full Pipeline
// ============================================================

/**
 * Run the complete 2-phase audit pipeline
 * @param {string} script - Generated script
 * @param {object} config - Script config
 * @param {string} apiKey - API key (if null, only Phase 1 runs)
 * @returns {Promise<object>} Complete audit result
 */
export async function runFullAudit(script, config, apiKey = null) {
    // Phase 1: Rule-based (always runs, FREE)
    const phase1 = runRuleAudit(script, config);

    // If phase1 fails badly, skip Phase 2
    if (!phase1.passed) {
        return {
            totalScore: phase1.score,
            maxScore: 100,
            phase1,
            phase2: null,
            grade: getGrade(phase1.score),
            status: 'needs_fix',
            summary: 'Script failed basic format checks. Auto-fix recommended before AI audit.',
        };
    }

    // Phase 2: AI audit (if API key available)
    let phase2 = null;
    if (apiKey) {
        phase2 = await runAIAudit(script, config, apiKey);
    }

    const totalScore = phase1.score + (phase2?.score || 0);
    const maxScore = 40 + (phase2 ? 60 : 0);

    // Normalize to /100 if only Phase 1 ran
    const normalizedScore = phase2 ? totalScore : Math.round((phase1.score / 40) * 100);

    const grade = getGrade(normalizedScore);

    let status;
    if (normalizedScore < 60) status = 'needs_rewrite';
    else if (normalizedScore < 75) status = 'needs_fix';
    else if (normalizedScore < 85) status = 'acceptable';
    else status = 'approved';

    return {
        totalScore: normalizedScore,
        maxScore: 100,
        phase1,
        phase2,
        grade,
        status,
        summary: buildAuditSummary(phase1, phase2, normalizedScore, status),
    };
}

// ============================================================
// HELPERS
// ============================================================

function getGrade(score) {
    if (score >= 90) return { letter: 'A+', emoji: '🌟', label: 'Excellent' };
    if (score >= 85) return { letter: 'A', emoji: '⭐', label: 'Approved' };
    if (score >= 75) return { letter: 'B', emoji: '✅', label: 'Good' };
    if (score >= 60) return { letter: 'C', emoji: '⚠️', label: 'Needs Work' };
    if (score >= 40) return { letter: 'D', emoji: '🔧', label: 'Below Standard' };
    return { letter: 'F', emoji: '❌', label: 'Failed' };
}

function buildAuditSummary(phase1, phase2, score, status) {
    const lines = [];
    lines.push(`Score: ${score}/100 — ${getGrade(score).label}`);

    // Phase 1 summary
    const failedChecks = phase1.checks.filter(c => c.status === 'fail');
    const warnChecks = phase1.checks.filter(c => c.status === 'warn');

    if (failedChecks.length > 0) {
        lines.push(`Format issues: ${failedChecks.map(c => c.name).join(', ')}`);
    }
    if (warnChecks.length > 0) {
        lines.push(`Warnings: ${warnChecks.map(c => c.name).join(', ')}`);
    }

    // Phase 2 summary
    if (phase2) {
        if (phase2.feedback) lines.push(`AI says: ${phase2.feedback}`);
        if (phase2.improvements?.length > 0) {
            lines.push(`Top improvements: ${phase2.improvements.join('; ')}`);
        }
    }

    return lines.join('\n');
}
