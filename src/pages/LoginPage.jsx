import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { apiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [mfaToken, setMfaToken] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const submitCredentials = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/login', form);
      if (data.mfaRequired) {
        setMfaToken(data.mfaToken);
      } else {
        await login(data.accessToken);
        navigate('/');
      }
    } catch (err) {
      setError(apiError(err, 'Unable to sign in'));
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/mfa/verify', { mfaToken, code });
      await login(data.accessToken);
      navigate('/');
    } catch (err) {
      setError(apiError(err, 'Invalid authentication code'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand brand-lg">
          <span className="brand-mark">◆</span> Inventory Manager
        </div>

        {mfaToken ? (
          <form onSubmit={submitCode} className="stack">
            <h1>Two-factor code</h1>
            <p className="muted">Enter the 6-digit code from your authenticator app.</p>
            <input
              className="input code-input"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              placeholder="000000"
              autoFocus
            />
            {error && <div className="alert">{error}</div>}
            <button className="btn btn-primary" disabled={busy || code.length !== 6}>
              {busy ? 'Verifying…' : 'Verify'}
            </button>
          </form>
        ) : (
          <form onSubmit={submitCredentials} className="stack">
            <h1>Welcome back</h1>
            <label className="field">
              <span>Username</span>
              <input className="input" value={form.username} onChange={update('username')} autoFocus />
            </label>
            <label className="field">
              <span>Password</span>
              <input className="input" type="password" value={form.password} onChange={update('password')} />
            </label>
            {error && <div className="alert">{error}</div>}
            <button className="btn btn-primary" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        )}

        <p className="muted center">
          No account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
