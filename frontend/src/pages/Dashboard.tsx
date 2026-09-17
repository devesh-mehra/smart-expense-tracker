import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { analyticsApi } from "../api/endpoints";
import type { AnalyticsSummary } from "../types";
import { useCountUp } from "../hooks/useCountUp";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

function StatCard({
  index,
  variant,
  icon,
  label,
  value,
}: {
  index: number;
  variant: string;
  icon: string;
  label: string;
  value: number;
}) {
  const animated = useCountUp(value);
  return (
    <motion.div
      className={`stat-card ${variant}`}
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className="stat-icon">{icon}</div>
      <div className="stat-text">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{formatCurrency(animated)}</span>
      </div>
    </motion.div>
  );
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
        <StatCard index={0} variant="income" icon="↑" label="Total Income" value={summary.total_income} />
        <StatCard index={1} variant="expense" icon="↓" label="Total Expenses" value={summary.total_expense} />
        <StatCard
          index={2}
          variant={summary.net_balance >= 0 ? "balance-positive" : "balance-negative"}
          icon="◈"
          label="Net Balance"
          value={summary.net_balance}
        />
      </div>

      <div className="charts-grid">
        <motion.div
          className="chart-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
        >
          <h2>Spending by Category</h2>
          {hasExpenseData ? (
            <div className="donut-wrap">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={summary.category_breakdown}
                    dataKey="total"
                    nameKey="category_name"
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={104}
                    paddingAngle={3}
                    cornerRadius={6}
                    animationBegin={100}
                    animationDuration={700}
                  >
                    {summary.category_breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      background: "#1a1a24",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 10,
                      color: "#f5f5f8",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 13, color: "#a1a1b5" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <span className="donut-total">{formatCurrency(summary.total_expense)}</span>
                <span className="donut-label">Spent</span>
              </div>
            </div>
          ) : (
            <p className="empty-state">Add some expenses to see your breakdown.</p>
          )}
        </motion.div>

        <motion.div
          className="chart-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
        >
          <h2>Monthly Trend</h2>
          {hasTrendData ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={summary.monthly_trend}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="month" stroke="#6b6b80" tick={{ fill: "#a1a1b5", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#6b6b80" tick={{ fill: "#a1a1b5", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    background: "#1a1a24",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10,
                    color: "#f5f5f8",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 13, color: "#a1a1b5" }} />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#34d399"
                  strokeWidth={2.5}
                  fill="url(#incomeGradient)"
                  animationDuration={900}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Expense"
                  stroke="#ec4899"
                  strokeWidth={2.5}
                  fill="url(#expenseGradient)"
                  animationDuration={900}
                  animationBegin={150}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-state">No transactions yet this period.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
