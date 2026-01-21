import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';
import { IAddToCart, IUpdateCart } from './cart.interface';

const addToCart = async (userId: string, payload: IAddToCart) => {
  // Check if product exists and has sufficient stock
  const product = await prisma.product.findUnique({
    where: { id: payload.productId },
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  if (product.status !== 'ACTIVE') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Product is not available');
  }

  if (product.stock < payload.quantity) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient stock available');
  }

  // Get or create cart
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: true },
    });
  }

  // Check if item already exists in cart
  const existingItem = cart.items.find(item => item.productId === payload.productId);

  if (existingItem) {
    // Update quantity
    const newQuantity = existingItem.quantity + payload.quantity;

    if (product.stock < newQuantity) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient stock available');
    }

    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    });
  } else {
    // Add new item
    const finalPrice = product.price * (1 - product.discount / 100);

    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: payload.productId,
        quantity: payload.quantity,
        price: finalPrice,
        selectedVariants: payload.selectedVariants || [],
      },
    });
  }

  return getCart(userId);
};

const getCart = async (userId: string) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
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
              discount: true,
              stock: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
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
                discount: true,
                stock: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  // Calculate totals
  const subtotal = cart.items.reduce((sum, item) => {
    const itemPrice = item.product.price * (1 - item.product.discount / 100);
    return sum + itemPrice * item.quantity;
  }, 0);

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cart,
    summary: {
      subtotal: Math.round(subtotal * 100) / 100,
      totalItems,
    },
  };
};

const updateCartItem = async (userId: string, productId: string, payload: IUpdateCart) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });

  if (!cart) {
    throw new AppError(httpStatus.NOT_FOUND, 'Cart not found');
  }

  const cartItem = cart.items.find(item => item.productId === productId);

  if (!cartItem) {
    throw new AppError(httpStatus.NOT_FOUND, 'Item not found in cart');
  }

  // Check stock availability
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  if (product.stock < payload.quantity) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient stock available');
  }

  await prisma.cartItem.update({
    where: { id: cartItem.id },
    data: { quantity: payload.quantity },
  });

  return getCart(userId);
};

const removeFromCart = async (userId: string, productId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });

  if (!cart) {
    throw new AppError(httpStatus.NOT_FOUND, 'Cart not found');
  }

  const cartItem = cart.items.find(item => item.productId === productId);

  if (!cartItem) {
    throw new AppError(httpStatus.NOT_FOUND, 'Item not found in cart');
  }

  await prisma.cartItem.delete({
    where: { id: cartItem.id },
  });

  return getCart(userId);
};

const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    throw new AppError(httpStatus.NOT_FOUND, 'Cart not found');
  }

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return getCart(userId);
};

export const CartService = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
