/**
 * HISTORY & TEMPLATES MANAGER
 * 
 * Handles saving, retrieving, and managing generated scripts and user templates.
 * Data is stored in localStorage.
 * 
 * Features:
 * - Script History: Auto-save generated scripts (max 100)
 * - Custom Templates: Save current config as a reusable preset
 * - Favorites: Mark scripts as favorites
 */

import { generateTags } from './gamification.js';

const HISTORY_KEY = 'yogakids_history';
const TEMPLATES_KEY = 'yogakids_user_templates';
const MAX_HISTORY = 100;

// ============================================================
// STATE INITIALIZATION
// ============================================================

function loadStorage(key, defaultVal) {
    try {
        const raw = localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
    } catch (e) {
        console.error(`[HistoryManager] Failed to load ${key}`, e);
    }
    return defaultVal;
}

function saveStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`[HistoryManager] Failed to save ${key}`, e);
        // If quota exceeded, clean up history
        if (e.name === 'QuotaExceededError' && key === HISTORY_KEY) {
            cleanUpHistory();
            localStorage.setItem(key, JSON.stringify(_history));
        }
    }
}

let _history = loadStorage(HISTORY_KEY, []);
let _userTemplates = loadStorage(TEMPLATES_KEY, []);

// ============================================================
// SCRIPT HISTORY API
// ============================================================

/**
 * Add a successfully generated script to history.
 * @param {Object} result - The result object from generateScript
 * @param {Object} config - The config used
 */
export function addToHistory(result, config) {
    const score = result.auditResult?.totalScore || result.meta?.auditResult?.score || 0;
    
    const entry = {
        id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        date: new Date().toISOString(),
        timestamp: Date.now(),
        title: config.title || result.meta?.title || 'Untitled Session',
        category: config.category || 'General',
        duration: config.session?.duration || 15,
        score: score,
        tags: generateTags(config, result.poseSequence, score),
        isFavorite: false,
        config: config,
        // Only store essential script data to save space
        scriptText: result.script,
        poseSequence: result.poseSequence,
        meta: result.meta,
    };

    _history.unshift(entry);

    if (_history.length > MAX_HISTORY) {
        _history.pop();
    }

    saveStorage(HISTORY_KEY, _history);
    return entry;
}

export function getHistory(limit = 50) {
    return _history.slice(0, limit);
}

export function getFavorites() {
    return _history.filter(h => h.isFavorite);
}

export function getHistoryItem(id) {
    return _history.find(h => h.id === id) || null;
}

export function toggleFavorite(id) {
    const item = _history.find(h => h.id === id);
    if (item) {
        item.isFavorite = !item.isFavorite;
        saveStorage(HISTORY_KEY, _history);
        return item.isFavorite;
    }
    return null;
}

export function deleteHistoryItem(id) {
    _history = _history.filter(h => h.id !== id);
    saveStorage(HISTORY_KEY, _history);
}

export function clearHistory(keepFavorites = true) {
    if (keepFavorites) {
        _history = _history.filter(h => h.isFavorite);
    } else {
        _history = [];
    }
    saveStorage(HISTORY_KEY, _history);
}

function cleanUpHistory() {
    // Keep favorites, keep 20 most recent, discard rest to save space
    const favorites = _history.filter(h => h.isFavorite);
    const recent = _history.filter(h => !h.isFavorite).slice(0, 20);
    _history = [...favorites, ...recent].sort((a, b) => b.timestamp - a.timestamp);
}

// ============================================================
// USER TEMPLATES API (CUSTOM PRESETS)
// ============================================================

/**
 * Save current configuration as a reusable user template.
 * @param {String} name - Display name
 * @param {String} description - Short description
 * @param {Object} config - The configuration object
 */
export function saveUserTemplate(name, description, config) {
    const template = {
        id: `utpl_${Date.now()}`,
        name: name,
        description: description,
        date: new Date().toISOString(),
        config: config,
    };

    _userTemplates.push(template);
    saveStorage(TEMPLATES_KEY, _userTemplates);
    return template;
}

export function getUserTemplates() {
    return [..._userTemplates];
}

export function getUserTemplate(id) {
    return _userTemplates.find(t => t.id === id) || null;
}

export function deleteUserTemplate(id) {
    _userTemplates = _userTemplates.filter(t => t.id !== id);
    saveStorage(TEMPLATES_KEY, _userTemplates);
}

// ============================================================
// ANALYTICS & STATS EXPORT
// ============================================================

/**
 * Returns a summary of user's generated content based on history
 */
export function getHistoryStats() {
    if (_history.length === 0) return null;

    const stats = {
        total: _history.length,
        avgScore: 0,
        categories: {},
        topPoses: {}
    };

    let totalScore = 0;
    
    _history.forEach(h => {
        totalScore += h.score;
        
        // Category count
        stats.categories[h.category] = (stats.categories[h.category] || 0) + 1;
        
        // Pose count
        if (h.poseSequence) {
            h.poseSequence.forEach(p => {
                const poseId = p.id || p.name;
                stats.topPoses[poseId] = (stats.topPoses[poseId] || 0) + 1;
            });
        }
    });

    stats.avgScore = Math.round(totalScore / _history.length);

    // Sort top poses
    stats.topPoses = Object.entries(stats.topPoses)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, count]) => ({ id, count }));

    return stats;
}
