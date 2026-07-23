import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';
import {
  getAdminDashboard,
  getUsers,
  updateUserRole,
  deleteUser,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  getOrderDetails,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/adminController.js';
import { getAdminAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.use(protect, admin);

router.get('/dashboard', getAdminDashboard);
router.get('/analytics', getAdminAnalytics);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderDetails);
router.put('/orders/:id/status', updateOrderStatus);
router.patch('/orders/:id/status', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);

export default router;
