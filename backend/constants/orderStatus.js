/**
 * Canonical order lifecycle definitions.
 *
 * Imported by the Order model, the user-facing tracking controller and the
 * admin status-update controller so the status list is defined in exactly one
 * place. Previously the enum was duplicated as a hardcoded array in both
 * `models/Order.js` and `adminController.updateOrderStatus`, which drifts
 * silently when statuses are added.
 *
 * Lifecycle (happy path): pending → confirmed → processing → shipped →
 * out_for_delivery → delivered. `cancelled` is terminal and may occur from any
 * pre-delivery state.
 */

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

export const TERMINAL_STATUSES = ['delivered', 'cancelled'];

// Delivered orders represent completed sales. Only cancelled orders are
// excluded from realised-revenue analytics.
export const NON_REVENUE_STATUSES = ['cancelled'];

// Cancellation is valid from every pre-delivery state. Forward movement follows
// the documented fulfilment lifecycle; terminal states cannot transition again.
export const ORDER_STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export const isValidOrderStatus = (value) => ORDER_STATUSES.includes(value);

export const canTransitionOrderStatus = (fromStatus, toStatus) =>
  fromStatus === toStatus || ORDER_STATUS_TRANSITIONS[fromStatus]?.includes(toStatus) === true;
