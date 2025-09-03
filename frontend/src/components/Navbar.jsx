import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Custom active link style
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-black shadow-lg relative overflow-hidden border-b border-gray-800">
      {/* Animated background elements similar to register page */}

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-gray-200 hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-white"
              >
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                <path
                  fillRule="evenodd"
                  d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">QRProfile</span>
          </Link>

          {/* Right side elements - Dashboard and Auth */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-all duration-300 ${
                isActive("/")
                  ? "text-white font-semibold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Home
            </Link>
            {isAuthenticated && (
              <Link
                to={user?.role === "admin" ? "/admin" : "/dashboard"}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  isActive("/dashboard") || isActive("/admin")
                    ? "text-white font-semibold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {user?.role === "admin" ? "Admin Panel" : "Dashboard"}
              </Link>
            )}
            {/* User/Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-500">
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm font-medium text-gray-300 hover:text-white transition-all duration-300 flex items-center space-x-1 rounded-lg hover:bg-gray-800/50"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-800">
                <Link
                  to="/login"
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                    isActive("/login")
                      ? " text-white font-semibold"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                    isActive("/register")
                      ? "text-white font-semibold"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={toggleMenu}
              className="text-gray-400 hover:text-white focus:outline-none p-2 rounded-lg hover:bg-gray-800"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-4 py-4 space-y-4">
          {/* Home Link - Always visible */}
          <div className="grid grid-cols-1 gap-2">
            <Link
              to="/"
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive("/")
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
          </div>

          {/* Dashboard/Admin Link - Only show if authenticated */}
          {isAuthenticated && (
            <div className="pt-3 border-t border-gray-800">
              <Link
                to={user?.role === "admin" ? "/admin" : "/dashboard"}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive("/dashboard") || isActive("/admin")
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {user?.role === "admin" ? "Admin Panel" : "Dashboard"}
              </Link>
            </div>
          )}

          {/* Authentication Section */}
          <div className="pt-3 border-t border-gray-800">
            {isAuthenticated ? (
              <>
                <div className="px-4 py-2 text-sm text-gray-400">
                  Hi, {user.name}
                  {user.role === "admin" && (
                    <span className="ml-2 px-2 py-1 text-xs font-bold bg-amber-400/20 text-amber-300 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white flex items-center space-x-2 mt-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                <Link
                  to="/login"
                  className={`px-4 py-3 text-sm font-medium rounded-lg text-center transition-all ${
                    isActive("/login")
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-3 text-sm font-medium rounded-lg text-center bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white transition-all ${
                    isActive("/register") ? "ring-2 ring-gray-500" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
