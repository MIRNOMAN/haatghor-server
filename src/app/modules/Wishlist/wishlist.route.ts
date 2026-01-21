import express from 'express';
import { WishlistController } from './wishlist.controller';
import { WishlistValidation } from './wishlist.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/add',
  auth('USER', 'SUPERADMIN'),
  validateRequest.body(WishlistValidation.addToWishlistValidation),
  WishlistController.addToWishlist,
);

router.get(
  '/',
  auth('USER', 'SUPERADMIN'),
  WishlistController.getWishlist,
);

router.delete(
  '/remove/:productId',
  auth('USER', 'SUPERADMIN'),
  WishlistController.removeFromWishlist,
);

export const WishlistRoutes = router;
