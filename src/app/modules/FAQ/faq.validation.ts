import { z } from 'zod';

const createFAQValidation = z.object({
  body: z.object({
    question: z
      .string({
        required_error: 'Question is required',
      })
      .min(5, 'Question must be at least 5 characters'),
    answer: z
      .string({
        required_error: 'Answer is required',
      })
      .min(10, 'Answer must be at least 10 characters'),
    category: z.string().optional(),
    order: z.number().int().min(0).optional().default(0),
    isActive: z.boolean().optional().default(true),
  }),
});

const updateFAQValidation = z.object({
  body: z.object({
    question: z.string().min(5).optional(),
    answer: z.string().min(10).optional(),
    category: z.string().optional(),
    order: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const FAQValidation = {
  createFAQValidation,
  updateFAQValidation,
};
