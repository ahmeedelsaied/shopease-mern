import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { user, login, loading, error, clearError } = useAuth();
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    clearError();
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
      navigate('/', { replace: true });
    } catch (submitError) {
      setLocalError(submitError.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-margin-mobile md:px-margin-desktop py-stack-lg">
      <Card variant="login" className="w-full max-w-md">
        <div className="space-y-6">
          <div>
            <h1 className="text-headline-lg font-headline-lg text-primary">Welcome back</h1>
            <p className="mt-stack-sm text-body-md text-on-surface-variant">
              Sign in to access your ShopEase account.
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

            {(localError || error) && (
              <p className="text-error text-body-sm">{localError || error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="text-body-sm text-on-surface-variant text-center">
            Don’t have an account?{' '}
            <Link to="/register" className="text-primary font-semibold">
              Create one
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
