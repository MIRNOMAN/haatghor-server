import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PrivacyPolicyService } from './privacyPolicy.service';
import { pickValidFields } from '../../utils/pickValidFields';

const createPrivacyPolicy = catchAsync(async (req, res) => {
  const result = await PrivacyPolicyService.createPrivacyPolicy(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Privacy Policy created successfully',
    data: result,
  });
});

const getAllPrivacyPolicies = catchAsync(async (req, res) => {
  const filters = pickValidFields(req.query, [
    'searchTerm',
    'section',
    'isActive',
    'version',
  ]);

  const paginationOptions = pickValidFields(req.query, [
    'page',
    'limit',
    'sortBy',
    'sortOrder',
  ]);

  const result = await PrivacyPolicyService.getAllPrivacyPolicies(
    filters,
    paginationOptions,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Privacy Policies retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getPrivacyPolicyById = catchAsync(async (req, res) => {
  const result = await PrivacyPolicyService.getPrivacyPolicyById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Privacy Policy retrieved successfully',
    data: result,
  });
});

const getActivePrivacyPolicies = catchAsync(async (req, res) => {
  const result = await PrivacyPolicyService.getActivePrivacyPolicies();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Active Privacy Policies retrieved successfully',
    data: result,
  });
});

const updatePrivacyPolicy = catchAsync(async (req, res) => {
  const result = await PrivacyPolicyService.updatePrivacyPolicy(
    req.params.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Privacy Policy updated successfully',
    data: result,
  });
});

const deletePrivacyPolicy = catchAsync(async (req, res) => {
  await PrivacyPolicyService.deletePrivacyPolicy(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Privacy Policy deleted successfully',
    data: null,
  });
});

export const PrivacyPolicyController = {
  createPrivacyPolicy,
  getAllPrivacyPolicies,
  getPrivacyPolicyById,
  getActivePrivacyPolicies,
  updatePrivacyPolicy,
  deletePrivacyPolicy,
};
