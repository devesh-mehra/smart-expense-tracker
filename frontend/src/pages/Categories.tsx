import { useEffect, useState } from "react";
import type { FormEvent } from "react";
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
    await categoriesApi.delete(id);
    loadData();
  };

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  return (
    <div className="categories-page">
      <div className="page-header">
        <h1>Categories</h1>
        <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ Add Category"}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
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
              <button
                type="button"
                key={c}
                className={`color-swatch ${color === c ? "selected" : ""}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <button className="btn-primary" type="submit">
            Save Category
          </button>
        </form>
      )}

      {loading ? (
        <div className="page-loading">Loading...</div>
      ) : (
        <div className="categories-columns">
          <div>
            <h2>Expense Categories</h2>
            <ul className="category-list">
              {expenseCategories.map((c) => (
                <li key={c.id}>
                  <span className="dot" style={{ backgroundColor: c.color }} />
                  {c.name}
                  <button className="btn-icon" onClick={() => handleDelete(c.id)} title="Delete">
                    🗑
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Income Categories</h2>
            <ul className="category-list">
              {incomeCategories.map((c) => (
                <li key={c.id}>
                  <span className="dot" style={{ backgroundColor: c.color }} />
                  {c.name}
                  <button className="btn-icon" onClick={() => handleDelete(c.id)} title="Delete">
                    🗑
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
