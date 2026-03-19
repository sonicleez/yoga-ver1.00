/**
 * GAMIFICATION MODULE — Tags, Skill Packs, XP & Achievements
 * 
 * Encourages content diversity and tracks user progress:
 * - Skill Packs: Curated pose collections by theme
 * - XP System: Earn points for generating diverse content
 * - Achievements: Unlock badges for milestones
 * - Auto-Tags: Smart tagging for generated scripts
 * 
 * All data stored in localStorage for persistence.
 */

import { POSES_DB } from './poseDatabase.js';

// ============================================================
// STORAGE KEY
// ============================================================
const STORAGE_KEY = 'yogakids_gamification';

// ============================================================
// SKILL PACKS — Curated pose collections
// ============================================================

export const SKILL_PACKS = {
    balance_master: {
        id: 'balance_master',
        name: '⚖️ Balance Master',
        description: 'Master single-leg poses and find your center',
        icon: '⚖️',
        difficulty: 'intermediate',
        poses: ['tree_pose', 'eagle_pose', 'warrior_3', 'dancer_pose', 'half_moon'],
        unlockLevel: 1,
        xpReward: 30,
        color: '#6366f1',
    },
    core_warrior: {
        id: 'core_warrior',
        name: '🔥 Core Warrior',
        description: 'Build a strong core with these power poses',
        icon: '🔥',
        difficulty: 'intermediate',
        poses: ['plank_pose', 'boat_pose', 'chair_pose', 'warrior_3', 'high_lunge'],
        unlockLevel: 1,
        xpReward: 30,
        color: '#ef4444',
    },
    flexibility_flow: {
        id: 'flexibility_flow',
        name: '🌊 Flexibility Flow',
        description: 'Deep stretches for maximum flexibility',
        icon: '🌊',
        difficulty: 'beginner',
        poses: ['seated_forward_fold', 'butterfly_pose', 'pigeon_pose', 'head_to_knee', 'standing_forward_fold'],
        unlockLevel: 1,
        xpReward: 25,
        color: '#06b6d4',
    },
    back_care: {
        id: 'back_care',
        name: '🩺 Back Care',
        description: 'Gentle poses to relieve and prevent back pain',
        icon: '🩺',
        difficulty: 'beginner',
        poses: ['cat_cow', 'cobra_pose', 'childs_pose', 'thread_the_needle', 'supine_twist'],
        unlockLevel: 1,
        xpReward: 25,
        color: '#10b981',
    },
    hip_opener_pro: {
        id: 'hip_opener_pro',
        name: '🦋 Hip Opener Pro',
        description: 'Release deep hip tension with these openers',
        icon: '🦋',
        difficulty: 'intermediate',
        poses: ['butterfly_pose', 'pigeon_pose', 'lizard_pose', 'happy_baby', 'low_lunge'],
        unlockLevel: 2,
        xpReward: 35,
        color: '#f59e0b',
    },
    stress_buster: {
        id: 'stress_buster',
        name: '🧘 Stress Buster',
        description: 'Calming restorative poses for stress relief',
        icon: '🧘',
        difficulty: 'beginner',
        poses: ['childs_pose', 'easy_pose', 'savasana', 'legs_up_the_wall', 'supine_butterfly'],
        unlockLevel: 1,
        xpReward: 20,
        color: '#8b5cf6',
    },
    warrior_series: {
        id: 'warrior_series',
        name: '⚔️ Warrior Series',
        description: 'All warrior poses for strength and confidence',
        icon: '⚔️',
        difficulty: 'beginner',
        poses: ['warrior_1', 'warrior_2', 'warrior_3', 'reverse_warrior', 'humble_warrior'],
        unlockLevel: 1,
        xpReward: 30,
        color: '#dc2626',
    },
    kids_animals: {
        id: 'kids_animals',
        name: '🦁 Kids Animal Pack',
        description: 'Fun animal-themed poses perfect for children',
        icon: '🦁',
        difficulty: 'beginner',
        poses: ['cat_cow', 'cobra_pose', 'downward_facing_dog', 'butterfly_pose', 'fish_pose'],
        unlockLevel: 1,
        xpReward: 20,
        color: '#f97316',
    },
    sunrise_flow: {
        id: 'sunrise_flow',
        name: '🌅 Sunrise Flow',
        description: 'Energizing morning sequence to start your day',
        icon: '🌅',
        difficulty: 'beginner',
        poses: ['mountain_pose', 'standing_forward_fold', 'low_lunge', 'downward_facing_dog', 'warrior_1'],
        unlockLevel: 1,
        xpReward: 25,
        color: '#fbbf24',
    },
    moonlight_restore: {
        id: 'moonlight_restore',
        name: '🌙 Moonlight Restore',
        description: 'Gentle evening poses for deep relaxation',
        icon: '🌙',
        difficulty: 'beginner',
        poses: ['easy_pose', 'seated_forward_fold', 'supine_twist', 'happy_baby', 'savasana'],
        unlockLevel: 1,
        xpReward: 20,
        color: '#6366f1',
    },
};

