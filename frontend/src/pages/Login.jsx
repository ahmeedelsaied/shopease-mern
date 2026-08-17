import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import SEO from '../components/SEO';
import { NOINDEX_ROBOTS } from '../seo/seoDefaults';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, loading, error, clearError } = useAuth();
  const toast = useToast();
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState('');
  const redirectTo = location.state?.from?.pathname?.startsWith('/') ? `${location.state.from.pathname}${location.state.from.search || ''}${location.state.from.hash || ''}` : '/';

  useEffect(() => { if (user) navigate(redirectTo, { replace: true }); }, [user, navigate, redirectTo]);
  useEffect(() => { clearError(); setFormState({ email: '', password: '' }); setLocalError(''); }, [clearError]);
  const handleChange = (event) => setFormState((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  const handleSubmit = async (event) => {
    event.preventDefault(); setLocalError('');
    const { email, password } = formState;
    if (!email.trim() || !password.trim()) { setLocalError('Please enter both email and password.'); return; }
    try { await login({ email, password }); toast.success('Signed in successfully'); } catch (submitError) { toast.error(submitError.message); setLocalError(submitError.message); }
  };

  return (
    <div className="page-shell flex min-h-[calc(100vh-10rem)] items-center">
      <SEO title="Sign In" robots={NOINDEX_ROBOTS} />
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2.2rem] border border-outline-variant/40 bg-surface-container-lowest shadow-xl lg:grid-cols-[0.85fr_1.15fr]">
        <div className="relative hidden overflow-hidden bg-primary p-10 text-on-primary lg:flex lg:flex-col lg:justify-between"><div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-secondary/30 blur-3xl" /><div className="relative"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-fixed/60">Welcome back</p><h2 className="mt-5 max-w-xs font-display-lg text-5xl leading-[1.02]">Good to see you again.</h2></div><div className="relative space-y-3 text-sm text-primary-fixed/65"><div className="h-px w-12 bg-secondary" /><p>Keep your edit close. Your saved pieces, orders, and preferences are waiting.</p></div></div>
        <Card variant="login" className="rounded-none border-0 p-7 shadow-none sm:p-10">
          <div className="mx-auto max-w-md space-y-7"><div><p className="eyebrow">Your account</p><h1 className="mt-3 font-display-lg text-4xl leading-tight text-primary">Sign in to ShopEase.</h1><p className="mt-3 text-sm leading-6 text-on-surface-variant">Access your account, orders, and saved preferences in one place.</p></div><form className="space-y-5" onSubmit={handleSubmit}><Input id="email" name="email" type="email" label="Email" value={formState.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" /><Input id="password" name="password" type="password" label="Password" value={formState.password} onChange={handleChange} placeholder="••••••••" autoComplete="current-password" />{(localError || error) && <p className="rounded-2xl bg-error-container px-4 py-3 text-sm text-error">{localError || error}</p>}<Button type="submit" className="w-full" disabled={loading} loading={loading} icon="arrow_forward">{loading ? 'Signing in...' : 'Sign in'}</Button></form><p className="text-center text-sm text-on-surface-variant">Don’t have an account? <Link to="/register" className="font-bold text-secondary transition-colors hover:text-primary">Create one</Link></p></div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
