import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { user, register, loading, error, clearError } = useAuth();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    clearError();
    setFormState({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
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

    const { name, email, password, confirmPassword } = formState;
    if (!name.trim() || !email.trim() || !password.trim()) {
      setLocalError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords must match.');
      return;
    }

    try {
      await register({ name, email, password });
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
            <h1 className="text-headline-lg font-headline-lg text-primary">Create your account</h1>
            <p className="mt-stack-sm text-body-md text-on-surface-variant">
              Set up your ShopEase profile and start shopping.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              id="name"
              name="name"
              type="text"
              label="Full name"
              value={formState.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              autoComplete="name"
            />
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
              autoComplete="new-password"
            />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm password"
              value={formState.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="new-password"
            />

            {(localError || error) && (
              <p className="text-error text-body-sm">{localError || error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="text-body-sm text-on-surface-variant text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;
