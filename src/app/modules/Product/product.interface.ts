import { ProductStatus } from '@prisma/client';

export interface Variant {
  name: string;
  value: string;
  price?: number;
  stock?: number;
}

export interface IProduct {
  name: string;
  slug?: string;
  description?: string;
  categoryId: string;
  brand?: string;
  images?: string[];
  price: number;
  discount?: number;
  stock?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  specifications?: Record<string, any>;
  variants?: { name: string; options?: string[]; value?: string; price?: number; stock?: number }[];
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
