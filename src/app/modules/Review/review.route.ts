import express from 'express';
import { ReviewController } from './review.controller';
import { ReviewValidation } from './review.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/', ReviewController.getAllReviews);
router.get('/product/:productId', ReviewController.getProductReviews);
router.get('/:id', ReviewController.getReviewById);

// User routes
router.post(
  '/',
  auth('USER', 'SUPERADMIN'),
  validateRequest.body(ReviewValidation.createReviewValidation),
  ReviewController.createReview,
);

router.put(
  '/:id',
  auth('USER', 'SUPERADMIN'),
  validateRequest.body(ReviewValidation.updateReviewValidation),
  ReviewController.updateReview,
);

router.delete(
  '/:id',
  auth('USER', 'SUPERADMIN'),
  ReviewController.deleteReview,
);

// Admin routes (SUPERADMIN only)
router.patch(
  '/:id/status',
  auth('SUPERADMIN'),
  validateRequest.body(ReviewValidation.updateReviewStatusValidation),
  ReviewController.updateReviewStatus,
);

router.delete(
  '/:id/admin',
  auth('SUPERADMIN'),
  ReviewController.adminDeleteReview,
);

export const ReviewRoutes = router;
