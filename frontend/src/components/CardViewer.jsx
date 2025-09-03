import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  FiUser,
  FiBriefcase,
  FiInfo,
  FiPhone,
  FiMail,
  FiGlobe,
  FiLinkedin,
  FiFacebook,
  FiLoader,
  FiMapPin,
  FiTarget,
  FiHeart,
  FiBook,
  FiBookOpen,
  FiType,
  FiUsers,
  FiShare2,
  FiCopy,
  FiTrendingUp,
  FiAnchor,
  FiX,
  FiCheck,
} from "react-icons/fi";
import { BiBuilding } from "react-icons/bi";
import { GiOfficeChair } from "react-icons/gi";

const CardViewer = () => {
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { userId } = useParams();

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/profile/public/${userId}`
        );

        if (!response.ok) throw new Error("Card not found");
        const data = await response.json();
        setCardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCardData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            <FiLoader className="w-10 h-10 text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-white font-medium text-lg">
            Loading your digital profile...
          </p>
          <p className="text-slate-200 mt-2">
            Just a moment while we prepare your card
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-md w-full text-center transform hover:scale-105 transition-transform duration-300 border border-slate-700/50">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiX className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Oops! Profile Not Found
          </h2>
          <p className="text-slate-200 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const websiteLink = cardData.website?.startsWith("http")
    ? cardData.website
    : `https://${cardData.website}`;

  const linkedinLink = cardData.linkedin?.startsWith("http")
    ? cardData.linkedin
    : `https://${cardData.linkedin}`;

  const facebookLink = cardData.facebook?.startsWith("http")
    ? cardData.facebook
    : `https://${cardData.facebook}`;

  const getProfilePicture = () => {
    if (cardData.profilePicture) {
      return `http://localhost:5000/${cardData.profilePicture}`;
    }
    return null;
  };

  const profilePictureUrl = getProfilePicture();

  // Define theme based on user type
  const getTheme = () => {
    switch (cardData.userType) {
      case "student":
        return {
          bgGradient: "from-blue-900/80 via-indigo-900/80 to-purple-900/80",
          headerGradient: "from-blue-600/70 via-indigo-600/70 to-purple-700/70",
          accentColor: "blue",
          iconBg: "bg-blue-500",
          iconColor: "text-blue-400",
          tagBg: "bg-blue-500/20 text-blue-300",
          buttonGradient: "from-blue-500 to-indigo-600",
          hoverButton: "hover:from-blue-600 hover:to-indigo-700",
          cardBg: "bg-slate-800/40",
          borderColor: "border-blue-500/30",
          glow: "shadow-blue-500/10",
          textColor: "text-white",
        };
      case "businessman":
        return {
          bgGradient: "from-emerald-900/80 via-teal-900/80 to-cyan-900/80",
          headerGradient: "from-emerald-600/70 via-teal-600/70 to-cyan-700/70",
          accentColor: "emerald",
          iconBg: "bg-emerald-500",
          iconColor: "text-emerald-400",
          tagBg: "bg-emerald-500/20 text-emerald-300",
          buttonGradient: "from-emerald-500 to-teal-600",
          hoverButton: "hover:from-emerald-600 hover:to-teal-700",
          cardBg: "bg-slate-800/40",
          borderColor: "border-emerald-500/30",
          glow: "shadow-emerald-500/10",
          textColor: "text-white",
        };
      case "official":
        return {
          bgGradient: "from-amber-50 via-orange-100 to-red-50",
          headerGradient: "from-amber-600/70 via-orange-600/70 to-red-700/70",
          accentColor: "amber",
          iconBg: "bg-amber-500",
          iconColor: "text-amber-400",
          tagBg: "bg-amber-500/20 text-amber-300",
          buttonGradient: "from-amber-500 to-orange-600",
          hoverButton: "hover:from-amber-600 hover:to-orange-700",
          cardBg: "bg-slate-800/40",
          borderColor: "border-amber-500/30",
          glow: "shadow-amber-50",
          textColor: "text-white",
        };
      default:
        return {
          bgGradient: "from-slate-900/80 via-purple-900/80 to-slate-900/80",
          headerGradient: "from-slate-600/70 via-blue-600/70 to-indigo-700/70",
          accentColor: "purple",
          iconBg: "bg-purple-500",
          iconColor: "text-purple-400",
          tagBg: "bg-purple-500/20 text-purple-300",
          buttonGradient: "from-purple-500 to-blue-600",
          hoverButton: "hover:from-purple-600 hover:to-blue-700",
          cardBg: "bg-slate-800/40",
          borderColor: "border-purple-500/30",
          glow: "shadow-purple-500/10",
          textColor: "text-white",
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} py-8 px-4 sm:px-6 lg:px-8`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Share Button */}

        {/* Main Card */}
        <div
          className={`rounded-3xl overflow-hidden backdrop-blur-md bg-slate-800/30 border ${theme.borderColor} shadow-2xl ${theme.glow} transition-all duration-500 hover:shadow-2xl`}
        >
          {/* Header with gradient */}
          <div
            className={`relative bg-gradient-to-r ${theme.headerGradient} p-8 text-white backdrop-blur-md`}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center text-center md:text-left">
              {/* Profile Picture */}
              <div className="w-32 h-32 rounded-full border-4 border-white/20 bg-white/10 mb-6 md:mb-0 md:mr-8 p-1 shadow-2xl relative">
                {profilePictureUrl ? (
                  <img
                    src={profilePictureUrl}
                    alt={cardData.fullName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center">
                    <FiUser className="w-12 h-12 text-white/70" />
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-green-400 to-cyan-500 rounded-full flex items-center justify-center border-2 border-white/80">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Name and Title */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  {cardData.fullName || "Your Name"}
                </h1>

                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-white/90 text-lg font-medium">
                    {cardData.userType === "student" &&
                      (cardData.institutionName || "Student")}
                    {cardData.userType === "businessman" &&
                      (cardData.position || "Business Professional")}
                    {cardData.userType === "official" &&
                      (cardData.jobTitle || "Official")}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span
                    className={`px-3 py-1 ${theme.tagBg} rounded-full text-sm font-medium backdrop-blur-md`}
                  >
                    {cardData.userType}
                  </span>
                  {cardData.department && (
                    <span
                      className={`px-3 py-1 ${theme.tagBg} rounded-full text-sm font-medium backdrop-blur-md`}
                    >
                      {cardData.department}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-8">
            {/* Avatar Display - Before Bio */}

            {/* User Type Specific Information */}
            {cardData.userType === "student" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {cardData.institutionName && (
                  <div
                    className={`${theme.cardBg} p-6 rounded-2xl border ${theme.borderColor} backdrop-blur-md transition-all duration-300 hover:translate-y-1`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 ${theme.iconBg} rounded-lg flex items-center justify-center backdrop-blur-md`}
                      >
                        <FiAnchor className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-white">Institution</h3>
                    </div>
                    <p className="text-slate-300">{cardData.institutionName}</p>
                  </div>
                )}

                {cardData.aimInLife && (
                  <div
                    className={`${theme.cardBg} p-6 rounded-2xl border ${theme.borderColor} backdrop-blur-md transition-all duration-300 hover:translate-y-1`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 ${theme.iconBg} rounded-lg flex items-center justify-center backdrop-blur-md`}
                      >
                        <FiTarget className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-white">Aim in Life</h3>
                    </div>
                    <p className="text-slate-300">{cardData.aimInLife}</p>
                  </div>
                )}

                {cardData.hobby && (
                  <div
                    className={`${theme.cardBg} p-6 rounded-2xl border ${theme.borderColor} backdrop-blur-md transition-all duration-300 hover:translate-y-1`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 ${theme.iconBg} rounded-lg flex items-center justify-center backdrop-blur-md`}
                      >
                        <FiHeart className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-white">Hobby</h3>
                    </div>
                    <p className="text-slate-300">{cardData.hobby}</p>
                  </div>
                )}

                {cardData.fieldOfStudy && (
                  <div
                    className={`${theme.cardBg} p-6 rounded-2xl border ${theme.borderColor} backdrop-blur-md transition-all duration-300 hover:translate-y-1`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 ${theme.iconBg} rounded-lg flex items-center justify-center backdrop-blur-md`}
                      >
                        <FiBook className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-white">
                        Field of Study
                      </h3>
                    </div>
                    <p className="text-slate-300">{cardData.fieldOfStudy}</p>
                  </div>
                )}
              </div>
            )}

            {cardData.userType === "businessman" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {cardData.businessName && (
                  <div
                    className={`${theme.cardBg} p-6 rounded-2xl border ${theme.borderColor} backdrop-blur-md transition-all duration-300 hover:translate-y-1`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 ${theme.iconBg} rounded-lg flex items-center justify-center backdrop-blur-md`}
                      >
                        <BiBuilding className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-white">Business</h3>
                    </div>
                    <p className="text-slate-300">{cardData.businessName}</p>
                  </div>
                )}

                {cardData.businessType && (
                  <div
                    className={`${theme.cardBg} p-6 rounded-2xl border ${theme.borderColor} backdrop-blur-md transition-all duration-300 hover:translate-y-1`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 ${theme.iconBg} rounded-lg flex items-center justify-center backdrop-blur-md`}
                      >
                        <FiType className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-white">
                        Business Type
                      </h3>
                    </div>
                    <p className="text-slate-300">{cardData.businessType}</p>
                  </div>
                )}

                {cardData.position && (
                  <div
                    className={`${theme.cardBg} p-6 rounded-2xl border ${theme.borderColor} backdrop-blur-md transition-all duration-300 hover:translate-y-1`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 ${theme.iconBg} rounded-lg flex items-center justify-center backdrop-blur-md`}
                      >
                        <FiBriefcase className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-200">Position</h3>
                    </div>
                    <p className="text-slate-300">{cardData.position}</p>
                  </div>
                )}

                {cardData.industry && (
                  <div
                    className={`${theme.cardBg} p-6 rounded-2xl border ${theme.borderColor} backdrop-blur-md transition-all duration-300 hover:translate-y-1`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 ${theme.iconBg} rounded-lg flex items-center justify-center backdrop-blur-md`}
                      >
                        <FiTrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-200">Industry</h3>
                    </div>
                    <p className="text-slate-300">{cardData.industry}</p>
                  </div>
                )}
              </div>
            )}

            {cardData.userType === "official" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {cardData.company && (
                  <div
                    className={`${theme.cardBg} p-6 rounded-2xl border ${theme.borderColor} backdrop-blur-md transition-all duration-300 hover:translate-y-1`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 ${theme.iconBg} rounded-lg flex items-center justify-center backdrop-blur-md`}
                      >
                        <GiOfficeChair className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-200">
                        Organization
                      </h3>
                    </div>
                    <p className="text-slate-300">{cardData.company}</p>
                  </div>
                )}

                {cardData.officialPosition && (
                  <div
                    className={`${theme.cardBg} p-6 rounded-2xl border ${theme.borderColor} backdrop-blur-md transition-all duration-300 hover:translate-y-1`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 ${theme.iconBg} rounded-lg flex items-center justify-center backdrop-blur-md`}
                      >
                        <FiUsers className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-200">Position</h3>
                    </div>
                    <p className="text-slate-300">
                      {cardData.officialPosition}
                    </p>
                  </div>
                )}

                {cardData.department && (
                  <div
                    className={`${theme.cardBg} p-6 rounded-2xl border ${theme.borderColor} backdrop-blur-md transition-all duration-300 hover:translate-y-1`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 ${theme.iconBg} rounded-lg flex items-center justify-center backdrop-blur-md`}
                      >
                        <FiBookOpen className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-200">
                        Department
                      </h3>
                    </div>
                    <p className="text-slate-300">{cardData.department}</p>
                  </div>
                )}

                {cardData.officeAddress && (
                  <div
                    className={`${theme.cardBg} p-6 rounded-2xl border ${theme.borderColor} backdrop-blur-md transition-all duration-300 hover:translate-y-1`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 ${theme.iconBg} rounded-lg flex items-center justify-center backdrop-blur-md`}
                      >
                        <FiMapPin className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-200">
                        Office Address
                      </h3>
                    </div>
                    <p className="text-slate-300">{cardData.officeAddress}</p>
                  </div>
                )}
              </div>
            )}
            {cardData.avatar && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 ${theme.iconBg} rounded-full flex items-center justify-center backdrop-blur-md`}
                  >
                    <FiInfo className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Avatar</h3>
                </div>
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center overflow-hidden shadow-xl mx-auto border-2 border-white/20">
                  <img
                    src={cardData.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            {/* Bio */}
            {cardData.bio && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 ${theme.iconBg} rounded-full flex items-center justify-center backdrop-blur-md`}
                  >
                    <FiInfo className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">About Me</h3>
                </div>
                <div
                  className={`${theme.cardBg} p-6 rounded-2xl border-l-4 ${theme.borderColor} backdrop-blur-md`}
                >
                  <p className="text-slate-300 text-lg leading-relaxed">
                    {cardData.bio}
                  </p>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`w-10 h-10 ${theme.iconBg} rounded-full flex items-center justify-center backdrop-blur-md`}
                >
                  <FiMapPin className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Get In Touch
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cardData.phone && (
                  <div
                    className={`group ${theme.cardBg} p-6 rounded-2xl border ${theme.borderColor} hover:shadow-md transition-all duration-300 backdrop-blur-md hover:-translate-y-1`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 ${theme.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 backdrop-blur-md`}
                      >
                        <FiPhone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-slate-200 text-sm">Phone</p>
                        <a
                          href={`tel:${cardData.phone}`}
                          className="font-semibold text-white hover:text-purple-400 transition-colors block"
                        >
                          {cardData.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {cardData.email && (
                  <div
                    className={`group ${theme.cardBg} p-6 rounded-2xl border ${theme.borderColor} hover:shadow-md transition-all duration-300 backdrop-blur-md hover:-translate-y-1`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 ${theme.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 backdrop-blur-md`}
                      >
                        <FiMail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-slate-200 text-sm">Email</p>
                        <a
                          href={`mailto:${cardData.email}`}
                          className="font-semibold text-white hover:text-blue-400 transition-colors block break-all"
                        >
                          {cardData.email}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {cardData.website && (
                  <div
                    className={`group ${theme.cardBg} p-6 rounded-2xl border ${theme.borderColor} hover:shadow-md transition-all duration-300 backdrop-blur-md hover:-translate-y-1`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 ${theme.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 backdrop-blur-md`}
                      >
                        <FiGlobe className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-slate-200 text-sm">Website</p>
                        <a
                          href={websiteLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-white hover:text-indigo-400 transition-colors block break-all"
                        >
                          {cardData.website}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {cardData.linkedin && (
                  <div
                    className={`group ${theme.cardBg} p-6 rounded-2xl border ${theme.borderColor} hover:shadow-md transition-all duration-300 backdrop-blur-md hover:-translate-y-1`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 backdrop-blur-md">
                        <FiLinkedin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-slate-200 text-sm">LinkedIn</p>
                        <a
                          href={linkedinLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-white hover:text-blue-400 transition-colors block break-all"
                        >
                          {cardData.linkedin}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {cardData.facebook && (
                  <div
                    className={`group ${theme.cardBg} p-6 rounded-2xl border ${theme.borderColor} hover:shadow-md transition-all duration-300 backdrop-blur-md hover:-translate-y-1`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 backdrop-blur-md">
                        <FiFacebook className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-slate-200 text-sm">Facebook</p>
                        <a
                          href={facebookLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-white hover:text-blue-400 transition-colors block break-all"
                        >
                          {cardData.facebook}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {cardData.address && (
                  <div
                    className={`group ${theme.cardBg} p-6 rounded-2xl border ${theme.borderColor} hover:shadow-md transition-all duration-300 backdrop-blur-md hover:-translate-y-1`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 ${theme.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 backdrop-blur-md`}
                      >
                        <FiMapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-slate-200 text-sm">Address</p>
                        <p className="font-semibold text-white">
                          {cardData.address}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-900/60 p-6 text-center border-t border-slate-700/50 backdrop-blur-md">
            <p className="text-xs text-slate-100">
              Powered by Arbeit Technology • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardViewer;
