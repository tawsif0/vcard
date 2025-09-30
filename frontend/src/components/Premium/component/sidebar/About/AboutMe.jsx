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
          className="text-gray-700 leading-relaxed text-sm mb-3"
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
          <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto">
            Provide your information to look perfect
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column - Form */}
          <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-6 lg:col-span-2 border border-gray-700/30">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FiEdit className="w-5 h-5" />
              Edit About Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group relative overflow-hidden"
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

            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">About Me</h2>
              </div>

              <div className="p-6">
                {/* Description Section */}
                <div className="mb-8">
                  <div className="space-y-3">
                    {aboutData.description ? (
                      parseFormattedText(aboutData.description)
                    ) : (
                      <p className="text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                        No description added yet
                      </p>
                    )}
                  </div>
                </div>

                {/* Personal Information - Single Column Layout */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Personal Information
                  </h3>

                  <div className="space-y-4">
                    {/* Name */}
                    {aboutData.name && (
                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                          <FiUser className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 font-medium mb-1">
                            Full Name
                          </p>
                          <p className="text-base text-gray-800 font-medium">
                            {aboutData.name}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    {aboutData.email && (
                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                          <FiMail className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 font-medium mb-1">
                            Email
                          </p>
                          <p className="text-base text-gray-800 break-all">
                            {aboutData.email}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Phone */}
                    {aboutData.phone && (
                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                          <FiPhone className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 font-medium mb-1">
                            Phone
                          </p>
                          <p className="text-base text-gray-800">
                            {aboutData.phone}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Address */}
                    {aboutData.address && (
                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                          <FiMapPin className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 font-medium mb-1">
                            Address
                          </p>
                          <p className="text-base text-gray-800">
                            {aboutData.address}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {aboutData.education && (
                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                          <FiBook className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 font-medium mb-1">
                            Education
                          </p>
                          <p className="text-base text-gray-800">
                            {aboutData.education}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    {aboutData.languages && (
                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                          <FiMessageSquare className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 font-medium mb-1">
                            Languages
                          </p>
                          <p className="text-base text-gray-800">
                            {aboutData.languages}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Nationality */}
                    {aboutData.nationality && (
                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                          <FiFlag className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 font-medium mb-1">
                            Nationality
                          </p>
                          <p className="text-base text-gray-800">
                            {aboutData.nationality}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Freelance Status */}
                    {aboutData.freelance && (
                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                          <FiAward className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 font-medium mb-1">
                            Freelance Status
                          </p>
                          <p
                            className={`text-base font-medium ${
                              aboutData.freelance === "Available"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {aboutData.freelance}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Button */}
                <div className="pt-6 border-t border-gray-200 mt-6">
                  <button className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 text-sm">
                    Contact Me
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
