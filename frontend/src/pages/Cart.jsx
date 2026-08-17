import { useMemo } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SEO from '../components/SEO';
import { NOINDEX_ROBOTS } from '../seo/seoDefaults';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ImageWithSkeleton from '../components/ui/ImageWithSkeleton';
import { useToast } from '../context/ToastContext';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, totalItems, increaseQuantity, decreaseQuantity, removeFromCart, clearCart } = useCart();
  const toast = useToast();
  const isEmpty = !cartItems || cartItems.length === 0;
  const formattedSubtotal = useMemo(() => `$${(subtotal || 0).toFixed(2)}`, [subtotal]);

  if (isEmpty) return <div data-reveal className="reveal page-shell"><SEO title="Shopping Cart" robots={NOINDEX_ROBOTS} /><div className="mx-auto max-w-container-max"><EmptyState icon="shopping_cart" title="Your bag is empty" description="Looks like you haven't added any products yet. Start exploring and build a considered order." actionLabel="Continue shopping" actionTo="/" /></div></div>;

  return (
    <div data-reveal className="reveal page-shell"><SEO title="Shopping Cart" robots={NOINDEX_ROBOTS} /><div className="mx-auto max-w-container-max space-y-10"><div className="border-b border-outline-variant/40 pb-8"><p className="eyebrow">Almost yours</p><h1 className="mt-3 font-display-lg text-5xl leading-none text-primary">Your bag.</h1><p className="mt-4 max-w-xl text-body-md text-on-surface-variant">Review your considered picks, then take the simple route to checkout.</p></div><div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-start"><div className="space-y-3">{cartItems.map((item) => <Card key={item.id} variant="panel" className="flex flex-col gap-5 p-4 sm:flex-row sm:items-center"><ImageWithSkeleton src={item.image} alt={item.name} loading="lazy" decoding="async" wrapperClassName="h-28 w-full shrink-0 rounded-[1.25rem] sm:h-28 sm:w-28" className="h-full w-full object-cover" /><div className="min-w-0 flex-1"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><h3 className="truncate text-lg font-bold text-primary">{item.name}</h3><p className="mt-1 text-xs text-on-surface-variant">${item.price.toFixed(2)} each</p></div><p className="text-lg font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</p></div><div className="mt-5 flex flex-wrap items-center gap-2"><div className="flex items-center rounded-full border border-outline-variant/60 bg-surface-container-low p-1"><Button size="sm" variant="icon" onClick={() => decreaseQuantity(item.id)} aria-label={`Decrease quantity of ${item.name}`} icon="remove" /><Input value={item.quantity} readOnly aria-label={`Quantity of ${item.name}`} className="w-12 border-0 bg-transparent px-1 py-1 text-center shadow-none focus:ring-0" wrapperClassName="gap-0" /><Button size="sm" variant="icon" onClick={() => increaseQuantity(item.id)} aria-label={`Increase quantity of ${item.name}`} icon="add" /></div><Button size="sm" variant="ghost" className="!w-auto text-error hover:bg-error-container/50" onClick={() => { removeFromCart(item.id); toast.info(`${item.name} removed from cart`); }} icon="delete">Remove</Button></div></div></Card>)}</div><aside className="lg:sticky lg:top-36"><Card variant="summary" className="space-y-6"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-fixed/60">Order summary</p><div className="mt-4 flex items-end justify-between gap-3"><span className="text-sm text-primary-fixed/70">Subtotal · {totalItems} item{totalItems === 1 ? '' : 's'}</span><span className="font-display-lg text-3xl text-on-primary">{formattedSubtotal}</span></div></div><div className="space-y-3 border-y border-primary-fixed/15 py-4 text-xs text-primary-fixed/65"><div className="flex justify-between"><span>Delivery</span><span>Calculated at checkout</span></div><div className="flex justify-between"><span>Returns</span><span>Simple and clear</span></div></div><Button variant="primary-solid" className="w-full !bg-secondary !text-on-secondary hover:!bg-secondary/90" onClick={() => navigate('/checkout')} icon="arrow_forward">Continue to checkout</Button><Button variant="ghost" className="!w-full !text-primary-fixed/75 hover:!bg-primary-fixed/10 hover:!text-on-primary" onClick={() => { clearCart(); toast.warning('Cart cleared'); }}>Clear bag</Button></Card></aside></div></div></div>
  );
};

export default Cart;
