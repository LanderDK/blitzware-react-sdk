import React from "react";
import {
  useAuthUser,
  useIsAuthenticated,
  useAuthLoading,
  useLogout,
} from "blitzware-react-sdk";

const Dashboard = () => {
  const logout = useLogout();
  const user = useAuthUser();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    isAuthenticated && (
      <div>
        <h1>Dashboard</h1>
        <p>Welcome to the protected dashboard, {user.username}!</p>
        <button onClick={logout}>Logout</button>
      </div>
    )
  );
};

export default Dashboard;
