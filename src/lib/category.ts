import { apiRequest } from './http';

export type Category = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  activeListingCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryInput = {
  title: string;
  description: string;
  image: File;
};

export type UpdateCategoryInput = {
  id: string;
  title: string;
  description: string;
  image?: File | null;
};

export const categoryQueryKeys = {
  all: ['categories'] as const,
  detail: (id: string) => ['categories', id] as const
};

function createCategoryFormData(input: {
  title: string;
  description: string;
  image?: File | null;
}) {
  const formData = new FormData();
  formData.append('title', input.title);
  formData.append('description', input.description);

  if (input.image) {
    formData.append('image', input.image);
  }

  return formData;
}

export async function getCategories() {
  const response = await apiRequest<Category[]>('/categories');
  return response.data;
}

export async function getCategoryById(id: string) {
  const response = await apiRequest<Category>(`/categories/${id}`);
  return response.data;
}

export async function createCategory(input: CreateCategoryInput) {
  const response = await apiRequest<Category>('/categories', {
    method: 'POST',
    body: createCategoryFormData(input)
  });

  return response.data;
}

export async function updateCategory(input: UpdateCategoryInput) {
  const response = await apiRequest<Category>(`/categories/${input.id}`, {
    method: 'PATCH',
    body: createCategoryFormData(input)
  });

  return response.data;
}

export async function deleteCategory(id: string) {
  const response = await apiRequest<{ id: string }>(`/categories/${id}`, {
    method: 'DELETE'
  });

  return response.data;
}
