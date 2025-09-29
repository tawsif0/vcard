import React, { useContext } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AuthContext from "./context/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminPanel from "./components/AdminPanel";
import CardViewer from "./components/CardViewer";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import { FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";
import PremiumDashboard from "./components/Premium/component/Dashboard/PremiumDashboard";
function App() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Detect if the route matches /profile/:userId
  const isCardViewerRoute = /^\/profile\/[^/]+$/.test(location.pathname);
  const hideNavbar =
    isCardViewerRoute ||
    location.pathname.includes("premium-dashboard") ||
    (location.pathname === "/dashboard" && user?.isPremium);

  const getDashboardComponent = () => {
    if (user?.role === "admin") {
      return <AdminPanel />;
    } else if (user?.isPremium) {
      return <PremiumDashboard />;
    } else {
      return <Dashboard />;
    }
  };
  return (
    <div className="App">
      {/* Show Navbar only if not on CardViewer route */}
      {!hideNavbar && <Navbar />}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            borderRadius: "16px",
            padding: "16px 24px",
            boxShadow:
              "0 10px 30px rgba(102, 126, 234, 0.4), 0 6px 10px rgba(118, 75, 162, 0.3)",
            fontFamily: '"Inter", "Poppins", sans-serif',
            fontSize: "15px",
            fontWeight: "600",
            letterSpacing: "0.3px",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
          success: {
            style: {
              background: "linear-gradient(135deg, #28a745 0%, #34d058 100%)",
              boxShadow:
                "0 10px 30px rgba(40, 167, 69, 0.4), 0 6px 10px rgba(52, 208, 88, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            },
            icon: <FiCheckCircle className="w-5 h-5" />,
            iconTheme: {
              primary: "#fff",
              secondary: "#28a745",
            },
          },
          error: {
            style: {
              background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
              boxShadow:
                "0 10px 30px rgba(255, 107, 107, 0.4), 0 6px 10px rgba(238, 90, 82, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            },
            icon: <FiXCircle className="w-5 h-5" />,
            iconTheme: {
              primary: "#fff",
              secondary: "#ff6b6b",
            },
          },
          loading: {
            style: {
              background: "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)",
              boxShadow:
                "0 10px 30px rgba(255, 216, 155, 0.4), 0 6px 10px rgba(25, 84, 123, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            },
            icon: <FiLoader className="w-5 h-5 animate-spin" />,
            iconTheme: {
              primary: "#fff",
              secondary: "#ffd89b",
            },
          },
        }}
      />
      <div>
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
            element={user ? getDashboardComponent() : <Navigate to="/login" />}
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
          <Route
            path="/premium-dashboard"
            element={
              user && user.isPremium ? (
                <PremiumDashboard />
              ) : (
                <Navigate to="/dashboard" />
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
