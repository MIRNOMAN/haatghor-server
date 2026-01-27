import express from 'express';
import { AdminController } from './admin.controller';
import { AdminControllers } from './admin.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.get(
  '/dashboard/stats',
  auth('SUPERADMIN'),
  AdminController.getDashboardStats,
);

router.get(
  '/support-admin',
  auth('ANY'),
  AdminControllers.getAdminForSupport,
);

export const AdminRoutes = router;
