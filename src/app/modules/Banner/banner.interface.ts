import { BannerType } from 'prisma/src/generated/prisma/enums';

export interface IBanner {
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  position?: number;
  isActive?: boolean;
  type?: BannerType;
}

export interface IUpdateBanner {
  title?: string;
  subtitle?: string;
  image?: string;
  link?: string;
  position?: number;
  isActive?: boolean;
  type?: BannerType;
}

export interface IBannerFilters {
  type?: BannerType;
  isActive?: string;
}
