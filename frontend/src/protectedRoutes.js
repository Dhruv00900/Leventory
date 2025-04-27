import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")); // Parse user data
                                              
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if the user's role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return  <Navigate to="/dashboard" replace />;
  }

    return <Outlet />;
};

export default ProtectedRoute;


