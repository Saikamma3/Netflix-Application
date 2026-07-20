import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../store";

export function ProtectedRoute() {
  const { accessToken, profileId } = useSelector((s: RootState) => s.auth);
  if (!accessToken) return <Navigate to="/login" replace />;
  if (!profileId)   return <Navigate to="/profiles" replace />;
  return <Outlet />;
}

export function AuthRequired() {
  const accessToken = useSelector((s: RootState) => s.auth.accessToken);
  return accessToken ? <Outlet /> : <Navigate to="/login" replace />;
}
