import { Navigate } from "react-router-dom";
import { ProtectedRouteProps } from "./types";
import { useIsAuthenticated } from "./BlitzWareAuthProvider";

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const isAuthenticated = useIsAuthenticated();

  return isAuthenticated ? <Component {...rest} /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
