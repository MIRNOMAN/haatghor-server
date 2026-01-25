import { Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { IPaginationOptions } from '../../interface/pagination.type';
import { calculatePagination } from '../../utils/calculatePagination';
import { prisma } from '../../utils/prisma';
import { IImageFilters, IImageUpdate } from './image.interface';
import {
  uploadSingleFileToVPS,
  uploadMultipleFilesToVPS,
  deleteFileFromVPS,
  getFilePathFromFilename,
  fileExists,
} from '../../utils/uploadToVPS';

/**
 * Upload single image
 */
const uploadSingleImage = async (
  file: Express.Multer.File,
  metadata?: { category?: string; alt?: string; description?: string },
) => {
  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No file provided');
  }

  // Upload file to VPS
  const uploadedFile = await uploadSingleFileToVPS(file);

  // Save to database
  const result = await prisma.image.create({
    data: {
      filename: uploadedFile.filename,
      originalName: uploadedFile.originalName,
      path: uploadedFile.path,
      url: uploadedFile.url,
      mimetype: uploadedFile.mimetype,
      size: uploadedFile.size,
      category: metadata?.category,
      alt: metadata?.alt,
      description: metadata?.description,
    },
  });

  return result;
};

/**
 * Upload multiple images
 */
const uploadMultipleImages = async (
  files: Express.Multer.File[],
  metadata?: { category?: string; alt?: string; description?: string },
) => {
  if (!files || files.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No files provided');
  }

  // Upload files to VPS
  const uploadedFiles = await uploadMultipleFilesToVPS(files);

  // Save to database
  const imagePromises = uploadedFiles.map(file =>
    prisma.image.create({
      data: {
        filename: file.filename,
        originalName: file.originalName,
        path: file.path,
        url: file.url,
        mimetype: file.mimetype,
        size: file.size,
        category: metadata?.category,
        alt: metadata?.alt,
        description: metadata?.description,
      },
    }),
  );

  const results = await Promise.all(imagePromises);
  return results;
};

/**
 * Get all images with filtering and pagination
 */
const getAllImages = async (
  filters: IImageFilters,
  paginationOptions: IPaginationOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    calculatePagination(paginationOptions);
  const { searchTerm, category, isActive, mimetype } = filters;

  const andConditions: Prisma.ImageWhereInput[] = [];

  // Search term
  if (searchTerm) {
    andConditions.push({
      OR: [
        { originalName: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { alt: { contains: searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  // Category filter
  if (category) {
    andConditions.push({ category: { equals: category, mode: 'insensitive' } });
  }

  // Active status filter
  if (isActive !== undefined) {
    andConditions.push({ isActive: isActive === 'true' });
  }

  // Mimetype filter
  if (mimetype) {
    andConditions.push({ mimetype: { contains: mimetype, mode: 'insensitive' } });
  }

  const whereConditions: Prisma.ImageWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.image.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
  });

  const total = await prisma.image.count({
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

/**
 * Get single image by ID
 */
const getImageById = async (id: string) => {
  const result = await prisma.image.findUnique({
    where: { id },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Image not found');
  }

  return result;
};

/**
 * Get image file for serving
 */
const getImageFile = async (filename: string) => {
  const filePath = getFilePathFromFilename(filename);

  if (!fileExists(filename)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Image file not found');
  }

  // Get image metadata from database
  const imageData = await prisma.image.findFirst({
    where: { filename },
  });

  return {
    filePath,
    mimetype: imageData?.mimetype || 'application/octet-stream',
  };
};

/**
 * Update image metadata
 */
const updateImage = async (id: string, payload: IImageUpdate) => {
  const image = await prisma.image.findUnique({
    where: { id },
  });

  if (!image) {
    throw new AppError(httpStatus.NOT_FOUND, 'Image not found');
  }

  const result = await prisma.image.update({
    where: { id },
    data: payload,
  });

  return result;
};

/**
 * Replace image file
 */
const replaceImage = async (
  id: string,
  file: Express.Multer.File,
  metadata?: { category?: string; alt?: string; description?: string },
) => {
  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No file provided');
  }

  const existingImage = await prisma.image.findUnique({
    where: { id },
  });

  if (!existingImage) {
    throw new AppError(httpStatus.NOT_FOUND, 'Image not found');
  }

  // Delete old file
  await deleteFileFromVPS(existingImage.filename);

  // Upload new file
  const uploadedFile = await uploadSingleFileToVPS(file);

  // Update database
  const result = await prisma.image.update({
    where: { id },
    data: {
      filename: uploadedFile.filename,
      originalName: uploadedFile.originalName,
      path: uploadedFile.path,
      url: uploadedFile.url,
      mimetype: uploadedFile.mimetype,
      size: uploadedFile.size,
      category: metadata?.category ?? existingImage.category,
      alt: metadata?.alt ?? existingImage.alt,
      description: metadata?.description ?? existingImage.description,
    },
  });

  return result;
};

/**
 * Delete image
 */
const deleteImage = async (id: string) => {
  const image = await prisma.image.findUnique({
    where: { id },
  });

  if (!image) {
    throw new AppError(httpStatus.NOT_FOUND, 'Image not found');
  }

  // Delete file from filesystem
  await deleteFileFromVPS(image.filename);

  // Delete from database
  const result = await prisma.image.delete({
    where: { id },
  });

  return result;
};

/**
 * Delete multiple images
 */
const deleteMultipleImages = async (ids: string[]) => {
  if (!ids || ids.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No image IDs provided');
  }

  const images = await prisma.image.findMany({
    where: { id: { in: ids } },
  });

  // Delete files from filesystem
  const deletePromises = images.map(image => deleteFileFromVPS(image.filename));
  await Promise.all(deletePromises);

  // Delete from database
  const result = await prisma.image.deleteMany({
    where: { id: { in: ids } },
  });

  return result;
};

export const ImageService = {
  uploadSingleImage,
  uploadMultipleImages,
  getAllImages,
  getImageById,
  getImageFile,
  updateImage,
  replaceImage,
  deleteImage,
  deleteMultipleImages,
};
