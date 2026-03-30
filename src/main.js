/**
 * YOGAKIDS — Main App Entry Point
 * Wires all modules together with UI event handlers
 */

import { parseScript, formatSceneLabel, getScriptStats, analyzeScene } from './modules/scriptParser.js';
import { generateAllFramePrompts, generateFramePrompts, STYLE_PRESETS, DEFAULT_SETTINGS } from './modules/promptGenerator.js';
import { generateImage, base64ToBlobUrl, generateSceneImages, PROVIDERS, verifyApiKey } from './modules/imageGenerator.js';
import { enqueue, enqueueAll, cancelAll, clearAll, isQueueProcessing, setCallbacks, getQueueStatus } from './modules/imageQueue.js';
import { getState, setState, onStateChange, restoreAllState, clearAllState, clearProjectState, getActiveApiKey, setApiKey } from './modules/state.js';
import { log } from './modules/logger.js';
import { initThumbnailStudio, renderThumbnailPoseSelectors } from './modules/thumbnailGenerator.js';
import { supabase } from './modules/supabaseClient.js';
import { generateScript, generateFromTemplate, generateSeries, generatePlaylist, getTemplateOptions, getLanguageOptions, applyTemplate, detectTextProvider, getDefaultTextModel, getSeriesPresets, getPlaylistThemes, recordGeneration, recordBatchCompletion, getCurrentLevel, getStats, getSkillPacks, markSkillPackUsed, getUnlockedAchievements, getAllAchievements, getRecentXP, addToHistory, getHistory, getHistoryItem, toggleFavorite, deleteHistoryItem, getFavorites, saveUserTemplate, getUserTemplates, getUserTemplate, deleteUserTemplate } from './modules/scriptGenerator/index.js';
import { generateText as generateTextAI } from './modules/scriptGenerator/textProvider.js';

// ============================================================
// CONSTANTS
// ============================================================
const TOAST_DURATION = 3500;
const MAX_REFERENCE_IMAGES = 3;

// Module-scoped timer state (replaces window globals)
let _genTimers = {};
let _genStartTimes = {};
let _genElapsedTimes = {};

// ============================================================
// SAMPLE SCRIPT
// ============================================================

const SAMPLE_SCRIPT = `Intro

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
Sleep well and have a peaceful night.`;

// ============================================================
// DOM ELEMENTS
// ============================================================

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ============================================================
// INIT
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    log.group('🚀 [App] DOMContentLoaded — Initializing YogaKids');

    // ============================================================
    // AUTH LOGIC (Supabase)
    // ============================================================
    initAuthUI();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        document.getElementById('auth-overlay').style.display = 'flex';
        document.getElementById('pending-overlay').style.display = 'none';
    } else {
        document.getElementById('auth-overlay').style.display = 'none';
        checkAccessAndInit(session);
    }

    supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
            document.getElementById('auth-overlay').style.display = 'flex';
            document.getElementById('pending-overlay').style.display = 'none';
            // Optional: reset app state or refresh if logged out
        } else {
            document.getElementById('auth-overlay').style.display = 'none';
            checkAccessAndInit(session);
        }
    });
});

// Hardcoded admin emails — always bypass pending check
const ADMIN_EMAILS = ['xvirion@gmail.com'];

async function checkAccessAndInit(session) {
    if(!session) return;
    
    const userEmail = (session.user.email || '').toLowerCase();
    const isHardcodedAdmin = ADMIN_EMAILS.includes(userEmail);
    
    // Try to fetch profile from DB
    let profile = null;
    try {
        const { data, error } = await supabase.from('profiles').select('role, is_active').eq('id', session.user.id).single();
        if (!error) profile = data;
    } catch(e) {
        console.warn('[Auth] Could not fetch profile, falling back to email check', e);
    }
    
    // Admin by email OR by DB role → always allow
    const isAdmin = isHardcodedAdmin || (profile && profile.role === 'admin');
    const isActive = isAdmin || (profile && profile.is_active);
    
    if (isActive) {
        document.getElementById('pending-overlay').style.display = 'none';
        
        if (isAdmin) {
            const adminNav = document.getElementById('nav-btn-admin');
            if (adminNav) adminNav.style.display = '';
            initAdminPanel();
        }
        
        initApp();
    } else {
        // Show pending
        document.getElementById('pending-overlay').style.display = 'flex';
    }
}

async function initApp() {
    if (window._appInitialized) return;
    window._appInitialized = true;
    
    // Image modal close handlers
    $('#image-modal-close')?.addEventListener('click', () => {
        $('#image-modal').style.display = 'none';
    });
    $('#image-modal')?.addEventListener('click', (e) => {
        if (e.target === $('#image-modal')) {
            $('#image-modal').style.display = 'none';
        }
    });

    // 1. Restore all persisted state first (localStorage + IndexedDB)
    await restoreAllState();

    // 2. Init UI modules (they read from restored state)
    initAuthUI();
    initSettings();
    initNavigation();
    initScriptPanel();
    initCharacterPanel();
    initPromptPanel();
    initGalleryPanel();
    initThumbnailStudio();
    initScriptGenerator();
    initFloatingAgent();

    // 3. Rebuild UI from restored state
    rebuildFromState();

    log.info('✅ [App] All modules initialized');
    log.groupEnd();
    showToast('🧘 YogaKids ready!', 'info');
}

/**
 * Khởi tạo UI Đăng nhập/Đăng ký
 */
function initAuthUI() {
    const btnLogin = document.getElementById('auth-tab-login');
    const btnRegister = document.getElementById('auth-tab-register');
    const form = document.getElementById('auth-form');
    const emailInput = document.getElementById('auth-email');
    const pwdInput = document.getElementById('auth-password');
    const errorMsg = document.getElementById('auth-error');
    const submitBtn = document.getElementById('auth-submit-btn');
    const btnLogout = document.getElementById('btn-logout');

    let mode = 'login'; // login | register

    // Switch tabs
    btnLogin.addEventListener('click', () => {
        mode = 'login';
        btnLogin.classList.add('active');
        btnRegister.classList.remove('active');
        submitBtn.textContent = 'Đăng Nhập';
        errorMsg.style.display = 'none';
    });
    btnRegister.addEventListener('click', () => {
        mode = 'register';
        btnRegister.classList.add('active');
        btnLogin.classList.remove('active');
        submitBtn.textContent = 'Đăng Ký';
        errorMsg.style.display = 'none';
    });

    // Form Submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        const password = pwdInput.value;
        errorMsg.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang xử lý...';

        if (mode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                errorMsg.textContent = 'Lỗi: ' + error.message;
                errorMsg.style.display = 'block';
            }
        } else {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) {
                errorMsg.textContent = 'Lỗi: ' + error.message;
                errorMsg.style.display = 'block';
            } else {
                errorMsg.textContent = 'Đăng ký thành công! Hãy kiểm tra Email nếu có yêu cầu xác thực, hoặc tự động đăng nhập...';
                errorMsg.style.color = '#10b981'; // green
                errorMsg.style.display = 'block';
                // Switch back to login normally, but Supabase logs in user automatically if no email verification
            }
        }

        submitBtn.disabled = false;
        submitBtn.textContent = mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký';
    });

    // Logout buttons
    btnLogout?.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.reload();
    });

    const pendingLogoutBtn = document.getElementById('btn-pending-logout');
    if (pendingLogoutBtn) {
        pendingLogoutBtn.addEventListener('click', async () => {
            await supabase.auth.signOut();
            window.location.reload();
        });
    }
}

/**
 * Khởi tạo tính năng Admin Panel
 */
function initAdminPanel() {
    if (window._adminInitialized) return;
    window._adminInitialized = true;

    // Load user list
    const adminNav = document.getElementById('nav-btn-admin');
    if(adminNav) {
        adminNav.addEventListener('click', () => {
            loadAdminUsers();
        });
    }
}

