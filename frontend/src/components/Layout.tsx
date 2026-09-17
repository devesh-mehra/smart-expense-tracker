import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "📊", end: true },
  { to: "/transactions", label: "Transactions", icon: "💳", end: false },
  { to: "/categories", label: "Categories", icon: "🏷️", end: false },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = (user?.full_name || user?.email || "?").slice(0, 1).toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">💰</span>
          Expense Tracker
        </div>
        <nav>
          {NAV_ITEMS.map((item) => {
            const isActive = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <NavLink key={item.to} to={item.to} end={item.end} className={`nav-link ${isActive ? "active" : ""}`}>
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="nav-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="avatar-circle">{initials}</div>
          <div className="sidebar-footer-text">
            <span className="user-chip">{user?.full_name || user?.email}</span>
            <button className="logout-link" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
