import React, { useContext } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AuthContext from "./context/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import AdminPanel from "./components/AdminPanel";
import Navbar from "./components/Navbar";
import CardViewer from "./components/CardViewer";

function App() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Detect if the route matches /profile/:userId
  const isCardViewerRoute = /^\/profile\/[^/]+$/.test(location.pathname);

  return (
    <div className="App">
      {/* Show Navbar only if not on CardViewer route */}
      {!isCardViewerRoute && <Navbar />}

      <div className={isCardViewerRoute ? "" : "container mt-4"}>
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Navigate
                  to={user.role === "admin" ? "/admin" : "/dashboard"}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" /> : <Register />}
          />
          <Route
            path="/dashboard"
            element={
              user && user.role === "user" ? (
                <Dashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/admin"
            element={
              user && user.role === "admin" ? (
                <AdminPanel />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          {/* Public route: show CardViewer without navbar */}
          <Route path="/profile/:userId" element={<CardViewer />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
