import { z } from 'zod';

const createFlashSaleSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    description: z.string().optional(),
    productId: z.string({ required_error: 'Product ID is required' }),
    flashPrice: z.number({ required_error: 'Flash price is required' }).positive(),
    totalStock: z.number({ required_error: 'Total stock is required' }).int().positive(),
    startTime: z.string({ required_error: 'Start time is required' }),
    endTime: z.string({ required_error: 'End time is required' }),
    isFeatured: z.boolean().optional(),
  }),
});

const updateFlashSaleSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    flashPrice: z.number().positive().optional(),
    totalStock: z.number().int().positive().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  }),
});

export const FlashSaleValidation = {
  createFlashSaleSchema,
  updateFlashSaleSchema,
};
