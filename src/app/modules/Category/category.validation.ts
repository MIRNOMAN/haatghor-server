import { z } from 'zod';

const createCategoryValidation = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Category name is required',
    }).min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
    image: z.string().url().optional(),
    isActive: z.boolean().optional().default(true),
  }),
});

const updateCategoryValidation = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    image: z.string().url().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const CategoryValidation = {
  createCategoryValidation,
  updateCategoryValidation,
};
