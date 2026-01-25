import express from 'express';
import { FAQController } from './faq.controller';
import { FAQValidation } from './faq.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/', FAQController.getAllFAQs);
router.get('/:id', FAQController.getFAQById);

// Admin only routes
router.post(
  '/',
  auth('SUPERADMIN'),
  validateRequest.body(FAQValidation.createFAQValidation),
  FAQController.createFAQ,
);

router.patch(
  '/:id',
  auth('SUPERADMIN'),
  validateRequest.body(FAQValidation.updateFAQValidation),
  FAQController.updateFAQ,
);

router.delete('/:id', auth('SUPERADMIN'), FAQController.deleteFAQ);

export const FAQRoutes = router;
