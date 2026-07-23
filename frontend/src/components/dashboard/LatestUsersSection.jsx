import { memo } from 'react';
import { Link } from 'react-router-dom';
import DashboardSection from './DashboardSection';
import { cn } from '../../styles/designSystem';

const formatDate = (iso) => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const ROLE_BADGE = {
  admin: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  user: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

/**
 * LatestUsersSection – renders a compact list of the 5 most recent registered
 * users. Each row links to the admin user detail page. Role badge colours
 * match the semantic palette (admin = rose, user = emerald).
 */
const LatestUsersSection = ({ latestUsers = [] }) => {
  if (!latestUsers.length) {
    return (
      <DashboardSection title="Latest Users" subtitle="5 most recent registrations">
        <p className="text-sm text-on-surface-variant text-center py-4">
          No users registered yet. New users will appear here.
        </p>
      </DashboardSection>
    );
  }

  return (
    <DashboardSection title="Latest Users" subtitle="5 most recent registrations">
      <div className="divide-y divide-outline-variant/20">
        {latestUsers.map((user) => {
          const badgeClass = ROLE_BADGE[user.role] ?? ROLE_BADGE.user;
          return (
            <Link
              key={user._id}
              to={`/admin/users/${user._id}`}
              className="flex flex-wrap items-center justify-between gap-4 p-4 hover:bg-surface-container-low/50 transition-colors"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-body-md font-medium text-primary truncate">
                  {user.name}
                </p>
                <p className="text-sm text-on-surface-variant truncate">{user.email}</p>
                <p className="text-xs text-on-surface-variant/70">
                  Joined {formatDate(user.createdAt)}
                </p>
              </div>
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  badgeClass
                )}
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </Link>
          );
        })}
      </div>
    </DashboardSection>
  );
};

LatestUsersSection.displayName = 'LatestUsersSection';

export default memo(LatestUsersSection);