import { PrismaClient } from '@/generated/client';

export const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
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
  accelerateUrl: process.env.DATABASE_URL!,
});
