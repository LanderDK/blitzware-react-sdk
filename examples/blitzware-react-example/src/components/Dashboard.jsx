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

  if (!isAuthenticated) {
    return <div>Not authenticated</div>;
  }

  if (!user) {
    return <div>User data not loaded</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the protected dashboard, {user.username}!</p>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;
