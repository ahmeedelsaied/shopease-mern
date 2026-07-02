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
    <div className="px-margin-mobile md:px-margin-desktop py-stack-xl">
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
          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user._id} variant="panel" className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-headline-sm font-headline-sm text-primary">{user.name}</h2>
                  <p className="text-body-md text-on-surface-variant">{user.email}</p>
                  <p className="mt-2 text-sm text-on-surface-variant">Role: {user.role}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={() => { setSelectedUser(user); setRole(user.role); }}>Edit Role</Button>
                  <Button variant="primary" onClick={() => handleDelete(user._id)}>Delete</Button>
                </div>
              </Card>
            ))}
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
