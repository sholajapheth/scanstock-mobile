// src/hooks/useBusiness.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api-client";

// Update the BusinessData interface in src/hooks/useBusiness.ts
export interface BusinessData {
  id?: number;
  name: string;
  logo?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
  website?: string;
  taxId?: string;
  description?: string;
  industry?: string;
  customIndustry?: string;
  isActive?: boolean;
}
// API Functions
const fetchBusiness = async () => {
  const response = await apiClient.get("/business");
  return response.data;
};

const createBusiness = async (data: BusinessData) => {
  const response = await apiClient.post("/business", data);
  return response.data;
};

const updateBusiness = async (data: Partial<BusinessData>) => {
  const response = await apiClient.patch("/business", data);
  return response.data;
};

const deleteBusiness = async () => {
  const response = await apiClient.delete("/business");
  return response.data;
};

// Hooks
export function useBusiness() {
  return useQuery({
    queryKey: ["business"],
    queryFn: fetchBusiness,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business"] });
    },
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business"] });
    },
  });
}

export function useDeleteBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business"] });
    },
  });
}
