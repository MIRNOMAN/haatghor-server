import express from 'express';
import { BannerController } from './banner.controller';
import { BannerValidation } from './banner.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/', BannerController.getAllBanners);
router.get('/:id', BannerController.getBannerById);

// Admin only routes
router.post(
  '/',
  auth('SUPERADMIN'),
  validateRequest.body(BannerValidation.createBannerValidation),
  BannerController.createBanner,
);

router.put(
  '/:id',
  auth('SUPERADMIN'),
  validateRequest.body(BannerValidation.updateBannerValidation),
  BannerController.updateBanner,
);

router.delete(
  '/:id',
  auth('SUPERADMIN'),
  BannerController.deleteBanner,
);

export const BannerRoutes = router;
