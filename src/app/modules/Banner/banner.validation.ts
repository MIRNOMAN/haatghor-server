import { z } from 'zod';

const createBannerValidation = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    subtitle: z.string().optional(),
    image: z.string({ required_error: 'Image is required' }).url(),
    link: z.string().url().optional(),
    position: z.number().int().optional().default(0),
    isActive: z.boolean().optional().default(true),
    type: z.enum(['HOME', 'CATEGORY', 'PROMOTIONAL']).optional().default('HOME'),
  }),
});

const updateBannerValidation = z.object({
  body: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    image: z.string().url().optional(),
    link: z.string().url().optional(),
    position: z.number().int().optional(),
    isActive: z.boolean().optional(),
    type: z.enum(['HOME', 'CATEGORY', 'PROMOTIONAL']).optional(),
  }),
});

export const BannerValidation = {
  createBannerValidation,
  updateBannerValidation,
};
