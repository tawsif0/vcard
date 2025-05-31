import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "./Navbar.css";
const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Custom active link style
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark gradient-bg">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <div className="logo-icon me-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
              <path
                fillRule="evenodd"
                d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="brand-text">QRProfile</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {isAuthenticated && user?.role === "user" && (
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    isActive("/dashboard") ? "active-link" : ""
                  }`}
                  to="/dashboard"
                >
                  Dashboard
                </Link>
              </li>
            )}
            {isAuthenticated && user?.role === "admin" && (
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    isActive("/admin") ? "active-link" : ""
                  }`}
                  to="/admin"
                >
                  Admin Panel
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center">
            {isAuthenticated ? (
              <>
                <div className="user-info me-3">
                  <span className="d-none d-md-inline user-name">
                    Hi, {user.name}
                  </span>
                  {user.role === "admin" && (
                    <span className="badge bg-light text-dark ms-2">Admin</span>
                  )}
                </div>
                <button
                  className="btn btn-outline-light logout-btn"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-1"></i> Logout
                </button>
              </>
            ) : (
              <div className="auth-links">
                <Link
                  className={`btn btn-outline-light me-2 ${
                    isActive("/login") ? "active-auth" : ""
                  }`}
                  to="/login"
                >
                  Login
                </Link>
                <Link
                  className={`btn btn-primary ${
                    isActive("/register") ? "active-auth" : ""
                  }`}
                  to="/register"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
