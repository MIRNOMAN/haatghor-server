import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FlashSaleService } from './flashSale.service';
import pick from '../../utils/pick';

// Create Flash Sale (Admin)
const createFlashSale = catchAsync(async (req, res) => {
  const result = await FlashSaleService.createFlashSale(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Flash sale created successfully',
    data: result,
  });
});

// Get All Flash Sales
const getAllFlashSales = catchAsync(async (req, res) => {
  const filters = pick(req.query, ['searchTerm', 'isActive', 'isFeatured', 'status']);
  const paginationOptions = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);

  const result = await FlashSaleService.getAllFlashSales(filters, paginationOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Flash sales retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// Get Live Flash Sales
const getLiveFlashSales = catchAsync(async (req, res) => {
  const result = await FlashSaleService.getLiveFlashSales();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Live flash sales retrieved successfully',
    data: result,
  });
});

// Get Flash Sale by ID
const getFlashSaleById = catchAsync(async (req, res) => {
  const result = await FlashSaleService.getFlashSaleById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Flash sale retrieved successfully',
    data: result,
  });
});

// Update Flash Sale (Admin)
const updateFlashSale = catchAsync(async (req, res) => {
  const result = await FlashSaleService.updateFlashSale(req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Flash sale updated successfully',
    data: result,
  });
});

// Delete Flash Sale (Admin)
const deleteFlashSale = catchAsync(async (req, res) => {
  const result = await FlashSaleService.deleteFlashSale(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Flash sale deleted successfully',
    data: result,
  });
});

export const FlashSaleController = {
  createFlashSale,
  getAllFlashSales,
  getLiveFlashSales,
  getFlashSaleById,
  updateFlashSale,
  deleteFlashSale,
};
