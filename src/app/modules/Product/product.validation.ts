import { z } from 'zod';

const variantSchema = z.object({
  name: z.string(),
  value: z.string(),
  price: z.number().optional(),
  stock: z.number().optional(),
});

const createProductValidation = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Product name is required',
    }).min(3, 'Name must be at least 3 characters'),
    description: z.string({
      required_error: 'Description is required',
    }).min(10, 'Description must be at least 10 characters'),
    categoryId: z.string({
      required_error: 'Category ID is required',
    }),
    brand: z.string().optional(),
    images: z.array(z.string().url()).min(1, 'At least one image is required'),
    price: z.number({
      required_error: 'Price is required',
    }).positive('Price must be positive'),
    discount: z.number().min(0).max(100).optional().default(0),
    stock: z.number({
      required_error: 'Stock is required',
    }).int().min(0),
    variants: z.array(variantSchema).optional(),
    isFeatured: z.boolean().optional().default(false),
    tags: z.array(z.string()).optional(),
  }),
});

const updateProductValidation = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    categoryId: z.string().optional(),
    brand: z.string().optional(),
    images: z.array(z.string().url()).optional(),
    price: z.number().positive().optional(),
    discount: z.number().min(0).max(100).optional(),
    stock: z.number().int().min(0).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    variants: z.array(variantSchema).optional(),
    isFeatured: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const ProductValidation = {
  createProductValidation,
  updateProductValidation,
};
