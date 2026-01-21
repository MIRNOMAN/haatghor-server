import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { WishlistService } from './wishlist.service';

const addToWishlist = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await WishlistService.addToWishlist(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Product added to wishlist successfully',
    data: result,
  });
});

const getWishlist = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await WishlistService.getWishlist(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Wishlist retrieved successfully',
    data: result,
  });
});

const removeFromWishlist = catchAsync(async (req, res) => {
  const userId = req.user.id;
  await WishlistService.removeFromWishlist(userId, req.params.productId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product removed from wishlist successfully',
    data: null,
  });
});

export const WishlistController = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};
