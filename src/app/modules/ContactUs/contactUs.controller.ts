import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ContactUsService } from './contactUs.service';
import { pickValidFields } from '../../utils/pickValidFields';
import { ContactStatus } from '@prisma/client';

const createContactUs = catchAsync(async (req, res) => {
  const result = await ContactUsService.createContactUs(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Contact message sent successfully',
    data: result,
  });
});

const getAllContactUs = catchAsync(async (req, res) => {
  const filters = pickValidFields(req.query, [
    'searchTerm',
    'status',
    'isRead',
    'email',
  ]);

  const paginationOptions = pickValidFields(req.query, [
    'page',
    'limit',
    'sortBy',
    'sortOrder',
  ]);

  const result = await ContactUsService.getAllContactUs(
    filters,
    paginationOptions,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Contact messages retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getContactUsById = catchAsync(async (req, res) => {
  const result = await ContactUsService.getContactUsById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Contact message retrieved successfully',
    data: result,
  });
});

const markAsRead = catchAsync(async (req, res) => {
  const result = await ContactUsService.markAsRead(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Contact message marked as read',
    data: result,
  });
});

const respondToContact = catchAsync(async (req, res) => {
  const { response, status } = req.body;
  const userId = req.user?.id; // Assuming user ID is available in req.user

  const result = await ContactUsService.respondToContact(
    req.params.id,
    {
      response,
      respondedBy: userId,
    },
    status as ContactStatus,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Response sent successfully',
    data: result,
  });
});

const updateContactUs = catchAsync(async (req, res) => {
  const result = await ContactUsService.updateContactUs(req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Contact message updated successfully',
    data: result,
  });
});

const deleteContactUs = catchAsync(async (req, res) => {
  await ContactUsService.deleteContactUs(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Contact message deleted successfully',
    data: null,
  });
});

const getStatistics = catchAsync(async (req, res) => {
  const result = await ContactUsService.getStatistics();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Contact statistics retrieved successfully',
    data: result,
  });
});

export const ContactUsController = {
  createContactUs,
  getAllContactUs,
  getContactUsById,
  markAsRead,
  respondToContact,
  updateContactUs,
  deleteContactUs,
  getStatistics,
};
