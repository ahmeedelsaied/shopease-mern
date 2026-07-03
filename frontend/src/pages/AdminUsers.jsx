import { useEffect, useState } from 'react';
import api from '../services/api';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/EmptyState';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState('user');
  const [toast, setToast] = useState('');

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
      setToast('Role updated successfully');
      setSelectedUser(null);
      fetchUsers();
    } catch (updateError) {
      setToast(updateError?.response?.data?.message || 'Unable to update role');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user?')) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      setToast('User deleted successfully');
      fetchUsers();
    } catch (deleteError) {
      setToast(deleteError?.response?.data?.message || 'Unable to delete user');
    }
  };

  return (
    <div className="px-margin-mobile py-stack-xl md:px-margin-desktop">
      <div className="mx-auto max-w-container-max space-y-8">
        <div>
          <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">Administration</p>
          <h1 className="text-headline-lg font-headline-lg text-primary">Users Management</h1>
        </div>

        {toast ? <div className="rounded-2xl bg-primary/10 p-4 text-sm text-primary">{toast}</div> : null}

        {loading ? (
          <Card variant="panel" className="p-6"><Loader lines={6} /></Card>
        ) : error ? (
          <EmptyState title="Users unavailable" description={error} icon="group_off" />
        ) : !users.length ? (
          <EmptyState title="No users found" description="There are no registered users yet." icon="person_off" />
        ) : (
          <div className="overflow-hidden rounded-[2rem] border border-outline-variant/30 bg-surface-container-lowest shadow-soft">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-outline-variant/40 text-left">
                <thead className="sticky top-0 z-10 bg-surface-container-low text-sm uppercase tracking-[0.2em] text-on-surface-variant">
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
                          <Button size="sm" variant="secondary" onClick={() => { setSelectedUser(user); setRole(user.role); }}>Edit Role</Button>
                          <Button size="sm" variant="primary" onClick={() => handleDelete(user._id)}>Delete</Button>
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
