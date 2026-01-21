import express from 'express';
import { CartController } from './cart.controller';
import { CartValidation } from './cart.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';

const router = express.Router();

// All cart routes require authentication
router.post(
  '/add',
  auth('USER', 'SUPERADMIN'),
  validateRequest.body(CartValidation.addToCartValidation),
  CartController.addToCart,
);

router.get(
  '/',
  auth('USER', 'SUPERADMIN'),
  CartController.getCart,
);

router.put(
  '/update/:productId',
  auth('USER', 'SUPERADMIN'),
  validateRequest.body(CartValidation.updateCartValidation),
  CartController.updateCartItem,
);

router.delete(
  '/remove/:productId',
  auth('USER', 'SUPERADMIN'),
  CartController.removeFromCart,
);

router.delete(
  '/clear',
  auth('USER', 'SUPERADMIN'),
  CartController.clearCart,
);

export const CartRoutes = router;
