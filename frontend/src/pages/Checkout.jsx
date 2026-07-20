import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import CheckoutSteps from '../components/CheckoutSteps';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const initialForm = {
  fullName: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  phone: '',
  notes: '',
};

const SHIPPING_STEPS = ['shipping', 'payment', 'review'];

// Boundary cases (rule 20): empty string, whitespace-only, short, regex
// non-match, and valid formats. ZIP is kept permissive (country-agnostic
// 4–10 alphanumerics) rather than US-only to avoid rejecting valid addresses.
const ZIP_PATTERN = /^[A-Za-z0-9\s-]{4,10}$/;
const PHONE_PATTERN = /^[0-9+\-\s()]{7,20}$/;
const REQUIRED_SHIPPING_FIELDS = ['fullName', 'address', 'city', 'state', 'zipCode', 'phone'];

/**
 * validateShipping – returns a { [field]: message } map. An empty object means
 * the shipping form is valid. Pure function so it can run both on "Continue"
 * (to gate advancement) and on blur (to surface inline errors).
 */
const validateShipping = (form) => {
  const errors = {};

  REQUIRED_SHIPPING_FIELDS.forEach((field) => {
    if (!form[field].trim()) {
      errors[field] = 'This field is required';
    }
  });

  if (!errors.zipCode && !ZIP_PATTERN.test(form.zipCode.trim())) {
    errors.zipCode = 'Enter a valid ZIP / postal code';
  }

  if (!errors.phone && !PHONE_PATTERN.test(form.phone.trim())) {
    errors.phone = 'Enter a valid phone number';
  }

  return errors;
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState('shipping');
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [triedContinue, setTriedContinue] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  // Guards against double submission: the button is disabled while loading,
  // but a ref also blocks any re-entrant call (rapid double-click before paint).
  const submittingRef = useRef(false);

  const isEmpty = !cartItems?.length;

  const formattedSubtotal = useMemo(() => `$${(subtotal || 0).toFixed(2)}`, [subtotal]);

  React.useEffect(() => {
    if (isEmpty) {
      navigate('/cart', { replace: true });
    }
  }, [isEmpty, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Re-validate just the field being edited so the error clears/reacts
    // live once the user has attempted to continue.
    if (triedContinue) {
      setErrors(validateShipping({ ...form, [name]: value }));
    }
  };

  const goContinue = () => {
    const nextIndex = SHIPPING_STEPS.indexOf(step) + 1;
    if (nextIndex >= SHIPPING_STEPS.length) return;
    setStep(SHIPPING_STEPS[nextIndex]);
  };

  const goBack = () => {
    const prevIndex = SHIPPING_STEPS.indexOf(step) - 1;
    if (prevIndex < 0) return;
    setStep(SHIPPING_STEPS[prevIndex]);
  };

  const handleShippingContinue = () => {
    setTriedContinue(true);
    const validation = validateShipping(form);
    setErrors(validation);
    if (Object.keys(validation).length === 0) {
      goContinue();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;

    setSubmitError('');
    setLoading(true);

    try {
      const payload = {
        items: cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: form.fullName,
          address: form.address,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          phone: form.phone,
          notes: form.notes,
        },
        paymentMethod: 'Cash on Delivery',
      };

      const response = await api.post('/orders', payload);
      clearCart();
      navigate(`/order-success/${response.data.data._id}`, { state: { toastMessage: 'Order placed successfully' } });
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Unable to place order';
      // Toast is the single user-facing notification surface; submitError is an
      // aria-live region for screen-reader parity (no duplicate visible text).
      setSubmitError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  if (isEmpty) {
    return null;
  }

  const renderShippingStep = () => (
    <>
      <h2 className="text-headline-sm font-headline-sm text-primary">Shipping Information</h2>
      <p className="mt-1 text-sm text-on-surface-variant">Tell us where to send your order.</p>
      <div className="mt-6 space-y-4">
        <Input
          label="Full name"
          id="fullName"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          error={triedContinue ? errors.fullName : ''}
          required
        />
        <Input
          label="Address"
          id="address"
          name="address"
          value={form.address}
          onChange={handleChange}
          error={triedContinue ? errors.address : ''}
          required
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="City"
            id="city"
            name="city"
            value={form.city}
            onChange={handleChange}
            error={triedContinue ? errors.city : ''}
            required
          />
          <Input
            label="State"
            id="state"
            name="state"
            value={form.state}
            onChange={handleChange}
            error={triedContinue ? errors.state : ''}
            required
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="ZIP code"
            id="zipCode"
            name="zipCode"
            value={form.zipCode}
            onChange={handleChange}
            error={triedContinue ? errors.zipCode : ''}
            required
          />
          <Input
            label="Phone"
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            error={triedContinue ? errors.phone : ''}
            required
          />
        </div>
        <Input label="Notes (optional)" id="notes" name="notes" value={form.notes} onChange={handleChange} />
      </div>
      <div className="mt-6 flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={() => navigate('/cart')}>
          Back to cart
        </Button>
        <Button type="button" variant="primary" onClick={handleShippingContinue}>
          Continue to payment
        </Button>
      </div>
    </>
  );

  const renderPaymentStep = () => (
    <>
      <h2 className="text-headline-sm font-headline-sm text-primary">Payment</h2>
      <p className="mt-1 text-sm text-on-surface-variant">Choose how you'd like to pay.</p>
      <div className="mt-6 rounded-2xl border-2 border-primary bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[28px] text-primary" aria-hidden="true">
            payments
          </span>
          <div className="flex-1">
            <p className="text-body-md font-medium text-primary">Cash on Delivery</p>
            <p className="mt-1 text-sm text-on-surface-variant">
              Pay in cash when your order is delivered. No card details required.
            </p>
          </div>
          <span className="material-symbols-outlined text-[24px] text-primary" aria-label="Selected payment method">
            check_circle
          </span>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="ghost" onClick={goBack}>
          Back
        </Button>
        <Button type="button" variant="primary" onClick={goContinue}>
          Continue to review
        </Button>
      </div>
    </>
  );

  const renderReviewStep = () => (
    <>
      <h2 className="text-headline-sm font-headline-sm text-primary">Review your order</h2>
      <p className="mt-1 text-sm text-on-surface-variant">Confirm the details below, then place your order.</p>

      <div className="mt-6 rounded-2xl border border-outline-variant/40 bg-surface-container-low/60 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-body-md font-semibold text-primary">Shipping address</h3>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:text-secondary/80"
            onClick={() => setStep('shipping')}
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">edit</span>
            Edit
          </button>
        </div>
        <dl className="mt-3 space-y-1 text-sm text-on-surface-variant">
          <div className="flex gap-2"><dt className="text-on-surface-variant/70">Name:</dt><dd className="text-on-surface">{form.fullName}</dd></div>
          <div className="flex gap-2"><dt className="text-on-surface-variant/70">Address:</dt><dd className="text-on-surface">{form.address}, {form.city}, {form.state} {form.zipCode}</dd></div>
          <div className="flex gap-2"><dt className="text-on-surface-variant/70">Phone:</dt><dd className="text-on-surface">{form.phone}</dd></div>
        </dl>
      </div>

      <div className="mt-4 rounded-2xl border border-outline-variant/40 bg-surface-container-low/60 p-5">
        <h3 className="text-body-md font-semibold text-primary">Items</h3>
        <ul className="mt-3 space-y-3">
          {cartItems.map((item) => (
            <li key={item.id} className="flex items-center justify-between text-sm text-on-surface-variant">
              <span>
                {item.name} &times; {item.quantity}
              </span>
              <span className="font-medium text-on-surface">${(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-outline-variant/40 pt-3 text-headline-sm font-headline-sm text-primary">
          <span>Total</span>
          <span>{formattedSubtotal}</span>
        </div>
      </div>

      {submitError ? (
        <p className="sr-only" role="alert">{submitError}</p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="ghost" onClick={goBack} disabled={loading}>
          Back
        </Button>
        <Button type="submit" variant="primary" disabled={loading} loading={loading}>
          {loading ? 'Placing order...' : 'Place order'}
        </Button>
      </div>
    </>
  );

  return (
    <div className="px-margin-mobile py-stack-xl md:px-margin-desktop">
      <div className="mx-auto grid max-w-container-max gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-outline-variant/30 bg-surface-container-low/80 p-8 shadow-soft">
            <h1 className="text-headline-lg font-headline-lg text-primary">Checkout</h1>
            <p className="mt-2 text-body-md text-on-surface-variant">Please review your order and provide your shipping details.</p>
          </div>

          <CheckoutSteps current={step} className="mb-2" />

          <Card variant="panel" className="p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {step === 'shipping' ? renderShippingStep() : null}
              {step === 'payment' ? renderPaymentStep() : null}
              {step === 'review' ? renderReviewStep() : null}
            </form>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {/* Collapsible on mobile, always open on desktop. */}
          <details className="group rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-lowest shadow-soft lg:open:shadow-none" open>
            <summary className="flex cursor-pointer items-center justify-between p-6 lg:cursor-default lg:pointer-events-none lg:!list-none">
              <h2 className="text-headline-sm font-headline-sm text-primary">Order Summary</h2>
              <span className="material-symbols-outlined text-on-surface-variant transition-transform duration-200 group-open:rotate-180 lg:hidden" aria-hidden="true">
                expand_more
              </span>
            </summary>
            <div className="px-6 pb-6">
              <div className="mt-2 space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm text-on-surface-variant">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-2 border-t border-outline-variant/40 pt-4">
                <div className="flex justify-between text-body-md text-on-surface-variant">
                  <span>Items ({totalItems})</span>
                  <span>{formattedSubtotal}</span>
                </div>
                <div className="flex justify-between text-body-md text-on-surface-variant">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-headline-sm font-headline-sm text-primary">
                  <span>Total</span>
                  <span>{formattedSubtotal}</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-on-surface-variant">Signed in as {user?.name || 'Guest'}</p>
            </div>
          </details>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
