import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../store";

export function ProtectedRoute() {
  const accessToken = useSelector((s: RootState) => s.auth.accessToken);
  return accessToken ? <Outlet /> : <Navigate to="/login" replace />;
}
