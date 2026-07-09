import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const { user, login, loading, error, clearError } = useAuth();
  const toast = useToast();
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    clearError();
    setFormState({ email: '', password: '' });
    setLocalError('');
  }, [clearError]);

  const handleChange = (event) => {
    setFormState((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');

    const { email, password } = formState;
    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both email and password.');
      return;
    }

    try {
      await login({ email, password });
      toast.success('Signed in successfully');
      navigate('/', { replace: true });
    } catch (submitError) {
      toast.error(submitError.message);
      setLocalError(submitError.message);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-margin-mobile py-stack-lg md:px-margin-desktop">
      <Card variant="login" className="w-full max-w-md">
        <div className="space-y-6">
          <div>
            <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-secondary">Welcome back</p>
            <h1 className="mt-2 text-headline-lg font-headline-lg text-primary">Sign in to ShopEase</h1>
            <p className="mt-stack-sm text-body-md text-on-surface-variant">
              Access your account, orders, and saved preferences in one place.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              value={formState.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              value={formState.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            {(localError || error) && <p className="text-sm text-error">{localError || error}</p>}

            <Button type="submit" className="w-full" disabled={loading} loading={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="text-center text-body-sm text-on-surface-variant">
            Don’t have an account?{' '}
            <Link to="/register" className="font-semibold text-primary">
              Create one
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
