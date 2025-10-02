import React, { useState, useEffect, useRef, useContext } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBook,
  FiGlobe,
  FiMessageSquare,
  FiAward,
  FiFlag,
  FiEdit,
  FiEye,
  FiSave,
  FiBold,
  FiItalic,
  FiList,
  FiLink,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import AuthContext from "../../../../../context/AuthContext"; // Adjust import path as needed

// eslint-disable-next-line no-unused-vars
const AboutMe = ({ user }) => {
  const { checkAuth } = useContext(AuthContext);
  const [aboutData, setAboutData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    education: "",
    languages: "",
    nationality: "",
    freelance: "Available",
    description: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef(null);
  const hasFetchedRef = useRef(false);

  // Loading timeout hook
  const useLoadingTimeout = (loadingState, timeout = 10000) => {
    const [timedOut, setTimedOut] = useState(false);

    useEffect(() => {
      if (loadingState) {
        const timer = setTimeout(() => {
          setTimedOut(true);
        }, timeout);

        return () => clearTimeout(timer);
      } else {
        setTimedOut(false);
      }
    }, [loadingState, timeout]);

    return timedOut;
  };

  const loadingTimedOut = useLoadingTimeout(isLoading, 10000);

  // Fetch about data from backend
  useEffect(() => {
    const fetchAboutData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoading(false);
        toast.error("Please log in to access this page");
        return;
      }

      // Prevent multiple fetches
      if (hasFetchedRef.current) {
        return;
      }

      try {
        setIsLoading(true);
        hasFetchedRef.current = true;

        const response = await fetch("http://localhost:5000/api/about", {
          headers: {
            "x-auth-token": token,
          },
        });

        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          toast.error("Session expired. Please log in again.");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        if (data.success) {
          // Handle both possible data structures
          const personalData = data.data.personal || data.data || {};
          setAboutData((prev) => ({
            ...prev,
            ...personalData,
          }));
        }
      } catch (err) {
        console.error("Fetch error:", err);
        if (err.message.includes("401")) {
          toast.error("Authentication failed. Please log in again.");
        } else {
          toast.error(err.message);
        }
        // Set default data on error to prevent infinite loading
        setAboutData({
          name: "",
          email: "",
          phone: "",
          address: "",
          education: "",
          languages: "",
          nationality: "",
          freelance: "Available",
          description: "",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAboutData();

    // Cleanup function to reset fetch flag when component unmounts
    return () => {
      hasFetchedRef.current = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAboutData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    // Check authentication before saving
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      toast.error("Please log in to save changes");
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/about/personal", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(aboutData),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please log in again.");
        return;
      }

      if (response.ok) {
        toast.success("About information saved successfully!");
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to save about information"
        );
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const formatText = (format) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = aboutData.description.substring(start, end);

    let formattedText = "";
    let newStart = start;
    let newEnd = end;

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`;
        newStart = start + 2;
        newEnd = end + 2;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        newStart = start + 1;
        newEnd = end + 1;
        break;
      case "bullet":
        if (selectedText) {
          formattedText = `• ${selectedText}`;
          newStart = start + 2;
          newEnd = end + 2;
        } else {
          formattedText = "• ";
          newStart = start + 2;
          newEnd = start + 2;
        }
        break;
      case "link":
        formattedText = `[${selectedText || "link"}](${
          selectedText ? "url" : "https://example.com"
        })`;
        newStart = start + 1;
        newEnd = selectedText ? end + 1 : start + 5;
        break;
      default:
        formattedText = selectedText;
    }

    const newDescription =
      aboutData.description.substring(0, start) +
      formattedText +
      aboutData.description.substring(end);

    setAboutData((prev) => ({
      ...prev,
      description: newDescription,
    }));

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newStart, newEnd);
      }
    }, 0);
  };

  const parseFormattedText = (text) => {
    if (!text) return null;

    return text.split("\n").map((line, index) => {
      if (line.trim().startsWith("•")) {
        return (
          <div key={index} className="flex items-start">
            <span className="mr-2">•</span>
            <span>{line.replace("•", "").trim()}</span>
          </div>
        );
      }

      let formattedLine = line;
      formattedLine = formattedLine.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
      );
      formattedLine = formattedLine.replace(/\*(.*?)\*/g, "<em>$1</em>");
      formattedLine = formattedLine.replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a href="$2" class="text-blue-600 underline">$1</a>'
      );

      return (
        <p
          key={index}
          className="text-white leading-relaxed text-sm mb-3"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center relative z-10">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-400 font-medium">
            Loading about information...
          </p>
          {loadingTimedOut && (
            <p className="mt-2 text-yellow-400 text-sm">
              Taking longer than expected. Check your connection.
            </p>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8 relative overflow-visible">
      <div className="mx-auto relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Personal Information
          </h1>
          {/* <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto">
            Provide your information to look perfect
          </p> */}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column - Form */}
          <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-6 lg:col-span-2 border border-gray-700/30">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FiEdit className="w-5 h-5" />
              Edit About Information
            </h2>

            <div className="space-y-6">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiUser className="w-4 h-4" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                  value={aboutData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiMail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                  value={aboutData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiPhone className="w-4 h-4" />
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                  value={aboutData.phone}
                  onChange={handleChange}
                  placeholder="+123 456 7890"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiMapPin className="w-4 h-4" />
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                  value={aboutData.address}
                  onChange={handleChange}
                  placeholder="Your address"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiBook className="w-4 h-4" />
                  Education
                </label>
                <input
                  type="text"
                  name="education"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                  value={aboutData.education}
                  onChange={handleChange}
                  placeholder="Your education"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiMessageSquare className="w-4 h-4" />
                  Languages
                </label>
                <input
                  type="text"
                  name="languages"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                  value={aboutData.languages}
                  onChange={handleChange}
                  placeholder="Languages you speak"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiFlag className="w-4 h-4" />
                  Nationality
                </label>
                <input
                  type="text"
                  name="nationality"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                  value={aboutData.nationality}
                  onChange={handleChange}
                  placeholder="Your nationality"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiAward className="w-4 h-4" />
                  Freelance Availability
                </label>
                <select
                  name="freelance"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                  value={aboutData.freelance}
                  onChange={handleChange}
                >
                  <option value="Available">Available</option>
                  <option value="Not Available">Not Available</option>
                </select>
              </div>
            </div>

            <div className="form-group mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <FiGlobe className="w-4 h-4" />
                About Description
              </label>

              <div className="flex gap-2 mb-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                <button
                  type="button"
                  onClick={() => formatText("bold")}
                  className="p-2 hover:bg-gray-700 rounded transition"
                  title="Bold"
                >
                  <FiBold className="w-4 h-4 text-gray-300" />
                </button>
                <button
                  type="button"
                  onClick={() => formatText("italic")}
                  className="p-2 hover:bg-gray-700 rounded transition"
                  title="Italic"
                >
                  <FiItalic className="w-4 h-4 text-gray-300" />
                </button>
                <button
                  type="button"
                  onClick={() => formatText("bullet")}
                  className="p-2 hover:bg-gray-700 rounded transition"
                  title="Bullet List"
                >
                  <FiList className="w-4 h-4 text-gray-300" />
                </button>
                <button
                  type="button"
                  onClick={() => formatText("link")}
                  className="p-2 hover:bg-gray-700 rounded transition"
                  title="Add Link"
                >
                  <FiLink className="w-4 h-4 text-gray-300" />
                </button>
              </div>

              <textarea
                ref={textareaRef}
                name="description"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition resize-none"
                value={aboutData.description}
                onChange={handleChange}
                placeholder="Write something about yourself..."
                rows="8"
              />

              <div className="mt-2 text-xs text-gray-400">
                <p>
                  Formatting tips: Use **bold**, *italic*, • bullet points,
                  [links](url)
                </p>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full group relative bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30"
              >
                <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <span className="relative flex items-center justify-center gap-2">
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" />
                      Save About Information
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-700/30 sticky top-8 self-start overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FiEye className="w-5 h-5" />
              Live Preview
            </h2>

            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 rounded-2xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-all duration-500 border border-gray-600/30 hover:border-cyan-500/30">
              {/* Sophisticated Header */}
              <div className="relative bg-gradient-to-r from-slate-800 via-gray-800 to-slate-900 p-6 overflow-hidden border-b border-gray-700/50">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/5"></div>
                <div className="absolute top-4 right-4 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-purple-500/10 rounded-full blur-lg"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg border border-cyan-400/30">
                      <FiUser className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        About Me
                      </h2>
                      <p className="text-cyan-200 text-sm opacity-80">
                        Digital Portfolio
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Description Section */}
                <div className="mb-8 relative">
                  <div className="absolute -left-2 top-0 w-0.5 h-full bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full"></div>
                  <div className="pl-5">
                    <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                      Professional Bio
                    </h3>
                    <div className="space-y-4">
                      {aboutData.description ? (
                        <div className="text-gray-300 leading-relaxed text-sm space-y-3">
                          {parseFormattedText(aboutData.description)}
                        </div>
                      ) : (
                        <div className="text-center py-8 px-4 border-2 border-dashed border-gray-600/50 rounded-xl bg-gray-800/30">
                          <FiEdit className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                          <p className="text-gray-400 italic">
                            Your story begins here
                          </p>
                          <p className="text-gray-500 text-sm mt-1">
                            Add your description to see it come alive
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Personal Information - Modern Dark Layout */}
                <div className="pt-6 border-t border-gray-700/50">
                  <h3 className="text-lg font-semibold text-cyan-300 mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    Personal Details
                  </h3>

                  <div className="grid gap-3">
                    {/* Name */}
                    {aboutData.name && (
                      <div className="group relative p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5">
                        <div className="flex items-center gap-4">
                          <div className="bg-gradient-to-br from-cyan-600 to-teal-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <FiUser className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-cyan-300 font-medium mb-1 uppercase tracking-wider">
                              Full Name
                            </p>
                            <p className="text-base text-white font-semibold">
                              {aboutData.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    {aboutData.email && (
                      <div className="group relative p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5">
                        <div className="flex items-center gap-4">
                          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <FiMail className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-purple-300 font-medium mb-1 uppercase tracking-wider">
                              Email
                            </p>
                            <p className="text-base text-white break-all font-medium">
                              {aboutData.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Phone */}
                    {aboutData.phone && (
                      <div className="group relative p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
                        <div className="flex items-center gap-4">
                          <div className="bg-gradient-to-br from-emerald-600 to-green-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <FiPhone className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-emerald-300 font-medium mb-1 uppercase tracking-wider">
                              Phone
                            </p>
                            <p className="text-base text-white font-semibold">
                              {aboutData.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Address */}
                    {aboutData.address && (
                      <div className="group relative p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/5">
                        <div className="flex items-center gap-4">
                          <div className="bg-gradient-to-br from-orange-600 to-red-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <FiMapPin className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-orange-300 font-medium mb-1 uppercase tracking-wider">
                              Location
                            </p>
                            <p className="text-base text-white font-medium">
                              {aboutData.address}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {aboutData.education && (
                      <div className="group relative p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 hover:border-pink-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/5">
                        <div className="flex items-center gap-4">
                          <div className="bg-gradient-to-br from-pink-600 to-rose-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <FiBook className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-pink-300 font-medium mb-1 uppercase tracking-wider">
                              Education
                            </p>
                            <p className="text-base text-white font-medium">
                              {aboutData.education}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    {aboutData.languages && (
                      <div className="group relative p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 hover:border-teal-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/5">
                        <div className="flex items-center gap-4">
                          <div className="bg-gradient-to-br from-teal-600 to-cyan-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <FiMessageSquare className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-teal-300 font-medium mb-1 uppercase tracking-wider">
                              Languages
                            </p>
                            <p className="text-base text-white font-medium">
                              {aboutData.languages}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Nationality */}
                    {aboutData.nationality && (
                      <div className="group relative p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5">
                        <div className="flex items-center gap-4">
                          <div className="bg-gradient-to-br from-amber-600 to-yellow-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <FiFlag className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-amber-300 font-medium mb-1 uppercase tracking-wider">
                              Nationality
                            </p>
                            <p className="text-base text-white font-medium">
                              {aboutData.nationality}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Freelance Status */}
                    {aboutData.freelance && (
                      <div className="group relative p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/5">
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                              aboutData.freelance === "Available"
                                ? "bg-gradient-to-br from-green-600 to-emerald-600"
                                : "bg-gradient-to-br from-red-600 to-rose-600"
                            }`}
                          >
                            <FiAward className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-300 font-medium mb-1 uppercase tracking-wider">
                              Availability
                            </p>
                            <p
                              className={`text-base font-semibold ${
                                aboutData.freelance === "Available"
                                  ? "text-emerald-400"
                                  : "text-rose-400"
                              }`}
                            >
                              {aboutData.freelance}
                              {aboutData.freelance === "Available" && (
                                <span className="ml-3 text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
                                  Open for projects
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Contact Button */}
                <div className="pt-6 mt-6">
                  <button className="w-full group relative bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30">
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      Start Conversation
                      <FiMail className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;
