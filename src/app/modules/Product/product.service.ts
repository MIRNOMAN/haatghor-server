import { Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { IPaginationOptions } from '../../interface/pagination.type';
import { calculatePagination } from '../../utils/calculatePagination';
import { prisma } from '../../utils/prisma';
import { IProduct, IProductFilters, Variant } from './product.interface';

export const createProduct = async (payload: IProduct) => {
  // 1️⃣ Generate slug from name if not provided
  const slug =
    payload.slug ||
    payload.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');

  // 2️⃣ Check category exists
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });
  if (!category) throw new AppError(httpStatus.NOT_FOUND, 'Category not found');

  // 3️⃣ Check if product with same slug exists
  const existingProduct = await prisma.product.findUnique({ where: { slug } });
  if (existingProduct)
    throw new AppError(httpStatus.CONFLICT, 'Product with similar name exists');

  // 4️⃣ Transform variants to match Prisma type
  const variants: Variant[] = [];
  if (payload.variants?.length) {
    payload.variants.forEach((v) => {
      if (v.options?.length) {
        v.options.forEach((opt) => {
          variants.push({ name: v.name, value: opt, price: v.price, stock: v.stock });
        });
      } else if (v.value) {
        variants.push({ name: v.name, value: v.value, price: v.price, stock: v.stock });
      }
    });
  }

  // 5️⃣ Create product
  const product = await prisma.product.create({
    data: {
      name: payload.name,
      slug,
      description: payload.description || '',
      categoryId: payload.categoryId,
      brand: payload.brand || null,
      images: payload.images || [],
      price: payload.price,
      discount: payload.discount || 0,
      stock: payload.stock || 0,
      status: payload.status || 'ACTIVE',
      specifications: payload.specifications || {},
      variants,
      tags: payload.tags || [],
    },
    include: { category: true }, // Include category relation if needed
  });

  return product;
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
  let orderBy: any = { createdAt: 'desc' };

  // Handle custom sort options
  switch (sortBy) {
    case 'price_asc':
      orderBy = { price: 'asc' };
      break;
    case 'price_desc':
      orderBy = { price: 'desc' };
      break;
    case 'newest':
      orderBy = { createdAt: 'desc' };
      break;
    case 'top_rated':
      orderBy = { rating: 'desc' };
      break;
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

export const getProductById = async (id: string) => {
  // Validate ObjectID manually (24 hex characters)
  if (!/^[a-fA-F0-9]{24}$/.test(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid product ID');
  }

  const result = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      reviews: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, profilePhoto: true },
          },
        },
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
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