async function loadAdminUsers() {
    const listEl = document.getElementById('admin-users-list');
    if(!listEl) return;
    
    listEl.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">Đang tải...</td></tr>';
    
    const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
    if (error) {
        listEl.innerHTML = `<tr><td colspan="4" style="text-align:center; color: red;">Lỗi: ${error.message}</td></tr>`;
        return;
    }

    if (!document.getElementById('admin-style')) {
        const style = document.createElement('style');
        style.id = 'admin-style';
        style.innerHTML = `
            .toggle-active-btn {
                background: transparent;
                border: 1px solid var(--glass-border);
                color: var(--text-primary);
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
            }
            .toggle-active-btn.activated {
                border-color: var(--accent-success);
                color: var(--accent-success);
            }
            .toggle-active-btn.deactivated {
                border-color: var(--accent-danger);
                color: var(--accent-danger);
            }
            .toggle-active-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(style);
    }
    
    listEl.innerHTML = '';
    
    users.forEach(u => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        
        const dateStr = new Date(u.created_at).toLocaleString('vi-VN');
        
        const statusSpan = u.is_active 
            ? '<span style="color: var(--accent-success); font-weight: bold;">Đã duyệt</span>' 
            : '<span style="color: var(--accent-danger);">Chờ duyệt</span>';
            
        const actionBtn = u.role === 'admin' ? '<span style="color: #666;">Admin</span>' : `
            <button class="toggle-active-btn ${u.is_active ? 'activated' : 'deactivated'}" data-id="${u.id}" data-active="${u.is_active}">
                ${u.is_active ? '✅ Tắt quyền' : '🔒 Bật quyền'}
            </button>
        `;
        
        tr.innerHTML = `
            <td style="padding: 12px 10px;">${escapeHtml(u.email || u.id)}</td>
            <td style="padding: 12px 10px;">${dateStr}</td>
            <td style="padding: 12px 10px;" id="status-${u.id}">${statusSpan}</td>
            <td style="padding: 12px 10px;" id="action-${u.id}">${actionBtn}</td>
        `;
        listEl.appendChild(tr);
    });
    
    // Bind buttons
    const btns = listEl.querySelectorAll('.toggle-active-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            const currentActive = e.target.getAttribute('data-active') === 'true';
            const newActive = !currentActive;
            
            e.target.disabled = true;
            e.target.textContent = '...';
            
            const { error: updErr } = await supabase
                .from('profiles')
                .update({ is_active: newActive })
                .eq('id', id);
                
            if(updErr) {
                alert('Lỗi: ' + updErr.message);
                e.target.disabled = false;
                e.target.textContent = currentActive ? '✅ Tắt quyền' : '🔒 Bật quyền';
            } else {
                // Refresh local view implicitly
                const statusTd = document.getElementById('status-' + id);
                statusTd.innerHTML = newActive 
                    ? '<span style="color: var(--accent-success); font-weight: bold;">Đã duyệt</span>' 
                    : '<span style="color: var(--accent-danger);">Chờ duyệt</span>';
                    
                e.target.setAttribute('data-active', newActive);
                e.target.className = 'toggle-active-btn ' + (newActive ? 'activated' : 'deactivated');
                e.target.textContent = newActive ? '✅ Tắt quyền' : '🔒 Bật quyền';
                e.target.disabled = false;
            }
        });
    });
}

/**
 * Rebuild the entire UI from persisted state after a page refresh.
 */
function rebuildFromState() {
    const state = getState();
    log.group('🔄 [Restore] Rebuilding UI from state');

    // Restore API key input for current provider
    const currentKey = getActiveApiKey();
    if (currentKey) {
        $('#api-key').value = currentKey;
    }

    // Restore character description
    if (state.characterDescription) {
        const el = $('#character-desc');
        if (el) el.value = state.characterDescription;
    }

    // Restore environment
    if (state.environment) {
        const el = $('#environment-desc');
        if (el) el.value = state.environment;
    }

    // Restore aspect ratio
    if (state.aspectRatio) {
        const el = $('#aspect-ratio');
        if (el) el.value = state.aspectRatio;
    }

    // Restore parsed script → rebuild scene list
    if (state.parsedScript && state.parsedScript.scenes?.length > 0) {
        log.info(`  📝 Restoring ${state.parsedScript.scenes.length} scenes`);
        renderSceneList(state.parsedScript);
        const stats = getScriptStats(state.parsedScript);
        $('#stat-scenes').textContent = stats.totalScenes;
        $('#stat-prompts').textContent = stats.totalScenes * 2;
        $('#scene-count-badge').textContent = `${stats.totalScenes} scenes`;
        $('#btn-to-character').disabled = false;
        renderThumbnailPoseSelectors();
    }

    // Restore frame prompts → rebuild prompt list
    if (state.framePrompts?.length > 0) {
        log.info(`  🎨 Restoring ${state.framePrompts.length} frame prompts`);
        buildPromptList();
    }

    // Restore generated images → rebuild gallery
    const imageCount = Object.keys(state.generatedImages || {}).length;
    if (imageCount > 0 && state.framePrompts?.length > 0) {
        log.info(`  🖼️ Restoring ${imageCount} generated image sets`);
        buildGallery();
        $('#stat-images').textContent = imageCount * 2;
        $('#btn-download-all').disabled = false;
    }

    // Restore reference image previews
    if (state.referenceImages?.length > 0) {
        log.info(`  🖼️ Restoring ${state.referenceImages.length} Character references`);
        renderRefPreviews();
    }
    if (state.envReferenceImages?.length > 0) {
        log.info(`  🏞️ Restoring ${state.envReferenceImages.length} Environment references`);
        renderEnvRefPreviews();
    }

    // Restore thumbnail
    if (state.thumbnail) {
        log.info(`  🎬 Restoring Thumbnail`);
        const imgPreview = $('#thumbnail-preview-img');
        const emptyState = $('#thumbnail-empty-state');
        const btnDownload = $('#btn-download-thumbnail');
        if (imgPreview && emptyState && btnDownload) {
            imgPreview.src = `data:image/png;base64,${state.thumbnail}`;
            imgPreview.style.display = 'block';
            emptyState.style.display = 'none';
            btnDownload.style.display = 'inline-flex';
        }
    }

    // Restore step (default to Script Gen = step 7)
    const targetStep = state.currentStep || 7;
    log.info(`  📍 Restoring step ${targetStep}`);
    goToStep(targetStep);

    // Restore style preset selection
    if (state.stylePreset) {
        $$('.style-option').forEach(s => {
            s.classList.toggle('selected', s.dataset.style === state.stylePreset);
        });
    }

    log.groupEnd();
}

// ============================================================
// NAVIGATION & STEPS
// ============================================================

function initNavigation() {
    // Step nav buttons
    $$('.nav-step').forEach(btn => {
        btn.addEventListener('click', () => {
            const step = parseInt(btn.dataset.step);
            goToStep(step);
        });
    });

    // Next/Prev buttons
    $$('[data-next]').forEach(btn => {
        btn.addEventListener('click', () => {
            const step = parseInt(btn.dataset.next);
            if (step === 3) buildPromptList(); // Generate prompts before going to prompt review
            if (step === 4) buildGallery();    // Build gallery before going to gallery
            goToStep(step);
        });
    });

    $$('[data-prev]').forEach(btn => {
        btn.addEventListener('click', () => {
            goToStep(parseInt(btn.dataset.prev));
        });
    });

    // New project button
    $('#btn-new-project').addEventListener('click', () => {
        if (confirm('Bắt đầu dự án mới? (Sẽ xóa kịch bản, ảnh và nhân vật nhưng giữ lại API key và cài đặt)')) {
            clearProjectState();
            location.reload();
        }
    });

    // Reset button
    $('#btn-reset').addEventListener('click', () => {
        if (confirm('Reset toàn bộ dữ liệu? (Bao gồm cả API key và cài đặt)')) {
            clearAllState();
            location.reload();
        }
    });

    // Load ZIP button
    $('#btn-load-zip').addEventListener('click', () => {
        $('#upload-zip-input').click();
    });

    $('#upload-zip-input').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            loadZipState(e.target.files[0]);
        }
    });
}

function goToStep(step) {
    const stepNames = ['Settings', 'Script Input', 'Character Setup', 'Prompt Review', 'Gallery', 'Thumbnail', '', 'Script Gen', 'Admin'];
    // Logical flow order: Script Gen(7) → Settings(0) → Script(1) → Char(2) → Prompts(3) → Gallery(4) → Thumbnail(5) → Admin(8)
    const FLOW_ORDER = [7, 0, 1, 2, 3, 4, 5, 8];

    log.debug(`📍 [Nav] goToStep(${step}) → "${stepNames[step] || 'Unknown'}"`);

    setState('currentStep', step);

    // Update panels
    $$('.step-panel').forEach(p => p.classList.remove('active'));
    $(`.step-panel[data-panel="${step}"]`)?.classList.add('active');

    // Update nav — mark 'completed' for steps BEFORE current in the flow order
    const currentFlowIdx = FLOW_ORDER.indexOf(step);
    $$('.nav-step').forEach(n => {
        const navStep = parseInt(n.dataset.step);
        const navFlowIdx = FLOW_ORDER.indexOf(navStep);
        n.classList.remove('active', 'completed');
        if (navFlowIdx < currentFlowIdx && navFlowIdx >= 0) n.classList.add('completed');
        if (navStep === step) n.classList.add('active');
    });

    // Progress bar — based on flow position
    const totalFlowSteps = FLOW_ORDER.length - 1; // exclude Admin
    const flowIdx = Math.max(0, currentFlowIdx);
    const pct = Math.min(100, ((flowIdx + 1) / totalFlowSteps) * 100);
    $('#progress-fill').style.width = `${pct}%`;
    $('#progress-label').textContent = stepNames[step] || `Step ${flowIdx + 1}`;
}

// ============================================================
// STEP 0: SETTINGS
// ============================================================

function initSettings() {
    const state = getState();

    // ---- Provider tabs ----
    updateProviderUI(state.provider);

    $$('.provider-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const provider = tab.dataset.provider;
            setState('provider', provider);
            updateProviderUI(provider);
            // Load the saved API key for this provider
            const apiKeyInput = $('#api-key');
            apiKeyInput.value = getState().apiKeys[provider] || '';
        });
    });

    // ---- API key ----
    const apiKeyInput = $('#api-key');
    apiKeyInput.value = getActiveApiKey();
    apiKeyInput.addEventListener('input', (e) => {
        const key = e.target.value;
        const currentProvider = getState().provider;
        setApiKey(currentProvider, key);

        // Auto-detect provider from key format
        if (key.startsWith('vai-') && currentProvider !== 'vertex-key') {
            setApiKey('vertex-key', key);
            setState('provider', 'vertex-key');
            updateProviderUI('vertex-key');
        } else if (key.startsWith('AIza') && currentProvider !== 'google-ai') {
            setApiKey('google-ai', key);
            setState('provider', 'google-ai');
            updateProviderUI('google-ai');
        } else if ((key.includes('|AQ.') || key.startsWith('AQ.')) && currentProvider !== 'vertex-ai') {
            // Vertex AI: projectId|AQ.xxx or AQ.xxx
            setApiKey('vertex-ai', key);
            setState('provider', 'vertex-ai');
            updateProviderUI('vertex-ai');
        } else if (key.includes('|') && key.split('|')[0].includes('.') && currentProvider !== 'gommo') {
            // Gommo: domain.net|token
            setApiKey('gommo', key);
            setState('provider', 'gommo');
            updateProviderUI('gommo');
        }
    });

    // Toggle key visibility
    $('#toggle-key').addEventListener('click', () => {
        apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
    });

    // Check key
    const btnVerify = $('#btn-verify-key');
    const statusText = $('#key-status');
    if (btnVerify) {
        btnVerify.addEventListener('click', async () => {
            const currentKey = getActiveApiKey();
            const currentProvider = getState().provider;
            if (!currentKey) {
                showToast('Vui lòng nhập API Key trước khi kiểm tra!', 'warning');
                return;
            }

            btnVerify.disabled = true;
            btnVerify.textContent = '⏳ Đang kiểm tra...';
            statusText.style.display = 'block';
            statusText.style.color = 'var(--text-secondary)';
            statusText.textContent = 'Đang kết nối API...';

            try {
                const result = await verifyApiKey(currentKey, currentProvider);
                if (result.valid) {
                    statusText.style.color = '#10b981'; // success green
                    statusText.textContent = `✅ ${result.message}`;
                    showToast('Xác thực API Key thành công!', 'success');
                } else {
                    statusText.style.color = '#ef4444'; // error red
                    statusText.textContent = `❌ ${result.message}`;
                    showToast('Lỗi API Key!', 'error');
                }
            } catch (err) {
                statusText.style.color = '#ef4444';
                statusText.textContent = `❌ Có lỗi xảy ra: ${err.message}`;
            } finally {
                btnVerify.disabled = false;
                btnVerify.textContent = '✅ Kiểm tra';
            }
        });
    }

    // ---- Model select ----
    $('#image-model').addEventListener('change', (e) => {
        setState('imageModel', e.target.value);
    });

    // ---- Style presets ----
    const styleGrid = $('#style-grid');
    Object.entries(STYLE_PRESETS).forEach(([key, preset]) => {
        const btn = document.createElement('button');
        btn.className = `style-option ${key === state.stylePreset ? 'selected' : ''}`;
        btn.dataset.style = key;
        btn.innerHTML = `
      <span class="style-option-name">${preset.name}</span>
      <span class="style-option-desc">${preset.description}</span>
    `;
        btn.addEventListener('click', () => {
            $$('.style-option').forEach(s => s.classList.remove('selected'));
            btn.classList.add('selected');
            setState('stylePreset', key);
        });
        styleGrid.appendChild(btn);
    });

    // Aspect ratio
    $('#aspect-ratio').addEventListener('change', (e) => setState('aspectRatio', e.target.value));
}

/**
 * Update the provider UI: tabs, placeholder, model list.
 */
function updateProviderUI(provider) {
    // Toggle tab active
    $$('.provider-tab').forEach(t => t.classList.remove('active'));
    const activeTab = $(`.provider-tab[data-provider="${provider}"]`);
    if (activeTab) activeTab.classList.add('active');

    // Update key placeholder
    const providerDef = PROVIDERS[provider];
    if (providerDef) {
        $('#api-key').placeholder = providerDef.keyPlaceholder;
        const hintMap = {
            'google-ai': 'Google AI API key (AIzaSy...). Lưu trên trình duyệt.',
            'vertex-key': 'Vertex Key API key (vai-...). Lưu trên trình duyệt.',
            'gommo': 'Gommo AI key: domain.net|access_token. Lưu trên trình duyệt.',
            'vertex-ai': 'Google AI Studio key (AIzaSy...). Dùng chung API key với Google AI.',
        };
        $('#key-hint').textContent = hintMap[provider] || 'Lưu trên trình duyệt.';
    }

    // Populate model dropdown
    const modelSelect = $('#image-model');
    modelSelect.innerHTML = '';
    if (providerDef?.models) {
        const savedModel = getState().imageModel || '';
        Object.entries(providerDef.models).forEach(([modelId, info]) => {
            const opt = document.createElement('option');
            opt.value = modelId;
            opt.textContent = `${info.name} — ${info.resolution} — ${info.price}`;
            if (info.recommended && !savedModel) opt.selected = true;
            if (savedModel === modelId) opt.selected = true;
            modelSelect.appendChild(opt);
        });
        // Update state with current selection
        setState('imageModel', modelSelect.value);
    }
}

// ============================================================
// STEP 1: SCRIPT INPUT
// ============================================================

function initScriptPanel() {
    // Sample script button
    $('#btn-sample-script').addEventListener('click', () => {
        $('#script-input').value = SAMPLE_SCRIPT;
        showToast('📋 Đã load script mẫu!', 'info');
    });

    // Parse button
    $('#btn-parse').addEventListener('click', () => {
        log.group('📝 [App] Parse Script button clicked');
        const raw = $('#script-input').value.trim();
        if (!raw) {
            log.warn('⚠️ [App] No script input');
            log.groupEnd();
            showToast('⚠️ Hãy nhập script trước!', 'error');
            return;
        }
        log.debug(`📄 [App] Raw script: ${raw.length} chars`);

        const parsed = parseScript(raw);
        setState('parsedScript', parsed);
        renderSceneList(parsed);

        const stats = getScriptStats(parsed);
        log.debug('📊 [App] Script stats:', stats);
        showToast(`✅ Đã phân tích ${stats.totalScenes} scenes (${stats.poseCount} poses)`, 'success');

        // Update sidebar stats
        $('#stat-scenes').textContent = stats.totalScenes;
        $('#stat-prompts').textContent = stats.totalScenes * 2;

        // Enable next button
        $('#btn-to-character').disabled = false;
        $('#scene-count-badge').textContent = `${stats.totalScenes} scenes`;
        renderThumbnailPoseSelectors();
        log.groupEnd();
    });
}

function renderSceneList(parsed) {
    const container = $('#scene-list');
    container.innerHTML = '';

    parsed.scenes.forEach(scene => {
        const analysis = analyzeScene(scene);
        const card = document.createElement('div');
        card.className = `scene-card type-${scene.type}`;

        const numLabel = scene.type === 'intro' ? '🎬' : scene.type === 'outro' ? '🎬' : scene.number;

        card.innerHTML = `
      <span class="scene-number">${numLabel}</span>
      <div class="scene-info">
        <div class="scene-name">${scene.name}</div>
        <div class="scene-meta">${scene.lineCount} lines · ${scene.type}</div>
      </div>
      <span class="scene-view">📷 ${analysis.suggestedView}</span>
    `;
        container.appendChild(card);
    });
}

// ============================================================
// STEP 2: CHARACTER SETUP
// ============================================================

function initCharacterPanel() {
    const state = getState();

    // Character description
    const charDesc = $('#character-desc');
    charDesc.value = state.characterDescription;
    charDesc.addEventListener('input', (e) => {
        setState('characterDescription', e.target.value);
    });

    // Environment
    const envDesc = $('#environment-desc');
    envDesc.value = state.environment;
    envDesc.addEventListener('input', (e) => {
        setState('environment', e.target.value);
    });

    // File upload zone - Character
    const uploadZone = $('#upload-zone');
    const fileInput = $('#ref-upload');

    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // File upload zone - Environment
    const envUploadZone = $('#env-upload-zone');
    const envFileInput = $('#env-ref-upload');

    envUploadZone.addEventListener('click', () => envFileInput.click());
    envUploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        envUploadZone.classList.add('dragover');
    });
    envUploadZone.addEventListener('dragleave', () => {
        envUploadZone.classList.remove('dragover');
    });
    envUploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        envUploadZone.classList.remove('dragover');
        handleEnvFiles(e.dataTransfer.files);
    });
    envFileInput.addEventListener('change', (e) => {
        handleEnvFiles(e.target.files);
    });

    // Generate prompts button
    $('#btn-generate-prompts').addEventListener('click', () => {
        generatePrompts();
    });
}

function handleFiles(files) {
    const state = getState();
    const refs = [...state.referenceImages];

    for (const file of files) {
        if (refs.length >= MAX_REFERENCE_IMAGES) {
            showToast('⚠️ Tối đa 3 ảnh reference!', 'error');
            break;
        }
        if (!file.type.startsWith('image/')) continue;

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result.split(',')[1]; // Remove data:... prefix
            refs.push(base64);
            setState('referenceImages', refs);
            renderRefPreviews();
        };
        reader.readAsDataURL(file);
    }
}

function renderRefPreviews() {
    const container = $('#ref-previews');
    const refs = getState().referenceImages;
    container.innerHTML = '';

    refs.forEach((base64, i) => {
        const thumb = document.createElement('div');
        thumb.className = 'ref-thumb';
        thumb.innerHTML = `
      <img src="data:image/png;base64,${base64}" alt="Reference ${i + 1}">
      <button class="ref-thumb-remove" data-index="${i}">✕</button>
    `;
        thumb.querySelector('.ref-thumb-remove').addEventListener('click', () => {
            const newRefs = [...getState().referenceImages];
            newRefs.splice(i, 1);
            setState('referenceImages', newRefs);
            renderRefPreviews();
        });
        container.appendChild(thumb);
    });
}

function handleEnvFiles(files) {
    const state = getState();
    const refs = [...(state.envReferenceImages || [])];

    for (const file of files) {
        if (refs.length >= MAX_REFERENCE_IMAGES) {
            showToast('⚠️ Tối đa 3 ảnh environment reference!', 'error');
            break;
        }
        if (!file.type.startsWith('image/')) continue;

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result.split(',')[1];
            refs.push(base64);
            setState('envReferenceImages', refs);
            renderEnvRefPreviews();
        };
        reader.readAsDataURL(file);
    }
}

function renderEnvRefPreviews() {
    const container = $('#env-ref-previews');
    const refs = getState().envReferenceImages || [];
    container.innerHTML = '';

    refs.forEach((base64, i) => {
        const thumb = document.createElement('div');
        thumb.className = 'ref-thumb';
        thumb.innerHTML = `
      <img src="data:image/png;base64,${base64}" alt="Env Ref ${i + 1}">
      <button class="ref-thumb-remove" data-index="${i}">✕</button>
    `;
        thumb.querySelector('.ref-thumb-remove').addEventListener('click', () => {
            const newRefs = [...(getState().envReferenceImages || [])];
            newRefs.splice(i, 1);
            setState('envReferenceImages', newRefs);
            renderEnvRefPreviews();
        });
        container.appendChild(thumb);
    });
}

// ============================================================
// STEP 3: PROMPT GENERATION & REVIEW
// ============================================================

function initPromptPanel() {
    $('#btn-copy-all-veo')?.addEventListener('click', () => {
        const state = getState();
        if (!state.framePrompts || state.framePrompts.length === 0) {
            showToast('⚠️ Chưa có prompts để copy!', 'error');
            return;
        }

        const veoPrompts = state.framePrompts
            .map(fp => fp.videoPrompt)
            .filter(Boolean)
            .join('\n\n');

        if (!veoPrompts) {
            showToast('⚠️ Không tìm thấy Veo video prompts!', 'error');
            return;
        }

        navigator.clipboard.writeText(veoPrompts).then(() => {
            showToast('📋 Đã copy tất cả Veo Prompts!', 'success');
        }).catch(err => {
            console.error('Failed to copy', err);
            showToast('❌ Lỗi copy to clipboard!', 'error');
        });
    });
}


function generatePrompts() {
    log.group('🎨 [App] generatePrompts()');
    const state = getState();
    if (!state.parsedScript) {
        log.warn('⚠️ [App] No parsed script available');
        log.groupEnd();
        showToast('⚠️ Chưa có script! Quay lại bước 2.', 'error');
        return;
    }

    const settings = {
        characterDescription: state.characterDescription,
        environment: state.environment,
        stylePreset: state.stylePreset,
        aspectRatio: state.aspectRatio,
        imageSize: state.imageSize,
    };
    log.debug('⚙️ [App] Prompt settings:', settings);

    const prompts = generateAllFramePrompts(state.parsedScript, settings);
    setState('framePrompts', prompts);
    log.info(`✅ [App] Generated ${prompts.length} scene prompts (${prompts.length * 2} total frames)`);
    log.groupEnd();
    showToast(`🎨 Đã tạo ${prompts.length * 2} prompts (${prompts.length} start + ${prompts.length} end)`, 'success');
}

function buildPromptList() {
    const state = getState();
    if (state.framePrompts.length === 0) generatePrompts();

    const container = $('#prompt-list');
    const prompts = getState().framePrompts;

    if (prompts.length === 0) return;
    container.innerHTML = '';

    prompts.forEach((fp, idx) => {
        const card = document.createElement('div');
        card.className = 'prompt-card';

        const numLabel = fp.sceneType === 'intro' ? '🎬' : fp.sceneType === 'outro' ? '🎬' : fp.poseNumber;

        card.innerHTML = `
      <div class="prompt-card-header">
        <div class="prompt-card-title">
          <span class="scene-number">${numLabel}</span>
          <span>${fp.sceneName}</span>
          <span class="badge">${fp.sceneType}</span>
        </div>
        <span class="prompt-card-toggle">▼</span>
      </div>
      <div class="prompt-card-body">
        <div class="frame-group">
          <div class="frame-label start">🟢 Start Frame</div>
          <div class="frame-prompt-text">${escapeHtml(fp.startFrame.prompt)}</div>
        </div>
        <div class="frame-group">
          <div class="frame-label end">🔴 End Frame</div>
          <div class="frame-prompt-text">${escapeHtml(fp.endFrame.prompt)}</div>
        </div>
        <div class="frame-group video-prompt">
          <div class="frame-label" style="color: #9b59b6;">🎬 Veo 3 Video Prompt</div>
          <div class="frame-prompt-text" style="font-style: italic;">${escapeHtml(fp.videoPrompt || '')}</div>
        </div>
        ${fp.transition ? `<div class="transition-label">⏩ Transition: ${escapeHtml(fp.transition)}</div>` : ''}
      </div>
    `;

        // Toggle expand
        card.querySelector('.prompt-card-header').addEventListener('click', () => {
            card.classList.toggle('expanded');
        });

        // Auto-expand first 2
        if (idx < 2) card.classList.add('expanded');

        container.appendChild(card);
    });
}

// ============================================================
// STEP 4: GALLERY
// ============================================================

function initGalleryPanel() {
    // Setup queue callbacks
    setCallbacks({
        onQueueStart: (total) => {
            log.info(`🚀 [App/Queue] Queue started — ${total} scenes to generate`);
            const progressEl = $('#generate-progress');
            const progressFill = $('#gen-progress-fill');
            const progressText = $('#gen-progress-text');
            progressEl.style.display = 'flex';
            progressFill.style.width = '0%';
            progressText.textContent = `0/${total} — Đang chuẩn bị...`;
            $('#btn-generate-all').disabled = true;
            $('#btn-generate-all').style.display = 'none';
            // Show cancel button
            showCancelButton(true);
            setState('isGenerating', true);
            _genTimers = {};
            _genStartTimes = {};
            _genElapsedTimes = {};
        },
        onProgress: (completed, total, currentItem) => {
            const progressFill = $('#gen-progress-fill');
            const progressText = $('#gen-progress-text');
            progressFill.style.width = `${(completed / total) * 100}%`;
            progressText.textContent = `${completed}/${total} — 🎨 ${currentItem.sceneName}`;

            // Initialize timer for current item
            if (_genTimers[currentItem.sceneIndex]) {
                clearInterval(_genTimers[currentItem.sceneIndex]);
            }
            const startTime = Date.now();
            _genStartTimes[currentItem.sceneIndex] = startTime;
            _genTimers[currentItem.sceneIndex] = setInterval(() => {
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                const startTimerEl = $(`#frame-start-timer-${currentItem.sceneIndex}`);
                const endTimerEl = $(`#frame-end-timer-${currentItem.sceneIndex}`);
                if (startTimerEl) startTimerEl.textContent = `${elapsed}s`;
                if (endTimerEl) endTimerEl.textContent = `${elapsed}s`;
            }, 100);
        },
        onItemComplete: (item, result) => {
            log.info(`✅ [App/Queue] Item complete: "${item.sceneName}" (scene #${item.sceneIndex})`);
            if (_genTimers[item.sceneIndex]) {
                clearInterval(_genTimers[item.sceneIndex]);
            }
            // Calculate and store elapsed time
            let elapsedSec = null;
            if (_genStartTimes[item.sceneIndex]) {
                elapsedSec = ((Date.now() - _genStartTimes[item.sceneIndex]) / 1000).toFixed(1);
                _genElapsedTimes[item.sceneIndex] = elapsedSec;
            }
            // Update gallery UI with elapsed time
            updateGalleryFrame(item.sceneIndex, result, elapsedSec);
            // Save to state properly merging
            const state = getState();
            const images = { ...state.generatedImages };

            const existing = images[item.sceneIndex] || {};
            const merged = { ...existing };
            if (result.start !== undefined) merged.start = result.start;
            if (result.end !== undefined) merged.end = result.end;
            images[item.sceneIndex] = merged;

            setState('generatedImages', images);
            // Update stats
            const status = getQueueStatus();
            $('#stat-images').textContent = status.done * 2;
        },
        onItemError: (item, error) => {
            log.error(`❌ [App/Queue] Item error: "${item.sceneName}" — ${error.message}`);
            if (_genTimers[item.sceneIndex]) {
                clearInterval(_genTimers[item.sceneIndex]);
            }
            showToast(`❌ ${item.sceneName}: ${error.message}`, 'error');
            // Show error state in gallery
            const startEl = $(`#frame-start-${item.sceneIndex}`);
            const endEl = $(`#frame-end-${item.sceneIndex}`);
            if (startEl) startEl.innerHTML = `<div class="gallery-frame-placeholder error">❌ Lỗi</div>`;
            if (endEl) endEl.innerHTML = `<div class="gallery-frame-placeholder error">❌ Lỗi</div>`;
        },
        onQueueComplete: (stats) => {
            log.info(`🏁 [App/Queue] Queue complete — done: ${stats.done}, error: ${stats.error}, cancelled: ${stats.cancelled}`);
            const progressFill = $('#gen-progress-fill');
            const progressText = $('#gen-progress-text');
            progressFill.style.width = '100%';

            if (stats.cancelled > 0) {
                progressText.textContent = `Đã hủy! ✅ ${stats.done} thành công, ${stats.cancelled} bị hủy`;
                showToast(`⚠️ Đã hủy. ${stats.done} ảnh đã generate.`, 'info');
            } else if (stats.error > 0) {
                progressText.textContent = `Hoàn thành! ✅ ${stats.done} thành công, ${stats.error} lỗi`;
                showToast(`⚠️ ${stats.done * 2} ảnh OK, ${stats.error} scenes lỗi.`, 'info');
            } else {
                progressText.textContent = `${stats.done}/${stats.done} Hoàn thành! ✅`;
                showToast(`🎉 Đã generate ${stats.done * 2} ảnh thành công!`, 'success');
            }

            setState('isGenerating', false);
            $('#btn-generate-all').disabled = false;
            $('#btn-generate-all').style.display = '';
            $('#btn-download-all').disabled = false;
            showCancelButton(false);
            // Re-enable all regen buttons
            $$('.btn-regen').forEach(btn => { btn.disabled = false; });
            $$('.btn-edit-start').forEach(btn => { btn.disabled = false; });
            $$('.btn-edit-end').forEach(btn => { btn.disabled = false; });
        },
    });

    $('#btn-generate-all').addEventListener('click', () => {
        generateAllImages();
    });

    $('#btn-download-all').addEventListener('click', () => {
        downloadAllAsZip();
    });

    // Delegated click for zoomable images
    $('#gallery-grid').addEventListener('click', (e) => {
        if (e.target.classList.contains('zoomable-image')) {
            const modal = $('#image-modal');
            const modalImg = $('#image-modal-img');
            if (modal && modalImg) {
                modalImg.src = e.target.src;
                modal.style.display = 'flex';
            }
        }
    });
}

