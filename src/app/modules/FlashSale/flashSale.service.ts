import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';
import { ICreateFlashSale, IUpdateFlashSale, IFlashSaleFilters } from './flashSale.interface';
import { IPaginationOptions } from '../../interface/pagination.type';
import { calculatePagination } from '../../utils/calculatePagination';

/**
 * Create Flash Sale
 */
const createFlashSale = async (payload: ICreateFlashSale) => {
  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: payload.productId },
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  // Check if there's an active flash sale for this product
  const existingFlashSale = await prisma.flashSale.findFirst({
    where: {
      productId: payload.productId,
      isActive: true,
      endTime: {
        gte: new Date(),
      },
    },
  });

  if (existingFlashSale) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'An active flash sale already exists for this product',
    );
  }

  // Calculate discount percentage
  const discount = ((product.price - payload.flashPrice) / product.price) * 100;

  // Create flash sale
  const flashSale = await prisma.flashSale.create({
    data: {
      ...payload,
      originalPrice: product.price,
      discount: Math.round(discount * 100) / 100,
      remainingStock: payload.totalStock,
      startTime: new Date(payload.startTime),
      endTime: new Date(payload.endTime),
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: true,
          price: true,
          category: true,
        },
      },
    },
  });

  return flashSale;
};

/**
 * Get All Flash Sales
 */
const getAllFlashSales = async (
  filters: IFlashSaleFilters,
  paginationOptions: IPaginationOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    calculatePagination(paginationOptions);

  const andConditions: any[] = [];

  // Search by title
  if (filters.searchTerm) {
    andConditions.push({
      title: {
        contains: filters.searchTerm,
        mode: 'insensitive',
      },
    });
  }

  // Filter by active status
  if (filters.isActive !== undefined) {
    andConditions.push({ isActive: filters.isActive });
  }

  // Filter by featured status
  if (filters.isFeatured !== undefined) {
    andConditions.push({ isFeatured: filters.isFeatured });
  }

  // Filter by status (UPCOMING, LIVE, ENDED)
  const now = new Date();
  if (filters.status === 'UPCOMING') {
    andConditions.push({ startTime: { gt: now } });
  } else if (filters.status === 'LIVE') {
    andConditions.push({
      startTime: { lte: now },
      endTime: { gte: now },
      isActive: true,
    });
  } else if (filters.status === 'ENDED') {
    andConditions.push({ endTime: { lt: now } });
  }

  const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.flashSale.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: true,
          price: true,
          stock: true,
          category: true,
          rating: true,
          totalReviews: true,
        },
      },
    },
  });

  const total = await prisma.flashSale.count({ where: whereConditions });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

/**
 * Get Active/Live Flash Sales
 */
const getLiveFlashSales = async () => {
  const now = new Date();

  const flashSales = await prisma.flashSale.findMany({
    where: {
      isActive: true,
      startTime: { lte: now },
      endTime: { gte: now },
      remainingStock: { gt: 0 },
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: true,
          price: true,
          stock: true,
          category: true,
          rating: true,
          totalReviews: true,
        },
      },
    },
  });

  return flashSales;
};

/**
 * Get Flash Sale by ID
 */
const getFlashSaleById = async (id: string) => {
  const flashSale = await prisma.flashSale.findUnique({
    where: { id },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!flashSale) {
    throw new AppError(httpStatus.NOT_FOUND, 'Flash sale not found');
  }

  return flashSale;
};

/**
 * Update Flash Sale
 */
const updateFlashSale = async (id: string, payload: IUpdateFlashSale) => {
  const flashSale = await prisma.flashSale.findUnique({
    where: { id },
    include: { product: true },
  });

  if (!flashSale) {
    throw new AppError(httpStatus.NOT_FOUND, 'Flash sale not found');
  }

  // If flash price is being updated, recalculate discount
  let updateData: any = { ...payload };

  if (payload.flashPrice && flashSale.product) {
    const discount =
      ((flashSale.product.price - payload.flashPrice) / flashSale.product.price) * 100;
    updateData.discount = Math.round(discount * 100) / 100;
  }

  // If total stock is updated, recalculate remaining stock
  if (payload.totalStock) {
    updateData.remainingStock = payload.totalStock - flashSale.soldCount;
  }

  // Convert date strings to Date objects
  if (payload.startTime) {
    updateData.startTime = new Date(payload.startTime);
  }
  if (payload.endTime) {
    updateData.endTime = new Date(payload.endTime);
  }

  const updatedFlashSale = await prisma.flashSale.update({
    where: { id },
    data: updateData,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: true,
          price: true,
        },
      },
    },
  });

  return updatedFlashSale;
};

/**
 * Delete Flash Sale
 */
const deleteFlashSale = async (id: string) => {
  const flashSale = await prisma.flashSale.findUnique({
    where: { id },
  });

  if (!flashSale) {
    throw new AppError(httpStatus.NOT_FOUND, 'Flash sale not found');
  }

  await prisma.flashSale.delete({
    where: { id },
  });

  return flashSale;
};

/**
 * Increment sold count when flash sale product is purchased
 */
const incrementSoldCount = async (flashSaleId: string, quantity: number) => {
  const flashSale = await prisma.flashSale.findUnique({
    where: { id: flashSaleId },
  });

  if (!flashSale) {
    throw new AppError(httpStatus.NOT_FOUND, 'Flash sale not found');
  }

  if (flashSale.remainingStock < quantity) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Not enough stock available in flash sale',
    );
  }

  const updated = await prisma.flashSale.update({
    where: { id: flashSaleId },
    data: {
      soldCount: {
        increment: quantity,
      },
      remainingStock: {
        decrement: quantity,
      },
    },
  });

  return updated;
};

export const FlashSaleService = {
  createFlashSale,
  getAllFlashSales,
  getLiveFlashSales,
  getFlashSaleById,
  updateFlashSale,
  deleteFlashSale,
  incrementSoldCount,
};
