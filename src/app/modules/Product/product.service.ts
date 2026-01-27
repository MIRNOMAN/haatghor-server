import { Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { IPaginationOptions } from '../../interface/pagination.type';
import { calculatePagination } from '../../utils/calculatePagination';
import { prisma } from '../../utils/prisma';
import { IProduct, IProductFilters } from './product.interface';

/* ===================== CREATE PRODUCT ===================== */
export const createProduct = async (payload: IProduct) => {
  // Generate slug
  const slug =
    payload.slug ||
    payload.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');

  // Check category
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  // Check slug uniqueness
  const existingProduct = await prisma.product.findUnique({
    where: { slug },
  });
  if (existingProduct) {
    throw new AppError(
      httpStatus.CONFLICT,
      'Product with this name already exists',
    );
  }

  // Transform variants (Prisma safe)
  const variants =
    payload.variants?.flatMap((v) => {
      if (v.options?.length) {
        return v.options.map((opt) => ({
          name: v.name,
          value: opt,
          price: v.price,
          stock: v.stock,
        }));
      }

      if (v.value) {
        return [
          {
            name: v.name,
            value: v.value,
            price: v.price,
            stock: v.stock,
          },
        ];
      }

      return [];
    }) || [];

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
      tags: payload.tags || [],
      variants,
    },
    include: {
      category: true,
    },
  });

  return product;
};

/* ===================== GET ALL PRODUCTS ===================== */
const getAllProducts = async (
  filters: IProductFilters,
  paginationOptions: IPaginationOptions,
) => {
  const { page, limit, skip, sortBy } =
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

  // Search
  if (searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { brand: { contains: searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  if (category) andConditions.push({ categoryId: category });
  if (brand)
    andConditions.push({ brand: { equals: brand, mode: 'insensitive' } });

  if (minPrice || maxPrice) {
    const priceCondition: any = {};
    if (minPrice) priceCondition.gte = Number(minPrice);
    if (maxPrice) priceCondition.lte = Number(maxPrice);
    andConditions.push({ price: priceCondition });
  }

  if (rating) {
    andConditions.push({ rating: { gte: Number(rating) } });
  }

  if (status) {
    andConditions.push({ status: status as any });
  }

  if (isFeatured !== undefined) {
    andConditions.push({ isFeatured: isFeatured === 'true' });
  }

  if (tags) {
    andConditions.push({
      tags: {
        hasSome: tags.split(','),
      },
    });
  }

  const whereConditions: Prisma.ProductWhereInput =
    andConditions.length ? { AND: andConditions } : {};

  let orderBy: Prisma.ProductOrderByWithRelationInput = {
    createdAt: 'desc',
  };

  switch (sortBy) {
    case 'price_asc':
      orderBy = { price: 'asc' };
      break;
    case 'price_desc':
      orderBy = { price: 'desc' };
      break;
    case 'top_rated':
      orderBy = { rating: 'desc' };
      break;
  }

  const data = await prisma.product.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy,
    include: {
      category: {
        select: { id: true, name: true, slug: true },
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
    meta: { page, limit, total },
    data,
  };
};

/* ===================== GET PRODUCT BY ID ===================== */
/* ===================== GET PRODUCT BY ID ===================== */
export const getProductById = async (id: string) => {
  // এই অংশটি ডিলিট করে দিন বা কমেন্ট করুন:
  /* if (!/^[a-fA-F0-9]{24}$/.test(id)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  } 
  */

  const product = await prisma.product.findUnique({
    where: { id }, // আইডি দিয়ে খুঁজবে
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


  if (!product) {
    return await getProductBySlug(id);
  }

  return product;
};

/* ===================== GET PRODUCT BY SLUG ===================== */
const getProductBySlug = async (slug: string) => {
  const product = await prisma.product.findUnique({
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

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  return product;
};

/* ===================== UPDATE PRODUCT ===================== */
const updateProduct = async (id: string, payload: Partial<IProduct>) => {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  if (payload.name) {
    const slug = payload.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');

    const exists = await prisma.product.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });

    if (exists) {
      throw new AppError(
        httpStatus.CONFLICT,
        'Another product with this name already exists',
      );
    }

    payload.slug = slug;
  }

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: payload.categoryId },
    });

    if (!category) {
      throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
    }
  }

  return prisma.product.update({
    where: { id },
    data: payload,
    include: {
      category: true,
    },
  });
};

/* ===================== DELETE PRODUCT ===================== */
/* ===================== DELETE PRODUCT ===================== */
const deleteProduct = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) { // <--- Ei logic-ti trigger hochche
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  return prisma.product.delete({
    where: { id },
  });
};
/* ===================== UPDATE PRODUCT RATING ===================== */
const updateProductRating = async (productId: string) => {
  const reviews = await prisma.review.findMany({
    where: { productId },
  });

  if (!reviews.length) {
    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: 0,
        totalReviews: 0,
      },
    });
    return;
  }

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalRating / reviews.length;

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
    },
  });
};

/* ===================== EXPORT ===================== */
export const ProductService = {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  updateProductRating,
};
