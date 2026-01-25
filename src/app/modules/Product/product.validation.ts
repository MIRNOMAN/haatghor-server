import { z } from 'zod';

// Variant schema for your product
const variantSchema = z.object({
  name: z.string({
    required_error: 'Variant name is required',
  }),
  options: z.array(z.string()).min(1, 'At least one option is required'),
});

// Specifications schema
const specificationsSchema = z.record(z.string(), z.string());

// Create product validation
const createProductValidation = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Product name is required',
    }).min(3, 'Name must be at least 3 characters'),
    slug: z.string({
      required_error: 'Slug is required',
    }).min(3, 'Slug must be at least 3 characters'),
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
    status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
    specifications: specificationsSchema.optional(),
    variants: z.array(variantSchema).optional(),
    isFeatured: z.boolean().optional().default(false),
    tags: z.array(z.string()).optional(),
  }),
});

// Update product validation
const updateProductValidation = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    slug: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    categoryId: z.string().optional(),
    brand: z.string().optional(),
    images: z.array(z.string().url()).optional(),
    price: z.number().positive().optional(),
    discount: z.number().min(0).max(100).optional(),
    stock: z.number().int().min(0).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    specifications: specificationsSchema.optional(),
    variants: z.array(variantSchema).optional(),
    isFeatured: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const ProductValidation = {
  createProductValidation,
  updateProductValidation,
};
