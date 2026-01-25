import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ImageService } from './image.service';
import { pickValidFields } from '../../utils/pickValidFields';
import fs from 'fs';

const uploadSingleImage = catchAsync(async (req, res) => {
  const file = req.file;
  const metadata = req.body;

  const result = await ImageService.uploadSingleImage(file!, metadata);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Image uploaded successfully',
    data: result,
  });
});

const uploadMultipleImages = catchAsync(async (req, res) => {
  const files = req.files as Express.Multer.File[];
  const metadata = req.body;

  const result = await ImageService.uploadMultipleImages(files, metadata);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: `${result.length} images uploaded successfully`,
    data: result,
  });
});

const getAllImages = catchAsync(async (req, res) => {
  const filters = pickValidFields(req.query, [
    'searchTerm',
    'category',
    'isActive',
    'mimetype',
  ]);

  const paginationOptions = pickValidFields(req.query, [
    'page',
    'limit',
    'sortBy',
    'sortOrder',
  ]);

  const result = await ImageService.getAllImages(filters, paginationOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Images retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getImageById = catchAsync(async (req, res) => {
  const result = await ImageService.getImageById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Image retrieved successfully',
    data: result,
  });
});

const serveImage = catchAsync(async (req, res) => {
  const { filename } = req.params;
  const { filePath, mimetype } = await ImageService.getImageFile(filename);

  res.setHeader('Content-Type', mimetype);
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

const updateImage = catchAsync(async (req, res) => {
  const result = await ImageService.updateImage(req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Image updated successfully',
    data: result,
  });
});

const replaceImage = catchAsync(async (req, res) => {
  const file = req.file;
  const metadata = req.body;

  const result = await ImageService.replaceImage(req.params.id, file!, metadata);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Image replaced successfully',
    data: result,
  });
});

const deleteImage = catchAsync(async (req, res) => {
  await ImageService.deleteImage(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Image deleted successfully',
    data: null,
  });
});

const deleteMultipleImages = catchAsync(async (req, res) => {
  const { ids } = req.body;
  await ImageService.deleteMultipleImages(ids);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Images deleted successfully',
    data: null,
  });
});

export const ImageController = {
  uploadSingleImage,
  uploadMultipleImages,
  getAllImages,
  getImageById,
  serveImage,
  updateImage,
  replaceImage,
  deleteImage,
  deleteMultipleImages,
};
