import React, { useEffect, useRef } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const { success } = useToast();
  const shownToastRef = useRef(false);

  useEffect(() => {
    if (location.state?.toastMessage && !shownToastRef.current) {
      shownToastRef.current = true;
      success(location.state.toastMessage);
    }
  }, [location.state, success]);

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-stack-xl">
      <div className="max-w-container-max mx-auto">
        <Card variant="panel" className="mx-auto max-w-2xl p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-3xl">check_circle</span>
          </div>
          <h1 className="mt-6 text-headline-lg font-headline-lg text-primary">Order placed successfully!</h1>
          <p className="mt-3 text-body-md text-on-surface-variant">
            Your order has been received and is being prepared for delivery.
          </p>
          <p className="mt-2 text-sm text-on-surface-variant">Order ID: {orderId}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/orders">
              <Button variant="primary">View orders</Button>
            </Link>
            <Link to="/">
              <Button variant="ghost">Continue shopping</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OrderSuccess;