// ============================================================
// XP REWARDS
// ============================================================

export const XP_REWARDS = {
    generate_script:      { xp: 10, label: 'Script Generated' },
    high_quality:         { xp: 5,  label: 'High Quality (85+)' },
    excellent_quality:    { xp: 10, label: 'Excellent Quality (95+)' },
    new_category:         { xp: 15, label: 'New Category Explored' },
    new_audience:         { xp: 15, label: 'New Audience Reached' },
    new_language:         { xp: 20, label: 'New Language Used' },
    series_complete:      { xp: 50, label: 'Series Completed' },
    playlist_complete:    { xp: 40, label: 'Playlist Completed' },
    content_gap_filled:   { xp: 25, label: 'Content Gap Filled' },
    skill_pack_used:      { xp: 15, label: 'Skill Pack Used' },
    daily_streak:         { xp: 10, label: 'Daily Streak' },
};

// ============================================================
// LEVELS
// ============================================================

export const LEVELS = [
    { level: 1,  title: '🌱 Seed',           xpRequired: 0 },
    { level: 2,  title: '🌿 Sprout',         xpRequired: 50 },
    { level: 3,  title: '🌳 Sapling',        xpRequired: 150 },
    { level: 4,  title: '🧘 Practitioner',    xpRequired: 300 },
    { level: 5,  title: '💪 Warrior',         xpRequired: 500 },
    { level: 6,  title: '🌟 Master',          xpRequired: 800 },
    { level: 7,  title: '🔥 Guru',            xpRequired: 1200 },
    { level: 8,  title: '👑 Grandmaster',     xpRequired: 2000 },
    { level: 9,  title: '🌈 Enlightened',     xpRequired: 3500 },
    { level: 10, title: '✨ Transcendent',    xpRequired: 5000 },
];

// ============================================================
// ACHIEVEMENTS
// ============================================================

