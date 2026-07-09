import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Profile = () => {
  const { user, updateProfile, changePassword, loading, error } = useAuth();
  const toast = useToast();
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', email: user.email || '' });
    }
  }, [user]);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setFormError('Name and email are required');
      toast.warning('Name and email are required');
      return;
    }

    try {
      await updateProfile(profileForm);
      toast.success('Profile updated successfully');
    } catch (updateError) {
      toast.error(updateError.message);
      setFormError(updateError.message);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setFormError('Both password fields are required');
      toast.warning('Both password fields are required');
      return;
    }

    try {
      await changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      toast.success('Password updated successfully');
    } catch (passwordError) {
      toast.error(passwordError.message);
      setFormError(passwordError.message);
    }
  };

  if (!user) {
    return (
      <div className="px-margin-mobile py-stack-xl md:px-margin-desktop">
        <div className="mx-auto max-w-container-max">
          <EmptyState
            icon="person"
            title="Your profile is empty"
            description="Sign in to manage your account details, orders, and security preferences."
            actionLabel="Sign in"
            actionTo="/login"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-margin-mobile py-stack-xl md:px-margin-desktop">
      <div className="mx-auto max-w-container-max space-y-6">
        <div className="rounded-[2rem] border border-outline-variant/30 bg-surface-container-low/80 p-8 shadow-soft">
          <h1 className="text-headline-lg font-headline-lg text-primary">Profile</h1>
          <p className="mt-2 text-body-md text-on-surface-variant">Manage your account details and security.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <Card variant="panel" className="p-6">
            <h2 className="text-headline-sm font-headline-sm text-primary">Account details</h2>
            <div className="mt-4 space-y-2 text-body-md text-on-surface-variant">
              <p><span className="font-semibold text-on-surface">Name:</span> {user.name || 'Guest'}</p>
              <p><span className="font-semibold text-on-surface">Email:</span> {user.email || 'N/A'}</p>
              <p><span className="font-semibold text-on-surface">Role:</span> {user.role || 'user'}</p>
            </div>
          </Card>

          <Card variant="panel" className="p-6">
            <h2 className="text-headline-sm font-headline-sm text-primary">Quick actions</h2>
            <div className="mt-4 space-y-3">
              <Link to="/orders">
                <Button variant="primary" className="w-full">View orders</Button>
              </Link>
              <Link to="/cart">
                <Button variant="ghost" className="w-full">Go to cart</Button>
              </Link>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card variant="panel" className="p-6">
            <h2 className="text-headline-sm font-headline-sm text-primary">Edit profile</h2>
            <form className="mt-4 space-y-4" onSubmit={handleProfileSubmit}>
              <Input
                label="Name"
                id="profile-name"
                value={profileForm.name}
                onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
              />
              <Input
                label="Email"
                id="profile-email"
                type="email"
                value={profileForm.email}
                onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
              />
              {(formError || error) ? <p className="text-sm text-error">{formError || error}</p> : null}
              <Button variant="primary" className="w-full" type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update profile'}
              </Button>
            </form>
          </Card>

          <Card variant="panel" className="p-6">
            <h2 className="text-headline-sm font-headline-sm text-primary">Change password</h2>
            <form className="mt-4 space-y-4" onSubmit={handlePasswordSubmit}>
              <Input
                label="Current password"
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
              />
              <Input
                label="New password"
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
              />
              <Button variant="ghost" className="w-full" type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Change password'}
              </Button>
            </form>
          </Card>
        </div>
      </div>

    </div>
  );
};

export default Profile;
