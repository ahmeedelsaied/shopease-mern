import { useEffect, useState } from 'react';
import api from '../services/api';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/EmptyState';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [status, setStatus] = useState('pending');
  const [toast, setToast] = useState('');

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
      setToast(fetchError?.response?.data?.message || 'Unable to load order details');
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;

    try {
      await api.put(`/admin/orders/${selectedOrder._id}/status`, { status });
      setToast('Order status updated successfully');
      setSelectedOrder(null);
      fetchOrders();
    } catch (updateError) {
      setToast(updateError?.response?.data?.message || 'Unable to update order status');
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Delete this order?')) return;

    try {
      await api.delete(`/admin/orders/${orderId}`);
      setToast('Order deleted successfully');
      fetchOrders();
    } catch (deleteError) {
      setToast(deleteError?.response?.data?.message || 'Unable to delete order');
    }
  };

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-stack-xl">
      <div className="mx-auto max-w-container-max space-y-8">
        <div>
          <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">Administration</p>
          <h1 className="text-headline-lg font-headline-lg text-primary">Orders Management</h1>
        </div>

        {toast ? <div className="rounded-2xl bg-primary/10 p-4 text-sm text-primary">{toast}</div> : null}

        {loading ? (
          <Card variant="panel" className="p-6"><Loader lines={6} /></Card>
        ) : error ? (
          <EmptyState title="Orders unavailable" description={error} icon="receipt_long" />
        ) : !orders.length ? (
          <EmptyState title="No orders found" description="Orders will appear here once customers place them." icon="receipt_long" />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order._id} variant="panel" className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-headline-sm font-headline-sm text-primary">{order.orderNumber}</h2>
                  <p className="text-body-md text-on-surface-variant">{order.user?.name || 'Customer'}</p>
                  <p className="mt-2 text-sm text-on-surface-variant">Status: {order.status} · Total: ${order.total}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={() => openDetails(order)}>View Details</Button>
                  <Button variant="primary" onClick={() => handleDelete(order._id)}>Delete</Button>
                </div>
              </Card>
            ))}
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
