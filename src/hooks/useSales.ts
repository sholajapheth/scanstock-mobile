import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api-client";
import { Product } from "./useProducts";

// Types
export interface SaleItem {
  productId: number;
  quantity: number;
  price: number;
}

export interface CustomerInfo {
  name?: string;
  email?: string;
  phone?: string;
}

export interface CreateSaleData {
  items: SaleItem[];
  total: number;
  customerInfo?: CustomerInfo;
  notes?: string;
  paymentMethod?: "cash" | "card" | "other";
}

export interface Sale {
  id: number;
  total: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
  paymentMethod: string;
  status: "completed" | "cancelled" | "refunded";
  receiptNumber: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  items: {
    id: number;
    quantity: number;
    price: number;
    subtotal: number;
    productName: string;
    productBarcode: string;
    productId?: number;
    saleId: number;
  }[];
}

export interface UpdateSaleData {
  notes?: string;
  paymentMethod?: "cash" | "card" | "other";
  status?: "completed" | "cancelled" | "refunded";
}

// API functions
const fetchSales = async () => {
  const response = await apiClient.get("/sales");
  return response.data;
};

const fetchSale = async (id: number) => {
  const response = await apiClient.get(`/sales/${id}`);
  return response.data;
};

const createSale = async (data: CreateSaleData) => {
  const response = await apiClient.post("/sales", data);
  return response.data;
};

const updateSale = async ({
  id,
  data,
}: {
  id: number;
  data: UpdateSaleData;
}) => {
  const response = await apiClient.patch(`/sales/${id}`, data);
  return response.data;
};

const cancelSale = async (id: number) => {
  const response = await apiClient.patch(`/sales/${id}/cancel`);
  return response.data;
};

const refundSale = async (id: number) => {
  const response = await apiClient.patch(`/sales/${id}/refund`);
  return response.data;
};

const fetchSaleStatistics = async ({
  start,
  end,
}: { start?: string; end?: string } = {}) => {
  let url = "/sales/statistics";
  if (start || end) {
    url += "?";
    if (start) url += `start=${start}`;
    if (start && end) url += "&";
    if (end) url += `end=${end}`;
  }
  const response = await apiClient.get(url);
  return response.data;
};

// Hooks
export function useSales() {
  return useQuery({
    queryKey: ["sales"],
    queryFn: fetchSales,
  });
}

export function useSale(id: number) {
  return useQuery({
    queryKey: ["sales", id],
    queryFn: () => fetchSale(id),
    enabled: !!id,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] }); // Invalidate products as their stock changes
    },
  });
}

export function useUpdateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSale,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sales", data.id] });
    },
  });
}

export function useCancelSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelSale,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sales", data.id] });
      queryClient.invalidateQueries({ queryKey: ["products"] }); // Invalidate products as their stock changes
    },
  });
}

export function useRefundSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refundSale,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sales", data.id] });
      queryClient.invalidateQueries({ queryKey: ["products"] }); // Invalidate products as their stock changes
    },
  });
}

export function useSaleStatistics(
  options: { start?: string; end?: string } = {}
) {
  return useQuery({
    queryKey: ["sales", "statistics", options.start, options.end],
    queryFn: () => fetchSaleStatistics(options),
  });
}
