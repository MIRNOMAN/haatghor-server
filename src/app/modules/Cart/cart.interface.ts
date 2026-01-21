export interface ICartItem {
  productId: string;
  quantity: number;
  selectedVariants?: {
    name: string;
    value: string;
    price?: number;
    stock?: number;
  }[];
}

export interface IAddToCart {
  productId: string;
  quantity: number;
  selectedVariants?: {
    name: string;
    value: string;
    price?: number;
    stock?: number;
  }[];
}

export interface IUpdateCart {
  quantity: number;
}
