import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = (user?.role_name || user?.role || "").toString();
  const normalizedRole = role.trim().toLowerCase();
  try {
    console.debug("ProtectedRoute: user=", user, "allowedRoles=", allowedRoles, "normalizedRole=", normalizedRole);
  } catch (e) {}

  if (
    allowedRoles &&
    !allowedRoles.some((r) => (r || "").toString().trim().toLowerCase() === normalizedRole)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
