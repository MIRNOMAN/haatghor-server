import express from 'express';
import { ImageController } from './image.controller';
import { ImageValidation } from './image.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { uploadMiddleware } from '../../middlewares/upload';

const router = express.Router();

// Public route - Serve images
router.get('/serve/:filename', ImageController.serveImage);

// Public routes - Get images
router.get('/', ImageController.getAllImages);
router.get('/:id', ImageController.getImageById);

// Protected routes - Upload images (Admin only)
router.post(
  '/upload/single',
  auth('SUPERADMIN'),
  uploadMiddleware.single('image', {
    allowedFileTypes: ['image/*'],
    maxFileSize: 10, // 10MB
  }),
  validateRequest.body(ImageValidation.createImageValidation),
  ImageController.uploadSingleImage,
);

router.post(
  '/upload/multiple',
  auth('SUPERADMIN'),
  uploadMiddleware.array('images', {
    allowedFileTypes: ['image/*'],
    maxFileSize: 10, // 10MB
    maxFiles: 20,
  }),
  validateRequest.body(ImageValidation.createImageValidation),
  ImageController.uploadMultipleImages,
);

// Protected routes - Update image metadata (Admin only)
router.patch(
  '/:id',
  auth('SUPERADMIN'),
  validateRequest.body(ImageValidation.updateImageValidation),
  ImageController.updateImage,
);

// Protected routes - Replace image file (Admin only)
router.put(
  '/:id/replace',
  auth('SUPERADMIN'),
  uploadMiddleware.single('image', {
    allowedFileTypes: ['image/*'],
    maxFileSize: 10, // 10MB
  }),
  validateRequest.body(ImageValidation.createImageValidation),
  ImageController.replaceImage,
);

// Protected routes - Delete image(s) (Admin only)
router.delete('/:id', auth('SUPERADMIN'), ImageController.deleteImage);

router.post(
  '/delete/multiple',
  auth('SUPERADMIN'),
  ImageController.deleteMultipleImages,
);

export const ImageRoutes = router;
