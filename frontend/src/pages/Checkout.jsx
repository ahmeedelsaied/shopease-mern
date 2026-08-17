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

const initialForm = { fullName: '', address: '', city: '', state: '', zipCode: '', phone: '', notes: '' };
const SHIPPING_STEPS = ['shipping', 'payment', 'review'];
const ZIP_PATTERN = /^[A-Za-z0-9\s-]{4,10}$/;
const PHONE_PATTERN = /^[0-9+\-\s()]{7,20}$/;
const REQUIRED_SHIPPING_FIELDS = ['fullName', 'address', 'city', 'state', 'zipCode', 'phone'];

const validateShipping = (form) => {
  const errors = {};
  REQUIRED_SHIPPING_FIELDS.forEach((field) => { if (!form[field].trim()) errors[field] = 'This field is required'; });
  if (!errors.zipCode && !ZIP_PATTERN.test(form.zipCode.trim())) errors.zipCode = 'Enter a valid ZIP / postal code';
  if (!errors.phone && !PHONE_PATTERN.test(form.phone.trim())) errors.phone = 'Enter a valid phone number';
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
  const submittingRef = useRef(false);
  const isEmpty = !cartItems?.length;
  const formattedSubtotal = useMemo(() => `$${(subtotal || 0).toFixed(2)}`, [subtotal]);

  React.useEffect(() => { if (isEmpty) navigate('/cart', { replace: true }); }, [isEmpty, navigate]);
  const handleChange = (event) => { const { name, value } = event.target; setForm((prev) => ({ ...prev, [name]: value })); if (triedContinue) setErrors(validateShipping({ ...form, [name]: value })); };
  const goContinue = () => { const nextIndex = SHIPPING_STEPS.indexOf(step) + 1; if (nextIndex < SHIPPING_STEPS.length) setStep(SHIPPING_STEPS[nextIndex]); };
  const goBack = () => { const prevIndex = SHIPPING_STEPS.indexOf(step) - 1; if (prevIndex >= 0) setStep(SHIPPING_STEPS[prevIndex]); };
  const handleShippingContinue = () => { setTriedContinue(true); const validation = validateShipping(form); setErrors(validation); if (Object.keys(validation).length === 0) goContinue(); };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true; setSubmitError(''); setLoading(true);
    try {
      const payload = { items: cartItems.map((item) => ({ productId: item.id, name: item.name, image: item.image, price: item.price, quantity: item.quantity })), shippingAddress: { fullName: form.fullName, address: form.address, city: form.city, state: form.state, zipCode: form.zipCode, phone: form.phone, notes: form.notes }, paymentMethod: 'Cash on Delivery' };
      const response = await api.post('/orders', payload);
      clearCart(); navigate(`/order-success/${response.data.data._id}`, { state: { toastMessage: 'Order placed successfully' } });
    } catch (err) { const message = err.response?.data?.message || err.message || 'Unable to place order'; setSubmitError(message); toast.error(message); } finally { setLoading(false); submittingRef.current = false; }
  };

  if (isEmpty) return null;

  const renderShippingStep = () => <><div><p className="eyebrow">Step one</p><h2 className="mt-2 font-display-lg text-3xl text-primary">Where should we send it?</h2><p className="mt-2 text-sm text-on-surface-variant">Tell us where to send your order.</p></div><div className="mt-7 space-y-5"><Input label="Full name" id="fullName" name="fullName" value={form.fullName} onChange={handleChange} error={triedContinue ? errors.fullName : ''} required /><Input label="Address" id="address" name="address" value={form.address} onChange={handleChange} error={triedContinue ? errors.address : ''} required /><div className="grid gap-4 md:grid-cols-2"><Input label="City" id="city" name="city" value={form.city} onChange={handleChange} error={triedContinue ? errors.city : ''} required /><Input label="State" id="state" name="state" value={form.state} onChange={handleChange} error={triedContinue ? errors.state : ''} required /></div><div className="grid gap-4 md:grid-cols-2"><Input label="ZIP code" id="zipCode" name="zipCode" value={form.zipCode} onChange={handleChange} error={triedContinue ? errors.zipCode : ''} required /><Input label="Phone" id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} error={triedContinue ? errors.phone : ''} required /></div><Input label="Notes (optional)" id="notes" name="notes" value={form.notes} onChange={handleChange} /></div><div className="mt-7 flex flex-col gap-3 border-t border-outline-variant/30 pt-5 sm:flex-row sm:justify-end"><Button type="button" variant="ghost" onClick={() => navigate('/cart')}>Back to bag</Button><Button type="button" variant="primary" onClick={handleShippingContinue} icon="arrow_forward">Continue to payment</Button></div></>;
  const renderPaymentStep = () => <><div><p className="eyebrow">Step two</p><h2 className="mt-2 font-display-lg text-3xl text-primary">How would you like to pay?</h2><p className="mt-2 text-sm text-on-surface-variant">No card details required for this order.</p></div><div className="mt-7 rounded-[1.5rem] border-2 border-secondary bg-secondary-container/30 p-5"><div className="flex items-start gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-on-secondary"><span className="material-symbols-outlined text-[22px]">payments</span></span><div className="flex-1"><p className="text-base font-bold text-primary">Cash on Delivery</p><p className="mt-1 text-sm leading-6 text-on-surface-variant">Pay in cash when your order is delivered. Simple, clear, and secure.</p></div><span className="material-symbols-outlined text-[24px] text-secondary" aria-label="Selected payment method">check_circle</span></div></div><div className="mt-7 flex flex-col gap-3 border-t border-outline-variant/30 pt-5 sm:flex-row sm:justify-between"><Button type="button" variant="ghost" onClick={goBack}>Back</Button><Button type="button" variant="primary" onClick={goContinue} icon="arrow_forward">Continue to review</Button></div></>;
  const renderReviewStep = () => <><div><p className="eyebrow">Step three</p><h2 className="mt-2 font-display-lg text-3xl text-primary">One last look.</h2><p className="mt-2 text-sm text-on-surface-variant">Confirm the details below, then place your order.</p></div><div className="mt-7 space-y-3"><div className="rounded-[1.4rem] border border-outline-variant/35 bg-surface-container-low p-5"><div className="flex items-center justify-between"><h3 className="text-sm font-bold text-primary">Shipping address</h3><button type="button" className="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:text-primary" onClick={() => setStep('shipping')}><span className="material-symbols-outlined text-[15px]">edit</span>Edit</button></div><dl className="mt-3 space-y-1 text-sm text-on-surface-variant"><div className="flex gap-2"><dt className="text-on-surface-variant/70">Name:</dt><dd className="text-on-surface">{form.fullName}</dd></div><div className="flex gap-2"><dt className="text-on-surface-variant/70">Address:</dt><dd className="text-on-surface">{form.address}, {form.city}, {form.state} {form.zipCode}</dd></div><div className="flex gap-2"><dt className="text-on-surface-variant/70">Phone:</dt><dd className="text-on-surface">{form.phone}</dd></div></dl></div><div className="rounded-[1.4rem] border border-outline-variant/35 bg-surface-container-low p-5"><h3 className="text-sm font-bold text-primary">Items</h3><ul className="mt-4 space-y-3">{cartItems.map((item) => <li key={item.id} className="flex items-center justify-between gap-3 text-sm text-on-surface-variant"><span className="truncate">{item.name} × {item.quantity}</span><span className="font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</span></li>)}</ul><div className="mt-4 flex justify-between border-t border-outline-variant/35 pt-4 text-lg font-bold text-primary"><span>Total</span><span>{formattedSubtotal}</span></div></div></div>{submitError && <p className="sr-only" role="alert">{submitError}</p>}<div className="mt-7 flex flex-col gap-3 border-t border-outline-variant/30 pt-5 sm:flex-row sm:justify-between"><Button type="button" variant="ghost" onClick={goBack} disabled={loading}>Back</Button><Button type="submit" variant="primary" disabled={loading} loading={loading} icon="check">{loading ? 'Placing order...' : 'Place order'}</Button></div></>;

  return <div className="page-shell"><div className="mx-auto grid max-w-container-max gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start"><div className="space-y-7"><div><p className="eyebrow">A considered checkout</p><h1 className="mt-3 font-display-lg text-5xl leading-none text-primary">Checkout.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-on-surface-variant">A few simple steps and your order will be on its way.</p></div><CheckoutSteps current={step} className="mb-2" /><Card variant="panel" className="p-6 sm:p-8"><form className="space-y-4" onSubmit={handleSubmit}>{step === 'shipping' ? renderShippingStep() : null}{step === 'payment' ? renderPaymentStep() : null}{step === 'review' ? renderReviewStep() : null}</form></Card></div><aside className="lg:sticky lg:top-36"><details className="group rounded-[1.6rem] border border-outline-variant/35 bg-primary text-on-primary shadow-lg lg:open:shadow-none" open><summary className="flex cursor-pointer list-none items-center justify-between p-6 lg:pointer-events-none"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-fixed/60">Your order</p><h2 className="mt-2 font-display-lg text-3xl">Summary</h2></div><span className="material-symbols-outlined text-primary-fixed/70 transition-transform duration-200 group-open:rotate-180 lg:hidden">expand_more</span></summary><div className="px-6 pb-6"><div className="space-y-3 border-y border-primary-fixed/15 py-5">{cartItems.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 text-sm text-primary-fixed/70"><span className="truncate">{item.name} × {item.quantity}</span><span>${(item.price * item.quantity).toFixed(2)}</span></div>)}</div><div className="mt-5 space-y-3"><div className="flex justify-between text-sm text-primary-fixed/70"><span>Items ({totalItems})</span><span>{formattedSubtotal}</span></div><div className="flex justify-between text-sm text-primary-fixed/70"><span>Shipping</span><span>Free</span></div><div className="flex justify-between text-xl font-bold text-on-primary"><span>Total</span><span>{formattedSubtotal}</span></div></div><p className="mt-5 text-xs text-primary-fixed/55">Signed in as {user?.name || 'Guest'}</p></div></details></aside></div></div>;
};

export default Checkout;