function buildGallery() {
    const state = getState();
    const prompts = state.framePrompts;
    if (prompts.length === 0) return;

    const container = $('#gallery-grid');
    container.innerHTML = '';

    prompts.forEach((fp) => {
        const existing = state.generatedImages[fp.sceneIndex];
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.id = `gallery-item-${fp.sceneIndex}`;

        const numLabel = fp.sceneType === 'intro' ? '🎬' : fp.sceneType === 'outro' ? '🎬' : fp.poseNumber;

        item.innerHTML = `
      <div class="gallery-item-header">
        <div class="gallery-item-title">
          <span class="scene-number">${numLabel}</span>
          ${fp.sceneName}
        </div>
        <span class="badge">${fp.metadata.view}</span>
      </div>
      <div class="gallery-frames">
        <div class="gallery-frame" id="frame-start-${fp.sceneIndex}">
          ${existing?.start
                ? `<span class="gallery-frame-label start">Start</span><img src="${existing.start.blobUrl}" alt="Start frame" class="zoomable-image" style="cursor: zoom-in;">`
                : `<div class="gallery-frame-placeholder"><span class="gallery-frame-label start">Start</span>🟢</div>`
            }
        </div>
        <div class="gallery-frame" id="frame-end-${fp.sceneIndex}">
          ${existing?.end
                ? `<span class="gallery-frame-label end">End</span><img src="${existing.end.blobUrl}" alt="End frame" class="zoomable-image" style="cursor: zoom-in;">`
                : `<div class="gallery-frame-placeholder"><span class="gallery-frame-label end">End</span>🔴</div>`
            }
        </div>
      </div>
      <div class="gallery-item-actions">
        <button class="btn btn-sm btn-outline btn-regen" data-scene="${fp.sceneIndex}">🔄 Re-gen (2 ảnh)</button>
        <button class="btn btn-sm btn-outline btn-edit-start" data-scene="${fp.sceneIndex}">✏️ Sửa Start</button>
        <button class="btn btn-sm btn-outline btn-edit-end" data-scene="${fp.sceneIndex}">✏️ Sửa End</button>
        <button class="btn btn-sm btn-outline btn-ref" data-scene="${fp.sceneIndex}" title="Chọn ảnh tham khảo riêng cho scene này (ghi đè ảnh ở bước 3)">
          ${fp.customReferenceImage ? '✅ Đã chọn mỏ neo' : '🔗 Mỏ neo tham khảo'}
        </button>
        <input type="file" id="ref-upload-${fp.sceneIndex}" accept="image/*" style="display: none;">
      </div>
    `;

        // Re-generate single scene
        item.querySelector('.btn-regen').addEventListener('click', () => {
            generateSingleScene(fp.sceneIndex);
        });

        // Edit single scene START
        item.querySelector('.btn-edit-start').addEventListener('click', () => {
            const editPrompt = window.prompt("Nhập nội dung cần sửa cho khung Start:");
            if (editPrompt && editPrompt.trim()) {
                editSceneWithAI(fp.sceneIndex, editPrompt, 'start');
            }
        });

        // Edit single scene END
        item.querySelector('.btn-edit-end').addEventListener('click', () => {
            const editPrompt = window.prompt("Nhập nội dung cần sửa cho khung End:");
            if (editPrompt && editPrompt.trim()) {
                editSceneWithAI(fp.sceneIndex, editPrompt, 'end');
            }
        });

        // Custom Reference Image setup
        const refBtn = item.querySelector('.btn-ref');
        const refInput = item.querySelector(`#ref-upload-${fp.sceneIndex}`);
        if (refBtn && refInput) {
            refBtn.addEventListener('click', () => refInput.click());
            refInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const base64 = ev.target.result.split(',')[1];
                    const currentState = getState();
                    const updatedPrompts = [...currentState.framePrompts];
                    const index = updatedPrompts.findIndex(p => p.sceneIndex === fp.sceneIndex);
                    if (index !== -1) {
                        updatedPrompts[index].customReferenceImage = base64;
                        setState('framePrompts', updatedPrompts);
                    }
                    refBtn.textContent = '✅ Đã chọn mỏ neo';
                    refBtn.style.color = 'var(--accent-success)';
                    refBtn.style.borderColor = 'var(--accent-success)';
                    showToast(`✅ Đã thiết lập mỏ neo cho Scene ${fp.sceneIndex}`, 'success');
                };
                reader.readAsDataURL(file);
            });
        }

        container.appendChild(item);
    });
}

