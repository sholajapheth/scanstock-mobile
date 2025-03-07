import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient, { unAuthApi } from "../lib/api-client";

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  businessName?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  businessName?: string;
}

// Auth functions
const loginUser = async (credentials: LoginCredentials) => {
  console.log("loginUser", credentials);
  const response = await unAuthApi.post("/auth/login", credentials);
  console.log("response", response);
  return response.data;
};

const registerUser = async (data: RegisterData) => {
  console.log("registerUser", data);
  const response = await apiClient.post("/auth/register", data);
  console.log("response", response);
  return response.data;
};

const fetchUserProfile = async () => {
  const response = await apiClient.get("/users/me");
  return response.data;
};

// Custom hooks
export function useLogin(onSuccess?: () => void, onError?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      // Save token to storage
      await AsyncStorage.setItem("userToken", data.access_token);

      // Update user data in the cache
      queryClient.setQueryData(["user"], data.user);

      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.();
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: registerUser,
  });
}

export function useLogout(onSuccess?: () => void, onError?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem("userToken");
      return true;
    },
    onSuccess: () => {
      // Clear user data from the cache
      queryClient.setQueryData(["user"], null);

      // Reset all queries
      queryClient.resetQueries();
      onSuccess?.();
    },
    onError: (error) => {
      onError?.();
    },
  });
}

export function useUser() {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading: isLoadingUser,
    isError,
    error,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUserProfile,
    enabled: !!token, // Only run if we have a token
    retry: false, // Don't retry if it fails
    onError: async (err) => {
      // If we get an authentication error, clear the token
      if (err?.response?.status === 401) {
        console.log("Authentication failed, clearing token");
        await AsyncStorage.removeItem("userToken");
        setToken(null);
      }
    },
  });

  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("userToken");
        setToken(storedToken);
      } catch (error) {
        console.error("Error retrieving token:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getToken();
  }, []);

  return {
    user,
    token,
    isAuthenticated: !!token && !!user && !isError,
    isLoading: isLoading || (!!token && isLoadingUser),
  };
}
