import { Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { IPaginationOptions } from '../../interface/pagination.type';
import { calculatePagination } from '../../utils/calculatePagination';
import { prisma } from '../../utils/prisma';
import { IProduct, IProductFilters } from './product.interface';

const createProduct = async (payload: IProduct) => {
  // Generate slug from name
  const slug = payload.name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

  // Check if category exists
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  // Check if product with same slug exists
  const existingProduct = await prisma.product.findUnique({
    where: { slug },
  });

  if (existingProduct) {
    throw new AppError(
      httpStatus.CONFLICT,
      'Product with similar name already exists',
    );
  }

  const result = await prisma.product.create({
    data: {
      ...payload,
      slug,
      variants: payload.variants || [],
      tags: payload.tags || [],
    },
    include: {
      category: true,
    },
  });

  return result;
};

const getAllProducts = async (
  filters: IProductFilters,
  paginationOptions: IPaginationOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    calculatePagination(paginationOptions);
  const {
    searchTerm,
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    status,
    isFeatured,
    tags,
  } = filters;

  const andConditions: Prisma.ProductWhereInput[] = [];

  // Search term
  if (searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { brand: { contains: searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  // Category filter
  if (category) {
    andConditions.push({ categoryId: category });
  }

  // Brand filter
  if (brand) {
    andConditions.push({ brand: { equals: brand, mode: 'insensitive' } });
  }

  // Price range
  if (minPrice || maxPrice) {
    const priceCondition: any = {};
    if (minPrice) priceCondition.gte = parseFloat(minPrice);
    if (maxPrice) priceCondition.lte = parseFloat(maxPrice);
    andConditions.push({ price: priceCondition });
  }

  // Rating filter
  if (rating) {
    andConditions.push({ rating: { gte: parseFloat(rating) } });
  }

  // Status filter
  if (status) {
    andConditions.push({ status: status as any });
  }

  // Featured filter
  if (isFeatured !== undefined) {
    andConditions.push({ isFeatured: isFeatured === 'true' });
  }

  // Tags filter
  if (tags) {
    andConditions.push({ tags: { has: tags } });
  }

  const whereConditions: Prisma.ProductWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Determine sort field
  let orderBy: any = { [sortBy]: sortOrder };

  // Handle custom sort options
  if (sortBy === 'price_asc') {
    orderBy = { price: 'asc' };
  } else if (sortBy === 'price_desc') {
    orderBy = { price: 'desc' };
  } else if (sortBy === 'newest') {
    orderBy = { createdAt: 'desc' };
  } else if (sortBy === 'top_rated') {
    orderBy = { rating: 'desc' };
  }

  const result = await prisma.product.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: { reviews: true },
      },
    },
  });

  const total = await prisma.product.count({
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

const getProductById = async (id: string) => {
  const result = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      reviews: {
        take: 10,
        orderBy: { createdAt: 'desc' },
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
      },
      _count: {
        select: { reviews: true },
      },
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  return result;
};

const getProductBySlug = async (slug: string) => {
  const result = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: {
        take: 10,
        orderBy: { createdAt: 'desc' },
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
      },
      _count: {
        select: { reviews: true },
      },
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  return result;
};

const updateProduct = async (id: string, payload: Partial<IProduct>) => {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  // Generate new slug if name is updated
  if (payload.name) {
    const slug = payload.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
    payload.slug = slug;
  }

  // Check category exists if updating categoryId
  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: payload.categoryId },
    });

    if (!category) {
      throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
    }
  }

  const result = await prisma.product.update({
    where: { id },
    data: payload,
    include: {
      category: true,
    },
  });

  return result;
};

const deleteProduct = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  const result = await prisma.product.delete({
    where: { id },
  });

  return result;
};

const updateProductRating = async (productId: string) => {
  const reviews = await prisma.review.findMany({
    where: { productId },
  });

  if (reviews.length === 0) {
    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: 0,
        totalReviews: 0,
      },
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews: reviews.length,
    },
  });
};

export const ProductService = {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  updateProductRating,
};
