import React, { createContext, useContext, useEffect, useMemo, useReducer, useCallback } from 'react';

const CartContext = createContext();

const LOCAL_KEY = 'shopease_cart';

const initialState = {
  cartItems: [],
  totalItems: 0,
  subtotal: 0,
};

const calculateTotals = (items) => {
  const totalItems = items.reduce((s, it) => s + (it.quantity || 0), 0);
  const subtotal = items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 0), 0);
  return { totalItems, subtotal };
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'INIT': {
      const items = action.payload || [];
      const totals = calculateTotals(items);
      return { ...state, cartItems: items, ...totals };
    }
    case 'ADD_ITEM': {
      const raw = action.payload;
      const productId = raw.id || raw._id;
      const product = { ...raw, id: productId };
      const exists = state.cartItems.find((i) => i.id === product.id);
      let items;
      if (exists) {
        items = state.cartItems.map((i) =>
          i.id === product.id ? { ...i, quantity: (i.quantity || 0) + 1 } : i
        );
      } else {
        items = [...state.cartItems, { ...product, quantity: 1 }];
      }
      const totals = calculateTotals(items);
      return { ...state, cartItems: items, ...totals };
    }
    case 'REMOVE_ITEM': {
      const id = action.payload;
      const items = state.cartItems.filter((i) => i.id !== id);
      const totals = calculateTotals(items);
      return { ...state, cartItems: items, ...totals };
    }
    case 'INCREASE_QTY': {
      const id = action.payload;
      const items = state.cartItems.map((i) =>
        i.id === id ? { ...i, quantity: (i.quantity || 0) + 1 } : i
      );
      const totals = calculateTotals(items);
      return { ...state, cartItems: items, ...totals };
    }
    case 'DECREASE_QTY': {
      const id = action.payload;
      const items = state.cartItems
        .map((i) => (i.id === id ? { ...i, quantity: Math.max(0, (i.quantity || 0) - 1) } : i))
        .filter((i) => i.quantity > 0);
      const totals = calculateTotals(items);
      return { ...state, cartItems: items, ...totals };
    }
    case 'CLEAR_CART': {
      return { ...state, cartItems: [], totalItems: 0, subtotal: 0 };
    }
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      const items = raw ? JSON.parse(raw) : [];
      const totals = calculateTotals(items);
      return { cartItems: items, ...totals };
    } catch (e) {
      return initialState;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(state.cartItems));
    } catch (e) {
      // ignore storage errors
    }
  }, [state.cartItems]);

  const addToCart = useCallback((product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  }, []);

  const removeFromCart = useCallback((id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, []);

  const increaseQuantity = useCallback((id) => {
    dispatch({ type: 'INCREASE_QTY', payload: id });
  }, []);

  const decreaseQuantity = useCallback((id) => {
    dispatch({ type: 'DECREASE_QTY', payload: id });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const value = useMemo(
    () => ({
      cartItems: state.cartItems,
      totalItems: state.totalItems,
      subtotal: state.subtotal,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
    }),
    [state.cartItems, state.totalItems, state.subtotal, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export default CartContext;
