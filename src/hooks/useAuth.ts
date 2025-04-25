import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient, { unAuthApi, api } from "../lib/api-client";
import { User } from "../types/user";

// Types
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

export interface EmailVerificationData {
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

const verifyEmail = async (data: EmailVerificationData) => {
  const response = await apiClient.post("/auth/verify-email", data);
  return response.data;
};

const resendVerificationCode = async (email: string) => {
  const response = await apiClient.post("/auth/resend-verification", {
    email,
  });
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

export function useVerifyEmail() {
  const { refetchUser } = useUser();

  return useMutation({
    mutationFn: verifyEmail,
    onSuccess: () => {
      refetchUser();
    },
  });
}

export function useResendVerificationCode() {
  return useMutation({
    mutationFn: resendVerificationCode,
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

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useUser = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      const result = await api.get("/users/me");

      if (result.success) {
        setState({
          user: result.data,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const refetchUser = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    await loadUser();
  };

  useEffect(() => {
    loadUser();
  }, []);

  return { ...state, refetchUser };
};
