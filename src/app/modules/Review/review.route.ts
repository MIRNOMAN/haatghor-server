import express from 'express';
import { ReviewController } from './review.controller';
import { ReviewValidation } from './review.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';

const router = express.Router();

// Public route
router.get('/product/:productId', ReviewController.getProductReviews);
router.get('/:id', ReviewController.getReviewById);

// Protected routes
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

export const ReviewRoutes = router;
