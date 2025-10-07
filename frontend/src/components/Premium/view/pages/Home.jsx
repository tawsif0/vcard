import React from "react";
import {
  User,
  FileText,
  Briefcase,
  Edit3,
  Mail,
  Facebook,
  Linkedin,
  Instagram,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation"; // ← ADDED IMPORT

const Home = () => {
  const handleImageError = (e, fallbackType) => {
    if (fallbackType === "logo") {
      e.target.style.display = "none";
      const fallback = document.getElementById("logo-fallback");
      if (fallback) fallback.style.display = "flex";
    } else if (fallbackType === "profile") {
      e.target.style.display = "none";
      const fallback = document.getElementById("profile-fallback");
      if (fallback) fallback.style.display = "flex";
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 p-4 md:p-8">
      {/* Top Navigation */}
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <div className="flex items-center space-x-2">
          <img
            src="images/logo/logo.png"
            alt="ProCV"
            className="h-8 w-auto object-contain"
            onError={(e) => handleImageError(e, "logo")}
          />
          <div
            id="logo-fallback"
            className="h-8 bg-green-500 rounded-full items-center justify-center px-3 hidden"
          >
            <span className="text-white text-sm font-bold">ProCV</span>
          </div>
        </div>
        <button className="bg-green-500 text-white px-4 md:px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors">
          Download CV
        </button>
      </div>

      {/* Container for Card and Navigation */}
      <div className="relative">
        {/* Main Content Card */}
        <div
          className="bg-gray-800 rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between relative overflow-hidden bg-cover bg-center bg-no-repeat mb-8"
          style={{
            backgroundImage: `linear-gradient(rgba(31, 41, 55, 0.8), rgba(31, 41, 55, 0.8)), url('images/hero/hero-bg.jpg')`,
          }}
        >
          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-gray-600 rounded-full opacity-30 -translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gray-600 rounded-full opacity-20 translate-x-16 translate-y-16"></div>

          {/* Left side - Profile Image */}
          <div className="relative z-10 mb-8 lg:mb-0">
            <div className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 bg-gray-300 rounded-full flex items-center justify-center relative overflow-hidden">
              <img
                src="images/hero/hero-img.png"
                alt="Emily Jenifer Smith"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => handleImageError(e, "profile")}
              />
              <div
                id="profile-fallback"
                className="w-full h-full bg-gray-300 rounded-full items-center justify-center absolute top-0 left-0 hidden"
              >
                <span className="text-gray-600 text-sm md:text-lg font-medium">
                  Profile Image
                </span>
              </div>
              <div className="absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 border border-white rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="flex-1 lg:ml-16 relative z-10 w-full lg:w-auto">
            <div className="text-center lg:text-right mb-8">
              <div className="text-green-400 font-semibold text-lg mb-4">
                Creative Designer From Dhaka
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 leading-tight">
                Emily
                <br />
                <span className="text-purple-300">Jenifer</span>
                <br />
                Smith
              </h1>
            </div>
          </div>

          {/* Social Media Links - Inside Card Bottom Right */}
          <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-10">
            <div className="flex space-x-6 text-gray-300 text-sm font-medium">
              <Link
                to="#"
                className="hover:text-white transition duration-300 flex items-center space-x-1"
              >
                <Facebook className="w-4 h-4" />
                <span className="hidden sm:inline">FACEBOOK</span>
              </Link>
              <Link
                to="#"
                className="hover:text-white transition duration-300 flex items-center space-x-1"
              >
                <Linkedin className="w-4 h-4" />
                <span className="hidden sm:inline">LINKEDIN</span>
              </Link>
              <Link
                to="#"
                className="hover:text-white transition duration-300 flex items-center space-x-1"
              >
                <Instagram className="w-4 h-4" />
                <span className="hidden sm:inline">INSTAGRAM</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Component - REPLACED OLD NAVIGATION */}
        <Navigation />
      </div>
    </div>
  );
};

export default Home;
