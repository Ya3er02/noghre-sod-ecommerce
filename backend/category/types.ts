export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
}

export interface UpdateCategoryRequest {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  sortOrder?: number;
}
