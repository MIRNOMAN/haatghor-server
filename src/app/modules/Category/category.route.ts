import express from 'express';
import { CategoryController } from './category.controller';
import { CategoryValidation } from './category.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);

// Admin only routes
router.post(
  '/',
  auth('SUPERADMIN'),
  validateRequest.body(CategoryValidation.createCategoryValidation),
  CategoryController.createCategory,
);

router.put(
  '/:id',
  auth('SUPERADMIN'),
  validateRequest.body(CategoryValidation.updateCategoryValidation),
  CategoryController.updateCategory,
);

router.delete(
  '/:id',
  auth('SUPERADMIN'),
  CategoryController.deleteCategory,
);

export const CategoryRoutes = router;
