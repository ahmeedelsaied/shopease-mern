import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Toast from '../components/ui/Toast';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile, changePassword, loading, error, clearError } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', email: user.email || '' });
    }
  }, [user]);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setFormError('Name and email are required');
      return;
    }

    try {
      await updateProfile(profileForm);
      setSuccessMessage('Profile updated successfully');
    } catch (updateError) {
      setFormError(updateError.message);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setFormError('Both password fields are required');
      return;
    }

    try {
      await changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setSuccessMessage('Password updated successfully');
    } catch (passwordError) {
      setFormError(passwordError.message);
    }
  };

  if (!user) {
    return (
      <div className="px-margin-mobile md:px-margin-desktop py-stack-xl">
        <div className="max-w-container-max mx-auto">
          <EmptyState
            icon="person"
            title="Your profile is empty"
            description="Sign in to manage your account details."
            actionLabel="Sign in"
            actionTo="/login"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-stack-xl">
      <div className="max-w-container-max mx-auto space-y-6">
        <div className="rounded-3xl bg-surface-container-low p-8">
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

      <Toast
        message={successMessage || formError || error || ''}
        isVisible={Boolean(successMessage || formError || error)}
        onClose={() => {
          setSuccessMessage('');
          setFormError('');
          clearError();
        }}
        icon={successMessage ? 'check_circle' : 'error'}
        variant="status"
      />
    </div>
  );
};

export default Profile;
