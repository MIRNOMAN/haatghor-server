import { z } from 'zod';

const createPrivacyPolicyValidation = z.object({
  body: z.object({
    title: z
      .string({
        required_error: 'Title is required',
      })
      .min(3, 'Title must be at least 3 characters'),
    content: z
      .string({
        required_error: 'Content is required',
      })
      .min(10, 'Content must be at least 10 characters'),
    section: z.string().optional(),
    order: z.number().int().min(0).optional().default(0),
    version: z.string().optional().default('1.0'),
    isActive: z.boolean().optional().default(true),
    effectiveDate: z.string().datetime().optional(),
  }),
});

const updatePrivacyPolicyValidation = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    content: z.string().min(10).optional(),
    section: z.string().optional(),
    order: z.number().int().min(0).optional(),
    version: z.string().optional(),
    isActive: z.boolean().optional(),
    effectiveDate: z.string().datetime().optional(),
  }),
});

export const PrivacyPolicyValidation = {
  createPrivacyPolicyValidation,
  updatePrivacyPolicyValidation,
};
