export interface IReview {
  productId: string;
  rating: number;
  comment?: string;
  images?: string[];
}

export interface IUpdateReview {
  rating?: number;
  comment?: string;
  images?: string[];
}

export interface IReviewFilters {
  productId?: string;
  rating?: string;
  isVerifiedPurchase?: string;
}
