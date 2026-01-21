import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';
import { IAddToWishlist } from './wishlist.interface';

const addToWishlist = async (userId: string, payload: IAddToWishlist) => {
  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: payload.productId },
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  // Check if already in wishlist
  const existing = await prisma.wishlist.findUnique({
    where: {
      userId_productId: {
        userId,
        productId: payload.productId,
      },
    },
  });

  if (existing) {
    throw new AppError(httpStatus.CONFLICT, 'Product already in wishlist');
  }

  const result = await prisma.wishlist.create({
    data: {
      userId,
      productId: payload.productId,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: true,
          price: true,
          discount: true,
          rating: true,
          stock: true,
          status: true,
        },
      },
    },
  });

  return result;
};

const getWishlist = async (userId: string) => {
  const result = await prisma.wishlist.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: true,
          price: true,
          discount: true,
          rating: true,
          stock: true,
          status: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return result;
};

const removeFromWishlist = async (userId: string, productId: string) => {
  const wishlistItem = await prisma.wishlist.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (!wishlistItem) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found in wishlist');
  }

  await prisma.wishlist.delete({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  return null;
};

export const WishlistService = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};
