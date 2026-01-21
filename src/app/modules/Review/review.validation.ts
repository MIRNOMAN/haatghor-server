import { z } from 'zod';

const createReviewValidation = z.object({
  body: z.object({
    productId: z.string({
      required_error: 'Product ID is required',
    }),
    rating: z.number({
      required_error: 'Rating is required',
    }).int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
    comment: z.string().optional(),
    images: z.array(z.string().url()).optional(),
  }),
});

const updateReviewValidation = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().optional(),
    images: z.array(z.string().url()).optional(),
  }),
});

export const ReviewValidation = {
  createReviewValidation,
  updateReviewValidation,
};
