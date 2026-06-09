import { Navigate } from "react-router-dom";

export default function ProtectedAdminRoute({ children }) {
  const isAdminLoggedIn = localStorage.getItem("adminAuth") === "true";

  if (!isAdminLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}