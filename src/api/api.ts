import axios from "axios";
import { Product } from "../context/InventoryContext";

// Set base URL for all API requests - update with your NestJS backend URL
const API_URL = "http://localhost:3000/api";

// Configure axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    // You can add additional request handling here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle API errors (e.g., token expiration, server errors)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Handle unauthorized error (e.g., logout user)
          console.log("Unauthorized request");
          break;
        case 404:
          console.log("Resource not found");
          break;
        case 500:
          console.log("Server error");
          break;
        default:
          console.log(`Error with status code: ${error.response.status}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.log("Network error - no response received");
    } else {
      // Something happened in setting up the request
      console.log("Error", error.message);
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
  }) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },

  getUserProfile: async () => {
    const response = await apiClient.get("/users/me");
    return response.data;
  },
};

// Products API
export const productsAPI = {
  getAll: async () => {
    const response = await apiClient.get("/products");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  create: async (product: Omit<Product, "id">) => {
    const response = await apiClient.post("/products", product);
    return response.data;
  },

  update: async (id: number, product: Partial<Product>) => {
    const response = await apiClient.patch(`/products/${id}`, product);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};

// Sales API
export const salesAPI = {
  create: async (saleData: any) => {
    const response = await apiClient.post("/sales", saleData);
    return response.data;
  },

  getAll: async () => {
    const response = await apiClient.get("/sales");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/sales/${id}`);
    return response.data;
  },
};

export default {
  auth: authAPI,
  products: productsAPI,
  sales: salesAPI,
};