function generateAllImages() {
    const state = getState();
    if (!getActiveApiKey()) {
        showToast('⚠️ Chưa nhập API key! Quay lại Settings.', 'error');
        return;
    }
    if (state.framePrompts.length === 0) {
        showToast('⚠️ Chưa có prompts!', 'error');
        return;
    }

    // Prevent spam: check if already generating
    if (isQueueProcessing()) {
        showToast('⏳ Đang generate, vui lòng đợi...', 'info');
        return;
    }

    // Filter out scenes that already have successfully generated images
    const existingImages = state.generatedImages || {};
    const pendingPrompts = state.framePrompts.filter(fp => {
        const img = existingImages[fp.sceneIndex];
        // Skip if both start AND end frames exist
        return !(img && img.start && img.end);
    });

    if (pendingPrompts.length === 0) {
        showToast('✅ Tất cả scenes đã được generate!', 'success');
        return;
    }

    const skippedCount = state.framePrompts.length - pendingPrompts.length;

    log.group('🖼️ [App] generateAllImages()');
    log.debug(`⚙️ [App] Provider: ${state.provider} | Model: ${state.imageModel} | AR: ${state.aspectRatio}`);
    log.debug(`📎 [App] Reference images: ${state.referenceImages?.length || 0}`);
    log.debug(`⏭️ [App] Skipping ${skippedCount} already-generated scenes`);
    log.debug(`🎯 [App] Scenes to generate: ${pendingPrompts.length} (${pendingPrompts.length * 2} images)`);
    log.groupEnd();

    if (skippedCount > 0) {
        showToast(`⏭️ Bỏ qua ${skippedCount} scenes đã có, tiếp tục ${pendingPrompts.length} scenes còn lại`, 'info');
    }

    // Disable all regen buttons while generating all
    $$('.btn-regen').forEach(btn => { btn.disabled = true; });
    $$('.btn-edit-start').forEach(btn => { btn.disabled = true; });
    $$('.btn-edit-end').forEach(btn => { btn.disabled = true; });

    // Only show loading on frames that DON'T have images yet
    pendingPrompts.forEach(fp => {
        const startEl = $(`#frame-start-${fp.sceneIndex}`);
        const endEl = $(`#frame-end-${fp.sceneIndex}`);
        if (startEl) startEl.innerHTML = `<div class="gallery-frame-placeholder pending">⏳ Đang chờ</div>`;
        if (endEl) endEl.innerHTML = `<div class="gallery-frame-placeholder pending">⏳ Đang chờ</div>`;
    });

    // Enqueue only pending scenes — queue will process them sequentially
    enqueueAll(pendingPrompts, {
        apiKey: getActiveApiKey(),
        provider: state.provider,
        model: state.imageModel,
        aspectRatio: state.aspectRatio,
        referenceImages: state.referenceImages,
        envReferenceImages: state.envReferenceImages,
    });
}

function generateSingleScene(sceneIndex) {
    const state = getState();
    if (!getActiveApiKey()) {
        showToast('⚠️ Chưa nhập API key!', 'error');
        return;
    }

    // Prevent spam: check if this scene or queue is already processing
    if (isQueueProcessing()) {
        showToast('⏳ Đang generate, scene sẽ được xếp hàng...', 'info');
    }

    const fp = state.framePrompts.find(f => f.sceneIndex === sceneIndex);
    if (!fp) return;

    log.group(`🔄 [App] generateSingleScene(${sceneIndex}) → "${fp.sceneName}"`);
    log.debug(`⚙️ [App] Provider: ${state.provider} | Model: ${state.imageModel}`);
    log.debug(`📎 [App] Reference images: ${state.referenceImages?.length || 0}`);
    log.groupEnd();

    // Show loading state
    const startEl = $(`#frame-start-${sceneIndex}`);
    const endEl = $(`#frame-end-${sceneIndex}`);
    if (startEl) startEl.innerHTML = `<div class="gallery-frame-loading"><div class="spinner"></div><div class="timer" id="frame-start-timer-${sceneIndex}" style="margin-top: 8px; font-family: monospace; font-size: 12px; color: #a855f7;">0.0s</div></div>`;
    if (endEl) endEl.innerHTML = `<div class="gallery-frame-loading"><div class="spinner"></div><div class="timer" id="frame-end-timer-${sceneIndex}" style="margin-top: 8px; font-family: monospace; font-size: 12px; color: #a855f7;">0.0s</div></div>`;

    // Disable the regen button for this scene
    const regenBtn = $(`#gallery-item-${sceneIndex} .btn-regen`);
    const editStartBtn = $(`#gallery-item-${sceneIndex} .btn-edit-start`);
    const editEndBtn = $(`#gallery-item-${sceneIndex} .btn-edit-end`);
    if (regenBtn) regenBtn.disabled = true;
    if (editStartBtn) editStartBtn.disabled = true;
    if (editEndBtn) editEndBtn.disabled = true;

    // Enqueue — it will be processed sequentially
    enqueue(sceneIndex, fp.sceneName, fp, {
        apiKey: getActiveApiKey(),
        provider: state.provider,
        model: state.imageModel,
        aspectRatio: state.aspectRatio,
        referenceImages: state.referenceImages,
        envReferenceImages: state.envReferenceImages,
    });
}

function editSceneWithAI(sceneIndex, editPrompt, targetFrame) {
    const state = getState();
    if (!getActiveApiKey()) {
        showToast('⚠️ Chưa nhập API key!', 'error');
        return;
    }

    if (isQueueProcessing()) {
        showToast('⏳ Đang generate, scene sẽ được xếp hàng...', 'info');
    }

    const fp = state.framePrompts.find(f => f.sceneIndex === sceneIndex);
    if (!fp) return;

    log.group(`✏️ [App] editSceneWithAI(${sceneIndex}, ${targetFrame}) → "${fp.sceneName}"`);
    log.debug(`💬 [App] Edit instruction: ${editPrompt}`);
    log.groupEnd();

    // Show loading state ONLY for the target frame
    const frameEl = targetFrame === 'start' ? $(`#frame-start-${sceneIndex}`) : $(`#frame-end-${sceneIndex}`);
    if (frameEl) {
        frameEl.innerHTML = `<div class="gallery-frame-loading"><div class="spinner"></div><div class="timer" id="frame-${targetFrame}-timer-${sceneIndex}" style="margin-top: 8px; font-family: monospace; font-size: 12px; color: #a855f7;">0.0s</div></div>`;
    }

    // Disable the buttons for this scene
    const regenBtn = $(`#gallery-item-${sceneIndex} .btn-regen`);
    const editStartBtn = $(`#gallery-item-${sceneIndex} .btn-edit-start`);
    const editEndBtn = $(`#gallery-item-${sceneIndex} .btn-edit-end`);
    if (regenBtn) regenBtn.disabled = true;
    if (editStartBtn) editStartBtn.disabled = true;
    if (editEndBtn) editEndBtn.disabled = true;

    // Create a modified framePrompt
    const modifiedFp = JSON.parse(JSON.stringify(fp));
    modifiedFp.sceneName = modifiedFp.sceneName + ` (✏️ Sửa ${targetFrame})`;
    // Append edit instruction so AI fixes the image based on prompt
    if (targetFrame === 'start') {
        modifiedFp.startFrame.prompt = `[LƯU Ý SỬA LỖI/YÊU CẦU: ${editPrompt}] ` + modifiedFp.startFrame.prompt;
    } else {
        modifiedFp.endFrame.prompt = `[LƯU Ý SỬA LỖI/YÊU CẦU: ${editPrompt}] ` + modifiedFp.endFrame.prompt;
    }

    const options = {
        apiKey: getActiveApiKey(),
        provider: state.provider,
        model: state.imageModel,
        aspectRatio: state.aspectRatio,
        referenceImages: state.referenceImages,
        envReferenceImages: state.envReferenceImages,
        targetFrame: targetFrame
    };

    if (targetFrame === 'end') {
        const existingImages = state.generatedImages || {};
        const existingStart = existingImages[sceneIndex]?.start;
        if (existingStart?.base64) {
            options.referenceImages = [existingStart.base64];
        }
    }

    enqueue(sceneIndex, modifiedFp.sceneName, modifiedFp, options);
}

function updateGalleryFrame(sceneIndex, result, elapsedSec = null) {
    const startEl = $(`#frame-start-${sceneIndex}`);
    const endEl = $(`#frame-end-${sceneIndex}`);
    const timerBadge = elapsedSec ? `<span class="gallery-frame-timer">⏱ ${elapsedSec}s</span>` : '';
    if (result.start && startEl) {
        startEl.innerHTML = `<span class="gallery-frame-label start">Start</span>${timerBadge}<img src="${result.start.blobUrl}" alt="Start" class="zoomable-image" style="cursor: zoom-in;">`;
    }
    if (result.end && endEl) {
        endEl.innerHTML = `<span class="gallery-frame-label end">End</span>${timerBadge}<img src="${result.end.blobUrl}" alt="End" class="zoomable-image" style="cursor: zoom-in;">`;
    }
}

