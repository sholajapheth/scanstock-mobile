// src/services/productService.ts
import api from "../lib/api-client";
import { Logger } from "../utils/logger";

const log = new Logger("ProductService");

export interface Product {
  id?: number;
  name: string;
  price: number;
  barcode: string;
  description: string;
  quantity: number;
  categoryId?: number;
  isActive?: boolean;
  isFavorite?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

class ProductService {
  async getAll(): Promise<ApiResponse<Product[]>> {
    log.info("Fetching all products");
    return api.get("/products");
  }

  async getById(id: number): Promise<ApiResponse<Product>> {
    log.info(`Fetching product ${id}`);
    return api.get(`/products/${id}`);
  }

  async getByBarcode(barcode: string): Promise<ApiResponse<Product>> {
    log.info(`Fetching product with barcode ${barcode}`);
    return api.get(`/products/barcode/${barcode}`);
  }

  async create(
    productData: Omit<Product, "id">
  ): Promise<ApiResponse<Product>> {
    log.info(`Creating product: ${productData.name}`);
    return api.post("/products", productData);
  }

  async update(
    id: number,
    productData: Partial<Product>
  ): Promise<ApiResponse<Product>> {
    log.info(`Updating product ${id}`);
    // Log the request payload for debugging
    const apiData = {
      name: productData.name,
      price: productData.price,
      description: productData.description,
      quantity: productData.quantity,
    };
    log.debug("Update payload:", apiData);
    const result = await api.patch(`/products/${id}`, apiData);
    // Log the response for debugging
    log.debug("Update result:", result);
    return {
      success: result.status === 200,
      data: result.data,
      message: result.statusText,
    };
  }

  async delete(id: number): Promise<ApiResponse> {
    log.info(`Deleting product ${id}`);
    return api.delete(`/products/${id}`);
  }

  async increaseStock(
    id: number,
    quantity: number = 1
  ): Promise<ApiResponse<Product>> {
    log.info(`Increasing stock for product ${id} by ${quantity}`);
    return api.patch(`/products/${id}/stock/increase?quantity=${quantity}`);
  }

  async decreaseStock(
    id: number,
    quantity: number = 1
  ): Promise<ApiResponse<Product>> {
    log.info(`Decreasing stock for product ${id} by ${quantity}`);
    return api.patch(`/products/${id}/stock/decrease?quantity=${quantity}`);
  }

  async toggleFavorite(id: number): Promise<ApiResponse<Product>> {
    log.info(`Toggling favorite for product ${id}`);
    return api.patch(`/products/${id}/favorite`);
  }

  async search(query: string): Promise<ApiResponse<Product[]>> {
    log.info(`Searching products with query: ${query}`);
    return api.get(`/products/search?q=${query}`);
  }

  async getLowStock(): Promise<ApiResponse<Product[]>> {
    log.info("Fetching low stock products");
    return api.get("/products/low-stock");
  }

  async getOutOfStock(): Promise<ApiResponse<Product[]>> {
    log.info("Fetching out of stock products");
    return api.get("/products/out-of-stock");
  }

  generateBarcode(): string {
    const timestamp = new Date().getTime().toString().slice(-10);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `${timestamp}${random}`;
  }
}

export const productService = new ProductService();
export default productService;
