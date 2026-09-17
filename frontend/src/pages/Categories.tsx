import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { categoriesApi } from "../api/endpoints";
import type { Category, TransactionType } from "../types";

const COLOR_OPTIONS = [
  "#f97316", "#3b82f6", "#ec4899", "#ef4444", "#8b5cf6",
  "#14b8a6", "#22c55e", "#10b981", "#84cc16", "#6b7280",
];

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const cats = await categoriesApi.list();
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await categoriesApi.create({ name, type, color });
      setName("");
      setColor(COLOR_OPTIONS[0]);
      setShowForm(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to add category");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category? Transactions using it will become uncategorized.")) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    await categoriesApi.delete(id);
  };

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  return (
    <div className="categories-page">
      <div className="page-header">
        <h1>Categories</h1>
        <motion.button
          className="btn-primary"
          onClick={() => setShowForm((s) => !s)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          {showForm ? "Cancel" : "+ Add Category"}
        </motion.button>
      </div>

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
                  Name
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Travel"
                  />
                </label>
                <label>
                  Type
                  <select value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </label>
              </div>
              <div className="color-picker">
                {COLOR_OPTIONS.map((c) => (
                  <motion.button
                    type="button"
                    key={c}
                    className={`color-swatch ${color === c ? "selected" : ""}`}
                    style={{ backgroundColor: c, color: c }}
                    onClick={() => setColor(c)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{ scale: color === c ? 1.15 : 1 }}
                  />
                ))}
              </div>
              <motion.button
                className="btn-primary"
                type="submit"
                style={{ alignSelf: "flex-start" }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Save Category
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="page-loading">Loading...</div>
      ) : (
        <div className="categories-columns">
          <div>
            <h2>Expense Categories</h2>
            <ul className="category-list">
              <AnimatePresence initial={false}>
                {expenseCategories.map((c) => (
                  <motion.li
                    key={c.id}
                    layout
                    initial={{ opacity: 0, x: -12, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 40, scale: 0.94, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  >
                    <span className="dot" style={{ backgroundColor: c.color, color: c.color }} />
                    {c.name}
                    <button className="btn-icon" onClick={() => handleDelete(c.id)} title="Delete">
                      🗑
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
          <div>
            <h2>Income Categories</h2>
            <ul className="category-list">
              <AnimatePresence initial={false}>
                {incomeCategories.map((c) => (
                  <motion.li
                    key={c.id}
                    layout
                    initial={{ opacity: 0, x: -12, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 40, scale: 0.94, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  >
                    <span className="dot" style={{ backgroundColor: c.color, color: c.color }} />
                    {c.name}
                    <button className="btn-icon" onClick={() => handleDelete(c.id)} title="Delete">
                      🗑
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
