import { useState, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../store";
import { loginThunk } from "../store/auth.slice";
import { fetchMe } from "../store/user.slice";

export function Login() {
  const dispatch  = useDispatch<AppDispatch>();
  const navigate  = useNavigate();
  const { status, error } = useSelector((s: RootState) => s.auth);

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await dispatch(loginThunk({ email, password }));
    if (loginThunk.fulfilled.match(result)) {
      await dispatch(fetchMe());
      navigate("/dashboard");
    }
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", background: "#f1f5f9",
    }}>
      <div style={{
        background: "#fff", padding: "2.5rem", borderRadius: 8,
        boxShadow: "0 4px 24px rgba(0,0,0,.08)", width: 360,
      }}>
        <h1 style={{ margin: "0 0 1.5rem", fontSize: 22, color: "#1e293b" }}>Sign in</h1>

        {error && (
          <div style={{
            background: "#fee2e2", color: "#dc2626", padding: "10px 14px",
            borderRadius: 4, marginBottom: 16, fontSize: 14,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: "#475569", marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required autoComplete="email"
              style={{
                width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1",
                borderRadius: 4, fontSize: 14, boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, color: "#475569", marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required autoComplete="current-password"
              style={{
                width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1",
                borderRadius: 4, fontSize: 14, boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit" disabled={status === "loading"}
            style={{
              width: "100%", padding: "10px", background: "#2563eb", color: "#fff",
              border: "none", borderRadius: 4, fontSize: 15, fontWeight: 600,
              cursor: status === "loading" ? "not-allowed" : "pointer",
              opacity: status === "loading" ? 0.7 : 1,
            }}
          >
            {status === "loading" ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
