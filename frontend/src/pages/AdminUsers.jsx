import { useEffect, useState } from 'react';
import api from '../services/api';
import EmptyState from '../components/EmptyState';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import SEO from '../components/SEO';
import { NOINDEX_FOLLOW_ROBOTS } from '../seo/seoDefaults';
import { TableSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState('user');
  const toast = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/admin/users');
      setUsers(response.data?.data ?? []);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || 'Unable to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async () => {
    if (!selectedUser) return;

    try {
      await api.put(`/admin/users/${selectedUser._id}/role`, { role });
      toast.success('Role updated successfully');
      setSelectedUser(null);
      fetchUsers();
    } catch (updateError) {
      toast.error(updateError?.response?.data?.message || 'Unable to update role');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user?')) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (deleteError) {
      toast.error(deleteError?.response?.data?.message || 'Unable to delete user');
    }
  };

  return (
    <div className="page-shell admin-shell">
      <SEO title="Admin Users" robots={NOINDEX_FOLLOW_ROBOTS} />
      <div className="mx-auto max-w-container-max space-y-8">
        <div>
          <p className="eyebrow">Operations / people</p>
          <h1 className="mt-3 font-display-lg text-5xl leading-none text-primary">Users.</h1>
          <p className="mt-3 max-w-xl text-sm text-on-surface-variant">Manage access thoughtfully and keep the team aligned.</p>
        </div>

        {loading ? (
          <TableSkeleton rows={6} columns={4} />
        ) : error ? (
          <EmptyState title="Users unavailable" description={error} icon="group_off" />
        ) : !users.length ? (
          <EmptyState title="No users found" description="There are no registered users yet." icon="person_off" />
        ) : (
          <div className="table-wrap bg-surface-container-lowest shadow-soft">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-outline-variant/40 text-left">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-4">Name</th>
                    <th className="px-4 py-4">Email</th>
                    <th className="px-4 py-4">Role</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
                  {users.map((user) => (
                    <tr key={user._id} className="odd:bg-surface-container-lowest even:bg-surface-container-low transition-colors hover:bg-surface-container-high">
                      <td className="px-4 py-4 font-medium text-primary">{user.name}</td>
                      <td className="px-4 py-4 text-on-surface-variant">{user.email}</td>
                      <td className="px-4 py-4 capitalize text-on-surface-variant">{user.role}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="secondary" onClick={() => { setSelectedUser(user); setRole(user.role); }} icon="edit">Edit role</Button>
                          <Button size="sm" variant="ghost" className="!w-auto text-error hover:bg-error-container/50" onClick={() => handleDelete(user._id)} icon="delete">Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)}>
        <div className="space-y-4 p-2">
          <h2 className="text-headline-sm font-headline-sm text-primary">Edit user role</h2>
          <Input label="Role" value={role} onChange={(event) => setRole(event.target.value)} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setSelectedUser(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleRoleChange}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsers;