export const ACHIEVEMENTS = {
    first_script: {
        id: 'first_script',
        name: '🎉 First Script',
        description: 'Generate your very first yoga script',
        icon: '🎉',
        condition: (stats) => stats.totalScripts >= 1,
        xpReward: 10,
    },
    quality_master: {
        id: 'quality_master',
        name: '🌟 Quality Master',
        description: 'Score 90+ on a quality audit',
        icon: '🌟',
        condition: (stats) => stats.highestScore >= 90,
        xpReward: 20,
    },
    perfect_score: {
        id: 'perfect_score',
        name: '💎 Perfect Score',
        description: 'Score 100 on a quality audit',
        icon: '💎',
        condition: (stats) => stats.highestScore >= 100,
        xpReward: 50,
    },
    polyglot: {
        id: 'polyglot',
        name: '🌍 Polyglot',
        description: 'Generate scripts in 3+ languages',
        icon: '🌍',
        condition: (stats) => stats.languagesUsed >= 3,
        xpReward: 30,
    },
    category_explorer: {
        id: 'category_explorer',
        name: '🗺️ Category Explorer',
        description: 'Use 5+ different categories',
        icon: '🗺️',
        condition: (stats) => stats.categoriesUsed >= 5,
        xpReward: 25,
    },
    category_master: {
        id: 'category_master',
        name: '🏅 Category Master',
        description: 'Use ALL categories (10+)',
        icon: '🏅',
        condition: (stats) => stats.categoriesUsed >= 10,
        xpReward: 50,
    },
    marathon_10: {
        id: 'marathon_10',
        name: '🏃 Marathon Runner',
        description: 'Generate 10+ scripts total',
        icon: '🏃',
        condition: (stats) => stats.totalScripts >= 10,
        xpReward: 20,
    },
    marathon_50: {
        id: 'marathon_50',
        name: '🏅 Half Century',
        description: 'Generate 50+ scripts total',
        icon: '🏅',
        condition: (stats) => stats.totalScripts >= 50,
        xpReward: 50,
    },
    marathon_100: {
        id: 'marathon_100',
        name: '💯 Century Club',
        description: 'Generate 100+ scripts total',
        icon: '💯',
        condition: (stats) => stats.totalScripts >= 100,
        xpReward: 100,
    },
    series_pro: {
        id: 'series_pro',
        name: '🎬 Series Pro',
        description: 'Complete a full series generation',
        icon: '🎬',
        condition: (stats) => stats.seriesCompleted >= 1,
        xpReward: 30,
    },
    diversity_champion: {
        id: 'diversity_champion',
        name: '🌈 Diversity Champion',
        description: 'Create scripts for 3+ different audiences',
        icon: '🌈',
        condition: (stats) => stats.audiencesUsed >= 3,
        xpReward: 25,
    },
    streak_3: {
        id: 'streak_3',
        name: '🔥 On Fire',
        description: 'Generate scripts 3 days in a row',
        icon: '🔥',
        condition: (stats) => stats.currentStreak >= 3,
        xpReward: 15,
    },
    streak_7: {
        id: 'streak_7',
        name: '⚡ Unstoppable',
        description: 'Generate scripts 7 days in a row',
        icon: '⚡',
        condition: (stats) => stats.currentStreak >= 7,
        xpReward: 40,
    },
};

// ============================================================
// STATE MANAGEMENT
// ============================================================

function getDefaultState() {
    return {
        xp: 0,
        level: 1,
        totalScripts: 0,
        highestScore: 0,
        categoriesUsedSet: [],
        audiencesUsedSet: [],
        languagesUsedSet: [],
        posesUsedSet: [],
        seriesCompleted: 0,
        playlistsCompleted: 0,
        unlockedAchievements: [],
        xpHistory: [],    // { date, amount, reason }
        lastGeneratedDate: null,
        currentStreak: 0,
        longestStreak: 0,
        skillPacksUsed: [],
    };
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const saved = JSON.parse(raw);
            return { ...getDefaultState(), ...saved };
        }
    } catch (e) { /* ignore */ }
    return getDefaultState();
}

function saveState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* ignore */ }
}

let _state = loadState();

// ============================================================
// CORE API
// ============================================================

/**
 * Record a script generation event — updates XP, streak, achievements.
 * Call this after every successful generateScript().
 */
