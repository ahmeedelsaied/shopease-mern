import React, { useMemo, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import Toast from '../components/ui/Toast';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, totalItems, increaseQuantity, decreaseQuantity, removeFromCart, clearCart } = useCart();
  const [toastMessage, setToastMessage] = useState('');

  const isEmpty = !cartItems || cartItems.length === 0;

  const formattedSubtotal = useMemo(() => `$${(subtotal || 0).toFixed(2)}`, [subtotal]);

  if (isEmpty) {
    return (
      <div className="px-margin-mobile md:px-margin-desktop py-stack-xl">
        <div className="max-w-container-max mx-auto rounded-3xl bg-surface-container-low p-12 text-center">
          <h2 className="text-headline-md font-headline-md text-primary">Your cart is empty</h2>
          <p className="mt-4 text-body-md text-on-surface-variant">Looks like you haven't added any products yet.</p>
          <div className="mt-6">
            <Link to="/">
              <Button variant="primary">Continue shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-stack-xl">
      <div className="max-w-container-max mx-auto space-y-6">
        <h1 className="text-headline-lg font-headline-lg text-primary">Shopping Cart</h1>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} variant="panel" className="p-4 flex gap-4 items-center">
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-body-lg font-body-lg text-primary">{item.name}</h3>
                      <p className="text-label-sm text-on-surface-variant">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <Button size="sm" variant="outline" onClick={() => decreaseQuantity(item.id)}>-</Button>
                    <Input value={item.quantity} readOnly className="w-16 text-center" />
                    <Button size="sm" variant="outline" onClick={() => increaseQuantity(item.id)}>+</Button>
                    <Button size="sm" variant="ghost" className="ml-4 text-error" onClick={() => {
                      removeFromCart(item.id);
                      setToastMessage(`${item.name} removed from cart`);
                    }}>Remove</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <aside className="space-y-4">
            <Card variant="panel" className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-body-md font-body-md">Subtotal ({totalItems} items)</span>
                <span className="text-headline-sm font-headline-sm text-primary">{formattedSubtotal}</span>
              </div>

              <Button variant="primary" className="w-full" onClick={() => navigate('/checkout')}>Checkout</Button>

              <Button variant="ghost" className="w-full" onClick={() => {
                clearCart();
                setToastMessage('Cart cleared');
              }}>Clear cart</Button>
            </Card>
          </aside>
        </div>
      </div>

      <Toast message={toastMessage} isVisible={Boolean(toastMessage)} onClose={() => setToastMessage('')} />
    </div>
  );
};

export default Cart;