async function downloadAllAsZip() {
    const state = getState();
    const images = state.generatedImages;
    const prompts = state.framePrompts;

    if (Object.keys(images).length === 0 && (!state.parsedScript || state.parsedScript.scenes.length === 0)) {
        showToast('⚠️ Chưa có dữ liệu để download!', 'error');
        return;
    }

    showToast('📦 Đang tạo ZIP...', 'info');

    try {
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();

        // 1. Export state.json
        const exportState = { ...state };
        delete exportState.isGenerating;

        const cleanImages = {};
        for (const [idx, scene] of Object.entries(exportState.generatedImages || {})) {
            // Include base64 so state.json has the raw image data to restore from
            cleanImages[idx] = {
                start: scene.start ? { base64: scene.start.base64, imageUrl: scene.start.imageUrl || null } : null,
                end: scene.end ? { base64: scene.end.base64, imageUrl: scene.end.imageUrl || null } : null,
            };
        }
        exportState.generatedImages = cleanImages;

        zip.file('state.json', JSON.stringify(exportState));

        // 2. Export images physically for user convenience outside app
        if (state.thumbnail) {
            zip.file('000_thumbnail.png', state.thumbnail, { base64: true });
        }

        let fileIndex = 1;
        for (const fp of prompts) {
            const imgData = images[fp.sceneIndex];
            if (!imgData) continue;

            const safeName = fp.sceneName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
            const prefix = String(fileIndex++).padStart(3, '0');

            if (imgData.start?.base64) {
                zip.file(`${prefix}_${safeName}_start.png`, imgData.start.base64, { base64: true });
            }
            if (imgData.end?.base64) {
                zip.file(`${prefix}_${safeName}_end.png`, imgData.end.base64, { base64: true });
            }
            if (fp.videoPrompt) {
                zip.file(`${prefix}_${safeName}_veo3_prompt.txt`, fp.videoPrompt);
            }
        }

        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        a.download = `yogakids_project_${ts}.zip`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('✅ ZIP downloaded!', 'success');
    } catch (err) {
        log.error('ZIP error:', err);
        showToast(`❌ ZIP error: ${err.message}`, 'error');
    }
}

async function loadZipState(file) {
    if (!file) return;
    showToast('📂 Đang đọc file ZIP...', 'info');

    try {
        const JSZip = (await import('jszip')).default;
        const zip = await new JSZip().loadAsync(file);

        const stateFile = zip.file('state.json');
        if (!stateFile) {
            showToast('❌ File ZIP không đúng định dạng (thiếu state.json)', 'error');
            return;
        }

        const stateData = await stateFile.async("string");
        const uploadedState = JSON.parse(stateData);

        // Recreate blob URLs for generated images
        if (uploadedState.generatedImages) {
            for (const idx of Object.keys(uploadedState.generatedImages)) {
                const scene = uploadedState.generatedImages[idx];
                if (scene.start?.base64) {
                    scene.start.blobUrl = base64ToBlobUrl(scene.start.base64);
                }
                if (scene.end?.base64) {
                    scene.end.blobUrl = base64ToBlobUrl(scene.end.base64);
                }
            }
        }

        clearAllState();

        for (const [key, value] of Object.entries(uploadedState)) {
            if (key === 'isGenerating') continue;
            setState(key, value);
        }

        showToast('✅ Đã load project thành công!', 'success');
        rebuildFromState();

    } catch (e) {
        log.error('ZIP Load error:', e);
        showToast(`❌ Lỗi khi load ZIP: ${e.message}`, 'error');
    } finally {
        $('#upload-zip-input').value = '';
    }
}

// restoreState() removed — dead code superseded by rebuildFromState()

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================

export function showToast(message, type = 'info') {
    const container = $('#toasts');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, TOAST_DURATION);
}

// ============================================================
// CANCEL BUTTON
// ============================================================

function showCancelButton(show) {
    let cancelBtn = $('#btn-cancel-generate');

    if (show) {
        if (!cancelBtn) {
            // Create cancel button dynamically next to generate button
            cancelBtn = document.createElement('button');
            cancelBtn.id = 'btn-cancel-generate';
            cancelBtn.className = 'btn btn-danger';
            cancelBtn.innerHTML = '⏹️ Hủy Generate';
            cancelBtn.addEventListener('click', () => {
                cancelAll();
                showToast('⏹️ Đang hủy...', 'info');
            });
            // Insert after generate button
            const genBtn = $('#btn-generate-all');
            genBtn.parentNode.insertBefore(cancelBtn, genBtn.nextSibling);
        }
        cancelBtn.style.display = '';
    } else {
        if (cancelBtn) {
            cancelBtn.style.display = 'none';
        }
    }
}

// ============================================================
// SCRIPT GENERATOR
// ============================================================

