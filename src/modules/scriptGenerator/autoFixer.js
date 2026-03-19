// ============================================================
// AUTO FIXER — Automatically repair scripts based on audit feedback
// ============================================================

import { generateText, detectTextProvider, getDefaultTextModel } from './textProvider.js';

/**
 * Determine what needs fixing based on audit result
 * @param {object} auditResult - Result from runFullAudit()
 * @returns {{ needsFix: boolean, fixType: string, issues: string[] }}
 */
export function diagnose(auditResult) {
    const issues = [];
    let fixType = 'none';

    if (!auditResult) return { needsFix: false, fixType, issues };

    const { phase1, phase2, totalScore, status } = auditResult;

    // Check Phase 1 failures
    if (phase1) {
        for (const check of phase1.checks) {
            if (check.status === 'fail') {
                issues.push(`[FORMAT] ${check.name}: ${check.detail}`);
            }
        }
    }

    // Check Phase 2 low scores
    if (phase2?.criteria) {
        for (const [key, val] of Object.entries(phase2.criteria)) {
            if (val.score <= 4) {
                issues.push(`[QUALITY] ${key}: score ${val.score}/10 — ${val.feedback}`);
            }
        }

        // Add top improvements
        if (phase2.improvements) {
            for (const imp of phase2.improvements) {
                issues.push(`[IMPROVE] ${imp}`);
            }
        }
    }

    // Determine fix type
    if (totalScore < 40) {
        fixType = 'full_rewrite';
    } else if (totalScore < 60) {
        fixType = 'major_fix';
    } else if (totalScore < 75) {
        fixType = 'minor_fix';
    } else if (issues.length > 0) {
        fixType = 'polish';
    }

    return {
        needsFix: issues.length > 0 && totalScore < 75,
        fixType,
        issues,
    };
}

// ============================================================
// FORMAT FIXER — Rule-based fixes (FREE, instant)
// ============================================================

/**
 * Apply automatic format fixes to a script
 * @param {string} script - Original script
 * @param {object} phase1Result - Phase 1 audit result
 * @returns {{ fixed: string, changes: string[] }}
 */
export function fixFormat(script, phase1Result) {
    let fixed = script;
    const changes = [];

    const failedChecks = phase1Result.checks.filter(c => c.status === 'fail');
    const warnedChecks = phase1Result.checks.filter(c => c.status === 'warn');

    // Fix: Missing intro
    const hasIntro = /^(intro|welcome|hello|xin chào)/im.test(fixed);
    if (!hasIntro && failedChecks.some(c => c.name === 'Has Intro')) {
        fixed = 'Intro\n\nWelcome to this yoga session.\nTake a moment to settle in and find a comfortable position.\nLet your breath begin to slow and deepen.\n\n' + fixed;
        changes.push('Added default intro section');
    }

    // Fix: Missing outro
    const hasOutro = /\b(outro|namaste|savasana|thank|cảm ơn|rest)\b/im.test(fixed);
    if (!hasOutro && failedChecks.some(c => c.name === 'Has Outro')) {
        fixed = fixed.trimEnd() + '\n\nOutro\n\nGently bring your awareness back to the present.\nThank yourself for taking this time.\nNamaste. 🙏\n';
        changes.push('Added default outro section');
    }

    // Fix: Ensure sections are numbered
    if (failedChecks.some(c => c.name === 'Section Format')) {
        // Try to auto-number paragraphs that look like sections
        const lines = fixed.split('\n');
        let sectionCount = 0;
        const processed = [];

        for (const line of lines) {
            // Detect unnumbered section headers (Title Case lines that aren't too long)
            if (line.trim().length > 0
                && line.trim().length < 60
                && /^[A-Z]/.test(line.trim())
                && !line.startsWith('Intro')
                && !line.startsWith('Outro')
                && !line.startsWith('Welcome')
                && !/^\d+\./.test(line.trim())
                && !/^[•\-\*]/.test(line.trim())) {

                // Check if it looks like a pose/section name
                const lowerLine = line.trim().toLowerCase();
                if (lowerLine.includes('pose') || lowerLine.includes('stretch')
                    || lowerLine.includes('warrior') || lowerLine.includes('flow')
                    || lowerLine.includes('breath') || lowerLine.includes('balance')
                    || /^[a-z]+ [a-z]+$/i.test(line.trim())) {
                    sectionCount++;
                    processed.push(`${sectionCount}. ${line.trim()}`);
                    continue;
                }
            }
            processed.push(line);
        }

        if (sectionCount > 0) {
            fixed = processed.join('\n');
            changes.push(`Auto-numbered ${sectionCount} sections`);
        }
    }

    return { fixed, changes };
}

