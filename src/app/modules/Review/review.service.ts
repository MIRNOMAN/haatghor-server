import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';
import { IReview, IUpdateReview, IReviewFilters } from './review.interface';
import { IPaginationOptions } from '../../interface/pagination.type';
import { calculatePagination } from '../../utils/calculatePagination';
import { ProductService } from '../Product/product.service';
import { Prisma } from '@/generated/enums';

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
    throw new AppError(httpStatus.CONFLICT, 'You have already reviewed this product');
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
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(paginationOptions);
  const { rating, isVerifiedPurchase } = filters;

  const andConditions: Prisma.ReviewWhereInput[] = [{ productId }];

  if (rating) {
    andConditions.push({ rating: parseInt(rating) });
  }

  if (isVerifiedPurchase !== undefined) {
    andConditions.push({ isVerifiedPurchase: isVerifiedPurchase === 'true' });
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

  stats.forEach((stat) => {
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

const updateReview = async (reviewId: string, userId: string, payload: IUpdateReview) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }

  if (review.userId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only update your own reviews');
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
    throw new AppError(httpStatus.FORBIDDEN, 'You can only delete your own reviews');
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
  createReview,
  getProductReviews,
  getReviewById,
  updateReview,
  deleteReview,
};
