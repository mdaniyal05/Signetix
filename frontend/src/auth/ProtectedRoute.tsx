import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";

/** Gate for routes that require a signed-in session. */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