function initScriptGenerator() {
    log.info('📝 [ScriptGen] Initializing Script Generator');

    // --- Populate Language dropdown ---
    const langSelect = $('#sg-language');
    if (langSelect) {
        const langs = getLanguageOptions();
        langSelect.innerHTML = langs.map(l =>
            `<option value="${l.code}">${l.flag} ${l.name}</option>`
        ).join('');
    }

    // --- Populate Quick Presets ---
    const presetsContainer = $('#sg-presets');
    if (presetsContainer) {
        const templates = getTemplateOptions();
        presetsContainer.innerHTML = templates.map(t =>
            `<button class="btn btn-sm btn-outline sg-preset-btn" data-template="${t.id}" title="${t.description}">${t.name}</button>`
        ).join('');

        // Preset click → fill form
        presetsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.sg-preset-btn');
            if (!btn) return;
            const templateId = btn.dataset.template;
            applyTemplateToForm(templateId);
            // Highlight active preset
            presetsContainer.querySelectorAll('.sg-preset-btn').forEach(b => b.classList.remove('btn-accent'));
            btn.classList.add('btn-accent');
            btn.classList.remove('btn-outline');
            showToast(`✅ Preset "${btn.textContent.trim()}" applied!`, 'info');
        });
    }

    // --- Gamification Init ---
    let _selectedSkillPack = null;

    function renderGamificationBar() {
        const level = getCurrentLevel();
        const stats = getStats();
        const achievements = getUnlockedAchievements();

        const levelBadge = $('#sg-level-badge');
        const xpFill = $('#sg-xp-fill');
        const xpText = $('#sg-xp-text');
        const statScripts = $('#sg-stat-scripts');
        const statStreak = $('#sg-stat-streak');
        const statAch = $('#sg-stat-achievements');

        if (levelBadge) levelBadge.textContent = `${level.title.split(' ')[0]} Lv.${level.level}`;
        if (xpFill) xpFill.style.width = `${(level.progress * 100).toFixed(0)}%`;
        if (xpText) {
            const nextXP = level.nextLevelXP ? ` / ${level.nextLevelXP}` : '';
            xpText.textContent = `${stats.xp}${nextXP} XP`;
        }
        if (statScripts) statScripts.textContent = `📝 ${stats.totalScripts}`;
        if (statStreak) statStreak.textContent = `🔥 ${stats.currentStreak}`;
        if (statAch) statAch.textContent = `🏆 ${achievements.length}`;
    }

    // ==========================================
    // HISTORY & TEMPLATES MODAL LOGIC (PHASE 3.3)
    // ==========================================
    const historyModal = $('#sg-history-modal');
    const historyCloseBtn = $('#btn-sg-history-close');
    const historyOverlay = $('#sg-history-overlay');
    const historyBtn = $('#btn-sg-history');
    
    if (historyBtn) historyBtn.addEventListener('click', openHistoryModal);
    if (historyCloseBtn) historyCloseBtn.addEventListener('click', closeHistoryModal);
    if (historyOverlay) historyOverlay.addEventListener('click', closeHistoryModal);

    function openHistoryModal() {
        if (!historyModal) return;
        historyModal.style.display = 'flex';
        renderHistoryList();
    }

    function closeHistoryModal() {
        if (!historyModal) return;
        historyModal.style.display = 'none';
    }

    // Tabs
    const tabs = document.querySelectorAll('.sg-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.sg-tab-content').forEach(c => c.style.display = 'none');
            
            e.target.classList.add('active');
            const targetId = `sg-tab-${e.target.dataset.tab}`;
            $(`#${targetId}`).style.display = 'block';

            if (e.target.dataset.tab === 'history') renderHistoryList();
            if (e.target.dataset.tab === 'templates') renderTemplateList();
            if (e.target.dataset.tab === 'favorites') renderFavoritesList();
        });
    });

    function createHistoryCardHtml(item, isTemplate = false) {
        let tagHtml = '';
        if (item.tags) {
            tagHtml = `<div class="sg-history-tags">${item.tags.map(t => `<span class="sg-history-tag">${t}</span>`).join('')}</div>`;
        }

        const dateStr = new Date(item.date).toLocaleDateString();

        if (isTemplate) {
            return `
                <div class="sg-history-item">
                    <div class="sg-history-content">
                        <div class="sg-history-title">${item.name}</div>
                        <div class="sg-history-meta">
                            <span>📅 ${dateStr}</span>
                            <span>•</span>
                            <span>${item.description}</span>
                        </div>
                    </div>
                    <div class="sg-history-actions">
                        <button class="btn btn-outline btn-xs" onclick="applyHistoryTemplate('${item.id}', true)">Tải Config</button>
                        <button class="btn btn-danger btn-xs" onclick="deleteHistoryItemUI('${item.id}', true)">Xóa</button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="sg-history-item">
                <div class="sg-history-content">
                    <div class="sg-history-title">${item.title}</div>
                    <div class="sg-history-meta">
                        <span>📅 ${dateStr}</span>
                        <span>•</span>
                        <span>⏱ ${item.duration}m</span>
                        <span>•</span>
                        <span class="sg-history-score">Score: ${item.score}</span>
                    </div>
                    ${tagHtml}
                </div>
                <div class="sg-history-actions">
                    <button class="sg-btn-fav ${item.isFavorite ? 'active' : ''}" onclick="toggleHistoryFavUI('${item.id}')">⭐</button>
                    <button class="btn btn-primary btn-xs" onclick="applyHistoryTemplate('${item.id}', false)">Xem Script</button>
                </div>
            </div>
        `;
    }

    window.toggleHistoryFavUI = function(id) {
        toggleFavorite(id);
        const activeTab = document.querySelector('.sg-tab.active').dataset.tab;
        if (activeTab === 'history') renderHistoryList();
        if (activeTab === 'favorites') renderFavoritesList();
    };

    window.deleteHistoryItemUI = function(id, isTemplate) {
        if (confirm('Bạn có chắc chắn muốn xóa?')) {
            if (isTemplate) {
                deleteUserTemplate(id);
                renderTemplateList();
            } else {
                deleteHistoryItem(id);
                renderHistoryList();
            }
        }
    };

    window.applyHistoryTemplate = function(id, isTemplate) {
        let item = isTemplate ? getUserTemplate(id) : getHistoryItem(id);
        if (!item) return;
        
        // Restore Config UI
        const config = item.config;
        if (config.category && $('#sg-category')) $('#sg-category').value = config.category;
        if (config.audience && $('#sg-audience')) $('#sg-audience').value = config.audience;
        if (config.language && $('#sg-language')) $('#sg-language').value = config.language;
        if (config.duration && $('#sg-duration')) $('#sg-duration').value = config.duration.toString() + ' min';
        
        // Render script if treating from history
        if (!isTemplate && item.scriptText) {
            _lastResult = {
                script: item.scriptText,
                poseSequence: item.poseSequence,
                meta: item.meta,
                auditResult: { totalScore: item.score }
            };
            renderGeneratedScript(_lastResult);
            // Switch to single mode
            $('input[name="sg-mode"][value="single"]').click();
        }

        closeHistoryModal();
        showToast('✅ Đã tải thành công', 'success');
    };

    function renderHistoryList() {
        const list = getHistory();
        const container = $('#sg-history-list');
        if (!container) return;
        if (list.length === 0) {
            container.innerHTML = `<div class="sg-empty-state">Chưa có lịch sử tạo kịch bản.</div>`;
            return;
        }
        container.innerHTML = list.map(item => createHistoryCardHtml(item)).join('');
    }

    function renderFavoritesList() {
        const list = getFavorites();
        const container = $('#sg-favorites-list');
        if (!container) return;
        if (list.length === 0) {
            container.innerHTML = `<div class="sg-empty-state">Chưa có kịch bản yêu thích.</div>`;
            return;
        }
        container.innerHTML = list.map(item => createHistoryCardHtml(item)).join('');
    }

    function renderTemplateList() {
        const list = getUserTemplates();
        const container = $('#sg-template-list');
        if (!container) return;
        if (list.length === 0) {
            container.innerHTML = `<div class="sg-empty-state">Chưa có Template Tùy chỉnh nào.</div>`;
            return;
        }
        container.innerHTML = list.map(item => createHistoryCardHtml(item, true)).join('');
    }

    // Save Template Handler
    $('#btn-sg-save-template')?.addEventListener('click', () => {
        const name = $('#sg-tpl-name').value.trim();
        const desc = $('#sg-tpl-desc').value.trim();
        if (!name) return showToast('Vui lòng nhập tên Template', 'error');

        const config = {
            category: $('#sg-category')?.value || 'Bedtime',
            audience: $('#sg-audience')?.value || 'Adults',
            difficulty: $('#sg-level')?.value || 'beginner',
            poses: parseInt($('#sg-poses')?.value || '12'),
            duration: parseInt(($('#sg-duration')?.value || '15 min').replace(' min', '')),
            language: $('#sg-language')?.value || 'vi',
            tone: $('#sg-personality')?.value || 'gentle'
        };

        const template = saveUserTemplate(name, desc, config);
        showToast(`✅ Đã lưu Template "${template.name}"`, 'success');
        $('#sg-tpl-name').value = '';
        $('#sg-tpl-desc').value = '';
        renderTemplateList();
    });

    function renderSkillPacks() {
        const container = $('#sg-skill-packs');
        const badge = $('#sg-packs-badge');
        if (!container) return;

        const packs = getSkillPacks();
        if (badge) badge.textContent = packs.filter(p => !p.locked).length;

        container.innerHTML = packs.map(pack => `
            <div class="sg-skill-pack-card ${pack.locked ? 'locked' : ''} ${_selectedSkillPack === pack.id ? 'active' : ''}"
                 data-pack="${pack.id}" style="--pack-color: ${pack.color}">
                <div class="sg-pack-name">${pack.name}</div>
                <div class="sg-pack-desc">${pack.description}</div>
                <div class="sg-pack-meta">
                    <span>${pack.poses.length} poses</span>
                    <span>•</span>
                    <span>${pack.difficulty}</span>
                    <span class="sg-pack-xp">+${pack.xpReward} XP</span>
                    ${pack.used ? '<span>✅</span>' : ''}
                </div>
            </div>
        `).join('');

        // Click handler
        container.addEventListener('click', (e) => {
            const card = e.target.closest('.sg-skill-pack-card');
            if (!card || card.classList.contains('locked')) return;
            const packId = card.dataset.pack;
            
            if (_selectedSkillPack === packId) {
                // Deselect
                _selectedSkillPack = null;
                container.querySelectorAll('.sg-skill-pack-card').forEach(c => c.classList.remove('active'));
                showToast('🏆 Skill Pack deselected', 'info');
            } else {
                // Select
                _selectedSkillPack = packId;
                container.querySelectorAll('.sg-skill-pack-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                markSkillPackUsed(packId);
                showToast(`🏆 Skill Pack "${card.querySelector('.sg-pack-name').textContent}" selected! Poses will be prioritized.`, 'success');
            }
        });
    }

    function showAchievementToast(achievement) {
        const toast = $('#sg-achievement-toast');
        if (!toast) return;
        const icon = $('#sg-achievement-icon');
        const title = $('#sg-achievement-title');
        const desc = $('#sg-achievement-desc');
        const xp = $('#sg-achievement-xp');

        if (icon) icon.textContent = achievement.icon;
        if (title) title.textContent = `🏆 ${achievement.name}`;
        if (desc) desc.textContent = achievement.description;
        if (xp) xp.textContent = `+${achievement.xpReward} XP`;
        
        toast.style.display = '';
        setTimeout(() => { toast.style.display = 'none'; }, 5000);
    }

    function showXPPopup(rewards) {
        if (!rewards?.length) return;
        const totalXP = rewards.reduce((sum, r) => sum + (r?.xp || 0), 0);
        if (totalXP <= 0) return;

        const popup = document.createElement('div');
        popup.className = 'sg-xp-popup';
        popup.textContent = `+${totalXP} XP`;
        popup.style.left = '50%';
        popup.style.top = '120px';
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 1600);
    }

    function onScriptGenerated(result) {
        const gamResult = recordGeneration(result);
        renderGamificationBar();

        // Show rewards
        if (gamResult.rewards?.length) {
            showXPPopup(gamResult.rewards);
        }

        // Show achievements
        if (gamResult.newAchievements?.length) {
            gamResult.newAchievements.forEach((a, i) => {
                setTimeout(() => showAchievementToast(a), i * 2000);
            });
        }
    }

    // Initial render
    renderGamificationBar();
    renderSkillPacks();

    // --- Mode Selector (Single / Series / Playlist) ---
    let _currentMode = 'single';
    const modeRadios = document.querySelectorAll('input[name="sg-mode"]');
    const seriesPanel = $('#sg-series-config');
    const playlistPanel = $('#sg-playlist-config');
    const generateBtn = $('#btn-sg-generate');

    modeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            _currentMode = e.target.value;
            // Show/hide panels
            if (seriesPanel) seriesPanel.style.display = _currentMode === 'series' ? '' : 'none';
            if (playlistPanel) playlistPanel.style.display = _currentMode === 'playlist' ? '' : 'none';
            // Update button text
            if (generateBtn) {
                generateBtn.innerHTML = _currentMode === 'single' ? '🤖 Generate Script'
                    : _currentMode === 'series' ? '🎬 Generate Series'
                    : '🎵 Generate Playlist';
            }
            log.info(`📝 [ScriptGen] Mode changed: ${_currentMode}`);
        });
    });

    // --- Populate Series Presets dropdown ---
    const seriesPresetSelect = $('#sg-series-preset');
    const seriesPresetsListEl = $('#sg-series-presets-list');
    if (seriesPresetSelect) {
        const presets = getSeriesPresets();
        seriesPresetSelect.innerHTML = '<option value="">Custom</option>'
            + presets.map(p => `<option value="${p.id}">${p.name} (${p.totalScripts})</option>`).join('');

        // Also show as preset buttons
        if (seriesPresetsListEl) {
            seriesPresetsListEl.innerHTML = presets.map(p =>
                `<button class="btn btn-sm btn-outline sg-series-preset-btn" data-preset="${p.id}" title="${p.description}">${p.name}</button>`
            ).join('');
            seriesPresetsListEl.addEventListener('click', (e) => {
                const btn = e.target.closest('.sg-series-preset-btn');
                if (btn) {
                    seriesPresetSelect.value = btn.dataset.preset;
                    seriesPresetSelect.dispatchEvent(new Event('change'));
                    seriesPresetsListEl.querySelectorAll('.sg-series-preset-btn').forEach(b => {
                        b.classList.remove('btn-accent');
                        b.classList.add('btn-outline');
                    });
                    btn.classList.add('btn-accent');
                    btn.classList.remove('btn-outline');
                }
            });
        }

        // When preset changes, update total scripts
        seriesPresetSelect.addEventListener('change', () => {
            const preset = getSeriesPresets().find(p => p.id === seriesPresetSelect.value);
            if (preset) {
                const totalEl = $('#sg-series-total');
                if (totalEl) totalEl.value = String(preset.totalScripts);
            }
        });
    }

    // --- Populate Playlist Themes dropdown ---
    const playlistThemeSelect = $('#sg-playlist-theme');
    const playlistThemesListEl = $('#sg-playlist-themes-list');
    if (playlistThemeSelect) {
        const themes = getPlaylistThemes();
        playlistThemeSelect.innerHTML = '<option value="">Custom</option>'
            + themes.map(t => `<option value="${t.id}">${t.name}</option>`).join('');

        if (playlistThemesListEl) {
            playlistThemesListEl.innerHTML = themes.map(t =>
                `<button class="btn btn-sm btn-outline sg-playlist-theme-btn" data-theme="${t.id}" title="${t.description}">${t.name}</button>`
            ).join('');
            playlistThemesListEl.addEventListener('click', (e) => {
                const btn = e.target.closest('.sg-playlist-theme-btn');
                if (btn) {
                    playlistThemeSelect.value = btn.dataset.theme;
                    playlistThemesListEl.querySelectorAll('.sg-playlist-theme-btn').forEach(b => {
                        b.classList.remove('btn-accent');
                        b.classList.add('btn-outline');
                    });
                    btn.classList.add('btn-accent');
                    btn.classList.remove('btn-outline');
                }
            });
        }
    }

    // --- AI Script Consultant (Chat) ---
    const chatMessages = $('#sg-chat-messages');
    const chatInput = $('#sg-chat-input');
    const chatSendBtn = $('#btn-sg-chat-send');
    const chatTyping = $('#sg-chat-typing');
    let _chatHistory = []; // {role: 'user'|'ai', text: string, config?: object}
    let _lastSuggestedConfig = null;

    // Welcome message
    if (chatMessages) {
        addChatMessage('ai', `Xin chào! 👋 Tôi là trợ lý AI chuyên tạo kịch bản yoga video.\n\nHãy cho tôi biết bạn muốn tạo video yoga kiểu gì? Ví dụ:\n• Đối tượng? (trẻ em, người lớn, cao tuổi...)\n• Mục đích? (ngủ ngon, năng lượng, giảm stress...)\n• Thời lượng mong muốn?\n• Ngôn ngữ script?\n\nHoặc chọn nhanh chủ đề bên dưới 👇`);
    }

    // Suggestion chips → send as chat message
    $$('.sg-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const prompt = chip.dataset.prompt || '';
            if (prompt && chatInput) {
                chatInput.value = prompt;
                sendChatMessage();
            }
        });
    });

    // Send button
    if (chatSendBtn) {
        chatSendBtn.addEventListener('click', () => sendChatMessage());
    }

    // Enter key
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }

    // Clear chat
    const clearChatBtn = $('#btn-sg-chat-clear');
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', () => {
            _chatHistory = [];
            _lastSuggestedConfig = null;
            if (chatMessages) chatMessages.innerHTML = '';
            addChatMessage('ai', 'Chat đã được reset! 🔄\n\nHãy mô tả ý tưởng video yoga mới của bạn.');
        });
    }

    // Send message function
    async function sendChatMessage() {
        const text = chatInput?.value?.trim();
        if (!text) return;

        const apiKey = getActiveApiKey();
        if (!apiKey) {
            showToast('❌ Vui lòng nhập API Key ở Settings trước!', 'error');
            return;
        }

        // Add user message
        addChatMessage('user', text);
        chatInput.value = '';
        chatSendBtn.disabled = true;

        // Show typing
        if (chatTyping) chatTyping.style.display = 'block';
        scrollChatToBottom();

        try {
            const result = await consultWithAI(text, _chatHistory, apiKey);
            
            // Hide typing
            if (chatTyping) chatTyping.style.display = 'none';

            // Add AI response
            addChatMessage('ai', result.text, result.config);

            if (result.config) {
                _lastSuggestedConfig = result.config;
            }

        } catch (err) {
            if (chatTyping) chatTyping.style.display = 'none';
            addChatMessage('ai', `❌ Xin lỗi, đã có lỗi xảy ra: ${err.message}\n\nHãy thử lại nhé!`);
        } finally {
            chatSendBtn.disabled = false;
            chatInput?.focus();
        }
    }

    // Add message to chat UI
    function addChatMessage(role, text, config = null) {
        if (!chatMessages) return;

        // Track history
        _chatHistory.push({ role, text, config });

        const msgEl = document.createElement('div');
        msgEl.className = `sg-chat-msg ${role}`;

        const avatar = role === 'ai' ? '🧠' : '👤';
        
        // Format text: convert \n to <br>, bold **text**
        let formattedText = escapeHtml(text)
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/•/g, '<span style="color: var(--accent-primary)">•</span>');

        let bubbleContent = formattedText;

        // If AI has config suggestion, add config card + action buttons
        if (role === 'ai' && config) {
            const configLabels = {
                category: '📂', language: '🌐', level: '📊',
                audience: '👥', duration: '⏱️', poseCount: '🧘',
                narrationStyle: '📝', flow: '🌊', focusArea: '🎯',
                personality: '🧑‍🏫',
            };

            let configGrid = '';
            for (const [key, icon] of Object.entries(configLabels)) {
                if (config[key] !== undefined && config[key] !== '') {
                    configGrid += `<span>${icon} ${key}: <b>${config[key]}</b></span>`;
                }
            }

            bubbleContent += `
                <div class="sg-chat-config">
                    <div class="sg-chat-config-grid">${configGrid}</div>
                </div>
                <div class="sg-chat-actions">
                    <button class="sg-chat-action-btn primary" onclick="window._sgApplyConfig()">✅ Apply Config</button>
                    <button class="sg-chat-action-btn" onclick="window._sgRefine('Hãy sửa lại config, tôi muốn thay đổi')">🔧 Tinh chỉnh</button>
                    <button class="sg-chat-action-btn" onclick="window._sgRefine('Gợi ý thêm ý tưởng khác')">💡 Ý tưởng khác</button>
                </div>
            `;
        }

        msgEl.innerHTML = `
            <div class="sg-chat-avatar">${avatar}</div>
            <div class="sg-chat-bubble">${bubbleContent}</div>
        `;

        chatMessages.appendChild(msgEl);
        scrollChatToBottom();
    }

    function scrollChatToBottom() {
        if (chatMessages) {
            requestAnimationFrame(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            });
        }
    }

    // Expose functions for inline button onclick handlers
    window._sgApplyConfig = () => {
        if (_lastSuggestedConfig) {
            applyBrainstormToForm(_lastSuggestedConfig);
            addChatMessage('ai', '✅ Config đã được apply! Bạn có thể xem và chỉnh sửa thêm ở phần Configuration bên dưới.\n\nKhi sẵn sàng, nhấn **🤖 Generate Script** để tạo kịch bản! 🚀');
            showToast('✅ Config applied!', 'success');
        }
    };

    window._sgRefine = (prompt) => {
        if (chatInput) {
            chatInput.value = prompt;
            sendChatMessage();
        }
    };

    // --- Generate Button ---
    let _lastResult = null;

    const generateBtn2 = $('#btn-sg-generate');
    const cancelBatchBtn = $('#btn-sg-cancel-batch');
    let _batchCancelToken = null;
    let _batchResults = [];

    if (generateBtn2) {
        generateBtn2.addEventListener('click', async () => {
            const apiKey = getActiveApiKey();
            if (!apiKey) {
                showToast('❌ Vui lòng nhập API Key ở Settings trước!', 'error');
                return;
            }

            const config = collectScriptGenConfig();
            const statusEl = $('#sg-status');

            generateBtn2.disabled = true;
            if (statusEl) {
                statusEl.style.display = 'block';
                statusEl.textContent = 'Preparing...';
            }

            if (_currentMode === 'single') {
                // --- SINGLE MODE ---
                generateBtn2.innerHTML = '⏳ Generating...';
                try {
                    const result = await generateScript(config, apiKey, {
                        onStatus: (msg) => { if (statusEl) statusEl.textContent = msg; },
                        onPoseSequence: (poses) => { renderPoseSequence(poses); },
                    });
                    _lastResult = result;
                    renderGeneratedScript(result);
                    onScriptGenerated(result);
                    addToHistory(result, config);
                    showToast('✅ Script generated successfully!', 'success');
                } catch (err) {
                    showToast(`❌ Generation failed: ${err.message}`, 'error');
                    if (statusEl) {
                        statusEl.textContent = `Error: ${err.message}`;
                        statusEl.style.color = 'var(--accent-danger)';
                    }
                } finally {
                    generateBtn2.disabled = false;
                    generateBtn2.innerHTML = '🤖 Generate Script';
                }

            } else if (_currentMode === 'series') {
                // --- SERIES MODE ---
                generateBtn2.innerHTML = '⏳ Generating Series...';
                if (cancelBatchBtn) cancelBatchBtn.style.display = '';

                const seriesConfig = {
                    totalScripts: parseInt($('#sg-series-total')?.value || '7'),
                    progressionType: $('#sg-series-progression')?.value || 'gradual',
                    baseCategory: config.category,
                    baseAudience: config.niche?.audience || 'adults',
                    startLevel: config.niche?.level || 'beginner',
                    endLevel: config.niche?.level === 'beginner' ? 'intermediate' : 'advanced',
                    seriesTitle: $('#sg-series-title')?.value || '',
                    language: config.language,
                    baseConfig: config,
                };

                // Apply preset if selected
                const presetId = $('#sg-series-preset')?.value;
                if (presetId) {
                    const preset = getSeriesPresets().find(p => p.id === presetId);
                    if (preset) {
                        Object.assign(seriesConfig, preset);
                        seriesConfig.language = config.language;
                        seriesConfig.baseConfig = config;
                    }
                }

                initBatchResultsUI(seriesConfig.totalScripts);

                try {
                    const { results, summary, cancelToken } = await generateSeries(seriesConfig, apiKey, {
                        onProgress: (idx, total, info) => updateBatchProgress(idx, total, info),
                        onError: (idx, err) => updateBatchItemStatus(idx, 'error', err.message),
                        onComplete: (results, summary) => renderBatchSummary(results, summary),
                    });
                    _batchCancelToken = cancelToken;
                    _batchResults = results;
                    // Gamification + History: record each result + batch completion
                    results.forEach(r => { 
                        if (r.result) {
                            onScriptGenerated(r.result);
                            addToHistory(r.result, Object.assign({}, config, { title: r.title }));
                        }
                    });
                    recordBatchCompletion('series', results.length);
                    renderGamificationBar();
                    showToast(`✅ Series complete: ${summary.successCount}/${summary.totalScripts}`, 'success');
                } catch (err) {
                    showToast(`❌ Series failed: ${err.message}`, 'error');
                } finally {
                    generateBtn2.disabled = false;
                    generateBtn2.innerHTML = '🎬 Generate Series';
                    if (cancelBatchBtn) cancelBatchBtn.style.display = 'none';
                }

            } else if (_currentMode === 'playlist') {
                // --- PLAYLIST MODE ---
                generateBtn2.innerHTML = '⏳ Generating Playlist...';
                if (cancelBatchBtn) cancelBatchBtn.style.display = '';

                const playlistConfig = {
                    totalScripts: parseInt($('#sg-playlist-total')?.value || '5'),
                    playlistTitle: $('#sg-playlist-title')?.value || '',
                    theme: $('#sg-playlist-theme')?.value || '',
                    variety: $('#sg-playlist-variety')?.value || 'medium',
                    language: config.language,
                    baseConfig: config,
                };

                initBatchResultsUI(playlistConfig.totalScripts);

                try {
                    const { results, summary, cancelToken } = await generatePlaylist(playlistConfig, apiKey, {
                        onProgress: (idx, total, info) => updateBatchProgress(idx, total, info),
                        onError: (idx, err) => updateBatchItemStatus(idx, 'error', err.message),
                        onComplete: (results, summary) => renderBatchSummary(results, summary),
                    });
                    _batchCancelToken = cancelToken;
                    _batchResults = results;
                    // Gamification + History: record each result + batch completion
                    results.forEach(r => { 
                        if (r.result) {
                            onScriptGenerated(r.result);
                            addToHistory(r.result, Object.assign({}, config, { title: r.title }));
                        }
                    });
                    recordBatchCompletion('playlist', results.length);
                    renderGamificationBar();
                    showToast(`✅ Playlist complete: ${summary.successCount}/${summary.totalScripts}`, 'success');
                } catch (err) {
                    showToast(`❌ Playlist failed: ${err.message}`, 'error');
                } finally {
                    generateBtn2.disabled = false;
                    generateBtn2.innerHTML = '🎵 Generate Playlist';
                    if (cancelBatchBtn) cancelBatchBtn.style.display = 'none';
                }
            }
        });
    }

    // Cancel batch button
    if (cancelBatchBtn) {
        cancelBatchBtn.addEventListener('click', () => {
            if (_batchCancelToken) {
                _batchCancelToken.cancel();
                showToast('⏹️ Batch generation cancelled', 'info');
            }
        });
    }

    // --- Copy button ---
    const copyBtn = $('#btn-sg-copy');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (!_lastResult?.script) return;
            navigator.clipboard.writeText(_lastResult.script).then(() => {
                showToast('📋 Script copied to clipboard!', 'success');
            });
        });
    }

    // --- Regenerate button ---
    const regenBtn = $('#btn-sg-regenerate');
    if (regenBtn) {
        regenBtn.addEventListener('click', () => {
            generateBtn2?.click();
        });
    }

    // --- Use This Script button ---
    const useBtn = $('#btn-sg-use');
    if (useBtn) {
        useBtn.addEventListener('click', () => {
            if (!_lastResult?.script) return;
            const scriptInput = $('#script-input');
            if (scriptInput) {
                scriptInput.value = _lastResult.script;
                goToStep(1);
                showToast('📝 Script loaded! Click "Phân tích Script" to continue.', 'info');
            }
        });
    }

    // === Batch Results Helper Functions ===

    function initBatchResultsUI(total) {
        const batchPanel = $('#sg-batch-results');
        const batchList = $('#sg-batch-list');
        const batchBadge = $('#sg-batch-badge');
        const batchFill = $('#sg-batch-fill');
        const batchStatus = $('#sg-batch-status');

        if (batchPanel) batchPanel.style.display = '';
        if (batchBadge) batchBadge.textContent = `0/${total}`;
        if (batchFill) batchFill.style.width = '0%';
        if (batchStatus) batchStatus.textContent = 'Starting batch...';
        if (batchList) {
            batchList.innerHTML = Array.from({ length: total }, (_, i) =>
                `<div class="sg-batch-item pending" data-index="${i}" id="sg-batch-item-${i}">
                    <span class="sg-batch-item-index">${i + 1}</span>
                    <span class="sg-batch-item-label">Waiting...</span>
                    <span class="sg-batch-item-score">—</span>
                </div>`
            ).join('');

            // Click batch item → load that script into preview
            batchList.addEventListener('click', (e) => {
                const item = e.target.closest('.sg-batch-item');
                if (!item) return;
                const idx = parseInt(item.dataset.index);
                const result = _batchResults[idx];
                if (result?.result) {
                    _lastResult = result.result;
                    renderGeneratedScript(result.result);
                    if (result.result.poseSequence) renderPoseSequence(result.result.poseSequence);
                    // Highlight active
                    batchList.querySelectorAll('.sg-batch-item').forEach(el => el.classList.remove('active'));
                    item.classList.add('active');
                    showToast(`📄 Loaded script ${idx + 1}: ${result.label}`, 'info');
                }
            });
        }
    }

    function updateBatchProgress(idx, total, info) {
        const batchBadge = $('#sg-batch-badge');
        const batchFill = $('#sg-batch-fill');
        const batchStatus = $('#sg-batch-status');
        const item = $(`#sg-batch-item-${idx}`);

        const progress = ((idx + 1) / total) * 100;
        if (batchBadge) batchBadge.textContent = `${idx + 1}/${total}`;
        if (batchFill) batchFill.style.width = `${progress}%`;
        if (batchStatus) batchStatus.textContent = `${info.status === 'done' ? '✅' : '⏳'} ${info.label} — ${info.status}`;

        if (item) {
            item.className = `sg-batch-item ${info.status === 'done' ? 'success' : 'running'}`;
            const displayLabel = info.status === 'done' ? info.label : `${info.label} — ${info.status}`;
            item.querySelector('.sg-batch-item-label').textContent = displayLabel;
            if (info.score) {
                const scoreEl = item.querySelector('.sg-batch-item-score');
                scoreEl.textContent = `${info.score}/100`;
                scoreEl.style.color = info.score >= 75 ? '#10b981' : info.score >= 50 ? '#f59e0b' : '#ef4444';
            }
        }

        // Mark next item as "running"
        if (info.status === 'done' && idx + 1 < total) {
            const nextItem = $(`#sg-batch-item-${idx + 1}`);
            if (nextItem) {
                nextItem.className = 'sg-batch-item running';
                nextItem.querySelector('.sg-batch-item-label').textContent = 'Generating...';
            }
        }
    }

    function updateBatchItemStatus(idx, status, message) {
        const item = $(`#sg-batch-item-${idx}`);
        if (item) {
            item.className = `sg-batch-item ${status}`;
            item.querySelector('.sg-batch-item-label').textContent = message || `Error`;
        }
    }

    function renderBatchSummary(results, summary) {
        const batchSummary = $('#sg-batch-summary');
        const batchStatus = $('#sg-batch-status');
        
        if (batchStatus) batchStatus.textContent = '✅ Batch complete!';
        if (batchSummary) {
            const avgTime = (summary.avgTimePerScript / 1000).toFixed(1);
            const totalTime = (summary.totalTimeMs / 1000).toFixed(0);
            batchSummary.innerHTML = `
                <div style="display: flex; gap: 12px; flex-wrap: wrap; padding: 6px; background: rgba(255,255,255,0.02); border-radius: 6px;">
                    <span>✅ ${summary.successCount} success</span>
                    <span>❌ ${summary.errorCount} errors</span>
                    <span>📊 Avg: ${summary.averageScore}/100</span>
                    <span>⏱️ ${totalTime}s total (${avgTime}s/script)</span>
                </div>
            `;
        }
    }

}

