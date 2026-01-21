import { OrderStatus, PaymentMethod, PaymentStatus } from '@/generated/enums';

export interface IShippingAddress {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ICreateOrder {
  shippingAddress: IShippingAddress;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface IOrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  searchTerm?: string;
  userId?: string;
}

export interface IUpdateOrderStatus {
  status: OrderStatus;
  trackingNumber?: string;
}
