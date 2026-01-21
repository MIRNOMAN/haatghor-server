import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';
import { IAddress, IUpdateAddress } from './address.interface';

const createAddress = async (userId: string, payload: IAddress) => {
  // If this is set as default, unset other default addresses
  if (payload.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const result = await prisma.address.create({
    data: {
      ...payload,
      userId,
    },
  });

  return result;
};

const getAllAddresses = async (userId: string) => {
  const result = await prisma.address.findMany({
    where: { userId },
    orderBy: [
      { isDefault: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  return result;
};

const getAddressById = async (addressId: string, userId: string) => {
  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address) {
    throw new AppError(httpStatus.NOT_FOUND, 'Address not found');
  }

  if (address.userId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only access your own addresses');
  }

  return address;
};

const updateAddress = async (addressId: string, userId: string, payload: IUpdateAddress) => {
  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address) {
    throw new AppError(httpStatus.NOT_FOUND, 'Address not found');
  }

  if (address.userId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only update your own addresses');
  }

  // If this is set as default, unset other default addresses
  if (payload.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const result = await prisma.address.update({
    where: { id: addressId },
    data: payload,
  });

  return result;
};

const deleteAddress = async (addressId: string, userId: string) => {
  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address) {
    throw new AppError(httpStatus.NOT_FOUND, 'Address not found');
  }

  if (address.userId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only delete your own addresses');
  }

  await prisma.address.delete({
    where: { id: addressId },
  });

  return null;
};

export const AddressService = {
  createAddress,
  getAllAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
};
