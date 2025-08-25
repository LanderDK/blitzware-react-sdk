import React, { useEffect } from "react";
import { ProtectedRouteProps } from "./types";
import { useIsAuthenticated, useAuthLoading } from "./BlitzWareAuthProvider";

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();

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

  return <Component {...rest} />;
};

export default ProtectedRoute;
