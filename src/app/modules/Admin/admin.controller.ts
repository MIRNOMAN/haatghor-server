import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AdminServices, AdminService } from './admin.service';

const getDashboardStats = catchAsync(async (req, res) => {
  const result = await AdminService.getDashboardStats();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Dashboard stats retrieved successfully',
    data: result,
  });
});

const getAdminForSupport = catchAsync(async (req, res) => {
  const result = await AdminServices.getAdminForSupport();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Admin retrieved successfully',
    data: result,
  });
});

// Original export (backward compatibility)
export const AdminController = {
  getDashboardStats,
};

// New exports
export const AdminControllers = {
  getAdminForSupport,
};
