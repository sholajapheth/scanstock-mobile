import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient, { unAuthApi } from "../lib/api-client";

// Types
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  businessName?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  businessName?: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

export interface OTPData {
  email: string;
  otp: string;
}

// Auth functions
const loginUser = async (credentials: LoginCredentials) => {
  const response = await unAuthApi.post("/auth/login", credentials);
  return response.data;
};

const registerUser = async (data: RegisterData) => {
  const response = await unAuthApi.post("/auth/register", data);
  return response.data;
};

const requestPasswordReset = async (email: string) => {
  const response = await unAuthApi.post("/auth/password/reset-request", {
    email,
  });
  return response.data;
};

const resetPassword = async (data: ResetPasswordData) => {
  const response = await unAuthApi.post("/auth/password/reset", data);
  return response.data;
};

const requestOTP = async (email: string) => {
  const response = await unAuthApi.post("/auth/otp/request", { email });
  return response.data;
};

const validateOTP = async (data: OTPData) => {
  const response = await unAuthApi.post("/auth/otp/validate", data);
  return response.data;
};

const fetchUserProfile = async () => {
  const response = await apiClient.get("/users/me");
  return response.data;
};

// Custom hooks
export function useLogin(
  onSuccess?: () => void,
  onError?: (error: any) => void
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      await AsyncStorage.setItem("userToken", data.access_token);
      queryClient.setQueryData(["user"], data.user);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: registerUser,
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: requestPasswordReset,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: resetPassword,
  });
}

export function useRequestOTP() {
  return useMutation({
    mutationFn: requestOTP,
  });
}

export function useValidateOTP() {
  return useMutation({
    mutationFn: validateOTP,
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
      queryClient.setQueryData(["user"], null);
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
    enabled: !!token,
    retry: false,
    onError: async (err) => {
      if (err?.response?.status === 401) {
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
