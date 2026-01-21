import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AddressService } from './address.service';

const createAddress = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await AddressService.createAddress(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Address created successfully',
    data: result,
  });
});

const getAllAddresses = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await AddressService.getAllAddresses(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Addresses retrieved successfully',
    data: result,
  });
});

const getAddressById = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await AddressService.getAddressById(req.params.id, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Address retrieved successfully',
    data: result,
  });
});

const updateAddress = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await AddressService.updateAddress(req.params.id, userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Address updated successfully',
    data: result,
  });
});

const deleteAddress = catchAsync(async (req, res) => {
  const userId = req.user.id;
  await AddressService.deleteAddress(req.params.id, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Address deleted successfully',
    data: null,
  });
});

export const AddressController = {
  createAddress,
  getAllAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
};
