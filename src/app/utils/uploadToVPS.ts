import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import config from '../../config';

// Create upload directory if it doesn't exist
const UPLOAD_DIR = path.join(process.cwd(), 'src', 'app', 'upload', 'images');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export interface IUploadedFile {
  filename: string;
  originalName: string;
  path: string;
  url: string;
  mimetype: string;
  size: number;
}

/**
 * Upload a single file to VPS local filesystem
 */
export const uploadSingleFileToVPS = async (
  file: Express.Multer.File,
): Promise<IUploadedFile> => {
  try {
    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const filename = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    // Write file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Generate accessible URL
    const baseUrl = config.base_url_server || 'http://localhost:5000';
    const fileUrl = `${baseUrl}/api/v1/images/serve/${filename}`;

    return {
      filename,
      originalName: file.originalname,
      path: filePath,
      url: fileUrl,
      mimetype: file.mimetype,
      size: file.size,
    };
  } catch (error) {
    throw new Error(`Failed to upload file: ${error}`);
  }
};

/**
 * Upload multiple files to VPS local filesystem
 */
export const uploadMultipleFilesToVPS = async (
  files: Express.Multer.File[],
): Promise<IUploadedFile[]> => {
  const uploadPromises = files.map(file => uploadSingleFileToVPS(file));
  return Promise.all(uploadPromises);
};

/**
 * Delete a file from VPS local filesystem
 */
export const deleteFileFromVPS = async (filename: string): Promise<void> => {
  try {
    const filePath = path.join(UPLOAD_DIR, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    throw new Error(`Failed to delete file: ${error}`);
  }
};

/**
 * Get file path from filename
 */
export const getFilePathFromFilename = (filename: string): string => {
  return path.join(UPLOAD_DIR, filename);
};

/**
 * Check if file exists
 */
export const fileExists = (filename: string): boolean => {
  const filePath = path.join(UPLOAD_DIR, filename);
  return fs.existsSync(filePath);
};
