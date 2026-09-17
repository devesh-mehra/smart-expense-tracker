export type TransactionType = "expense" | "income";

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  type: TransactionType;
  color: string;
  is_default: boolean;
}

export interface Transaction {
  id: number;
  amount: number;
  type: TransactionType;
  description: string | null;
  date: string;
  category: Category | null;
}

export interface CategoryBreakdown {
  category_id: number | null;
  category_name: string;
  color: string;
  total: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}

export interface AnalyticsSummary {
  total_income: number;
  total_expense: number;
  net_balance: number;
  category_breakdown: CategoryBreakdown[];
  monthly_trend: MonthlyTrend[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
