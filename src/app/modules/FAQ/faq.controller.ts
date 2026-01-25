import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FAQService } from './faq.service';
import { pickValidFields } from '../../utils/pickValidFields';

const createFAQ = catchAsync(async (req, res) => {
  const result = await FAQService.createFAQ(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'FAQ created successfully',
    data: result,
  });
});

const getAllFAQs = catchAsync(async (req, res) => {
  const filters = pickValidFields(req.query, [
    'searchTerm',
    'category',
    'isActive',
  ]);

  const paginationOptions = pickValidFields(req.query, [
    'page',
    'limit',
    'sortBy',
    'sortOrder',
  ]);

  const result = await FAQService.getAllFAQs(filters, paginationOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'FAQs retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getFAQById = catchAsync(async (req, res) => {
  const result = await FAQService.getFAQById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'FAQ retrieved successfully',
    data: result,
  });
});

const updateFAQ = catchAsync(async (req, res) => {
  const result = await FAQService.updateFAQ(req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'FAQ updated successfully',
    data: result,
  });
});

const deleteFAQ = catchAsync(async (req, res) => {
  await FAQService.deleteFAQ(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'FAQ deleted successfully',
    data: null,
  });
});

export const FAQController = {
  createFAQ,
  getAllFAQs,
  getFAQById,
  updateFAQ,
  deleteFAQ,
};
