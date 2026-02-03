import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { FlashSaleController } from './flashSale.controller';
import { FlashSaleValidation } from './flashSale.validation';

const router = express.Router();

// Public routes
router.get('/live', FlashSaleController.getLiveFlashSales);
router.get('/:id', FlashSaleController.getFlashSaleById);
router.get('/', FlashSaleController.getAllFlashSales);

// Admin routes
router.post(
  '/',
  auth('ADMIN', 'SUPERADMIN'),
  validateRequest.body(FlashSaleValidation.createFlashSaleSchema),
  FlashSaleController.createFlashSale,
);

router.patch(
  '/:id',
  auth('ADMIN', 'SUPERADMIN'),
  validateRequest.body(FlashSaleValidation.updateFlashSaleSchema),
  FlashSaleController.updateFlashSale,
);

router.delete(
  '/:id',
  auth('ADMIN', 'SUPERADMIN'),
  FlashSaleController.deleteFlashSale,
);

export const FlashSaleRoutes = router;
