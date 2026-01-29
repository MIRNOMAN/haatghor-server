import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ReviewService } from './review.service';
import { pickValidFields } from '../../utils/pickValidFields';

const getAllReviews = catchAsync(async (req, res) => {
  const filters = pickValidFields(req.query, ['rating', 'isVerifiedPurchase', 'status']);
  const paginationOptions = pickValidFields(req.query, [
    'page',
    'limit',
    'sortBy',
    'sortOrder',
  ]);

  const result = await ReviewService.getAllReviews(filters, paginationOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reviews retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const createReview = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await ReviewService.createReview(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Review created successfully',
    data: result,
  });
});

const getProductReviews = catchAsync(async (req, res) => {
  const filters = pickValidFields(req.query, ['rating', 'isVerifiedPurchase']);
  const paginationOptions = pickValidFields(req.query, [
    'page',
    'limit',
    'sortBy',
    'sortOrder',
  ]);

  const result = await ReviewService.getProductReviews(
    req.params.productId,
    filters,
    paginationOptions,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reviews retrieved successfully',
    meta: result.meta,
    stats: result.stats,
    data: result.data,
  });
});

const getReviewById = catchAsync(async (req, res) => {
  const result = await ReviewService.getReviewById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review retrieved successfully',
    data: result,
  });
});

const updateReview = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await ReviewService.updateReview(req.params.id, userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review updated successfully',
    data: result,
  });
});

const deleteReview = catchAsync(async (req, res) => {
  const userId = req.user.id;
  await ReviewService.deleteReview(req.params.id, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review deleted successfully',
    data: null,
  });
});

// Admin: Update review status
const updateReviewStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const result = await ReviewService.updateReviewStatus(req.params.id, status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Review ${status.toLowerCase()} successfully`,
    data: result,
  });
});

// Admin: Delete any review
const adminDeleteReview = catchAsync(async (req, res) => {
  await ReviewService.adminDeleteReview(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review deleted successfully',
    data: null,
  });
});

export const ReviewController = {
  getAllReviews,
  createReview,
  getProductReviews,
  getReviewById,
  updateReview,
  deleteReview,
  updateReviewStatus,
  adminDeleteReview,
};
