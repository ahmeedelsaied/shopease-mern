import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-stack-xl">
      <div className="max-w-container-max mx-auto space-y-6">
        <div className="rounded-3xl bg-surface-container-low p-8">
          <h1 className="text-headline-lg font-headline-lg text-primary">Profile</h1>
          <p className="mt-2 text-body-md text-on-surface-variant">Manage your account details and orders.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <Card variant="panel" className="p-6">
            <h2 className="text-headline-sm font-headline-sm text-primary">Account details</h2>
            <div className="mt-4 space-y-2 text-body-md text-on-surface-variant">
              <p><span className="font-semibold text-on-surface">Name:</span> {user?.name || 'Guest'}</p>
              <p><span className="font-semibold text-on-surface">Email:</span> {user?.email || 'N/A'}</p>
              <p><span className="font-semibold text-on-surface">Role:</span> {user?.role || 'user'}</p>
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
      </div>
    </div>
  );
};

export default Profile;
