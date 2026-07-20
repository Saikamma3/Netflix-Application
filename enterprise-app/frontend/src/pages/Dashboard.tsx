import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { fetchMe } from "../store/user.slice";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8,
      padding: "1.5rem", flex: 1, minWidth: 180,
    }}>
      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#1e293b" }}>{value}</div>
    </div>
  );
}

export function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, status } = useSelector((s: RootState) => s.user);

  useEffect(() => {
    if (!profile) dispatch(fetchMe());
  }, [dispatch, profile]);

  if (status === "loading") {
    return <div style={{ color: "#64748b" }}>Loading...</div>;
  }

  return (
    <div>
      <h2 style={{ margin: "0 0 0.25rem", color: "#1e293b" }}>
        Welcome back{profile ? `, ${profile.firstName}` : ""}
      </h2>
      <p style={{ color: "#64748b", marginTop: 0, marginBottom: "2rem" }}>
        Here is an overview of the system.
      </p>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        <StatCard label="Your Role"  value={profile?.role ?? "—"} />
        <StatCard label="Email"      value={profile?.email ?? "—"} />
        <StatCard label="Member Since"
          value={profile ? new Date(profile.createdAt).toLocaleDateString() : "—"}
        />
      </div>

      <div style={{
        background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "1.5rem",
      }}>
        <h3 style={{ margin: "0 0 1rem", color: "#1e293b", fontSize: 15 }}>System Status</h3>
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          {[
            { service: "API Gateway",   status: "Healthy" },
            { service: "Auth Service",  status: "Healthy" },
            { service: "User Service",  status: "Healthy" },
            { service: "PostgreSQL",    status: "Healthy" },
            { service: "Redis Cache",   status: "Healthy" },
          ].map(({ service, status }) => (
            <div key={service} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                width: 10, height: 10, borderRadius: "50%", background: "#22c55e", display: "inline-block",
              }} />
              <span style={{ fontSize: 14, color: "#374151" }}>{service}</span>
              <span style={{ fontSize: 12, color: "#6b7280" }}>({status})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
