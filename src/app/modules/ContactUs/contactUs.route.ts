import express from 'express';
import { ContactUsController } from './contactUs.controller';
import { ContactUsValidation } from './contactUs.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';

const router = express.Router();

// Public route - Submit contact form
router.post(
  '/',
  validateRequest.body(ContactUsValidation.createContactUsValidation),
  ContactUsController.createContactUs,
);

// Admin only routes
router.get('/', auth('SUPERADMIN'), ContactUsController.getAllContactUs);

router.get(
  '/statistics',
  auth('SUPERADMIN'),
  ContactUsController.getStatistics,
);

router.get('/:id', auth('SUPERADMIN'), ContactUsController.getContactUsById);

router.patch(
  '/:id/mark-read',
  auth('SUPERADMIN'),
  ContactUsController.markAsRead,
);

router.post(
  '/:id/respond',
  auth('SUPERADMIN'),
  validateRequest.body(ContactUsValidation.respondToContactValidation),
  ContactUsController.respondToContact,
);

router.patch(
  '/:id',
  auth('SUPERADMIN'),
  validateRequest.body(ContactUsValidation.updateContactUsValidation),
  ContactUsController.updateContactUs,
);

router.delete('/:id', auth('SUPERADMIN'), ContactUsController.deleteContactUs);

export const ContactUsRoutes = router;
