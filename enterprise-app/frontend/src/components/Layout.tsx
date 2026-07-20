import { useDispatch, useSelector } from "react-redux";
import { Link, Outlet } from "react-router-dom";
import { AppDispatch, RootState } from "../store";
import { logoutThunk } from "../store/auth.slice";
import { clearProfile } from "../store/user.slice";

export function Layout() {
  const dispatch = useDispatch<AppDispatch>();
  const profile  = useSelector((s: RootState) => s.user.profile);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    dispatch(clearProfile());
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh" }}>
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2rem", height: 56, background: "#1e293b", color: "#f1f5f9",
      }}>
        <Link to="/dashboard" style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 18, textDecoration: "none" }}>
          Enterprise App
        </Link>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <Link to="/dashboard" style={{ color: "#94a3b8", textDecoration: "none" }}>Dashboard</Link>
          {profile?.role === "ADMIN" && (
            <Link to="/users" style={{ color: "#94a3b8", textDecoration: "none" }}>Users</Link>
          )}
          <span style={{ color: "#64748b", fontSize: 14 }}>
            {profile ? `${profile.firstName} ${profile.lastName}` : ""}
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: "#dc2626", color: "#fff", border: "none",
              borderRadius: 4, padding: "6px 14px", cursor: "pointer", fontSize: 13,
            }}
          >
            Logout
          </button>
        </div>
      </nav>
      <main style={{ padding: "2rem" }}>
        <Outlet />
      </main>
    </div>
  );
}
