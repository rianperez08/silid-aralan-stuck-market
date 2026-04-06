// ===== SUPABASE CLIENT =====
const SUPABASE_URL = 'https://hlgnndcpmoitlroywoim.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsZ25uZGNwbW9pdGxyb3l3b2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTc1MzEsImV4cCI6MjA4OTI5MzUzMX0.9wQoEeLnMhmgpZUfVd9dM7kSMsAsJ0_6uet60n6Mnuc';

const _sb = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ===== AUTH MODAL =====
function injectAuthModal() {
  const modal = document.createElement('div');
  modal.id = 'auth-modal';
  modal.className = 'auth-modal-overlay';
  modal.style.display = 'none';
  modal.innerHTML = `
    <div class="auth-modal-card" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <button class="auth-modal-close" id="auth-modal-close" aria-label="Close">&times;</button>
      <div class="auth-modal-tabs">
        <button class="auth-tab active" id="tab-signin" data-tab="signin">Sign In</button>
        <button class="auth-tab" id="tab-signup" data-tab="signup">Create Account</button>
      </div>
      <h2 class="auth-modal-title" id="auth-modal-title">Welcome back</h2>
      <p class="auth-modal-sub" id="auth-modal-sub">Sign in to access your supporter portfolio.</p>
      <form id="auth-form" autocomplete="on" novalidate>
        <div class="auth-field">
          <label for="auth-email">Email</label>
          <input type="email" id="auth-email" name="email" autocomplete="email" placeholder="you@example.com" required />
        </div>
        <div class="auth-field">
          <label for="auth-password">Password</label>
          <input type="password" id="auth-password" name="password" autocomplete="current-password" placeholder="••••••••" required minlength="6" />
        </div>
        <div class="auth-error" id="auth-error" style="display:none"></div>
        <button type="submit" class="btn-primary auth-submit" id="auth-submit">Sign In</button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  // Tab switching
  let currentMode = 'signin';
  document.getElementById('tab-signin').addEventListener('click', () => switchTab('signin'));
  document.getElementById('tab-signup').addEventListener('click', () => switchTab('signup'));

  function switchTab(mode) {
    currentMode = mode;
    document.getElementById('tab-signin').classList.toggle('active', mode === 'signin');
    document.getElementById('tab-signup').classList.toggle('active', mode === 'signup');
    if (mode === 'signin') {
      document.getElementById('auth-modal-title').textContent = 'Welcome back';
      document.getElementById('auth-modal-sub').textContent = 'Sign in to access your supporter portfolio.';
      document.getElementById('auth-submit').textContent = 'Sign In';
      document.getElementById('auth-password').autocomplete = 'current-password';
    } else {
      document.getElementById('auth-modal-title').textContent = 'Create an account';
      document.getElementById('auth-modal-sub').textContent = 'Join Stuck Market and start backing students.';
      document.getElementById('auth-submit').textContent = 'Create Account';
      document.getElementById('auth-password').autocomplete = 'new-password';
    }
    clearAuthError();
  }

  // Close
  document.getElementById('auth-modal-close').addEventListener('click', closeAuthModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeAuthModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAuthModal(); });

  // Submit
  document.getElementById('auth-form').addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    clearAuthError();
    setAuthLoading(true);
    if (currentMode === 'signin') {
      await signIn(email, password);
    } else {
      await signUp(email, password);
    }
    setAuthLoading(false);
  });
}

function openAuthModal(mode) {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  if (mode === 'signup') {
    document.getElementById('tab-signup').click();
  } else {
    document.getElementById('tab-signin').click();
  }
  setTimeout(() => document.getElementById('auth-email').focus(), 50);
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
  clearAuthError();
  document.getElementById('auth-form').reset();
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  el.style.display = '';
}

function clearAuthError() {
  const el = document.getElementById('auth-error');
  if (el) { el.textContent = ''; el.style.display = 'none'; }
}

function setAuthLoading(loading) {
  const btn = document.getElementById('auth-submit');
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Please wait…' : (
    document.getElementById('tab-signin').classList.contains('active') ? 'Sign In' : 'Create Account'
  );
}

// ===== AUTH ACTIONS =====
async function signIn(email, password) {
  const { error } = await _sb.auth.signInWithPassword({ email, password });
  if (error) {
    showAuthError(error.message);
  } else {
    closeAuthModal();
  }
}

async function signUp(email, password) {
  const { error } = await _sb.auth.signUp({ email, password });
  if (error) {
    showAuthError(error.message);
  } else {
    showAuthError('Check your email to confirm your account, then sign in.');
    document.getElementById('auth-error').style.color = 'var(--green)';
  }
}

async function signOut() {
  await _sb.auth.signOut();
}

// ===== AUTH INIT =====
function initAuth(onLogin, onLogout) {
  if (!_sb) { onLogout(); return; }
  _sb.auth.getSession().then(({ data: { session } }) => {
    if (session) onLogin(session.user);
    else onLogout();
  });
  _sb.auth.onAuthStateChange((event, session) => {
    if (session) onLogin(session.user);
    else onLogout();
  });
}

// ===== NAV STATE =====
function updateNavAuth(user) {
  const dashboard = document.getElementById('nav-dashboard');
  const authBtn = document.getElementById('nav-auth-btn');
  const invest = document.getElementById('nav-invest');
  if (user) {
    if (dashboard) dashboard.style.display = '';
    if (authBtn) {
      authBtn.style.display = '';
      authBtn.textContent = user.email.split('@')[0];
      authBtn.onclick = e => { e.preventDefault(); signOut(); };
    }
    if (invest) invest.style.display = 'none';
  } else {
    if (dashboard) dashboard.style.display = 'none';
    if (authBtn) {
      authBtn.style.display = '';
      authBtn.textContent = 'Sign In';
      authBtn.onclick = e => { e.preventDefault(); openAuthModal('login'); };
    }
    if (invest) invest.style.display = '';
  }
}

// ===== BOOT =====
document.addEventListener('DOMContentLoaded', injectAuthModal);
