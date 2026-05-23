'use client';

import {
  categoryQueryKeys,
  createCategory,
  deleteCategory,
  getCategoryById,
  getCategories,
  updateCategory,
  type CreateCategoryInput,
  type UpdateCategoryInput
} from '@/lib/category';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useCategoriesQuery() {
  return useQuery({
    queryKey: categoryQueryKeys.all,
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000
  });
}

export function useCategoryQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: categoryQueryKeys.detail(id),
    queryFn: () => getCategoryById(id),
    enabled: enabled && id.trim().length > 0,
    staleTime: 5 * 60 * 1000
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
    }
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCategoryInput) => updateCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
    }
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
    }
  });
}
