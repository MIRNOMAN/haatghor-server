import { Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { IPaginationOptions } from '../../interface/pagination.type';
import { calculatePagination } from '../../utils/calculatePagination';
import { prisma } from '../../utils/prisma';
import { ProductService } from '../Product/product.service';
import { notificationServices } from '../Notification/notification.service';
import { IReview, IReviewFilters, IUpdateReview } from './review.interface';

const getAllReviews = async (
  filters: IReviewFilters,
  paginationOptions: IPaginationOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    calculatePagination(paginationOptions);
  const { rating, isVerifiedPurchase, status } = filters;

  const andConditions: Prisma.ReviewWhereInput[] = [];

  if (rating) {
    andConditions.push({ rating: parseInt(rating) });
  }

  if (isVerifiedPurchase !== undefined) {
    andConditions.push({ isVerifiedPurchase: isVerifiedPurchase === 'true' });
  }

  if (status) {
    andConditions.push({ status });
  }

  const whereConditions: Prisma.ReviewWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.review.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePhoto: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  const total = await prisma.review.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const createReview = async (userId: string, payload: IReview) => {
  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: payload.productId },
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  // Check if user already reviewed this product
  const existingReview = await prisma.review.findUnique({
    where: {
      productId_userId: {
        productId: payload.productId,
        userId,
      },
    },
  });

  if (existingReview) {
    throw new AppError(
      httpStatus.CONFLICT,
      'You have already reviewed this product',
    );
  }

  // Check if user purchased this product (verified purchase)
  const order = await prisma.order.findFirst({
    where: {
      userId,
      status: 'DELIVERED',
      items: {
        some: {
          productId: payload.productId,
        },
      },
    },
  });

  const isVerifiedPurchase = !!order;

  const result = await prisma.review.create({
    data: {
      ...payload,
      userId,
      isVerifiedPurchase,
      images: payload.images || [],
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePhoto: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  // Update product rating
  await ProductService.updateProductRating(payload.productId);

  return result;
};

const getProductReviews = async (
  productId: string,
  filters: IReviewFilters,
  paginationOptions: IPaginationOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    calculatePagination(paginationOptions);
  const { rating, isVerifiedPurchase, status } = filters;

  const andConditions: Prisma.ReviewWhereInput[] = [{ productId }];

  if (rating) {
    andConditions.push({ rating: parseInt(rating) });
  }

  if (isVerifiedPurchase !== undefined) {
    andConditions.push({ isVerifiedPurchase: isVerifiedPurchase === 'true' });
  }

  // For public API, only show approved reviews by default
  if (status) {
    andConditions.push({ status });
  } else {
    // Default to approved for public views
    andConditions.push({ status: 'APPROVED' });
  }

  const whereConditions: Prisma.ReviewWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.review.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePhoto: true,
        },
      },
    },
  });

  const total = await prisma.review.count({
    where: whereConditions,
  });

  // Get rating statistics
  const stats = await prisma.review.groupBy({
    by: ['rating'],
    where: { productId },
    _count: {
      rating: true,
    },
  });

  const ratingStats = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  stats.forEach(stat => {
    ratingStats[stat.rating as keyof typeof ratingStats] = stat._count.rating;
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    stats: ratingStats,
    data: result,
  };
};

const getReviewById = async (reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePhoto: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }

  return review;
};

const updateReview = async (
  reviewId: string,
  userId: string,
  payload: IUpdateReview,
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }

  if (review.userId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can only update your own reviews',
    );
  }

  const result = await prisma.review.update({
    where: { id: reviewId },
    data: payload,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePhoto: true,
        },
      },
    },
  });

  // Update product rating
  await ProductService.updateProductRating(review.productId);

  return result;
};

const deleteReview = async (reviewId: string, userId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }

  if (review.userId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can only delete your own reviews',
    );
  }

  const productId = review.productId;

  await prisma.review.delete({
    where: { id: reviewId },
  });

  // Update product rating
  await ProductService.updateProductRating(productId);

  return null;
};

// Admin: Update review status (approve/reject)
const updateReviewStatus = async (
  reviewId: string,
  status: 'APPROVED' | 'REJECTED',
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }

  const result = await prisma.review.update({
    where: { id: reviewId },
    data: {
      status,
      isApproved: status === 'APPROVED',
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePhoto: true,
          email: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  // Update product rating if approved
  if (status === 'APPROVED') {
    await ProductService.updateProductRating(review.productId);
  }

  // Send notification to user
  try {
    const notificationMessage = status === 'APPROVED' 
      ? `Your review for "${result.product.name}" has been approved and is now visible to other customers!`
      : `Your review for "${result.product.name}" has been rejected. Please contact support if you have questions.`;

    await notificationServices.createNotification({
      title: status === 'APPROVED' ? 'Review Approved' : 'Review Rejected',
      message: notificationMessage,
      type: status === 'APPROVED' ? 'REVIEW_APPROVED' : 'REVIEW_REJECTED',
      userIds: [result.userId],
      redirectEndpoint: `/products/${result.product.slug}`,
    });
  } catch (error) {
    console.error('Failed to send review status notification:', error);
    // Don't throw error - notification failure shouldn't break the review update
  }

  return result;
};

// Admin: Delete any review
const adminDeleteReview = async (reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }

  const productId = review.productId;

  await prisma.review.delete({
    where: { id: reviewId },
  });

  // Update product rating
  await ProductService.updateProductRating(productId);

  return null;
};

export const ReviewService = {
  getAllReviews,
  createReview,
  getProductReviews,
  getReviewById,
  updateReview,
  deleteReview,
  updateReviewStatus,
  adminDeleteReview,
};
