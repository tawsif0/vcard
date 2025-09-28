import React, { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import {
  FiBarChart2,
  FiHeadphones,
  FiZap,
  FiGlobe,
  FiShield,
  FiArrowLeft,
  FiUser,
  FiSettings,
  FiEye,
  FiAward,
  FiStar,
  FiTrendingUp,
  FiShare2,
  FiDownload,
  FiUsers,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const PremiumDashboard = () => {
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
              background: "linear-gradient(145deg, #a855f7, #6366f1)",
              animationDuration: `${Math.random() * 10 + 15}s`,
              animationDelay: `${i * 2}s`,
            }}
          />
        ))}
      </div>
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle 500px at 50% 100px, rgba(168,85,247,0.4), transparent)`,
        }}
      />

      <div className="container mx-auto relative z-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Premium Experience, {user?.name}!
              </h1>
              <p className="text-gray-400">
                Access exclusive features and enhanced capabilities
              </p>
            </div>

            {/* Premium Badge and Back Button */}
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full">
                <span className="font-semibold">PREMIUM MEMBER</span>
              </div>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-3 bg-gray-900/20 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-gray-700/30 transition-all hover:bg-gray-800 group"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full flex items-center justify-center transform group-hover:-translate-x-1 transition-transform">
                  <FiArrowLeft className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="!text-left text-sm text-gray-400">Go Back To</p>
                  <p className="!text-left font-semibold text-white">
                    Dashboard
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-6 text-white border border-purple-500/30 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Premium Views</p>
                <p className="text-2xl font-bold">2,458</p>
                <p className="text-sm text-gray-300 mt-1">
                  <span className="text-green-400">↑ 24%</span> this month
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-700/50 rounded-xl flex items-center justify-center">
                <FiZap className="w-6 h-6 text-purple-300" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-2xl p-6 text-white border border-purple-500/30 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Engagement Rate</p>
                <p className="text-2xl font-bold">68%</p>
                <p className="text-sm text-gray-300 mt-1">
                  <span className="text-green-400">↑ 8%</span> higher
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-700/50 rounded-xl flex items-center justify-center">
                <FiBarChart2 className="w-6 h-6 text-indigo-300" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-6 text-white border border-blue-500/30 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Connections</p>
                <p className="text-2xl font-bold">892</p>
                <p className="text-sm text-gray-300 mt-1">
                  <span className="text-green-400">↑ 15%</span> growth
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-700/50 rounded-xl flex items-center justify-center">
                <FiGlobe className="w-6 h-6 text-blue-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Premium Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-purple-500/30 backdrop-blur-md hover:border-purple-500/70 hover:shadow-2xl transition-all duration-300 group w-full !text-left">
            <div className="flex !items-start justify-between">
              <div>
                <p className="text-md text-gray-400">Advanced Analytics</p>
                <p className="mt-2.5 text-xl font-bold text-white">
                  Detailed insights & metrics
                </p>
              </div>
              <div className="w-16 h-16 bg-purple-900/30 rounded-xl flex items-center justify-center group-hover:bg-purple-900/50 transition-colors">
                <FiBarChart2 className="w-8 h-8 text-purple-400 group-hover:text-white" />
              </div>
            </div>
          </button>

          <button className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-pink-500/30 backdrop-blur-md hover:border-pink-500/70 hover:shadow-2xl transition-all duration-300 group w-full !text-left">
            <div className="flex !items-start justify-between">
              <div>
                <p className="text-md text-gray-400">Custom Themes</p>
                <p className="mt-2.5 text-xl font-bold text-white">
                  Exclusive designs
                </p>
              </div>
              <div className="w-16 h-16 bg-pink-900/30 rounded-xl flex items-center justify-center group-hover:bg-pink-900/50 transition-colors">
                <FiSettings className="w-8 h-8 text-pink-400 group-hover:text-white" />
              </div>
            </div>
          </button>

          <button className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-blue-500/30 backdrop-blur-md hover:border-blue-500/70 hover:shadow-2xl transition-all duration-300 group w-full !text-left">
            <div className="flex !items-start justify-between">
              <div>
                <p className="text-md text-gray-400">Priority Support</p>
                <p className="mt-2.5 text-xl font-bold text-white">
                  24/7 dedicated help
                </p>
              </div>
              <div className="w-16 h-16 bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:bg-blue-900/50 transition-colors">
                <FiHeadphones className="w-8 h-8 text-blue-400 group-hover:text-white" />
              </div>
            </div>
          </button>

          <button className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-green-500/30 backdrop-blur-md hover:border-green-500/70 hover:shadow-2xl transition-all duration-300 group w-full !text-left">
            <div className="flex !items-start justify-between">
              <div>
                <p className="text-md text-gray-400">Enhanced Security</p>
                <p className="mt-2.5 text-xl font-bold text-white">
                  Advanced protection
                </p>
              </div>
              <div className="w-16 h-16 bg-green-900/30 rounded-xl flex items-center justify-center group-hover:bg-green-900/50 transition-colors">
                <FiShield className="w-8 h-8 text-green-400 group-hover:text-white" />
              </div>
            </div>
          </button>

          <button className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-orange-500/30 backdrop-blur-md hover:border-orange-500/70 hover:shadow-2xl transition-all duration-300 group w-full !text-left">
            <div className="flex !items-start justify-between">
              <div>
                <p className="text-md text-gray-400">Performance Boost</p>
                <p className="mt-2.5 text-xl font-bold text-white">
                  Faster loading
                </p>
              </div>
              <div className="w-16 h-16 bg-orange-900/30 rounded-xl flex items-center justify-center group-hover:bg-orange-900/50 transition-colors">
                <FiZap className="w-8 h-8 text-orange-400 group-hover:text-white" />
              </div>
            </div>
          </button>

          <button className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-teal-500/30 backdrop-blur-md hover:border-teal-500/70 hover:shadow-2xl transition-all duration-300 group w-full !text-left">
            <div className="flex !items-start justify-between">
              <div>
                <p className="text-md text-gray-400">Global Reach</p>
                <p className="mt-2.5 text-xl font-bold text-white">
                  Worldwide visibility
                </p>
              </div>
              <div className="w-16 h-16 bg-teal-900/30 rounded-xl flex items-center justify-center group-hover:bg-teal-900/50 transition-colors">
                <FiGlobe className="w-8 h-8 text-teal-400 group-hover:text-white" />
              </div>
            </div>
          </button>
        </div>

        {/* Premium Benefits Section */}
        <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700/30 p-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-semibold text-gray-200 glowing-text">
              Premium Benefits
            </h2>
            <p className="mt-2 text-xl text-gray-400">
              Unlock the full potential of your digital presence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-purple-900/30 to-transparent rounded-2xl p-6 border border-purple-500/20">
              <h3 className="text-xl font-semibold text-white mb-3">
                Exclusive Features
              </h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Advanced analytics dashboard</li>
                <li>• Custom theme library</li>
                <li>• Priority customer support</li>
                <li>• Enhanced security features</li>
                <li>• Performance optimization</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-blue-900/30 to-transparent rounded-2xl p-6 border border-blue-500/20">
              <h3 className="text-xl font-semibold text-white mb-3">
                Growth Tools
              </h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Unlimited profile views</li>
                <li>• Advanced sharing options</li>
                <li>• Custom domain support</li>
                <li>• Team collaboration features</li>
                <li>• API access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumDashboard;
