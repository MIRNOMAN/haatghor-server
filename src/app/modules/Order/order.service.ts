import { Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import { nanoid } from 'nanoid';
import AppError from '../../errors/AppError';
import { IPaginationOptions } from '../../interface/pagination.type';
import { calculatePagination } from '../../utils/calculatePagination';
import { prisma } from '../../utils/prisma';
import {
  ICreateOrder,
  IOrderFilters,
  IUpdateOrderStatus,
} from './order.interface';

const createOrder = async (userId: string, payload: ICreateOrder) => {
  // Get user's cart
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Cart is empty');
  }

  // Validate stock and calculate totals
  let subtotal = 0;
  const orderItems: any[] = [];

  for (const item of cart.items) {
    const product = item.product;

    if (product.status !== 'ACTIVE') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Product ${product.name} is not available`,
      );
    }

    if (product.stock < item.quantity) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Insufficient stock for ${product.name}. Available: ${product.stock}`,
      );
    }

    const itemPrice = product.price * (1 - product.discount / 100);
    subtotal += itemPrice * item.quantity;

    orderItems.push({
      productId: item.productId,
      quantity: item.quantity,
      price: itemPrice,
      discount: product.discount,
      selectedVariants: item.selectedVariants,
    });
  }

  const deliveryCharge = 50; // Fixed delivery charge
  const finalAmount = subtotal + deliveryCharge;

  // Generate order number
  const orderNumber = `ORD-${nanoid(10).toUpperCase()}`;

  // Create order in transaction
  const result = await prisma.$transaction(async tx => {
    // Create order
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        totalAmount: subtotal,
        deliveryCharge,
        finalAmount,
        paymentMethod: payload.paymentMethod,
        shippingAddress: payload.shippingAddress,
        notes: payload.notes,
        status:
          payload.paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PENDING',
        paymentStatus:
          payload.paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PENDING',
      },
    });

    // Create order items
    await tx.orderItem.createMany({
      data: orderItems.map(item => ({
        orderId: order.id,
        ...item,
      })),
    });

    // Reduce stock for each product
    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Clear cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return order;
  });

  // Fetch complete order details
  const completeOrder = await prisma.order.findUnique({
    where: { id: result.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return completeOrder;
};

const getUserOrders = async (
  userId: string,
  filters: IOrderFilters,
  paginationOptions: IPaginationOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    calculatePagination(paginationOptions);
  const { status, paymentStatus } = filters;

  const andConditions: Prisma.OrderWhereInput[] = [{ userId }];

  if (status) {
    andConditions.push({ status });
  }

  if (paymentStatus) {
    andConditions.push({ paymentStatus });
  }

  const whereConditions: Prisma.OrderWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.order.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
            },
          },
        },
      },
    },
  });

  const total = await prisma.order.count({
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

const getOrderById = async (orderId: string, userId?: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
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
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }

  // If userId is provided (for user role), check ownership
  if (userId && order.userId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to view this order',
    );
  }

  return order;
};

const getAllOrders = async (
  filters: IOrderFilters,
  paginationOptions: IPaginationOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    calculatePagination(paginationOptions);
  const { status, paymentStatus, searchTerm, userId } = filters;

  const andConditions: Prisma.OrderWhereInput[] = [];

  if (status) {
    andConditions.push({ status });
  }

  if (paymentStatus) {
    andConditions.push({ paymentStatus });
  }

  if (userId) {
    andConditions.push({ userId });
  }

  if (searchTerm) {
    andConditions.push({
      OR: [
        { orderNumber: { contains: searchTerm, mode: 'insensitive' } },
        {
          shippingAddress: {
            is: { fullName: { contains: searchTerm, mode: 'insensitive' } },
          },
        },
      ],
    });
  }

  const whereConditions: Prisma.OrderWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.order.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  const total = await prisma.order.count({
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

const updateOrderStatus = async (
  orderId: string,
  payload: IUpdateOrderStatus,
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }

  const updateData: any = {
    status: payload.status,
  };

  if (payload.trackingNumber) {
    updateData.trackingNumber = payload.trackingNumber;
  }

  // Update payment status based on order status
  if (payload.status === 'PAID' || payload.status === 'PROCESSING') {
    updateData.paymentStatus = 'SUCCESS';
  } else if (payload.status === 'CANCELLED') {
    updateData.paymentStatus = 'CANCELLED';
  } else if (payload.status === 'REFUNDED') {
    updateData.paymentStatus = 'CANCELLED';

    // Restore stock for refunded orders
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId },
    });

    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }
  }

  const result = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
            },
          },
        },
      },
    },
  });

  return result;
};

export const OrderService = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
