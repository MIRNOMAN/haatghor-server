import { z } from 'zod';

const shippingAddressSchema = z.object({
  fullName: z.string({ required_error: 'Full name is required' }),
  phone: z.string({ required_error: 'Phone is required' }),
  email: z.string().email().optional(),
  address: z.string({ required_error: 'Address is required' }),
  city: z.string({ required_error: 'City is required' }),
  state: z.string({ required_error: 'State is required' }),
  zipCode: z.string({ required_error: 'Zip code is required' }),
  country: z.string({ required_error: 'Country is required' }),
});

const createOrderValidation = z.object({
  body: z.object({
    shippingAddress: shippingAddressSchema,
    paymentMethod: z.enum(['BKASH', 'NAGAD', 'CASH_ON_DELIVERY', 'STRIPE'], {
      required_error: 'Payment method is required',
    }),
    notes: z.string().optional(),
  }),
});

const updateOrderStatusValidation = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'], {
      required_error: 'Status is required',
    }),
    trackingNumber: z.string().optional(),
  }),
});

export const OrderValidation = {
  createOrderValidation,
  updateOrderStatusValidation,
};
