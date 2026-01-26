export interface ICreateFlashSale {
  title: string;
  description?: string;
  productId: string;
  flashPrice: number;
  totalStock: number;
  startTime: Date;
  endTime: Date;
  isFeatured?: boolean;
}

export interface IUpdateFlashSale {
  title?: string;
  description?: string;
  flashPrice?: number;
  totalStock?: number;
  startTime?: Date;
  endTime?: Date;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface IFlashSaleFilters {
  searchTerm?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  status?: 'UPCOMING' | 'LIVE' | 'ENDED';
}
