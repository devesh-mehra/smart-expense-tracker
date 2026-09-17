import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { transactionsApi, categoriesApi } from "../api/endpoints";
import type { Transaction, Category, TransactionType } from "../types";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export function Transactions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [txns, cats] = await Promise.all([
        transactionsApi.list(),
        categoriesApi.list(),
      ]);
      setTransactions(txns);
      setCategories(cats);
    } catch {
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCategories = categories.filter((c) => c.type === type);

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setDate(new Date().toISOString().slice(0, 10));
    setCategoryId("");
    setType("expense");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await transactionsApi.create({
        amount: parseFloat(amount),
        type,
        description: description || undefined,
        date,
        category_id: categoryId ? parseInt(categoryId, 10) : undefined,
      });
      resetForm();
      setShowForm(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail?.[0]?.msg || "Failed to add transaction");
    }
  };

  const handleDelete = (id: number) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (confirmDeleteId == null) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    await transactionsApi.delete(id);
  };

  const filteredCategoryName = categoryFilter
    ? categories.find((c) => String(c.id) === categoryFilter)?.name
    : null;

  const visibleTransactions = useMemo(() => {
    if (!categoryFilter) return transactions;
    return transactions.filter((t) => String(t.category?.id ?? "") === categoryFilter);
  }, [transactions, categoryFilter]);

  const clearCategoryFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("category");
    setSearchParams(next);
  };

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1>Transactions</h1>
        <motion.button
          className="btn-primary"
          onClick={() => setShowForm((s) => !s)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          {showForm ? "Cancel" : "+ Add Transaction"}
        </motion.button>
      </div>

      {filteredCategoryName && (
        <div className="filter-chip">
          Filtered by category: <strong>{filteredCategoryName}</strong>
          <button className="btn-icon" onClick={clearCategoryFilter} title="Clear filter">
            ✕
          </button>
        </div>
      )}

      <AnimatePresence>
          {error && (
            <motion.div
              className="error-banner"
              initial={{ opacity: 0, height: 0, scale: 0.97 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              style={{ overflow: "hidden" }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

      <AnimatePresence initial={false}>
        {showForm && (
          <motion.div
            key="form"
            initial={{ height: 0, opacity: 0, scale: 0.96, y: -12 }}
            animate={{ height: "auto", opacity: 1, scale: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, scale: 0.96, y: -8 }}
            transition={{
              height: { duration: 0.32, ease: [0.32, 0.72, 0, 1] },
              opacity: { duration: 0.2 },
              scale: { type: "spring", stiffness: 400, damping: 26 },
            }}
            style={{ overflow: "hidden", transformOrigin: "top" }}
          >
            <form className="inline-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label>
                  Type
                  <select value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </label>
                <label>
                  Amount (₹)
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </label>
                <label>
                  Date
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Category
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="">Uncategorized</option>
                    {filteredCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grow">
                  Description
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Groceries at Whole Foods"
                  />
                </label>
              </div>
              <motion.button
                className="btn-primary"
                type="submit"
                style={{ alignSelf: "flex-start" }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Save Transaction
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="page-loading">Loading...</div>
      ) : transactions.length === 0 ? (
        <p className="empty-state">No transactions yet. Add your first one above.</p>
      ) : visibleTransactions.length === 0 ? (
        <p className="empty-state">No transactions in this category yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th className="text-right">Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {visibleTransactions.map((t) => (
                  <motion.tr
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 60, scale: 0.94, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  >
                    <td>{t.date}</td>
                    <td>{t.description || "—"}</td>
                    <td>
                      {t.category ? (
                        <span className="category-pill" style={{ backgroundColor: t.category.color + "22", color: t.category.color }}>
                          {t.category.name}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <span className={`type-badge ${t.type}`}>{t.type}</span>
                    </td>
                    <td className={`text-right amount ${t.type}`}>
                      {t.type === "income" ? "+" : "-"}
                      {formatCurrency(t.amount)}
                    </td>
                    <td>
                      <button className="btn-icon" onClick={() => handleDelete(t.id)} title="Delete">
                        🗑
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {confirmDeleteId !== null && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmDeleteId(null)}
          >
            <motion.div
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
            >
              <h3>Delete this transaction?</h3>
              <p>This action cannot be undone.</p>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setConfirmDeleteId(null)}>
                  Cancel
                </button>
                <button className="btn-danger" onClick={confirmDelete}>
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
