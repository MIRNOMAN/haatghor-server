import express from 'express';
import { AdminController } from './admin.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.get(
  '/dashboard/stats',
  auth('SUPERADMIN'),
  AdminController.getDashboardStats,
);

export const AdminRoutes = router;
