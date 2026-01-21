export interface ICategory {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive?: boolean;
}

export interface ICategoryFilters {
  searchTerm?: string;
  isActive?: string;
}
