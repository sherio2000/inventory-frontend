import { useState } from 'react';
import QRCode from 'qrcode';
import api, { apiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export default function SecurityPage() {
  const { profile, refresh } = useAuth();
  const [setup, setSetup] = useState(null);
  const [qr, setQr] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const beginSetup = async () => {
    setError('');
    setMessage('');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/mfa/setup');
      setSetup(data);
      setQr(await QRCode.toDataURL(data.otpauthUri, { margin: 1, width: 200 }));
    } catch (err) {
      setError(apiError(err, 'Unable to start setup'));
    } finally {
      setBusy(false);
    }
  };

  const confirm = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/auth/mfa/confirm', { code });
      setSetup(null);
      setQr('');
      setCode('');
      setMessage('Two-factor authentication is now enabled.');
      await refresh();
    } catch (err) {
      setError(apiError(err, 'Invalid authentication code'));
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    if (!window.confirm('Disable two-factor authentication?')) {
      return;
    }
    setError('');
    setBusy(true);
    try {
      await api.post('/auth/mfa/disable');
      setMessage('Two-factor authentication disabled.');
      await refresh();
    } catch (err) {
      setError(apiError(err, 'Unable to disable'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack-lg narrow">
      <div className="page-head">
        <div>
          <h1>Security</h1>
          <p className="muted">Protect your account with an authenticator app.</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-row">
          <div>
            <h2>Two-factor authentication</h2>
            <p className="muted">
              Status:{' '}
              <span className={profile?.mfaEnabled ? 'status status-on' : 'status status-off'}>
                {profile?.mfaEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </p>
          </div>
          {profile?.mfaEnabled ? (
            <button className="btn btn-danger" onClick={disable} disabled={busy}>Disable</button>
          ) : (
            !setup && <button className="btn btn-primary" onClick={beginSetup} disabled={busy}>Enable</button>
          )}
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert">{error}</div>}

        {setup && (
          <div className="mfa-setup">
            <ol className="steps">
              <li>Scan the QR code with Google Authenticator, Authy, or 1Password.</li>
              <li>Enter the 6-digit code below to finish.</li>
            </ol>
            <div className="mfa-grid">
              {qr && <img className="qr" src={qr} alt="Authenticator QR code" />}
              <div className="stack">
                <div className="field">
                  <span>Manual key</span>
                  <code className="secret">{setup.secret}</code>
                </div>
                <form onSubmit={confirm} className="stack">
                  <input
                    className="input code-input"
                    value={code}
                    onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    inputMode="numeric"
                    placeholder="000000"
                  />
                  <button className="btn btn-primary" disabled={busy || code.length !== 6}>
                    {busy ? 'Confirming…' : 'Confirm & enable'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
