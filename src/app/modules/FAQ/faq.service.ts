import { Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { IPaginationOptions } from '../../interface/pagination.type';
import { calculatePagination } from '../../utils/calculatePagination';
import { prisma } from '../../utils/prisma';
import { IFAQ, IFAQFilters } from './faq.interface';

const createFAQ = async (payload: IFAQ) => {
  const result = await prisma.fAQ.create({
    data: {
      question: payload.question,
      answer: payload.answer,
      category: payload.category,
      order: payload.order || 0,
      isActive: payload.isActive ?? true,
    },
  });

  return result;
};

const getAllFAQs = async (
  filters: IFAQFilters,
  paginationOptions: IPaginationOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    calculatePagination(paginationOptions);
  const { searchTerm, category, isActive } = filters;

  const andConditions: Prisma.FAQWhereInput[] = [];

  // Search term
  if (searchTerm) {
    andConditions.push({
      OR: [
        { question: { contains: searchTerm, mode: 'insensitive' } },
        { answer: { contains: searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  // Category filter
  if (category) {
    andConditions.push({ category: { equals: category, mode: 'insensitive' } });
  }

  // Active status filter
  if (isActive !== undefined) {
    andConditions.push({ isActive: isActive === 'true' });
  }

  const whereConditions: Prisma.FAQWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Default sort by order, then by creation date
  let orderBy: any = { order: 'asc' };
  if (sortBy && sortBy !== 'order') {
    orderBy = { [sortBy]: sortOrder };
  }

  const result = await prisma.fAQ.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  });

  const total = await prisma.fAQ.count({
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

const getFAQById = async (id: string) => {
  const result = await prisma.fAQ.findUnique({
    where: { id },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'FAQ not found');
  }

  return result;
};

const updateFAQ = async (id: string, payload: Partial<IFAQ>) => {
  const faq = await prisma.fAQ.findUnique({
    where: { id },
  });

  if (!faq) {
    throw new AppError(httpStatus.NOT_FOUND, 'FAQ not found');
  }

  const result = await prisma.fAQ.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteFAQ = async (id: string) => {
  const faq = await prisma.fAQ.findUnique({
    where: { id },
  });

  if (!faq) {
    throw new AppError(httpStatus.NOT_FOUND, 'FAQ not found');
  }

  const result = await prisma.fAQ.delete({
    where: { id },
  });

  return result;
};

export const FAQService = {
  createFAQ,
  getAllFAQs,
  getFAQById,
  updateFAQ,
  deleteFAQ,
};
