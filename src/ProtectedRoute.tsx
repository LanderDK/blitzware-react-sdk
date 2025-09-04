import React, { useEffect } from "react";
import { ProtectedRouteProps } from "./types";
import { useIsAuthenticated, useAuthLoading, useHasRole } from "./BlitzWareAuthProvider";

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  role,
  requireAllRoles = false,
  ...rest
}) => {
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const hasRequiredRole = useHasRole(role, requireAllRoles);

  // Show loading while authentication state is being determined
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        Loading...
      </div>
    );
  }

  // Handle redirect without using React Router hooks to avoid context issues
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Use window.location to avoid Router context issues
      const currentPath = window.location.pathname;
      if (currentPath !== "/login") {
        window.location.href = "/login";
      }
    }
  }, [isAuthenticated, isLoading]);

  // Only render the component if authenticated
  if (!isAuthenticated) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        Redirecting to login...
      </div>
    );
  }

  // Check role requirements if specified
  if (role && !hasRequiredRole) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div>Access Denied</div>
        <div style={{ fontSize: "14px", color: "#666" }}>
          You don't have the required permissions to access this page.
        </div>
      </div>
    );
  }

  return <Component {...rest} />;
};

export default ProtectedRoute;
