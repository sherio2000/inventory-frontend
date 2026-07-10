import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { apiError } from '../api/client';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/auth/register', form);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(apiError(err, 'Unable to create account'));
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
        <form onSubmit={submit} className="stack">
          <h1>Create account</h1>
          <label className="field">
            <span>Username</span>
            <input className="input" value={form.username} onChange={update('username')} autoFocus />
          </label>
          <label className="field">
            <span>Password</span>
            <input className="input" type="password" value={form.password} onChange={update('password')} />
            <small className="muted">At least 8 characters.</small>
          </label>
          {error && <div className="alert">{error}</div>}
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="muted center">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
