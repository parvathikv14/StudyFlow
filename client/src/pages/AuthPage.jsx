import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Target } from 'lucide-react';
import { useAuth } from '../state/AuthContext.jsx';

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { user, authenticate } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  }

  async function submit(event) {
    event.preventDefault();
    if (isRegister && form.name.trim().length < 2) return setError('Please enter your name (at least 2 characters).');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Please enter a valid email address.');
    if (form.password.length < 8) return setError('Your password must be at least 8 characters.');
    setBusy(true);
    try {
      await authenticate(isRegister ? 'register' : 'login', {
        ...(isRegister ? { name: form.name.trim() } : {}),
        email: form.email.trim(),
        password: form.password
      });
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-top"><Link to="/" className="brand"><span className="brand-mark"><Target size={19} /></span><span>studyflow<span className="brand-dot">.</span></span></Link><Link to="/" className="auth-back"><ArrowLeft size={15} /> Back to home</Link></div>
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-intro"><span className="auth-icon"><Target size={20} /></span><span className="eyebrow">{isRegister ? 'YOUR NEXT CHAPTER STARTS HERE' : 'WELCOME BACK'}</span><h1>{isRegister ? 'Make space for progress.' : 'Good to see you again.'}</h1><p>{isRegister ? 'Set up your personal study space and start tackling things one step at a time.' : 'Sign in to pick up right where you left off.'}</p></div>
          {error && <div className="form-error" role="alert">{error}</div>}
          <form className="auth-form" onSubmit={submit} noValidate>
            {isRegister && <label>Your name<input name="name" type="text" autoComplete="name" value={form.name} onChange={update} placeholder="e.g. Alex Morgan" maxLength={60} required /></label>}
            <label>Email address<input name="email" type="email" autoComplete="email" value={form.email} onChange={update} placeholder="you@example.com" required /></label>
            <label>Password<div className="password-wrap"><input name="password" type={showPassword ? 'text' : 'password'} autoComplete={isRegister ? 'new-password' : 'current-password'} value={form.password} onChange={update} placeholder="At least 8 characters" minLength={8} maxLength={72} required /><button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{isRegister && <span className="field-note"><Check size={12} /> Use at least 8 characters</span>}</label>
            <button type="submit" className="button button-primary auth-submit" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Create your account' : 'Sign in'} {!busy && <ArrowRight size={16} />}</button>
          </form>
          <p className="auth-switch">{isRegister ? 'Already have an account?' : 'New to StudyFlow?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Log in' : 'Create an account'}</Link></p>
        </div>
        <div className="auth-footnote"><span><Check size={13} /> Your progress belongs to you</span><i /><span>Simple, private, and always yours</span></div>
      </div>
    </main>
  );
}
