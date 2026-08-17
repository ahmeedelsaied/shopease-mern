import { useEffect, useState } from 'react';
import api from '../services/api';
import EmptyState from '../components/EmptyState';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import SortDropdown from '../components/filters/SortDropdown';
import SEO from '../components/SEO';
import { NOINDEX_FOLLOW_ROBOTS } from '../seo/seoDefaults';
import { TableSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import OrderTimeline from '../components/OrderTimeline';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

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
    <div className="page-shell admin-shell">
      <SEO title="Admin Orders" robots={NOINDEX_FOLLOW_ROBOTS} />
      <div className="mx-auto max-w-container-max space-y-8">
        <div>
          <p className="eyebrow">Operations / fulfillment</p>
          <h1 className="mt-3 font-display-lg text-5xl leading-none text-primary">Orders.</h1>
          <p className="mt-3 max-w-xl text-sm text-on-surface-variant">Keep every handoff visible, from pending to delivered.</p>
        </div>

        {loading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : error ? (
          <EmptyState title="Orders unavailable" description={error} icon="receipt_long" />
        ) : !orders.length ? (
          <EmptyState title="No orders found" description="Orders will appear here once customers place them." icon="receipt_long" />
        ) : (
          <div className="table-wrap bg-surface-container-lowest shadow-soft">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-outline-variant/40 text-left">
                <thead className="sticky top-0 z-10">
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
                          <Button size="sm" variant="secondary" onClick={() => openDetails(order)} icon="visibility">View</Button>
                          <Button size="sm" variant="ghost" className="!w-auto text-error hover:bg-error-container/50" onClick={() => handleDelete(order._id)} icon="delete">Delete</Button>
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
              <div className="rounded-2xl bg-surface-container-low/60 p-4">
                <OrderTimeline
                  status={selectedOrder.status}
                  timestamps={selectedOrder.statusHistory}
                  updatedAt={selectedOrder.updatedAt}
                />
              </div>
              <SortDropdown
                id="admin-order-status"
                label="Status"
                options={statusOptions}
                value={status}
                onChange={setStatus}
              />
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
