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

export const isValidOrderStatus = (value) => ORDER_STATUSES.includes(value);
