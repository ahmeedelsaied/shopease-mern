import React, { useMemo, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import Toast from '../components/ui/Toast';
import EmptyState from '../components/EmptyState';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, totalItems, increaseQuantity, decreaseQuantity, removeFromCart, clearCart } = useCart();
  const [toastMessage, setToastMessage] = useState('');

  const isEmpty = !cartItems || cartItems.length === 0;

  const formattedSubtotal = useMemo(() => `$${(subtotal || 0).toFixed(2)}`, [subtotal]);

  if (isEmpty) {
    return (
      <div className="px-margin-mobile py-stack-xl md:px-margin-desktop">
        <div className="mx-auto max-w-container-max">
          <EmptyState
            icon="shopping_cart"
            title="Your cart is empty"
            description="Looks like you haven't added any products yet. Start exploring and add your favorites to build your perfect order."
            actionLabel="Continue shopping"
            actionTo="/"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-margin-mobile py-stack-xl md:px-margin-desktop">
      <div className="mx-auto max-w-container-max space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-headline-lg font-headline-lg text-primary">Shopping Cart</h1>
          <p className="text-body-md text-on-surface-variant">Review your selections and move to checkout in just a few steps.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4 lg:col-span-2">
            {cartItems.map((item) => (
              <Card key={item.id} variant="panel" className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
                <img src={item.image} alt={item.name} className="h-24 w-24 rounded-[1.25rem] object-cover" />
                <div className="flex-1">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-body-lg font-body-lg text-primary">{item.name}</h3>
                      <p className="text-label-sm text-on-surface-variant">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-body-lg font-body-lg text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button size="sm" variant="outline" onClick={() => decreaseQuantity(item.id)}>-</Button>
                    <Input value={item.quantity} readOnly className="w-16 text-center" />
                    <Button size="sm" variant="outline" onClick={() => increaseQuantity(item.id)}>+</Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-1 text-error"
                      onClick={() => {
                        removeFromCart(item.id);
                        setToastMessage(`${item.name} removed from cart`);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <aside className="space-y-4">
            <Card variant="summary" className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-body-md font-body-md">Subtotal ({totalItems} items)</span>
                <span className="text-headline-sm font-headline-sm text-primary">{formattedSubtotal}</span>
              </div>

              <Button variant="primary" className="w-full" onClick={() => navigate('/checkout')}>
                Checkout
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  clearCart();
                  setToastMessage('Cart cleared');
                }}
              >
                Clear cart
              </Button>
            </Card>
          </aside>
        </div>
      </div>

      <Toast message={toastMessage} isVisible={Boolean(toastMessage)} onClose={() => setToastMessage('')} />
    </div>
  );
};

export default Cart;
