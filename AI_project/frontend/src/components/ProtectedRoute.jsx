import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext";

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="p-8 text-sm text-muted">Loading library...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
