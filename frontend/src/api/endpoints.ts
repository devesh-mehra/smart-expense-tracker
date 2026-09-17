import { apiClient } from "./client";
import type {
  AuthResponse,
  AnalyticsSummary,
  Category,
  Transaction,
  TransactionType,
} from "../types";

export const authApi = {
  register: (email: string, password: string, full_name: string) =>
    apiClient
      .post<AuthResponse>("/api/auth/register", { email, password, full_name })
      .then((r) => r.data),
  login: (email: string, password: string) =>
    apiClient
      .post<AuthResponse>("/api/auth/login", { email, password })
      .then((r) => r.data),
};

export const categoriesApi = {
  list: () => apiClient.get<Category[]>("/api/categories").then((r) => r.data),
  create: (data: { name: string; type: TransactionType; color?: string }) =>
    apiClient.post<Category>("/api/categories", data).then((r) => r.data),
  update: (id: number, data: Partial<{ name: string; type: TransactionType; color: string }>) =>
    apiClient.put<Category>(`/api/categories/${id}`, data).then((r) => r.data),
  delete: (id: number) => apiClient.delete(`/api/categories/${id}`),
};

export interface TransactionInput {
  amount: number;
  type: TransactionType;
  description?: string;
  date?: string;
  category_id?: number | null;
}

export const transactionsApi = {
  list: (params?: { type?: TransactionType; category_id?: number }) =>
    apiClient
      .get<Transaction[]>("/api/transactions", { params })
      .then((r) => r.data),
  create: (data: TransactionInput) =>
    apiClient.post<Transaction>("/api/transactions", data).then((r) => r.data),
  update: (id: number, data: Partial<TransactionInput>) =>
    apiClient.put<Transaction>(`/api/transactions/${id}`, data).then((r) => r.data),
  delete: (id: number) => apiClient.delete(`/api/transactions/${id}`),
};

export const analyticsApi = {
  summary: (months = 6) =>
    apiClient
      .get<AnalyticsSummary>("/api/analytics/summary", { params: { months } })
      .then((r) => r.data),
};
