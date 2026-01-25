import { Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { IPaginationOptions } from '../../interface/pagination.type';
import { calculatePagination } from '../../utils/calculatePagination';
import { prisma } from '../../utils/prisma';
import { IPrivacyPolicy, IPrivacyPolicyFilters } from './privacyPolicy.interface';

const createPrivacyPolicy = async (payload: IPrivacyPolicy) => {
  const result = await prisma.privacyPolicy.create({
    data: {
      title: payload.title,
      content: payload.content,
      section: payload.section,
      order: payload.order || 0,
      version: payload.version || '1.0',
      isActive: payload.isActive ?? true,
      effectiveDate: payload.effectiveDate ? new Date(payload.effectiveDate) : new Date(),
    },
  });

  return result;
};

const getAllPrivacyPolicies = async (
  filters: IPrivacyPolicyFilters,
  paginationOptions: IPaginationOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    calculatePagination(paginationOptions);
  const { searchTerm, section, isActive, version } = filters;

  const andConditions: Prisma.PrivacyPolicyWhereInput[] = [];

  // Search term
  if (searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { content: { contains: searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  // Section filter
  if (section) {
    andConditions.push({ section: { equals: section, mode: 'insensitive' } });
  }

  // Version filter
  if (version) {
    andConditions.push({ version: { equals: version } });
  }

  // Active status filter
  if (isActive !== undefined) {
    andConditions.push({ isActive: isActive === 'true' });
  }

  const whereConditions: Prisma.PrivacyPolicyWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.privacyPolicy.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  });

  const total = await prisma.privacyPolicy.count({
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

const getPrivacyPolicyById = async (id: string) => {
  const result = await prisma.privacyPolicy.findUnique({
    where: { id },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Privacy Policy not found');
  }

  return result;
};

const getActivePrivacyPolicies = async () => {
  const result = await prisma.privacyPolicy.findMany({
    where: { isActive: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  });

  return result;
};

const updatePrivacyPolicy = async (
  id: string,
  payload: Partial<IPrivacyPolicy>,
) => {
  const privacyPolicy = await prisma.privacyPolicy.findUnique({
    where: { id },
  });

  if (!privacyPolicy) {
    throw new AppError(httpStatus.NOT_FOUND, 'Privacy Policy not found');
  }

  const updateData: any = { ...payload };
  if (payload.effectiveDate) {
    updateData.effectiveDate = new Date(payload.effectiveDate);
  }

  const result = await prisma.privacyPolicy.update({
    where: { id },
    data: updateData,
  });

  return result;
};

const deletePrivacyPolicy = async (id: string) => {
  const privacyPolicy = await prisma.privacyPolicy.findUnique({
    where: { id },
  });

  if (!privacyPolicy) {
    throw new AppError(httpStatus.NOT_FOUND, 'Privacy Policy not found');
  }

  const result = await prisma.privacyPolicy.delete({
    where: { id },
  });

  return result;
};

export const PrivacyPolicyService = {
  createPrivacyPolicy,
  getAllPrivacyPolicies,
  getPrivacyPolicyById,
  getActivePrivacyPolicies,
  updatePrivacyPolicy,
  deletePrivacyPolicy,
};
