import { z } from 'zod';

const addToWishlistValidation = z.object({
  body: z.object({
    productId: z.string({
      message: 'Product ID is required',
    }),
  }),
});

export const WishlistValidation = {
  addToWishlistValidation,
};
