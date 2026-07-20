import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Confetti from '../components/Confetti';
import { Skeleton, SkeletonText } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

/**
 * OrderSuccess – shown after a checkout completes.
 *
 * Fetches the order so it can display a real summary (order number, items,
 * total, estimated delivery). Shows a CSS-only confetti burst and an animated
 * success icon, then "View order" and "Continue shopping" actions. A skeleton
 * is rendered while the order is being fetched so the page never appears blank.
 */

const CONFETTI_DURATION_MS = 3000;

// Estimated delivery is computed client-side as a presentational nicety:
// 5 business days from the order date. No backend commitment is made.
const BUSINESS_DAYS_LEAD_TIME = 5;

const addToDateByBusinessDays = (startDate, days) => {
  const date = new Date(startDate);
  let remaining = days;
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) remaining -= 1; // skip Sat(6)/Sun(0)
  }
  return date;
};

const formatEstimatedDelivery = (createdAt) => {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;
  const delivery = addToDateByBusinessDays(date, BUSINESS_DAYS_LEAD_TIME);
  return delivery.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const OrderSuccess = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const { success } = useToast();
  const shownToastRef = useRef(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (location.state?.toastMessage && !shownToastRef.current) {
      shownToastRef.current = true;
      success(location.state.toastMessage);
    }
  }, [location.state, success]);

  useEffect(() => {
    // Hide the confetti after the animation completes so the layer does not
    // linger (and pointer-events:none pieces don't sit in the DOM forever).
    const timerId = setTimeout(() => setShowConfetti(false), CONFETTI_DURATION_MS);
    return () => clearTimeout(timerId);
  }, []);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return undefined;
    }
    let active = true;
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        if (active) setOrder(response.data?.data ?? null);
      } catch {
        // Order details are optional — the page works with just `orderId`.
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchOrder();
    return () => {
      active = false;
    };
  }, [orderId]);

  const formattedTotal = useMemo(
    () => (order ? `$${(order.total || 0).toFixed(2)}` : null),
    [order],
  );

  const estimatedDelivery = useMemo(
    () => (order ? formatEstimatedDelivery(order.createdAt) : null),
    [order],
  );

  const displayOrderNumber = order?.orderNumber || orderId;

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
      {showConfetti ? <Confetti /> : null}

      <div className="max-w-container-max mx-auto">
        <Card variant="panel" className="mx-auto max-w-2xl p-8 text-center">
          {loading ? (
            <div className="space-y-4 text-left" aria-busy="true">
              <div className="mx-auto flex h-20 w-20">
                <Skeleton className="h-20 w-20 rounded-full" />
              </div>
              <Skeleton className="mx-auto h-8 w-56" />
              <Skeleton className="mx-auto h-5 w-72" />
              <SkeletonText lines={4} className="mt-4" />
            </div>
          ) : (
            <>
              {/* Animated checkmark with a celebratory pop (CSS only). */}
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary animate-success-pop">
                <span className="material-symbols-outlined text-4xl" aria-hidden="true">check_circle</span>
              </div>

              <h1 className="mt-6 text-headline-lg font-headline-lg text-primary">
                Order placed successfully!
              </h1>
              <p className="mt-3 text-body-md text-on-surface-variant">
                Your order has been received and is being prepared for delivery.
              </p>

              <p className="mt-2 text-sm font-medium text-on-surface-variant">
                Order number: <span className="text-primary">{displayOrderNumber}</span>
              </p>

              {estimatedDelivery ? (
                <p className="mt-1 text-sm text-on-surface-variant">
                  Estimated delivery: <span className="font-medium text-on-surface">{estimatedDelivery}</span>
                </p>
              ) : null}

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
                    <Button variant="primary">View order</Button>
                  </Link>
                ) : null}
                <Link to="/">
                  <Button variant="secondary">Continue shopping</Button>
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
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default OrderSuccess;
