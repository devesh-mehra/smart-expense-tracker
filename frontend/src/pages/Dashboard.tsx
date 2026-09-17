import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { analyticsApi } from "../api/endpoints";
import type { AnalyticsSummary } from "../types";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function Dashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyticsApi
      .summary(6)
      .then(setSummary)
      .catch(() => setError("Could not load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard...</div>;
  if (error) return <div className="error-banner">{error}</div>;
  if (!summary) return null;

  const hasExpenseData = summary.category_breakdown.length > 0;
  const hasTrendData = summary.monthly_trend.length > 0;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="stat-cards">
        <div className="stat-card income">
          <span className="stat-label">Total Income</span>
          <span className="stat-value">{formatCurrency(summary.total_income)}</span>
        </div>
        <div className="stat-card expense">
          <span className="stat-label">Total Expenses</span>
          <span className="stat-value">{formatCurrency(summary.total_expense)}</span>
        </div>
        <div className={`stat-card ${summary.net_balance >= 0 ? "balance-positive" : "balance-negative"}`}>
          <span className="stat-label">Net Balance</span>
          <span className="stat-value">{formatCurrency(summary.net_balance)}</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2>Spending by Category</h2>
          {hasExpenseData ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={summary.category_breakdown}
                  dataKey="total"
                  nameKey="category_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(props: { name?: string; percent?: number }) =>
                    `${props.name ?? ""} ${((props.percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {summary.category_breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-state">Add some expenses to see your breakdown.</p>
          )}
        </div>

        <div className="chart-card">
          <h2>Monthly Trend</h2>
          {hasTrendData ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summary.monthly_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="income" fill="#22c55e" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-state">No transactions yet this period.</p>
          )}
        </div>
      </div>
    </div>
  );
}
