import { z } from 'zod';

const createImageValidation = z.object({
  body: z.object({
    category: z.string().optional(),
    alt: z.string().optional(),
    description: z.string().optional(),
  }),
});

const updateImageValidation = z.object({
  body: z.object({
    category: z.string().optional(),
    alt: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const ImageValidation = {
  createImageValidation,
  updateImageValidation,
};
