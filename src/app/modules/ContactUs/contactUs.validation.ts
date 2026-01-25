import { z } from 'zod';

const createContactUsValidation = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Name is required',
      })
      .min(2, 'Name must be at least 2 characters'),
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email address'),
    phone: z.string().optional(),
    subject: z
      .string({
        required_error: 'Subject is required',
      })
      .min(3, 'Subject must be at least 3 characters'),
    message: z
      .string({
        required_error: 'Message is required',
      })
      .min(10, 'Message must be at least 10 characters'),
  }),
});

const updateContactUsValidation = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
    response: z.string().optional(),
    isRead: z.boolean().optional(),
  }),
});

const respondToContactValidation = z.object({
  body: z.object({
    response: z
      .string({
        required_error: 'Response is required',
      })
      .min(10, 'Response must be at least 10 characters'),
    status: z.enum(['IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  }),
});

export const ContactUsValidation = {
  createContactUsValidation,
  updateContactUsValidation,
  respondToContactValidation,
};