// ============================================================
// AI SCRIPT CONSULTANT (Chat Engine)
// ============================================================

const CONSULTANT_SYSTEM_PROMPT = `You are "Yoga Script Consultant" — a friendly, expert AI assistant specialized in creating yoga video scripts.

YOUR PERSONALITY:
- Warm, knowledgeable, and conversational
- Like a real yoga instructor helping a producer plan their next video
- You ask smart follow-up questions when needed
- You give creative suggestions the user might not have thought of

YOUR JOB:
1. CHAT naturally with the user about their yoga video idea
2. ASK clarifying questions if their request is vague (audience? duration? mood? language?)
3. SUGGEST creative ideas they might not have considered
4. When you have enough info, PROPOSE a config with a JSON block

CONVERSATION RULES:
- Always respond in the SAME LANGUAGE the user is using
- Keep responses concise but helpful (3-8 sentences max for conversational replies)
- Don't dump all questions at once — ask 1-2 at a time, naturally
- If the user gives enough detail upfront, go straight to suggesting a config
- Be enthusiastic about good ideas, suggest improvements for weak ones
- Mention specific yoga concepts when relevant (pose names, flow types, etc.)

WHEN PROPOSING A CONFIG:
Include a JSON block in your response like this:

\`\`\`json
{
  "category": "bedtime|morning|kids|meditation|power|senior|office|prenatal|yin|recovery",
  "language": "en|vi|ja|ko|zh|es|fr|de|pt|hi",
  "level": "beginner|intermediate|advanced",
  "audience": "adults|kids|teens|seniors|pregnant|athletes|beginners|office-workers",
  "duration": 15,
  "poseCount": 12,
  "narrationStyle": "minimal|short|detailed|poetic",
  "flow": "progressive|warm_to_cool|cool_to_warm|body_scan|chakra|themed_animals|random",
  "focusArea": "relaxation|flexibility|strength|balance|breathing|core|energy|sleep|stress-relief|meditation|posture",
  "breathCues": true,
  "transitions": true,
  "personality": "gentle|energetic|calm|playful|coaching",
  "instructorName": ""
}
\`\`\`

Only include the JSON block when you're ready to suggest a complete config. Otherwise, just chat naturally.

SMART DEFAULTS:
- Kids → themed_animals flow, playful personality, short narration
- Bedtime → warm_to_cool flow, gentle personality, poetic narration
- Morning → cool_to_warm flow, energetic personality
- Senior → beginner level, gentle, exclude advanced poses
- Office → short duration (5-10 min), minimal narration`;

/**
 * Multi-turn AI consultation — sends conversation history for context
 */
