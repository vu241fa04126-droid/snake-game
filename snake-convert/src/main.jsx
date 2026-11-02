import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const USERS_KEY = 'serpentis_local_users';
const ACTIVE_KEY = 'serpentis_active_username';
const AUTH_KEY = 'serpentis_frontend_authenticated_v2';

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  } catch {
    return {};
  }
}

async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

function createSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    const cleanName = username.trim();
    const userKey = cleanName.toLowerCase();

    if (!/^[A-Za-z0-9_]{3,20}$/.test(cleanName)) {
      setError('Username must be 3–20 characters (letters, numbers or underscore).');
      return;
    }
    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      const users = getUsers();
      if (mode === 'register') {
        if (users[userKey]) throw new Error('That username already exists. Please log in.');
        const salt = createSalt();
        users[userKey] = { username: cleanName, salt, passwordHash: await hashPassword(password, salt), createdAt: new Date().toISOString() };
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      } else {
        const savedUser = users[userKey];
        if (!savedUser) throw new Error('Account not found. Please register first.');
        const passwordHash = await hashPassword(password, savedUser.salt);
        if (passwordHash !== savedUser.passwordHash) throw new Error('Incorrect username or password.');
      }

      localStorage.setItem(ACTIVE_KEY, cleanName);
      localStorage.setItem(AUTH_KEY, 'true');
      onAuthenticated();
    } catch (err) {
      setError(err.message || 'Unable to complete login.');
    } finally {
      setBusy(false);
    }
  }

  function switchMode() {
    setMode(mode === 'login' ? 'register' : 'login');
    setPassword('');
    setConfirmPassword('');
    setError('');
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-icon">🐍</div>
        <p className="auth-eyebrow">SERPENTIS ARCADE</p>
        <h1>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
        <p className="auth-subtitle">{mode === 'login' ? 'Log in to continue your game.' : 'Create an account to save your scores.'}</p>
        <label htmlFor="auth-username">Username</label>
        <input id="auth-username" value={username} onChange={e => setUsername(e.target.value)} minLength={3} maxLength={20} autoComplete="username" placeholder="Enter username" required />
        <label htmlFor="auth-password">Password</label>
        <input id="auth-password" type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="At least 8 characters" required />
        {mode === 'register' && <>
          <label htmlFor="auth-confirm">Confirm password</label>
          <input id="auth-confirm" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={8} autoComplete="new-password" placeholder="Re-enter password" required />
        </>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create Account'}</button>
        <p className="auth-switch">{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button type="button" onClick={switchMode}>{mode === 'login' ? 'Register' : 'Login'}</button>
        </p>
        <p className="auth-note">Demo authentication: accounts are saved only in this browser.</p>
      </form>
    </main>
  );
}

function Root() {
  const [authenticated, setAuthenticated] = useState(() => localStorage.getItem(AUTH_KEY) === 'true' && Boolean(localStorage.getItem(ACTIVE_KEY)));
  function logout() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(ACTIVE_KEY);
    setAuthenticated(false);
  }
  if (!authenticated) return <AuthScreen onAuthenticated={() => setAuthenticated(true)} />;
  return <App onLogout={logout} />;
}

createRoot(document.getElementById('root')).render(<Root />);