// ============================================================
// AI FIXER — Smart rewrite of problematic sections
// ============================================================

const FIX_SYSTEM_PROMPT = `You are a yoga script editor. Your job is to IMPROVE an existing yoga script based on specific feedback.

RULES:
1. Keep the same general structure (sections, poses, flow)
2. ONLY fix the specific issues mentioned
3. Keep the same language as the original
4. Maintain the same approximate length
5. Keep all pose names and section numbers
6. Return the COMPLETE improved script (not just the changed parts)

Output format: Return ONLY the improved script text, nothing else.`;

/**
 * Use AI to fix specific issues in a script
 * @param {string} script - Original script
 * @param {string[]} issues - List of specific issues to fix
 * @param {object} config - Script config
 * @param {string} apiKey - API key
 * @returns {Promise<{ fixedScript: string, fixesSummary: string }>}
 */
export async function fixWithAI(script, issues, config, apiKey) {
    const provider = detectTextProvider(apiKey);
    const model = getDefaultTextModel(provider);

    const userPrompt = `SCRIPT CONFIG:
- Category: ${config.category}
- Audience: ${config.niche?.audience || 'adults'}
- Level: ${config.niche?.level || 'beginner'}
- Language: ${config.language || 'en'}

ISSUES TO FIX:
${issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

ORIGINAL SCRIPT:
${script}

Please rewrite this script fixing ONLY the issues listed above. Keep everything else the same.`;

    const fixedScript = await generateText(
        FIX_SYSTEM_PROMPT,
        userPrompt,
        apiKey,
        { model, maxTokens: 4096, temperature: 0.5, provider }
    );

    // Clean up: remove any markdown code blocks if AI wrapped it
    const cleaned = fixedScript
        .replace(/^```[\w]*\n?/gm, '')
        .replace(/\n?```$/gm, '')
        .trim();

    return {
        fixedScript: cleaned,
        fixesSummary: `Fixed ${issues.length} issues: ${issues.slice(0, 3).join('; ')}`,
    };
}

// ============================================================
// FULL AUTO-FIX PIPELINE
// ============================================================

/**
 * Run the complete auto-fix pipeline
 * @param {string} script - Original script
 * @param {object} auditResult - Result from runFullAudit()
 * @param {object} config - Script config
 * @param {string} apiKey - API key
 * @param {object} options - { maxRetries: 2 }
 * @returns {Promise<{ fixedScript: string, changes: string[], attempts: number, finalScore: number|null }>}
 */
export async function autoFix(script, auditResult, config, apiKey, options = {}) {
    const { maxRetries = 2 } = options;
    const allChanges = [];
    let currentScript = script;
    let attempts = 0;

    const { needsFix, fixType, issues } = diagnose(auditResult);

    if (!needsFix) {
        return { fixedScript: script, changes: [], attempts: 0, finalScore: auditResult.totalScore };
    }

    // Step 1: Format fixes (always try first, FREE)
    if (auditResult.phase1 && !auditResult.phase1.passed) {
        const { fixed, changes } = fixFormat(currentScript, auditResult.phase1);
        currentScript = fixed;
        allChanges.push(...changes.map(c => `[Format] ${c}`));
        attempts++;
    }

    // Step 2: AI fixes (if issues remain and we have an API key)
    if (apiKey && issues.length > 0 && (fixType === 'major_fix' || fixType === 'minor_fix')) {
        try {
            const { fixedScript, fixesSummary } = await fixWithAI(
                currentScript, issues, config, apiKey
            );
            currentScript = fixedScript;
            allChanges.push(`[AI] ${fixesSummary}`);
            attempts++;
        } catch (err) {
            allChanges.push(`[AI] Fix failed: ${err.message}`);
        }
    }

    // Step 3: Full rewrite (only for very low scores)
    if (fixType === 'full_rewrite' && apiKey && attempts < maxRetries) {
        try {
            const { fixedScript } = await fixWithAI(
                currentScript,
                ['Complete rewrite needed: script quality is too low. Rewrite with better flow, more breath cues, proper format, and engaging narration.'],
                config,
                apiKey
            );
            currentScript = fixedScript;
            allChanges.push('[AI] Full rewrite performed');
            attempts++;
        } catch (err) {
            allChanges.push(`[AI] Rewrite failed: ${err.message}`);
        }
    }

    return {
        fixedScript: currentScript,
        changes: allChanges,
        attempts,
        finalScore: null, // Will be filled by re-audit
    };
}
