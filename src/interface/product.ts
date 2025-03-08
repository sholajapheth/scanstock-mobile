import { Category } from "../hooks/useProducts";

export interface Product {
  id?: number;
  name: string;
  price: number;
  barcode: string;
  description?: string;
  quantity: number;
  imageUrl?: string;
  sku?: string;
  isActive?: boolean;
  isFavorite?: boolean;
  reorderPoint?: number;
  costPrice?: number;
  categoryId?: number;
  category?: Category;
}

export interface CreateProductData {
  name: string;
  price: number;
  barcode: string;
  description?: string;
  quantity?: number;
  imageUrl?: string;
  sku?: string;
  isActive?: boolean;
  isFavorite?: boolean;
  reorderPoint?: number;
  costPrice?: number;
  categoryId?: number;
}
