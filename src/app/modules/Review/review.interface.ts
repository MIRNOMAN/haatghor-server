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
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface IUpdateReviewStatus {
  status: 'APPROVED' | 'REJECTED';
}
