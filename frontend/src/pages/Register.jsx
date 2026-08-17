import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import SEO from '../components/SEO';
import { NOINDEX_ROBOTS } from '../seo/seoDefaults';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Register = () => {
  const navigate = useNavigate();
  const { user, register, loading, error, clearError } = useAuth();
  const toast = useToast();
  const [formState, setFormState] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [localError, setLocalError] = useState('');
  useEffect(() => { if (user) navigate('/', { replace: true }); }, [user, navigate]);
  useEffect(() => { clearError(); setFormState({ name: '', email: '', password: '', confirmPassword: '' }); setLocalError(''); }, [clearError]);
  const handleChange = (event) => setFormState((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  const handleSubmit = async (event) => {
    event.preventDefault(); setLocalError('');
    const { name, email, password, confirmPassword } = formState;
    if (!name.trim() || !email.trim() || !password.trim()) { setLocalError('Please fill in all fields.'); return; }
    if (password !== confirmPassword) { setLocalError('Passwords must match.'); return; }
    try { await register({ name, email, password }); toast.success('Account created successfully'); navigate('/', { replace: true }); } catch (submitError) { toast.error(submitError.message); setLocalError(submitError.message); }
  };

  return (
    <div className="page-shell flex min-h-[calc(100vh-10rem)] items-center">
      <SEO title="Create Account" robots={NOINDEX_ROBOTS} />
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2.2rem] border border-outline-variant/40 bg-surface-container-lowest shadow-xl lg:grid-cols-[0.85fr_1.15fr]">
        <div className="relative hidden overflow-hidden bg-secondary p-10 text-on-secondary lg:flex lg:flex-col lg:justify-between"><div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl" /><div className="relative"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-secondary/60">A better way to browse</p><h2 className="mt-5 max-w-xs font-display-lg text-5xl leading-[1.02]">Make room for good things.</h2></div><div className="relative space-y-3 text-sm text-on-secondary/70"><div className="h-px w-12 bg-on-secondary" /><p>Save the pieces that feel like you, and pick up where you left off whenever you like.</p></div></div>
        <Card variant="login" className="rounded-none border-0 p-7 shadow-none sm:p-10"><div className="mx-auto max-w-md space-y-7"><div><p className="eyebrow">New here</p><h1 className="mt-3 font-display-lg text-4xl leading-tight text-primary">Create your account.</h1><p className="mt-3 text-sm leading-6 text-on-surface-variant">Set up your ShopEase profile and start building your edit in minutes.</p></div><form className="space-y-5" onSubmit={handleSubmit}><Input id="name" name="name" type="text" label="Full name" value={formState.name} onChange={handleChange} placeholder="Jane Doe" autoComplete="name" /><Input id="email" name="email" type="email" label="Email" value={formState.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" /><Input id="password" name="password" type="password" label="Password" value={formState.password} onChange={handleChange} placeholder="••••••••" autoComplete="new-password" /><Input id="confirmPassword" name="confirmPassword" type="password" label="Confirm password" value={formState.confirmPassword} onChange={handleChange} placeholder="••••••••" autoComplete="new-password" />{(localError || error) && <p className="rounded-2xl bg-error-container px-4 py-3 text-sm text-error">{localError || error}</p>}<Button type="submit" className="w-full" disabled={loading} loading={loading} icon="arrow_forward">{loading ? 'Creating account...' : 'Create account'}</Button></form><p className="text-center text-sm text-on-surface-variant">Already have an account? <Link to="/login" className="font-bold text-secondary transition-colors hover:text-primary">Sign in</Link></p></div></Card>
      </div>
    </div>
  );
};

export default Register;
