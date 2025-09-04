import React from "react";
import { useIsAuthenticated, useLogin } from "blitzware-react-sdk";

const Login = () => {
  const isAuthenticated = useIsAuthenticated();
  const login = useLogin();

  if (isAuthenticated) {
    window.location.href = "/dashboard";
    return;
  }

  return (
    <div>
      <h1>Login Page</h1>
      <button onClick={login}>Login</button>
    </div>
  );
};

export default Login;
