import express from 'express';
import { OrderController } from './order.controller';
import { OrderValidation } from './order.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';

const router = express.Router();

// User routes
router.post(
  '/',
  auth('USER', 'SUPERADMIN'),
  validateRequest.body(OrderValidation.createOrderValidation),
  OrderController.createOrder,
);

router.get(
  '/me',
  auth('USER', 'SUPERADMIN'),
  OrderController.getUserOrders,
);

router.get(
  '/:id',
  auth('USER', 'SUPERADMIN'),
  OrderController.getOrderById,
);

// Admin routes
router.get(
  '/admin/all',
  auth('SUPERADMIN'),
  OrderController.getAllOrders,
);

router.put(
  '/admin/:id/status',
  auth('SUPERADMIN'),
  validateRequest.body(OrderValidation.updateOrderStatusValidation),
  OrderController.updateOrderStatus,
);

export const OrderRoutes = router;
