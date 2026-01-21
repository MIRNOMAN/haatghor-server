import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BannerService } from './banner.service';
import { pickValidFields } from '../../utils/pickValidFields';

const createBanner = catchAsync(async (req, res) => {
  const result = await BannerService.createBanner(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Banner created successfully',
    data: result,
  });
});

const getAllBanners = catchAsync(async (req, res) => {
  const filters = pickValidFields(req.query, ['type', 'isActive']);
  const result = await BannerService.getAllBanners(filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Banners retrieved successfully',
    data: result,
  });
});

const getBannerById = catchAsync(async (req, res) => {
  const result = await BannerService.getBannerById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Banner retrieved successfully',
    data: result,
  });
});

const updateBanner = catchAsync(async (req, res) => {
  const result = await BannerService.updateBanner(req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Banner updated successfully',
    data: result,
  });
});

const deleteBanner = catchAsync(async (req, res) => {
  await BannerService.deleteBanner(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Banner deleted successfully',
    data: null,
  });
});

export const BannerController = {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
};
