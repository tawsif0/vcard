// src/components/Navigation.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { User, FileText, Briefcase, Edit3, Mail } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Hide navigation on the current page
  const hideCurrentPageIcon = (path) => {
    return currentPath === path;
  };

  // Determine position class based on current page
  const positionClass =
    currentPath === "/"
      ? "absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-30"
      : "absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30";

  return (
    <div className={positionClass}>
      <div className="flex space-x-4">
        {/* Home Icon - Hide on Home page */}
        {!hideCurrentPageIcon("/home") && (
          <Link
            to="/home"
            className="group flex items-center justify-center w-16 h-16 bg-green-500 rounded-full text-white 
                 hover:bg-green-600 transition-all duration-300 shadow-xl border-4 border-white 
                 overflow-hidden hover:w-40"
          >
            <User className="w-7 h-7 flex-shrink-0" />
            <span className="ml-3 hidden group-hover:inline-block opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
              Home
            </span>
          </Link>
        )}

        {/* About Icon - Hide on About page */}
        {!hideCurrentPageIcon("/about") && (
          <Link
            to="/about"
            className="group flex items-center justify-center w-16 h-16 bg-green-500 rounded-full text-white 
                 hover:bg-green-600 transition-all duration-300 shadow-xl border-4 border-white 
                 overflow-hidden hover:w-40"
          >
            <FileText className="w-7 h-7 flex-shrink-0" />
            <span className="ml-3 hidden group-hover:inline-block opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
              About
            </span>
          </Link>
        )}

        {/* Resume Icon - Hide on Resume page */}
        {!hideCurrentPageIcon("/resume") && (
          <Link
            to="/resume"
            className="group flex items-center justify-center w-16 h-16 bg-green-500 rounded-full text-white 
                 hover:bg-green-600 transition-all duration-300 shadow-xl border-4 border-white 
                 overflow-hidden hover:w-44"
          >
            <Briefcase className="w-7 h-7 flex-shrink-0" />
            <span className="ml-3 hidden group-hover:inline-block opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
              Resume
            </span>
          </Link>
        )}

        {/* Portfolio Icon - Hide on Portfolio page */}
        {!hideCurrentPageIcon("/portfolio") && (
          <Link
            to="/portfolio"
            className="group flex items-center justify-center w-16 h-16 bg-green-500 rounded-full text-white 
                 hover:bg-green-600 transition-all duration-300 shadow-xl border-4 border-white 
                 overflow-hidden hover:w-44"
          >
            <Edit3 className="w-7 h-7 flex-shrink-0" />
            <span className="ml-3 hidden group-hover:inline-block opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
              Portfolio
            </span>
          </Link>
        )}

        {/* Blog Icon - Hide on blog page */}
        {!hideCurrentPageIcon("/blog") && (
          <Link
            to="/blog"
            className="group flex items-center justify-center w-16 h-16 bg-green-500 rounded-full text-white 
                 hover:bg-green-600 transition-all duration-300 shadow-xl border-4 border-white 
                 overflow-hidden hover:w-44"
          >
            <Edit3 className="w-7 h-7 flex-shrink-0" />
            <span className="ml-3 hidden group-hover:inline-block opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
              Blog
            </span>
          </Link>
        )}

        {/* Contact Icon - Hide on Contact page */}
        {!hideCurrentPageIcon("/contact") && (
          <Link
            to="/contact"
            className="group flex items-center justify-center w-16 h-16 bg-green-500 rounded-full text-white 
                 hover:bg-green-600 transition-all duration-300 shadow-xl border-4 border-white 
                 overflow-hidden hover:w-44"
          >
            <Mail className="w-7 h-7 flex-shrink-0" />
            <span className="ml-3 hidden group-hover:inline-block opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
              Contact
            </span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navigation;
