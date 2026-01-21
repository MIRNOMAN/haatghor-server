import { z } from 'zod';

const createAddressValidation = z.object({
  body: z.object({
    fullName: z.string({ message: 'Full name is required' }),
    phone: z.string({ message: 'Phone is required' }),
    email: z.string().email().optional(),
    address: z.string({ message: 'Address is required' }),
    city: z.string({ message: 'City is required' }),
    state: z.string({ message: 'State is required' }),
    zipCode: z.string({ message: 'Zip code is required' }),
    country: z.string({ message: 'Country is required' }),
    isDefault: z.boolean().optional(),
  }),
});

const updateAddressValidation = z.object({
  body: z.object({
    fullName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const AddressValidation = {
  createAddressValidation,
  updateAddressValidation,
};
