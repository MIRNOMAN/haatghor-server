import { ContactStatus } from '@prisma/client';

export interface IContactUs {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status?: ContactStatus;
  response?: string;
  respondedAt?: Date;
  respondedBy?: string;
  isRead?: boolean;
}

export interface IContactUsFilters {
   searchTerm?: string;
  status?: ContactStatus;
  isRead?: string;
  email?: string;
}

export interface IContactUsResponse {
  response: string;
  respondedBy: string;
}
