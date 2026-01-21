import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CartService } from './cart.service';

const addToCart = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await CartService.addToCart(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Item added to cart successfully',
    data: result,
  });
});

const getCart = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await CartService.getCart(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Cart retrieved successfully',
    data: result,
  });
});

const updateCartItem = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;
  const result = await CartService.updateCartItem(userId, productId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Cart item updated successfully',
    data: result,
  });
});

const removeFromCart = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;
  const result = await CartService.removeFromCart(userId, productId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Item removed from cart successfully',
    data: result,
  });
});

const clearCart = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await CartService.clearCart(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Cart cleared successfully',
    data: result,
  });
});

export const CartController = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
