import { ProductStatus } from '@/prisma/schema/generated/prisma/enums';

export interface IVariant {
  name: string;
  value: string;
  price?: number;
  stock?: number;
}

export interface IProduct {
  id?: string;
  name: string;
  slug?: string;
  description: string;
  categoryId: string;
  brand?: string;
  images: string[];
  price: number;
  discount?: number;
  stock: number;
  status?: ProductStatus;
  variants?: IVariant[];
  isFeatured?: boolean;
  tags?: string[];
}

export interface IProductFilters {
  searchTerm?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
  status?: string;
  isFeatured?: string;
  tags?: string;
}
