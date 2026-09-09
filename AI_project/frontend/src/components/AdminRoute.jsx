import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext";

function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="p-8 text-sm text-muted">Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
