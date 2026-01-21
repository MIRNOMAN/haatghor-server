import { z } from 'zod';

const variantSchema = z.object({
  name: z.string(),
  value: z.string(),
  price: z.number().optional(),
  stock: z.number().optional(),
});

const addToCartValidation = z.object({
  body: z.object({
    productId: z.string({
      required_error: 'Product ID is required',
    }),
    quantity: z.number({
      required_error: 'Quantity is required',
    }).int().positive(),
    selectedVariants: z.array(variantSchema).optional(),
  }),
});

const updateCartValidation = z.object({
  body: z.object({
    quantity: z.number({
      required_error: 'Quantity is required',
    }).int().positive(),
  }),
});

export const CartValidation = {
  addToCartValidation,
  updateCartValidation,
};
