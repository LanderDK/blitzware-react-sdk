import "./App.css";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "blitzware-react-sdk";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <>
      <Routes>
        <Route path="*" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute component={Dashboard} />}
        />
      </Routes>
    </>
  );
}

export default App;
