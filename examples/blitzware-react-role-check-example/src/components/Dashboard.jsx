import React from "react";
import {
  useAuthUser,
  useIsAuthenticated,
  useAuthLoading,
  useLogout,
  useHasRole,
} from "blitzware-react-sdk";

const Dashboard = () => {
  const logout = useLogout();
  const user = useAuthUser();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const hasAdminRole = useHasRole("admin");
  const hasPremiumRole = useHasRole("premium");

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
      <h1>Role Check Dashboard</h1>
      <p>Welcome to the role-protected dashboard, {user.username}!</p>
      
      <div style={{ margin: "20px 0", padding: "20px", border: "1px solid #ccc" }}>
        <h3>Role Checks:</h3>
        <p>
          <strong>Admin Role:</strong>{" "}
          <span style={{ color: hasAdminRole ? "green" : "red" }}>
            {hasAdminRole ? "✓ You have admin access" : "✗ Admin access denied"}
          </span>
        </p>
        <p>
          <strong>Premium Role:</strong>{" "}
          <span style={{ color: hasPremiumRole ? "green" : "red" }}>
            {hasPremiumRole ? "✓ You have premium access" : "✗ Premium access denied"}
          </span>
        </p>
      </div>

      {hasAdminRole && (
        <div style={{ margin: "20px 0", padding: "20px", backgroundColor: "#e8f5e8" }}>
          <h3>🔒 Admin Only Section</h3>
          <p>This content is only visible to users with the admin role.</p>
        </div>
      )}

      {hasPremiumRole && (
        <div style={{ margin: "20px 0", padding: "20px", backgroundColor: "#fff3cd" }}>
          <h3>⭐ Premium Only Section</h3>
          <p>This content is only visible to users with the premium role.</p>
        </div>
      )}

      <div style={{ margin: "20px 0" }}>
        <h3>User Information:</h3>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>
      
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;
