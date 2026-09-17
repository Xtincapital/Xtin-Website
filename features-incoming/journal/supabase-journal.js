(function () {
  const STATE_TABLE = 'journal_user_state';
  const REQUIRED_KEYS = [
    'trades',
    'goals',
    'custom_strategies',
    'settings',
    'subscription',
    'invoices',
    'ai_usage',
    'drafts'
  ];

  let client = null;
  let session = null;

  function getMetaContent(name) {
    return document.querySelector(`meta[name="${name}"]`)?.content?.trim() || '';
  }

  function getConfig() {
    return {
      url: window.XTIN_JOURNAL_SUPABASE_URL || getMetaContent('supabase-url'),
      anonKey: window.XTIN_JOURNAL_SUPABASE_ANON_KEY || getMetaContent('supabase-anon-key')
    };
  }

  function isConfigured() {
    const config = getConfig();
    return Boolean(config.url && config.anonKey && window.supabase?.createClient);
  }

  async function init() {
    if (!isConfigured()) {
      updateAuthStatus('Supabase not configured');
      return { configured: false, user: null };
    }

    const config = getConfig();
    client = window.supabase.createClient(config.url, config.anonKey);

    const { data, error } = await client.auth.getSession();
    if (error) console.error('Supabase session error:', error);
    session = data?.session || null;

    client.auth.onAuthStateChange((_event, nextSession) => {
      session = nextSession;
      updateAuthStatus();
      if (session && _event !== 'INITIAL_SESSION' && typeof window.reloadJournalFromCloud === 'function') {
        window.reloadJournalFromCloud({ showToast: false });
      }
    });

    updateAuthStatus();
    return { configured: true, user: getUser() };
  }

  function getUser() {
    return session?.user || null;
  }

  function getDisplayName() {
    const user = getUser();
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Trader';
  }

  function updateAuthStatus(message = '') {
    const status = document.getElementById('journalAuthStatus');
    const signInBtn = document.getElementById('journalSignInBtn');
    const signOutBtn = document.getElementById('journalSignOutBtn');
    const changeNameBtn = document.getElementById('journalChangeNameBtn');
    const user = getUser();

    if (status) {
      status.textContent = message || (user ? getDisplayName() : 'Not signed in');
    }
    if (signInBtn) signInBtn.style.display = user ? 'none' : 'inline-flex';
    if (signOutBtn) signOutBtn.style.display = user ? 'inline-flex' : 'none';
    if (changeNameBtn) changeNameBtn.style.display = user ? 'inline-flex' : 'none';
  }

  async function signIn(email, password) {
    if (!client) throw new Error('Supabase is not configured');
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    session = data.session;
    updateAuthStatus();
    return data.user;
  }

  async function signUp(email, password, metadata = {}) {
    if (!client) throw new Error('Supabase is not configured');
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    if (error) throw error;
    session = data.session;
    updateAuthStatus();
    return data.user;
  }

  async function resetPassword(email) {
    if (!client) throw new Error('Supabase is not configured');
    const { data, error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    if (!client) return;
    await client.auth.signOut();
    session = null;
    updateAuthStatus();
  }

  async function updateProfile(metadata = {}) {
    if (!client) throw new Error('Supabase is not configured');
    const { data, error } = await client.auth.updateUser({ data: metadata });
    if (error) throw error;
    if (data?.user) {
      session = session ? { ...session, user: data.user } : session;
      updateAuthStatus();
    }
    return data?.user || null;
  }

  async function loadState(key, fallback = null) {
    const user = getUser();
    if (!client || !user) return fallback;

    const { data, error } = await client
      .from(STATE_TABLE)
      .select('payload')
      .eq('user_id', user.id)
      .eq('state_key', key)
      .maybeSingle();

    if (error) {
      console.error(`Error loading Supabase state ${key}:`, error);
      return fallback;
    }

    return data?.payload ?? fallback;
  }

  async function loadAllState() {
    const user = getUser();
    if (!client || !user) return {};

    const { data, error } = await client
      .from(STATE_TABLE)
      .select('state_key,payload')
      .eq('user_id', user.id)
      .in('state_key', REQUIRED_KEYS);

    if (error) {
      console.error('Error loading Supabase journal state:', error);
      return {};
    }

    return (data || []).reduce((state, row) => {
      state[row.state_key] = row.payload;
      return state;
    }, {});
  }

  async function saveState(key, payload) {
    const user = getUser();
    if (!client || !user) return false;

    const { error } = await client.from(STATE_TABLE).upsert({
      user_id: user.id,
      state_key: key,
      payload,
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.error(`Error saving Supabase state ${key}:`, error);
      return false;
    }

    return true;
  }

  async function saveManyState(entries) {
    const user = getUser();
    if (!client || !user) return false;

    const rows = Object.entries(entries).map(([stateKey, payload]) => ({
      user_id: user.id,
      state_key: stateKey,
      payload,
      updated_at: new Date().toISOString()
    }));

    const { error } = await client.from(STATE_TABLE).upsert(rows);
    if (error) {
      console.error('Error saving Supabase journal state:', error);
      return false;
    }
    return true;
  }

  window.journalSupabase = {
    init,
    isConfigured,
    getUser,
    getDisplayName,
    signIn,
    signUp,
    resetPassword,
    signOut,
    updateProfile,
    loadState,
    loadAllState,
    saveState,
    saveManyState,
    updateAuthStatus
  };
})();
