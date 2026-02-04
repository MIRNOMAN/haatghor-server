export interface IFAQ {
  id?: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
  isActive?: boolean;
}

export interface IFAQFilters {
  searchTerm?: string;
  search?: string;
  category?: string;
  isActive?: string;
}
