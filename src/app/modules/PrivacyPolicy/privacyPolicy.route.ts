import express from 'express';
import { PrivacyPolicyController } from './privacyPolicy.controller';
import { PrivacyPolicyValidation } from './privacyPolicy.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/', PrivacyPolicyController.getAllPrivacyPolicies);
router.get('/active', PrivacyPolicyController.getActivePrivacyPolicies);
router.get('/:id', PrivacyPolicyController.getPrivacyPolicyById);

// Admin only routes
router.post(
  '/',
  auth('SUPERADMIN'),
  validateRequest.body(PrivacyPolicyValidation.createPrivacyPolicyValidation),
  PrivacyPolicyController.createPrivacyPolicy,
);

router.patch(
  '/:id',
  auth('SUPERADMIN'),
  validateRequest.body(PrivacyPolicyValidation.updatePrivacyPolicyValidation),
  PrivacyPolicyController.updatePrivacyPolicy,
);

router.delete(
  '/:id',
  auth('SUPERADMIN'),
  PrivacyPolicyController.deletePrivacyPolicy,
);

export const PrivacyPolicyRoutes = router;
