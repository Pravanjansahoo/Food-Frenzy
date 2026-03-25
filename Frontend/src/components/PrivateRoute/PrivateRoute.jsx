import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");

  const decodeJwtPayload = (jwt) => {
    try {
      const base64Url = jwt.split(".")[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  };

  if (!token) return <Navigate to="/login" replace />;

  const payload = decodeJwtPayload(token);
  if (payload?.exp && Date.now() >= payload.exp * 1000) {
    localStorage.removeItem("authToken");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
