import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api-client";

// Types
export interface Product {
  id: number;
  name: string;
  price: number;
  barcode: string;
  description: string;
  quantity: number;
  sku?: string;
  imageUrl?: string;
  isActive: boolean;
  isFavorite: boolean;
  reorderPoint?: number;
  costPrice?: number;
  categoryId?: number;
  category?: Category;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
}

export interface CreateProductData {
  name: string;
  price: number;
  barcode: string;
  description?: string;
  quantity?: number;
  sku?: string;
  imageUrl?: string;
  reorderPoint?: number;
  costPrice?: number;
  categoryId?: number;
}

// API functions
const fetchProducts = async () => {
  const response = await apiClient.get("/products");
  return response.data;
};

const fetchProduct = async (id: number) => {
  const response = await apiClient.get(`/products/${id}`);
  return response.data;
};

const fetchProductByBarcode = async (barcode: string) => {
  const response = await apiClient.get(`/products/barcode/${barcode}`);
  return response.data;
};

const createProduct = async (data: CreateProductData) => {
  const response = await apiClient.post("/products", data);
  return response.data;
};

const updateProduct = async ({
  id,
  data,
}: {
  id: number;
  data: Partial<Product>;
}) => {
  const apiData = {
    name: data.name,
    price: data.price,
    description: data.description,
    quantity: data.quantity,
    categoryId: data.categoryId,
    sku: data.sku,
    reorderPoint: data.reorderPoint,
    costPrice: data.costPrice,
  };
  const response = await apiClient.patch(`/products/${id}`, apiData);
  console.log(apiData);
  console.log(response.data);
  return response.data;
};

const deleteProduct = async (id: number) => {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
};

const toggleFavorite = async (id: number) => {
  const response = await apiClient.patch(`/products/${id}/favorite`);
  return response.data;
};

const searchProducts = async (query: string) => {
  const response = await apiClient.get(`/products/search?q=${query}`);
  return response.data;
};

const fetchLowStockProducts = async () => {
  const response = await apiClient.get("/products/low-stock");
  return response.data;
};

const fetchOutOfStockProducts = async () => {
  const response = await apiClient.get("/products/out-of-stock");
  return response.data;
};

const fetchFavoriteProducts = async () => {
  const response = await apiClient.get("/products/favorites");
  return response.data;
};

const increaseStock = async ({
  id,
  quantity = 1,
}: {
  id: number;
  quantity?: number;
}) => {
  const response = await apiClient.patch(
    `/products/${id}/stock/increase?quantity=${quantity}`
  );
  return response.data;
};

const decreaseStock = async ({
  id,
  quantity = 1,
}: {
  id: number;
  quantity?: number;
}) => {
  const response = await apiClient.patch(
    `/products/${id}/stock/decrease?quantity=${quantity}`
  );
  return response.data;
};

// Hooks
export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
  });
}

export function useProductByBarcode(barcode: string | null) {
  return useQuery({
    queryKey: ["products", "barcode", barcode],
    queryFn: () => fetchProductByBarcode(barcode!),
    enabled: !!barcode,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", data.id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleFavorite,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", data.id] });
      queryClient.invalidateQueries({ queryKey: ["products", "favorites"] });
    },
  });
}

export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: ["products", "search", query],
    queryFn: () => searchProducts(query),
    enabled: query.length > 0,
  });
}

export function useLowStockProducts() {
  return useQuery({
    queryKey: ["products", "low-stock"],
    queryFn: fetchLowStockProducts,
  });
}

export function useOutOfStockProducts() {
  return useQuery({
    queryKey: ["products", "out-of-stock"],
    queryFn: fetchOutOfStockProducts,
  });
}

export function useFavoriteProducts() {
  return useQuery({
    queryKey: ["products", "favorites"],
    queryFn: fetchFavoriteProducts,
  });
}

export function useIncreaseStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: increaseStock,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", data.id] });
    },
  });
}

export function useDecreaseStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: decreaseStock,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", data.id] });
    },
  });
}
