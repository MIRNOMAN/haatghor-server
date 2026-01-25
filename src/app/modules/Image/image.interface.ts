export interface IImage {
  id?: string;
  filename: string;
  originalName: string;
  path: string;
  url: string;
  mimetype: string;
  size: number;
  category?: string;
  alt?: string;
  description?: string;
  isActive?: boolean;
}

export interface IImageFilters {
  searchTerm?: string;
  category?: string;
  isActive?: string;
  mimetype?: string;
}

export interface IImageUpdate {
  category?: string;
  alt?: string;
  description?: string;
  isActive?: boolean;
}