export function recordGeneration(result) {
    const rewards = [];
    const config = result.config || {};
    const score = result.auditResult?.totalScore || result.meta?.auditResult?.score || 0;

    // 1. Basic XP for generating
    rewards.push(addXP('generate_script'));
    _state.totalScripts++;

    // 2. Quality bonuses
    if (score >= 95) {
        rewards.push(addXP('excellent_quality'));
    } else if (score >= 85) {
        rewards.push(addXP('high_quality'));
    }

    // 3. Track highest score
    if (score > _state.highestScore) _state.highestScore = score;

    // 4. New category?
    const cat = config.category;
    if (cat && !_state.categoriesUsedSet.includes(cat)) {
        _state.categoriesUsedSet.push(cat);
        rewards.push(addXP('new_category'));
    }

    // 5. New audience?
    const aud = config.niche?.audience;
    if (aud && !_state.audiencesUsedSet.includes(aud)) {
        _state.audiencesUsedSet.push(aud);
        rewards.push(addXP('new_audience'));
    }

    // 6. New language?
    const lang = config.language;
    if (lang && !_state.languagesUsedSet.includes(lang)) {
        _state.languagesUsedSet.push(lang);
        rewards.push(addXP('new_language'));
    }

    // 7. Track poses used
    const poses = result.poseSequence?.map(p => p.id || p.name) || [];
    poses.forEach(p => {
        if (!_state.posesUsedSet.includes(p)) _state.posesUsedSet.push(p);
    });

    // 8. Update streak
    updateStreak();

    // 9. Check achievements
    const newAchievements = checkAchievements();
    newAchievements.forEach(a => {
        rewards.push({ xp: a.xpReward, label: `🏆 ${a.name}` });
    });

    // 10. Update level
    updateLevel();

    // 11. Save
    saveState(_state);

    return {
        rewards,
        totalXP: _state.xp,
        level: getCurrentLevel(),
        newAchievements,
    };
}

/**
 * Record a series/playlist completion.
 */
export function recordBatchCompletion(type, count) {
    if (type === 'series') {
        _state.seriesCompleted++;
        addXP('series_complete');
    } else {
        _state.playlistsCompleted++;
        addXP('playlist_complete');
    }
    const newAchievements = checkAchievements();
    updateLevel();
    saveState(_state);
    return { newAchievements };
}

// ============================================================
// XP & LEVEL
// ============================================================

function addXP(rewardKey) {
    const reward = XP_REWARDS[rewardKey];
    if (!reward) return null;
    _state.xp += reward.xp;
    _state.xpHistory.push({
        date: new Date().toISOString(),
        amount: reward.xp,
        reason: reward.label,
    });
    // Keep history manageable
    if (_state.xpHistory.length > 200) _state.xpHistory = _state.xpHistory.slice(-100);
    return { xp: reward.xp, label: reward.label };
}

function updateLevel() {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (_state.xp >= LEVELS[i].xpRequired) {
            _state.level = LEVELS[i].level;
            return;
        }
    }
}

export function getCurrentLevel() {
    const lvl = LEVELS.find(l => l.level === _state.level) || LEVELS[0];
    const nextLvl = LEVELS.find(l => l.level === _state.level + 1);
    return {
        ...lvl,
        currentXP: _state.xp,
        nextLevelXP: nextLvl?.xpRequired || null,
        progress: nextLvl
            ? (_state.xp - lvl.xpRequired) / (nextLvl.xpRequired - lvl.xpRequired)
            : 1,
    };
}

// ============================================================
// STREAK
// ============================================================

function updateStreak() {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = _state.lastGeneratedDate;

    if (!lastDate) {
        _state.currentStreak = 1;
    } else {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (lastDate === today) {
            // Same day, no change
        } else if (lastDate === yesterday) {
            _state.currentStreak++;
        } else {
            _state.currentStreak = 1; // Streak broken
        }
    }

    _state.lastGeneratedDate = today;
    if (_state.currentStreak > _state.longestStreak) {
        _state.longestStreak = _state.currentStreak;
    }
}

// ============================================================
// ACHIEVEMENTS
// ============================================================

function checkAchievements() {
    const stats = getStats();
    const newlyUnlocked = [];

    for (const [id, achievement] of Object.entries(ACHIEVEMENTS)) {
        if (_state.unlockedAchievements.includes(id)) continue;
        if (achievement.condition(stats)) {
            _state.unlockedAchievements.push(id);
            _state.xp += achievement.xpReward;
            newlyUnlocked.push(achievement);
        }
    }

    return newlyUnlocked;
}

// ============================================================
// SKILL PACKS API
// ============================================================

