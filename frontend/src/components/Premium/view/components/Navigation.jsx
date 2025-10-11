// src/components/Navigation.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { User, FileText, Briefcase, Edit3, Mail } from "lucide-react";
import { useParams } from "react-router-dom";
const Navigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { userId } = useParams();

  const positionClass =
    currentPath === "/"
      ? "absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-30"
      : "absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30";

  return (
    <div className={positionClass}>
      <div className="flex space-x-4 max-w-full overflow-x-auto px-2">
        {/* Home Icon - Hide on Home page */}
        {currentPath !== `/profile/${userId}/home` && (
          <Link
            to={`/profile/${userId}/home`}
            className="group flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 
 bg-gradient-to-r from-gray-700 to-gray-600 text-white border border-gray-700 hover:from-gray-600 hover:to-gray-500
rounded-full hover:bg-opacity-60
  transition-all duration-300 shadow-md overflow-hidden hover:w-40"
          >
            <User className="w-7 h-7 flex-shrink-0" />
            <span className="ml-3 hidden group-hover:inline-block opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
              Home
            </span>
          </Link>
        )}

        {/* About Icon - Hide on About page */}
        {currentPath !== `/profile/${userId}/about` && (
          <Link
            to={`/profile/${userId}/about`}
            className="group flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 
 bg-gradient-to-r from-gray-700 to-gray-600 text-white border border-gray-700 hover:from-gray-600 hover:to-gray-500
rounded-full hover:bg-opacity-60
  transition-all duration-300 shadow-md overflow-hidden hover:w-40"
          >
            <FileText className="w-7 h-7 flex-shrink-0" />
            <span className="ml-3 hidden group-hover:inline-block opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
              About
            </span>
          </Link>
        )}

        {/* Resume Icon - Hide on Resume page */}
        {currentPath !== `/profile/${userId}/resume` && (
          <Link
            to={`/profile/${userId}/resume`}
            className="group flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 
 bg-gradient-to-r from-gray-700 to-gray-600 text-white border border-gray-700 hover:from-gray-600 hover:to-gray-500
rounded-full hover:bg-opacity-60
  transition-all duration-300 shadow-md overflow-hidden hover:w-40"
          >
            <Briefcase className="w-7 h-7 flex-shrink-0" />
            <span className="ml-3 hidden group-hover:inline-block opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
              Resume
            </span>
          </Link>
        )}

        {/* Portfolio Icon - Hide on Portfolio page */}
        {currentPath !== `/profile/${userId}/portfolio` && (
          <Link
            to={`/profile/${userId}/portfolio`}
            className="group flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 
 bg-gradient-to-r from-gray-700 to-gray-600 text-white border border-gray-700 hover:from-gray-600 hover:to-gray-500
rounded-full hover:bg-opacity-60
  transition-all duration-300 shadow-md overflow-hidden hover:w-40"
          >
            <Edit3 className="w-7 h-7 flex-shrink-0" />
            <span className="ml-3 hidden group-hover:inline-block opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
              Portfolio
            </span>
          </Link>
        )}

        {/* Blog Icon - Hide on blog page */}
        {currentPath !== `/profile/${userId}/blog` && (
          <Link
            to={`/profile/${userId}/blog`}
            className="group flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 
 bg-gradient-to-r from-gray-700 to-gray-600 text-white border border-gray-700 hover:from-gray-600 hover:to-gray-500
rounded-full hover:bg-opacity-60
  transition-all duration-300 shadow-md overflow-hidden hover:w-40"
          >
            <Edit3 className="w-7 h-7 flex-shrink-0" />
            <span className="ml-3 hidden group-hover:inline-block opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
              Blog
            </span>
          </Link>
        )}

        {/* Contact Icon - Hide on Contact page */}
        {currentPath !== `/profile/${userId}/contact` && (
          <Link
            to={`/profile/${userId}/contact`}
            className="group flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 
 bg-gradient-to-r from-gray-700 to-gray-600 text-white border border-gray-700 hover:from-gray-600 hover:to-gray-500
rounded-full hover:bg-opacity-60
  transition-all duration-300 shadow-md overflow-hidden hover:w-40"
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
