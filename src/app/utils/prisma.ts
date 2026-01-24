import { PrismaClient } from 'prisma/src/generated/prisma/client';

export const prisma = new PrismaClient({
  adapter: null,
  omit: {
    user: {
      password: true,
      otp: true,
      otpExpiry: true,
      isEmailVerified: true,
      emailVerificationToken: true,
      emailVerificationTokenExpires: true,
      isAgreeWithTerms: true,
    },
  },
});

export const insecurePrisma = new PrismaClient({
  adapter: null,
});