export function getSkillPacks() {
    const level = _state.level;
    return Object.values(SKILL_PACKS).map(pack => ({
        ...pack,
        locked: pack.unlockLevel > level,
        poseDetails: pack.poses.map(id => POSES_DB[id]).filter(Boolean),
        used: _state.skillPacksUsed.includes(pack.id),
    }));
}

export function getSkillPack(packId) {
    return SKILL_PACKS[packId] || null;
}

export function markSkillPackUsed(packId) {
    if (!_state.skillPacksUsed.includes(packId)) {
        _state.skillPacksUsed.push(packId);
        addXP('skill_pack_used');
        saveState(_state);
    }
}

/**
 * Get pose IDs from a skill pack for use in config.
 */
export function getSkillPackPoses(packId) {
    const pack = SKILL_PACKS[packId];
    return pack ? pack.poses : [];
}

// ============================================================
// STATS & DATA
// ============================================================

export function getStats() {
    return {
        totalScripts: _state.totalScripts,
        highestScore: _state.highestScore,
        categoriesUsed: _state.categoriesUsedSet.length,
        audiencesUsed: _state.audiencesUsedSet.length,
        languagesUsed: _state.languagesUsedSet.length,
        posesUsed: _state.posesUsedSet.length,
        totalPoses: Object.keys(POSES_DB).length,
        seriesCompleted: _state.seriesCompleted,
        playlistsCompleted: _state.playlistsCompleted,
        currentStreak: _state.currentStreak,
        longestStreak: _state.longestStreak,
        xp: _state.xp,
        level: _state.level,
        skillPacksUsed: _state.skillPacksUsed.length,
        totalSkillPacks: Object.keys(SKILL_PACKS).length,
    };
}

export function getUnlockedAchievements() {
    return _state.unlockedAchievements
        .map(id => ACHIEVEMENTS[id])
        .filter(Boolean);
}

export function getAllAchievements() {
    const stats = getStats();
    return Object.values(ACHIEVEMENTS).map(a => ({
        ...a,
        unlocked: _state.unlockedAchievements.includes(a.id),
        progress: a.condition(stats),
    }));
}

export function getRecentXP(limit = 10) {
    return _state.xpHistory.slice(-limit).reverse();
}

export function resetGamification() {
    _state = getDefaultState();
    saveState(_state);
}

// ============================================================
// AUTO-TAGGING
// ============================================================

/**
 * Generate smart tags for a generated script based on its config and content.
 */
export function generateTags(config, poseSequence = [], score = 0) {
    const tags = new Set();

    // Category tag
    if (config.category) tags.add(config.category);

    // Audience tag
    if (config.niche?.audience) tags.add(config.niche.audience);

    // Level tag
    if (config.niche?.level) tags.add(config.niche.level);

    // Duration tag
    const dur = config.session?.duration || 15;
    if (dur <= 10) tags.add('quick');
    else if (dur >= 30) tags.add('long-session');

    // Focus area tag
    if (config.niche?.focusArea) tags.add(config.niche.focusArea);

    // Language tag
    if (config.language && config.language !== 'en') tags.add(`lang:${config.language}`);

    // Quality tag
    if (score >= 90) tags.add('high-quality');
    if (score >= 95) tags.add('premium');

    // Pose-based tags
    const poseIds = poseSequence.map(p => p.id || '');
    if (poseIds.some(p => p.includes('warrior'))) tags.add('warrior-flow');
    if (poseIds.some(p => p.includes('balance') || p === 'tree_pose' || p === 'eagle_pose')) tags.add('balance');
    if (poseIds.includes('savasana')) tags.add('includes-savasana');
    if (poseIds.some(p => ['cobra_pose', 'bow_pose', 'camel_pose'].includes(p))) tags.add('backbends');

    // Character mode
    if (config.characterMode && config.characterMode !== 'none') tags.add('character');

    // Narration style
    if (config.session?.narrationStyle === 'poetic') tags.add('poetic');

    return [...tags];
}
