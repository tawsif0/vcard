import React, { useContext } from "react";
import AuthContext from "../context/AuthContext";
import ProfileCard from "./ProfileCard";
import {
  FiUser,
  FiAward,
  FiStar,
  FiTrendingUp,
  FiShare2,
  FiDownload,
  FiSettings,
  FiEye,
  FiUsers,
  FiArrowLeft,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#020617] py-8 px-4 sm:px-6 lg:px-8 relative overflow-visible">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10 animate-pulse"
            style={{
              width: `${Math.random() * 200 + 100}px`,
              height: `${Math.random() * 200 + 100}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: "linear-gradient(145deg, #777, #888)",
              animationDuration: `${Math.random() * 10 + 15}s`,
              animationDelay: `${i * 2}s`,
            }}
          />
        ))}
      </div>
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle 500px at 50% 100px, rgba(192,92,246,0.4), transparent)`,
        }}
      />

      <div className="container mx-auto relative z-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-400">
                Manage your digital business card and profile settings
              </p>
            </div>

            {/* Quick Stats */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 bg-gray-900/20 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-gray-700/30 transition-all hover:bg-gray-800 group"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full flex items-center justify-center transform group-hover:-translate-x-1 transition-transform">
                <FiArrowLeft className="w-5 h-5 text-white " />
              </div>
              <div>
                <p className="!text-left text-sm text-gray-400">Go Back To</p>
                <p className="!text-left font-semibold text-white">Home</p>
              </div>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white border border-gray-700/30 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Profile Views</p>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-sm text-gray-400 mt-1">
                  <span className="text-green-400">↑ 12%</span> this month
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-700/50 rounded-xl flex items-center justify-center">
                <FiEye className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <button className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700/30 backdrop-blur-md hover:border-purple-500/50 hover:shadow-2xl transition-all duration-300 group w-full !text-left">
            <div className="flex !items-start justify-between">
              <div>
                <p className="text-md text-gray-400">Edit Profile</p>
                <p className="mt-2.5 text-xl font-bold text-white">
                  Update your information
                </p>
              </div>
              <div className="w-16 h-16 bg-purple-900/30 rounded-xl flex items-center justify-center group-hover:bg-purple-900/50 transition-colors">
                <FiUser className="w-8 h-8 text-purple-400 group-hover:text-white" />
              </div>
            </div>
          </button>

          <button className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700/30 backdrop-blur-md hover:border-orange-500/50 hover:shadow-2xl transition-all duration-300 group w-full !text-left">
            <div className="flex !items-start justify-between">
              <div>
                <p className="text-md text-gray-400">Settings</p>
                <p className="mt-2.5 text-xl font-bold text-white">
                  Customize preferences
                </p>
              </div>
              <div className="w-16 h-16 bg-orange-900/30 rounded-xl flex items-center justify-center group-hover:bg-orange-900/50 transition-colors">
                <FiSettings className="w-8 h-8 text-orange-400 group-hover:text-white" />
              </div>
            </div>
          </button>
        </div>

        {/* Quick Actions */}

        {/* Profile Card Section */}
        <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700/30">
          <div className="border-b border-gray-400/30">
            <div className="px-6 py-6 flex justify-center items-center">
              <div className="text-center">
                <h2 className="text-4xl font-semibold text-gray-200 glowing-text">
                  Your Digital Business Card
                </h2>
                <p className="mt-2 text-xl text-gray-400">
                  Edit and preview your professional profile
                </p>
              </div>
            </div>
          </div>
          <div>
            <ProfileCard user={user} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
