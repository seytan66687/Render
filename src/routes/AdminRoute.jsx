import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <p>Chargement...</p>;
  return user && profile?.role === "admin" ? children : <Navigate to="/" />;
}
