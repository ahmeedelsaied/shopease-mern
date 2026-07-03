import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
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

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
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
      setError(err.response?.data?.message || err.message || 'Unable to place order');
    } finally {
      setLoading(false);
    }
  };

  if (isEmpty) {
    return null;
  }

  return (
    <div className="px-margin-mobile py-stack-xl md:px-margin-desktop">
      <div className="mx-auto grid max-w-container-max gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-outline-variant/30 bg-surface-container-low/80 p-8 shadow-soft">
            <h1 className="text-headline-lg font-headline-lg text-primary">Checkout</h1>
            <p className="mt-2 text-body-md text-on-surface-variant">Please review your order and provide your shipping details.</p>
          </div>

          <Card variant="panel" className="p-6">
            <h2 className="text-headline-sm font-headline-sm text-primary">Shipping Information</h2>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <Input label="Full name" id="fullName" name="fullName" value={form.fullName} onChange={handleChange} required />
              <Input label="Address" id="address" name="address" value={form.address} onChange={handleChange} required />
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="City" id="city" name="city" value={form.city} onChange={handleChange} required />
                <Input label="State" id="state" name="state" value={form.state} onChange={handleChange} required />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="ZIP code" id="zipCode" name="zipCode" value={form.zipCode} onChange={handleChange} required />
                <Input label="Phone" id="phone" name="phone" value={form.phone} onChange={handleChange} required />
              </div>
              <Input label="Notes (optional)" id="notes" name="notes" value={form.notes} onChange={handleChange} />

              {error ? <p className="text-sm text-error">{error}</p> : null}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button type="button" variant="ghost" onClick={() => navigate('/cart')}>
                  Back to cart
                </Button>
                <Button type="submit" variant="primary" disabled={loading} loading={loading}>
                  {loading ? 'Placing order...' : 'Place order'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card variant="summary" className="p-6">
            <h2 className="text-headline-sm font-headline-sm text-primary">Order Summary</h2>
            <div className="mt-4 space-y-3">
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
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
