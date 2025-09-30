import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiZap,
  FiBarChart2,
  FiGlobe,
  FiSettings,
  FiHeadphones,
  FiShield,
} from "react-icons/fi";
import AuthContext from "../../../../../context/AuthContext";
// adjust path if needed

const DashboardHome = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="relative overflow-visible">
      {/* Page content */}
      <div className="mx-auto relative z-10">
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
            <div className="flex items-center justify-center sm:justify-start gap-4">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-3 bg-gray-900/20 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-gray-700/30 transition-all hover:bg-gray-800 group"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full flex items-center justify-center transform group-hover:-translate-x-1 transition-transform">
                  <FiArrowLeft className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="!text-left text-sm text-gray-400">Go Back</p>
                  <p className="!text-left font-semibold text-white">Home</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-6 text-white border border-purple-500/30 backdrop-blur-md shadow-xl transition-all duration-300 hover:scale-102 hover:shadow-2xl hover:border-purple-400/50 cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Premium Views</p>
                <p className="text-2xl font-bold">2,458</p>
                <p className="text-sm text-gray-300 mt-1">
                  <span className="text-green-400">↑ 24%</span> this month
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-700/50 rounded-xl flex items-center justify-center group-hover:bg-purple-600/50 transition-all duration-300">
                <FiZap className="w-6 h-6 text-purple-300 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-2xl p-6 text-white border border-purple-500/30 backdrop-blur-md shadow-xl transition-all duration-300 hover:scale-102 hover:shadow-2xl hover:border-indigo-400/50 cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Engagement Rate</p>
                <p className="text-2xl font-bold">68%</p>
                <p className="text-sm text-gray-300 mt-1">
                  <span className="text-green-400">↑ 8%</span> higher
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-700/50 rounded-xl flex items-center justify-center group-hover:bg-indigo-600/50 transition-all duration-300">
                <FiBarChart2 className="w-6 h-6 text-indigo-300 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-6 text-white border border-blue-500/30 backdrop-blur-md shadow-xl transition-all duration-300 hover:scale-102 hover:shadow-2xl hover:border-blue-400/50 cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Connections</p>
                <p className="text-2xl font-bold">892</p>
                <p className="text-sm text-gray-300 mt-1">
                  <span className="text-green-400">↑ 15%</span> growth
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-700/50 rounded-xl flex items-center justify-center group-hover:bg-blue-600/50 transition-all duration-300">
                <FiGlobe className="w-6 h-6 text-blue-300 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
