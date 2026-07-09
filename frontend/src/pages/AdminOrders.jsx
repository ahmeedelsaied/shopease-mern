import { useEffect, useState } from 'react';
import api from '../services/api';
import EmptyState from '../components/EmptyState';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { TableSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [status, setStatus] = useState('pending');
  const toast = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data?.data ?? []);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || 'Unable to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openDetails = async (order) => {
    try {
      const response = await api.get(`/admin/orders/${order._id}`);
      setSelectedOrder(response.data?.data ?? order);
      setStatus(response.data?.data?.status || 'pending');
    } catch (fetchError) {
      toast.error(fetchError?.response?.data?.message || 'Unable to load order details');
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;

    try {
      await api.put(`/admin/orders/${selectedOrder._id}/status`, { status });
      toast.success('Order status updated successfully');
      setSelectedOrder(null);
      fetchOrders();
    } catch (updateError) {
      toast.error(updateError?.response?.data?.message || 'Unable to update order status');
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Delete this order?')) return;

    try {
      await api.delete(`/admin/orders/${orderId}`);
      toast.success('Order deleted successfully');
      fetchOrders();
    } catch (deleteError) {
      toast.error(deleteError?.response?.data?.message || 'Unable to delete order');
    }
  };

  return (
    <div className="px-margin-mobile py-stack-xl md:px-margin-desktop">
      <div className="mx-auto max-w-container-max space-y-8">
        <div>
          <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">Administration</p>
          <h1 className="text-headline-lg font-headline-lg text-primary">Orders Management</h1>
        </div>

        {loading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : error ? (
          <EmptyState title="Orders unavailable" description={error} icon="receipt_long" />
        ) : !orders.length ? (
          <EmptyState title="No orders found" description="Orders will appear here once customers place them." icon="receipt_long" />
        ) : (
          <div className="overflow-hidden rounded-[2rem] border border-outline-variant/30 bg-surface-container-lowest shadow-soft">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-outline-variant/40 text-left">
                <thead className="sticky top-0 z-10 bg-surface-container-low text-sm uppercase tracking-[0.2em] text-on-surface-variant">
                  <tr>
                    <th className="px-4 py-4">Order</th>
                    <th className="px-4 py-4">Customer</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Total</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
                  {orders.map((order) => (
                    <tr key={order._id} className="odd:bg-surface-container-lowest even:bg-surface-container-low transition-colors hover:bg-surface-container-high">
                      <td className="px-4 py-4">
                        <div className="font-medium text-primary">{order.orderNumber}</div>
                        <div className="text-sm text-on-surface-variant">{order.items?.length || 0} items</div>
                      </td>
                      <td className="px-4 py-4 text-on-surface-variant">{order.user?.name || 'Customer'}</td>
                      <td className="px-4 py-4 capitalize text-on-surface-variant">{order.status}</td>
                      <td className="px-4 py-4 text-on-surface-variant">${order.total}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="secondary" onClick={() => openDetails(order)}>View</Button>
                          <Button size="sm" variant="primary" onClick={() => handleDelete(order._id)}>Delete</Button>
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

      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)}>
        <div className="space-y-4 p-2">
          <h2 className="text-headline-sm font-headline-sm text-primary">Order details</h2>
          {selectedOrder ? (
            <>
              <p className="text-sm text-on-surface-variant">Order Number: {selectedOrder.orderNumber}</p>
              <p className="text-sm text-on-surface-variant">Customer: {selectedOrder.user?.name || 'Customer'}</p>
              <p className="text-sm text-on-surface-variant">Address: {selectedOrder.shippingAddress?.address}</p>
              <div className="space-y-2">
                {selectedOrder.items?.map((item) => (
                  <div key={`${item.productId}-${item.name}`} className="rounded-2xl bg-surface-container-low p-3 text-sm text-on-surface-variant">
                    {item.name} × {item.quantity}
                  </div>
                ))}
              </div>
              <Input label="Status" value={status} onChange={(event) => setStatus(event.target.value)} />
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setSelectedOrder(null)}>Close</Button>
                <Button variant="primary" onClick={handleStatusUpdate}>Update</Button>
              </div>
            </>
          ) : null}
        </div>
      </Modal>
    </div>
  );
};

export default AdminOrders;
