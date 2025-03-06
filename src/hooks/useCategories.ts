import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api-client";
import { Category } from "./useProducts";

// Types
export interface CreateCategoryData {
  name: string;
  description?: string;
  color?: string;
}

// API functions
const fetchCategories = async () => {
  const response = await apiClient.get("/categories");
  return response.data;
};

const fetchCategory = async (id: number) => {
  const response = await apiClient.get(`/categories/${id}`);
  return response.data;
};

const createCategory = async (data: CreateCategoryData) => {
  const response = await apiClient.post("/categories", data);
  return response.data;
};

const updateCategory = async ({
  id,
  data,
}: {
  id: number;
  data: Partial<Category>;
}) => {
  const response = await apiClient.patch(`/categories/${id}`, data);
  return response.data;
};

const deleteCategory = async (id: number) => {
  const response = await apiClient.delete(`/categories/${id}`);
  return response.data;
};

// Hooks
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
}

export function useCategory(id: number) {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: () => fetchCategory(id),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories", data.id] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
