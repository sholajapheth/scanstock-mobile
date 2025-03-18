// src/lib/api-client.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiLogger } from "../utils/logger";

// Get API URL from environment
const API_URL = process.env.EXPO_PUBLIC_BASE_URL || "http://localhost:3000/api";

// Create axios instance with base URL
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Add a request interceptor to include JWT token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // console.log("config", config);
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log the outgoing request (with sensitive data redacted)
      const logData = { ...config };
      if (config.headers?.Authorization) {
        logData.headers = {
          ...config.headers,
          Authorization: "Bearer [REDACTED]",
        };
      }

      apiLogger.debug(
        `Request: ${config.method?.toUpperCase()} ${config.url}`,
        logData
      );
      return config;
    } catch (error) {
      apiLogger.error("Error setting auth header:", error);
      return config;
    }
  },
  (error) => {
    apiLogger.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling and logging
apiClient.interceptors.response.use(
  (response) => {
    // console.log("response: ", response);
    apiLogger.debug(
      `Response: ${response.status} from ${response.config.url}`,
      {
        data: response.data,
        headers: response.headers,
      }
    );
    return response;
  },
  async (error) => {
    // Handle network errors
    if (!error.response) {
      apiLogger.error("Network Error:", error);
      return Promise.reject({
        success: false,
        message: "Network error, please check your connection",
      });
    }

    // Log the error response
    apiLogger.error(
      `Error Response: ${error.response.status} from ${error.config.url}`,
      {
        data: error.response.data,
        headers: error.response.headers,
      }
    );

    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      try {
        // Clear the token
        await AsyncStorage.removeItem("userToken");
        apiLogger.info("Auth token cleared due to 401 response");

        // We'll handle redirection to login in the app's router or auth context
      } catch (storageError) {
        apiLogger.error("Error clearing auth token:", storageError);
      }
    }

    // Format error for consistent handling
    return Promise.reject({
      success: false,
      status: error.response.status,
      message: error.response.data?.message || "An error occurred",
      data: error.response.data,
    });
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 errors (token expired)
    if (error.response?.status === 401) {
      // Clear the token from storage
      await AsyncStorage.removeItem("userToken");

      // Your app should handle redirection based on auth state
      // No need to navigate here as the layouts will handle it
    }

    return Promise.reject(error);
  }
);

// Helper methods for API calls with consistent error handling
export const api = {
  async get(url: string, config = {}) {
    try {
      const response = await apiClient.get(url, config);
      return { success: true, data: response.data };
    } catch (error: any) {
      return error.success === false
        ? error
        : { success: false, message: error.message };
    }
  },

  async post(url: string, data = {}, config = {}) {
    try {
      const response = await apiClient.post(url, data, config);
      return { success: true, data: response.data };
    } catch (error: any) {
      return error.success === false
        ? error
        : { success: false, message: error.message };
    }
  },

  async patch(url: string, data = {}, config = {}) {
    try {
      const response = await apiClient.patch(url, data, config);
      return { success: true, data: response.data };
    } catch (error: any) {
      return error.success === false
        ? error
        : { success: false, message: error.message };
    }
  },

  async delete(url: string, config = {}) {
    try {
      const response = await apiClient.delete(url, config);
      return { success: true, data: response.data };
    } catch (error: any) {
      return error.success === false
        ? error
        : { success: false, message: error.message };
    }
  },
};

export const unAuthApi = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default apiClient;