async function consultWithAI(userMessage, chatHistory, apiKey) {
    const provider = detectTextProvider(apiKey);
    const model = getDefaultTextModel(provider);

    // Build conversation context from history (last 10 messages max)
    const recentHistory = chatHistory.slice(-10);
    let conversationContext = '';
    for (const msg of recentHistory) {
        if (msg.role === 'user') {
            conversationContext += `\nUser: ${msg.text}`;
        } else if (msg.role === 'ai') {
            conversationContext += `\nAssistant: ${msg.text}`;
        }
    }

    const userPrompt = conversationContext 
        ? `Previous conversation:\n${conversationContext}\n\nUser's latest message: ${userMessage}`
        : userMessage;

    const response = await generateTextAI(
        CONSULTANT_SYSTEM_PROMPT,
        userPrompt,
        apiKey,
        { model, maxTokens: 2048, temperature: 0.8, provider }
    );

    // Parse response — check if it contains a JSON config
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    let config = null;

    if (jsonMatch) {
        try {
            config = JSON.parse(jsonMatch[1]);
        } catch (e) {
            log.warn('⚠️ Failed to parse consultant JSON config');
        }
    }

    // Extract the text part (everything except the JSON block)
    let text = response
        .replace(/```json[\s\S]*?```/g, '')  // Remove JSON blocks
        .replace(/^\s*\n/gm, '\n')           // Clean up extra blank lines
        .trim();

    // If text is empty but we have config, add a default message
    if (!text && config) {
        text = 'Đây là config tôi suggest cho bạn:';
    }

    return { text, config, rawResponse: response };
}

/**
 * Apply AI brainstorm config to the form
 */
function applyBrainstormToForm(config) {
    if (!config) return;

    // Map AI response fields to form fields
    if (config.category) setSelectValue('sg-category', config.category);
    if (config.language) setSelectValue('sg-language', config.language);
    if (config.level) setSelectValue('sg-level', config.level);
    if (config.audience) setSelectValue('sg-audience', config.audience);
    if (config.duration) setSelectValue('sg-duration', String(config.duration));
    if (config.poseCount) setSelectValue('sg-pose-count', String(config.poseCount));
    if (config.narrationStyle) setSelectValue('sg-narration', config.narrationStyle);
    if (config.flow) setSelectValue('sg-flow', config.flow);
    if (config.focusArea) setSelectValue('sg-focus', config.focusArea);
    if (config.characterMode) setSelectValue('sg-character', config.characterMode);
    if (config.personality) setSelectValue('sg-personality', config.personality);
    if (config.instructorName) {
        const nameInput = $('#sg-instructor-name');
        if (nameInput) nameInput.value = config.instructorName;
    }

    // Checkboxes
    if (config.breathCues !== undefined) {
        const el = $('#sg-breath-cues');
        if (el) el.checked = config.breathCues;
    }
    if (config.transitions !== undefined) {
        const el = $('#sg-transitions');
        if (el) el.checked = config.transitions;
    }
}

/**
 * Collect config from the Script Gen form fields
 */
function collectScriptGenConfig() {
    const s = getState();
    return {
        category: $('#sg-category')?.value || 'bedtime',
        language: $('#sg-language')?.value || 'en',
        characterMode: $('#sg-character')?.value || 'none',
        characterDescription: s.characterDescription || '',
        scriptFormat: 'solo',
        niche: {
            level: $('#sg-level')?.value || 'beginner',
            audience: $('#sg-audience')?.value || 'adults',
            focusArea: $('#sg-focus')?.value || 'relaxation',
        },
        instructor: {
            name: $('#sg-instructor-name')?.value || '',
            personality: $('#sg-personality')?.value || 'gentle',
        },
        session: {
            duration: parseInt($('#sg-duration')?.value || '15'),
            poseCount: parseInt($('#sg-pose-count')?.value || '12'),
            narrationStyle: $('#sg-narration')?.value || 'short',
            breathCues: $('#sg-breath-cues')?.checked ?? true,
            transitionCues: $('#sg-transitions')?.checked ?? true,
            includeIntro: $('#sg-intro')?.checked ?? true,
            includeOutro: $('#sg-outro')?.checked ?? true,
        },
        poses: {
            flow: $('#sg-flow')?.value || 'progressive',
            mustInclude: ['savasana'],
            excludePoses: [],
        },
        ai: {
            temperature: 0.7,
            creativity: 'balanced',
        },
    };
}

/**
 * Apply a template to the form fields
 */
function applyTemplateToForm(templateId) {
    const templateConfig = applyTemplate(templateId, {});
    if (!templateConfig) return;

    // Fill form selects
    if (templateConfig.category) setSelectValue('sg-category', templateConfig.category);
    if (templateConfig.niche?.level) setSelectValue('sg-level', templateConfig.niche.level);
    if (templateConfig.niche?.audience) setSelectValue('sg-audience', templateConfig.niche.audience);
    if (templateConfig.niche?.focusArea) setSelectValue('sg-focus', templateConfig.niche.focusArea);
    if (templateConfig.session?.duration) setSelectValue('sg-duration', String(templateConfig.session.duration));
    if (templateConfig.session?.poseCount) setSelectValue('sg-pose-count', String(templateConfig.session.poseCount));
    if (templateConfig.session?.narrationStyle) setSelectValue('sg-narration', templateConfig.session.narrationStyle);
    if (templateConfig.poses?.flow) setSelectValue('sg-flow', templateConfig.poses.flow);

    // Checkboxes
    const cbMap = {
        'sg-breath-cues': templateConfig.session?.breathCues,
        'sg-transitions': templateConfig.session?.transitionCues,
        'sg-intro': templateConfig.session?.includeIntro,
        'sg-outro': templateConfig.session?.includeOutro,
    };
    for (const [id, val] of Object.entries(cbMap)) {
        const el = $(`#${id}`);
        if (el && val !== undefined) el.checked = val;
    }
}

function setSelectValue(id, value) {
    const select = $(`#${id}`);
    if (select) {
        // Check if option exists
        const option = select.querySelector(`option[value="${value}"]`);
        if (option) select.value = value;
    }
}

/**
 * Render pose sequence badges 
 */
function renderPoseSequence(poses) {
    const container = $('#sg-pose-list');
    const badge = $('#sg-pose-badge');
    if (!container) return;

    container.innerHTML = poses.map((p, i) => {
        const catIcon = {
            warmup: '🔥', standing: '🧍', balancing: '⚖️', seated: '🪷',
            floor: '🛏️', supine: '😴', inversion: '🙃', twist: '🔄',
            backbend: '🌈', hip_opener: '🦋', cooldown: '❄️',
            restorative: '🧘', breathing: '💨',
        }[p.category] || '🧘';

        return `<span class="badge" style="font-size: 10px; padding: 2px 6px;" title="${p.phase || ''}">${catIcon} ${p.name}</span>`;
    }).join('');

    if (badge) badge.textContent = `${poses.length}`;
}

/**
 * Render generated script output + meta + audit
 */
function renderGeneratedScript(result) {
    const outputEl = $('#sg-script-output');
    const metaCard = $('#sg-meta-card');
    const metaInfo = $('#sg-meta-info');
    const actionsEl = $('#sg-actions');

    if (!outputEl) return;

    // Render script with compact styling
    const lines = result.script.split('\n');
    let html = '';
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            html += '<br>';
        } else if (/^(Intro|Outro)$/i.test(trimmed)) {
            html += `<div style="font-weight: 700; color: var(--accent-primary); font-size: 14px; margin-top: 12px; margin-bottom: 3px;">${escapeHtml(trimmed)}</div>`;
        } else if (/^\d+\.\s/.test(trimmed)) {
            html += `<div style="font-weight: 700; color: var(--accent-secondary, var(--accent-primary)); font-size: 13px; margin-top: 10px; margin-bottom: 3px;">${escapeHtml(trimmed)}</div>`;
        } else {
            html += `<div style="color: var(--text-primary); font-size: 12px; line-height: 1.55;">${escapeHtml(trimmed)}</div>`;
        }
    }
    outputEl.innerHTML = `<div style="max-height: 400px; overflow-y: auto; padding: 6px;">${html}</div>`;

    // Enable buttons
    const copyBtn = $('#btn-sg-copy');
    const regenBtn = $('#btn-sg-regenerate');
    const useBtn = $('#btn-sg-use');
    if (copyBtn) copyBtn.disabled = false;
    if (regenBtn) regenBtn.disabled = false;
    if (useBtn) useBtn.disabled = false;

    // Meta info
    if (metaCard && metaInfo && result.meta) {
        const m = result.meta;
        metaCard.style.display = '';
        let metaHTML = '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2px 10px;">';
        metaHTML += `<span>⏱️ ${(m.elapsedMs / 1000).toFixed(1)}s</span>`;
        metaHTML += `<span>📏 ${m.scriptLength}ch</span>`;
        metaHTML += `<span>🧘 ${m.poseCount} poses</span>`;
        metaHTML += `<span>🤖 ${m.model || 'auto'}</span>`;
        metaHTML += `<span>📂 ${m.category}</span>`;
        metaHTML += `<span>🌐 ${m.language}</span>`;
        if (m.auditResult) {
            metaHTML += `<span>📊 ${m.auditResult.score}/100</span>`;
            metaHTML += `<span>${m.auditResult.grade?.emoji || ''} ${m.auditResult.grade?.label || ''}</span>`;
            metaHTML += `<span>${m.auditResult.status}</span>`;
        }
        if (m.duplicateWarning) {
            metaHTML += `<span style="grid-column:1/-1;color:var(--accent-warm);">⚠️ ${m.duplicateWarning}</span>`;
        }
        if (m.fixResult) {
            metaHTML += `<span style="grid-column:1/-1;">🔧 Auto-fixed: ${m.fixResult.changes.join(', ')}</span>`;
        }
        metaHTML += '</div>';
        metaInfo.innerHTML = metaHTML;
    }

    if (actionsEl) actionsEl.style.display = '';

    // Audit score card
    if (result.auditResult) {
        renderAuditScore(result.auditResult);
    }

    const statusEl = $('#sg-status');
    if (statusEl) statusEl.style.display = 'none';
}

/**
 * Render audit score card
 */
function renderAuditScore(auditResult) {
    const card = $('#sg-audit-card');
    const gradeEl = $('#sg-audit-grade');
    const fillEl = $('#sg-audit-fill');
    const detailsEl = $('#sg-audit-details');
    const fixBtn = $('#btn-sg-fix-with-ai');
    if (!card) return;

    card.style.display = '';

    const grade = auditResult.grade || { emoji: '—', letter: '?', label: 'Unknown' };
    if (gradeEl) {
        gradeEl.textContent = `${grade.emoji} ${auditResult.totalScore}/100`;
        gradeEl.className = auditResult.totalScore >= 85 ? 'badge badge-success'
            : auditResult.totalScore >= 60 ? 'badge badge-warm' : 'badge';
        if (auditResult.totalScore < 60) {
            gradeEl.style.cssText = 'background:rgba(239,68,68,0.12);color:var(--accent-danger);border-color:rgba(239,68,68,0.2);';
        }
    }

    if (fillEl) {
        const pct = Math.min(100, auditResult.totalScore);
        fillEl.style.width = `${pct}%`;
        fillEl.style.background = pct >= 85 ? 'linear-gradient(90deg,#10b981,#34d399)'
            : pct >= 60 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
            : 'linear-gradient(90deg,#ef4444,#f87171)';
    }

    if (detailsEl && auditResult.phase1) {
        let html = '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:4px;">';
        for (const check of auditResult.phase1.checks) {
            const icon = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌';
            html += `<span style="font-size:10px;">${icon} ${check.name}</span>`;
        }
        html += '</div>';
        if (auditResult.phase2?.feedback) {
            html += `<div style="font-style:italic;font-size:10px;margin-top:3px;">💡 ${escapeHtml(auditResult.phase2.feedback)}</div>`;
        }
        detailsEl.innerHTML = html;
    }

    // Show fix button if score is low
    if (fixBtn) {
        fixBtn.style.display = auditResult.totalScore < 75 ? '' : 'none';
    }
}

// ============================================================
// FLOATING AI AGENT — Toggle & Fix Integration
// ============================================================

function initFloatingAgent() {
    const fab = $('#sg-agent-fab');
    const panel = $('#sg-agent-panel');
    const closeBtn = $('#btn-sg-agent-close');
    const fixBtn = $('#btn-sg-fix-with-ai');

    if (!fab || !panel) return;

    fab.addEventListener('click', () => {
        const isOpen = panel.style.display !== 'none';
        panel.style.display = isOpen ? 'none' : '';
        fab.textContent = isOpen ? '🧠' : '✕';
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            panel.style.display = 'none';
            fab.textContent = '🧠';
        });
    }

    // Fix with AI button
    if (fixBtn) {
        fixBtn.addEventListener('click', () => {
            panel.style.display = '';
            fab.textContent = '✕';
            const chatInput = $('#sg-chat-input');
            const sendBtn = $('#btn-sg-chat-send');
            if (chatInput && sendBtn) {
                chatInput.value = 'Script vừa tạo bị điểm thấp. Hãy phân tích lỗi và gợi ý cách sửa. Nếu có thể hãy tự động fix giúp tôi.';
                sendBtn.click();
            }
        });
    }
}

// ============================================================
// UTILITIES
// ============================================================

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
