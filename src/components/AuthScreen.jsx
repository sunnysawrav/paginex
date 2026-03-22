import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function AuthScreen({ onBack }) {
  const { login, resetPassword } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const clearState = () => {
    setError('');
    setMessage('');
    setPassword('');
  };

  const handleSubmit = async () => {
    setError('');
    setMessage('');

    if (!email) { setError('Please enter your email.'); return; }

    if (mode === 'reset') {
      try {
        setLoading(true);
        // Check if account exists before sending reset email.
        // Attempt sign-in with a dummy password — wrong-password means the
        // account exists. user-not-found means it doesn't.
        await signInWithEmailAndPassword(auth, email, '__dummy_check__');
      } catch (e) {
        if (e.code === 'auth/wrong-password') {
          // Account exists, wrong password expected — safe to send reset
          try {
            await resetPassword(email);
            setMessage('Password reset email sent. Check your inbox.');
          } catch (resetErr) {
            setError(friendlyError(resetErr.code));
          }
        } else if (e.code === 'auth/invalid-credential') {
          // Newer Firebase SDKs use this for both wrong-password and no-account.
          // Send reset and let Firebase handle it silently.
          try {
            await resetPassword(email);
            setMessage('If an account exists for this email, a reset link has been sent.');
          } catch (resetErr) {
            setError(friendlyError(resetErr.code));
          }
        } else if (e.code === 'auth/user-not-found') {
          setError('No account found with this email address.');
        } else if (e.code === 'auth/invalid-email') {
          setError('Please enter a valid email address.');
        } else if (e.code === 'auth/too-many-requests') {
          setError('Too many attempts. Please try again later.');
        } else {
          setError(friendlyError(e.code));
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) { setError('Please enter your password.'); return; }

    try {
      setLoading(true);
      await login(email, password);
    } catch (e) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
  };

  const friendlyError = (code) => {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection.';
      default:
        return 'Something went wrong. Please try again.';
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">

        {/* Back to landing */}
        {onBack && (
          <button className="auth-back-btn" onClick={onBack}>
            <ArrowLeft size={13} /> Back
          </button>
        )}

        {/* Logo */}
        <div className="auth-logo">
          <img src="/paginex/paginex_logo.svg" alt="Paginex" style={{ width: 104, height: 104, objectFit: 'contain' }} />
        </div>

        {/* Title */}
        <div className="auth-title">
          {mode === 'login' && 'Sign in to your account'}
          {mode === 'reset' && 'Reset your password'}
        </div>

        {/* Fields */}
        <div className="auth-fields">
          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
          </div>

          {mode === 'login' && (
            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          )}
        </div>

        {/* Error / Message */}
        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-message">{message}</div>}

        {/* Submit */}
        <button
          className="auth-submit"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Please wait…' : (
            mode === 'login' ? 'Sign In' : 'Send Reset Email'
          )}
        </button>

        {/* Footer links */}
        <div className="auth-footer">
          {mode === 'login' && (
            <button onClick={() => { setMode('reset'); clearState(); }}>
              Forgot password?
            </button>
          )}
          {mode === 'reset' && (
            <button onClick={() => { setMode('login'); clearState(); }}>
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}