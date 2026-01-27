import express from 'express';
import { ProductController } from './product.controller';
import { ProductValidation } from './product.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/', ProductController.getAllProducts);
router.get('/slug/:slug', ProductController.getProductBySlug);
router.get('/:id', ProductController.getProductById);

// Admin only routes
router.post(
  '/',
  auth('SUPERADMIN'),
  validateRequest.body(ProductValidation.createProductValidation),
  ProductController.createProduct,
);

router.put(
  '/:id',
  auth('SUPERADMIN'),
  validateRequest.body(ProductValidation.updateProductValidation),
  ProductController.updateProduct,
);

router.delete(
  '/:id',
  auth('SUPERADMIN'),
  ProductController.deleteProduct,
);

export const ProductRoutes = router;
