import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';
import { IBanner, IUpdateBanner, IBannerFilters } from './banner.interface';
import { Prisma } from '@/prisma/schema/generated/prisma/enums';

const createBanner = async (payload: IBanner) => {
  const result = await prisma.banner.create({
    data: payload,
  });

  return result;
};

const getAllBanners = async (filters?: IBannerFilters) => {
  const andConditions: Prisma.BannerWhereInput[] = [];

  if (filters?.type) {
    andConditions.push({ type: filters.type });
  }

  if (filters?.isActive !== undefined) {
    andConditions.push({ isActive: filters.isActive === 'true' });
  }

  const whereConditions: Prisma.BannerWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.banner.findMany({
    where: whereConditions,
    orderBy: [
      { position: 'asc' },
      { createdAt: 'desc' },
    ],
  });

  return result;
};

const getBannerById = async (id: string) => {
  const result = await prisma.banner.findUnique({
    where: { id },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Banner not found');
  }

  return result;
};

const updateBanner = async (id: string, payload: IUpdateBanner) => {
  const banner = await prisma.banner.findUnique({
    where: { id },
  });

  if (!banner) {
    throw new AppError(httpStatus.NOT_FOUND, 'Banner not found');
  }

  const result = await prisma.banner.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteBanner = async (id: string) => {
  const banner = await prisma.banner.findUnique({
    where: { id },
  });

  if (!banner) {
    throw new AppError(httpStatus.NOT_FOUND, 'Banner not found');
  }

  await prisma.banner.delete({
    where: { id },
  });

  return null;
};

export const BannerService = {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
};
