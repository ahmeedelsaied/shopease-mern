import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

/**
 * OrderSuccess – shown after a checkout completes.
 *
 * Fetches the order so it can display a real summary (items, total, status).
 * Provides a "Track order" link, "Continue shopping", and a placeholder
 * "Download invoice" button (downloads a plain-text receipt).
 */
const OrderSuccess = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const { success } = useToast();
  const shownToastRef = useRef(false);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (location.state?.toastMessage && !shownToastRef.current) {
      shownToastRef.current = true;
      success(location.state.toastMessage);
    }
  }, [location.state, success]);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data?.data ?? null);
      } catch {
        /* order details are optional — the page works with just orderId */
      }
    };
    fetchOrder();
  }, [orderId]);

  const formattedTotal = useMemo(
    () => (order ? `$${(order.total || 0).toFixed(2)}` : null),
    [order],
  );

  const handleDownloadInvoice = () => {
    if (!order) return;
    const lines = [
      '==============================',
      '      ShopEase Invoice',
      '==============================',
      '',
      `Order: ${order.orderNumber || orderId}`,
      `Date:  ${new Date(order.createdAt).toLocaleString()}`,
      '',
      '--- Items ---',
      ...order.items.map(
        (item) => `  ${item.name}  x${item.quantity}   $${(item.price * item.quantity).toFixed(2)}`,
      ),
      '',
      `Total: $${(order.total || 0).toFixed(2)}`,
      '',
      `Payment: ${order.paymentMethod || 'Cash on Delivery'}`,
      `Ship to: ${order.shippingAddress?.fullName || '—'}`,
      `          ${order.shippingAddress?.address || ''}`,
      `          ${order.shippingAddress?.city || ''} ${order.shippingAddress?.zipCode || ''}`,
      '',
      'Thank you for shopping with ShopEase!',
      '==============================',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.orderNumber || orderId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-stack-xl">
      <div className="max-w-container-max mx-auto">
        <Card variant="panel" className="mx-auto max-w-2xl p-8 text-center">
          {/* Animated checkmark */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary animate-bounce">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>

          <h1 className="mt-6 text-headline-lg font-headline-lg text-primary">
            Order placed successfully!
          </h1>
          <p className="mt-3 text-body-md text-on-surface-variant">
            Your order has been received and is being prepared for delivery.
          </p>
          <p className="mt-2 text-sm font-medium text-on-surface-variant">
            Order ID: {orderId}
          </p>

          {/* Order summary section */}
          {order ? (
            <div className="mt-8 text-left rounded-2xl bg-surface-container-low/60 p-5">
              <h2 className="text-headline-sm font-headline-sm text-primary">Order Summary</h2>
              <ul className="mt-4 space-y-3">
                {order.items?.map((item) => (
                  <li
                    key={`${item.productId}-${item.name}`}
                    className="flex items-center justify-between text-body-md text-on-surface-variant"
                  >
                    <span>
                      {item.name} &times; {item.quantity}
                    </span>
                    <span className="font-medium text-on-surface">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t border-outline-variant/40 pt-3">
                <div className="flex justify-between text-headline-sm font-headline-sm text-primary">
                  <span>Total</span>
                  <span>{formattedTotal}</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Action buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {orderId ? (
              <Link to={`/orders/${orderId}`}>
                <Button variant="primary">Track order</Button>
              </Link>
            ) : null}
            <Link to="/orders">
              <Button variant="secondary">View orders</Button>
            </Link>
            <Link to="/">
              <Button variant="ghost">Continue shopping</Button>
            </Link>
          </div>

          {/* Download invoice placeholder */}
          {order ? (
            <button
              type="button"
              onClick={handleDownloadInvoice}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                download
              </span>
              Download invoice
            </button>
          ) : null}
        </Card>
      </div>
    </div>
  );
};

export default OrderSuccess;
