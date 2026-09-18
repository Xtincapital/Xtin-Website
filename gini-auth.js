const GiniAuth = (() => {
  const DATA_TABLE = 'gini_user_data';
  const state = {
    client: null,
    session: null,
    user: null,
    ready: false,
    configured: false,
    saving: false,
    saveTimer: null,
    lastSyncedAt: null
  };

  const getEl = (id) => document.getElementById(id);

  function setStatus(message, tone = 'muted') {
    const status = getEl('giniAuthStatus');
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone;
  }

  function showToast(message, type = 'success') {
    if (typeof window.showAuthNotification === 'function') {
      window.showAuthNotification(message, type);
    }
  }

  function formatSyncTime(value) {
    if (!value) return 'Not synced';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Not synced';
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  function updateAccountPanel() {
    const email = state.user?.email || 'Not logged in';
    const sync = formatSyncTime(state.lastSyncedAt);
    const tokens = window.getGiniAITokenBalanceLabel?.() || '0';
    const setText = (id, val) => { const el = getEl(id); if (el) el.textContent = val; };

    // Auth-corner panel
    setText('giniAccountEmail', email);
    setText('giniAccountSync', sync);
    setText('giniAccountTokens', tokens);

    // Full-page account details
    setText('giniAuthPageEmail', email);
    setText('giniAuthPageSync', sync);
    setText('giniAuthPageTokens', tokens);
    const avatar = getEl('giniAuthAvatar');
    if (avatar) avatar.textContent = (state.user?.email || 'U').charAt(0).toUpperCase();
  }

  function setPageStatus(message, tone = 'muted') {
    const el = getEl('giniAuthPageStatus');
    if (!el) return;
    if (!message) {
      el.hidden = true;
      el.textContent = '';
      return;
    }
    el.hidden = false;
    el.textContent = message;
    el.dataset.tone = tone;
  }

  function setMode(mode) {
    const page = getEl('giniAuthPage');
    if (!page) return;
    page.dataset.mode = mode;
    const title = getEl('giniAuthTitle');
    const submit = getEl('giniAuthSubmit');
    const switchBtn = getEl('giniAuthSwitch');
    const subtitle = getEl('giniAuthSubtitle');
    const password = getEl('giniAuthPassword');
    if (title) title.textContent = mode === 'signup' ? 'Create your Gini account' : 'Login to Gini';
    if (submit) submit.textContent = mode === 'signup' ? 'Sign up' : 'Login';
    if (switchBtn) switchBtn.textContent = mode === 'signup' ? 'Already have an account? Login' : 'New here? Sign up';
    if (subtitle) subtitle.textContent = mode === 'signup'
      ? 'Set up cloud sync for your financial plan.'
      : 'Welcome back. Enter your details to continue.';
    if (password) password.setAttribute('autocomplete', mode === 'signup' ? 'new-password' : 'current-password');
  }

  // Opens the full-screen auth page (kept named openModal for existing callers).
  function openModal(mode = 'login') {
    setMode(mode);
    const page = getEl('giniAuthPage');
    if (!page) return;
    setPageStatus('');
    page.classList.remove('hidden');
    page.setAttribute('aria-hidden', 'false');
    document.body.classList.add('auth-page-open');
    updateUi(); // toggle form vs. signed-in details based on current state
    setTimeout(() => { if (!state.user) getEl('giniAuthEmail')?.focus(); }, 60);
  }

  function closeModal() {
    const page = getEl('giniAuthPage');
    if (!page) return;
    page.classList.add('hidden');
    page.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('auth-page-open');
    const password = getEl('giniAuthPassword');
    if (password) password.value = '';
  }

  function updateUi() {
    const loggedOut = getEl('giniAuthLoggedOut');
    const loggedIn = getEl('giniAuthLoggedIn');
    const userEmail = getEl('giniAuthUserEmail');

    // Full-page auth view: show signed-in details when logged in, else the form.
    const pageForm = getEl('giniAuthForm');
    const pageDetails = getEl('giniAuthDetails');
    const showDetails = !!state.user;
    if (pageForm) pageForm.classList.toggle('hidden', showDetails);
    if (pageDetails) pageDetails.classList.toggle('hidden', !showDetails);

    if (!state.configured) {
      loggedOut?.classList.add('hidden');
      loggedIn?.classList.add('hidden');
      getEl('giniAccountPanel')?.classList.add('hidden');
      setStatus('Login unavailable', 'error');
      updateAccountPanel();
      return;
    }

    if (state.user) {
      loggedOut?.classList.add('hidden');
      loggedIn?.classList.remove('hidden');
      if (userEmail) userEmail.textContent = state.user.email || 'Logged in';
      setStatus(state.saving ? 'Saving...' : `Synced ${formatSyncTime(state.lastSyncedAt)}`, 'success');
      updateAccountPanel();
      return;
    }

    getEl('giniAccountPanel')?.classList.add('hidden');
    loggedOut?.classList.remove('hidden');
    loggedIn?.classList.add('hidden');
    setStatus('Login to save data', 'muted');
    updateAccountPanel();
  }

  async function fetchConfig() {
    try {
      const response = await fetch('/api/config');
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.warn('[GiniAuth] Could not load config:', error);
      return null;
    }
  }

  async function checkTableAccess() {
    if (!state.client || !state.user || !state.session) return;
    try {
      const { error } = await state.client
        .from(DATA_TABLE)
        .select('user_id')
        .eq('user_id', state.user.id)
        .maybeSingle();
      if (error) {
        const code = error.code || '';
        const msg = error.message || '';
        if (code === '42P01' || msg.includes('does not exist')) {
          setStatus('Table missing — run SQL from SETUP.md in Supabase', 'error');
        } else if (code === '42501' || msg.includes('row-level security')) {
          setStatus('RLS policy missing — run SQL from SETUP.md in Supabase', 'error');
        }
        console.warn('[GiniAuth] Table access check failed:', code, msg);
      }
    } catch (e) {
      console.warn('[GiniAuth] checkTableAccess error:', e);
    }
  }

  async function initClient() {
    if (!window.supabase?.createClient) {
      setStatus('Supabase script missing', 'error');
      return;
    }

    const config = await fetchConfig();
    if (!config?.supabaseUrl || !config?.supabaseAnonKey) {
      state.ready = true;
      state.configured = false;
      updateUi();
      return;
    }

    state.client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
    state.configured = true;

    const { data } = await state.client.auth.getSession();
    state.session = data.session || null;
    state.user = state.session?.user || null;

    state.client.auth.onAuthStateChange(async (_event, session) => {
      state.session = session || null;
      state.user = session?.user || null;
      updateUi();

      if (state.session && state.user && typeof window.loadAppStateFromStorage === 'function') {
        setStatus('Loading your financial data...', 'muted');
        await window.loadAppStateFromStorage();
        window.refreshGiniViews?.();
        // After loading, run a table health check on first login
        await checkTableAccess();
        updateUi();
      }
    });

    state.ready = true;
    updateUi();
  }

  async function loadUserData() {
    if (!state.client || !state.user) return null;

    const { data, error } = await state.client
      .from(DATA_TABLE)
      .select('app_state, ai_wallet, report_quota, ai_profile')
      .eq('user_id', state.user.id)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }

  async function saveUserData(payload) {
    if (!state.client || !state.user || !state.session) return { skipped: true };

    state.saving = true;
    setStatus('Saving...', 'muted');
    updateAccountPanel();

    const { error } = await state.client
      .from(DATA_TABLE)
      .upsert({
        user_id: state.user.id,
        app_state: payload.appState || {},
        ai_wallet: payload.aiWallet || {},
        report_quota: payload.reportQuota || {},
        ai_profile: payload.aiProfile || {},
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    state.saving = false;
    if (error) {
      const code = error.code || '';
      const msg = error.message || '';
      let hint = 'Sync failed, saved locally';
      if (code === '42501' || msg.includes('row-level security')) {
        hint = 'Sync failed: run the SQL from SETUP.md in Supabase dashboard';
      } else if (code === '42P01' || msg.includes('does not exist')) {
        hint = 'Sync failed: table missing — run SQL from SETUP.md in Supabase';
      } else if (msg.includes('JWT') || msg.includes('token')) {
        hint = 'Session expired — please log out and log in again';
      }
      console.warn('[GiniAuth] Supabase sync error:', code, msg);
      setStatus(hint, 'error');
      showToast(hint, 'error');
      throw error;
    }

    state.lastSyncedAt = new Date().toISOString();
    setStatus('Synced just now', 'success');
    updateAccountPanel();
    showToast('Saved to cloud', 'success');
    return { success: true };
  }

  function scheduleSave(payloadFactory, delay = 900) {
    if (!state.user || !state.client || typeof payloadFactory !== 'function') return;
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(async () => {
      try {
        await saveUserData(payloadFactory());
      } catch (error) {
        console.warn('[GiniAuth] Cloud save failed:', error);
      }
    }, delay);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!state.client) {
      setStatus('Supabase not configured', 'error');
      setPageStatus('Login is unavailable — cloud service is not configured.', 'error');
      return;
    }

    const page = getEl('giniAuthPage');
    const mode = page?.dataset.mode || 'login';
    const email = getEl('giniAuthEmail')?.value.trim();
    const password = getEl('giniAuthPassword')?.value;

    if (!email || !password) {
      setPageStatus('Enter your email and password.', 'error');
      return;
    }

    setPageStatus(mode === 'signup' ? 'Creating your account...' : 'Signing you in...', 'muted');
    const submitBtn = getEl('giniAuthSubmit');
    submitBtn.disabled = true;
    submitBtn.textContent = mode === 'signup' ? 'Creating...' : 'Logging in...';

    try {
      const result = mode === 'signup'
        ? await state.client.auth.signUp({ email, password })
        : await state.client.auth.signInWithPassword({ email, password });

      if (result.error) throw result.error;
      state.session = result.data.session || null;
      state.user = result.data.user || state.session?.user || null;

      const needsEmailConfirm = mode === 'signup' && !result.data.session;
      const okMsg = needsEmailConfirm ? 'Account created — check your email to confirm signup.' : 'Signed in. Cloud sync is on.';
      setStatus(needsEmailConfirm ? 'Check your email to confirm signup' : 'Cloud sync on', 'success');

      // Only sync when we have a real session (not pending email confirmation)
      if (state.session && state.user && typeof window.loadAppStateFromStorage === 'function') {
        await window.loadAppStateFromStorage();
        window.refreshGiniViews?.();
        await window.saveAppStateToStorage?.({ immediateCloudSync: true });
      }

      // Keep the page open and reveal the user's account details.
      updateUi();
      updateAccountPanel();
      setPageStatus(okMsg, needsEmailConfirm ? 'muted' : 'success');
    } catch (error) {
      setPageStatus(error.message || 'Authentication failed.', 'error');
      setStatus(error.message || 'Authentication failed', 'error');
    } finally {
      submitBtn.disabled = false;
      setMode(mode);
    }
  }

  async function signOut() {
    if (!state.client) return;
    try {
      if (typeof window.saveAppStateToStorage === 'function') {
        await window.saveAppStateToStorage({ immediateCloudSync: true });
      }
      await state.client.auth.signOut();
      state.session = null;
      state.user = null;
      updateUi();
    } catch (error) {
      setStatus(error.message || 'Logout failed', 'error');
    }
  }

  async function syncNow() {
    if (!state.user || !state.client || typeof window.getCloudPersistencePayload !== 'function') return;
    try {
      await saveUserData(window.getCloudPersistencePayload());
    } catch (error) {
      console.warn('[GiniAuth] Manual sync failed:', error);
    }
  }

  function toggleAccountPanel() {
    const panel = getEl('giniAccountPanel');
    const corner = getEl('giniAuthCorner');
    if (!panel) return;
    panel.classList.toggle('hidden');
    corner?.classList.toggle('is-open', !panel.classList.contains('hidden'));
    updateAccountPanel();
  }

  async function init() {
    getEl('giniLoginBtn')?.addEventListener('click', () => openModal('login'));
    getEl('giniSignupBtn')?.addEventListener('click', () => openModal('signup'));
    getEl('giniAuthClose')?.addEventListener('click', closeModal);
    getEl('giniAuthCancel')?.addEventListener('click', closeModal);
    getEl('giniAuthSwitch')?.addEventListener('click', () => {
      const current = getEl('giniAuthPage')?.dataset.mode || 'login';
      setPageStatus('');
      setMode(current === 'login' ? 'signup' : 'login');
    });
    getEl('giniAccountBtn')?.addEventListener('click', toggleAccountPanel);
    getEl('giniManualSyncBtn')?.addEventListener('click', syncNow);
    getEl('giniLogoutBtn')?.addEventListener('click', signOut);
    getEl('giniAuthForm')?.addEventListener('submit', handleSubmit);

    // Full-page auth controls
    getEl('giniAuthContinue')?.addEventListener('click', () => {
      closeModal();
      document.body.classList.remove('landing-active');
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
    getEl('giniAuthPageLogout')?.addEventListener('click', signOut);
    getEl('giniAuthPageSyncBtn')?.addEventListener('click', syncNow);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !getEl('giniAuthPage')?.classList.contains('hidden')) closeModal();
    });

    document.addEventListener('click', (event) => {
      const corner = getEl('giniAuthCorner');
      if (corner && !corner.contains(event.target)) {
        getEl('giniAccountPanel')?.classList.add('hidden');
        corner.classList.remove('is-open');
      }
    });

    await initClient();
  }

  return {
    init,
    loadUserData,
    saveUserData,
    scheduleSave,
    syncNow,
    updateAccountPanel,
    isLoggedIn: () => Boolean(state.user),
    isConfigured: () => state.configured,
    getUser: () => state.user,
    getClient: () => state.client
  };
})();

window.GiniAuth = GiniAuth;
