import React, { useState, useEffect } from "react";
import QRGenerator from "./QRGenerator";
import {
  FiUser,
  FiBriefcase,
  FiPhone,
  FiMail,
  FiGlobe,
  FiLinkedin,
  FiFacebook,
  FiFileText,
  FiImage,
  FiSave,
  FiEye,
  FiShare2,
  FiEdit,
  FiArrowLeft,
  FiLink,
  FiMessageSquare,
  FiLoader,
  FiCheckCircle,
  FiXCircle,
  FiAward,
  FiX,
  FiBook,
  FiBookOpen,
  FiTarget,
  FiHeart,
  FiType,
  FiUsers,
  FiCamera,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { BiBuilding } from "react-icons/bi";
const ProfileCard = ({ user }) => {
  const [profile, setProfile] = useState({
    userType: "student",
    fullName: "",
    jobTitle: "",
    department: "",
    company: "",
    phone: "",
    email: "",
    website: "",
    linkedin: "",
    facebook: "",
    bio: "",
    avatar: "",
    avatarOption: "none", // 'default' or 'custom'
    avatarCustomUrl: "",
    profilePicture: null,
    // Student specific fields
    institutionName: "",
    aimInLife: "",
    hobby: "",
    // Businessman specific fields
    businessName: "",
    businessType: "",
    position: "",
    // Official specific fields
    officialPosition: "",
  });

  const [savedProfile, setSavedProfile] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [profilePictureError, setProfilePictureError] = useState("");

  // Fetch profile data from backend
  // Fetch profile data from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5000/api/profile/${user.id}`,
          {
            headers: {
              "x-auth-token": token,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          // Generate avatar URLs if needed
          if (data.avatarOption === "robot" && !data.avatar) {
            data.avatar = `https://gravatar.com/avatar/${user.id}?s=400&d=robohash&r=x`;
          } else if (data.avatarOption === "cat" && !data.avatar) {
            data.avatar = `https://robohash.org/${user.id}?set=set4&bgset=bg1&size=400x400`;
          }

          setProfile(data);
          setSavedProfile(data); // Store the saved profile data
        } else {
          const errorData = await response.json();
          throw new Error(errorData.msg || "Failed to fetch profile");
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUserTypeChange = (e) => {
    setProfile({
      ...profile,
      userType: e.target.value,
      // Reset type-specific fields when changing user type
      jobTitle: "",
      department: "",
      company: "",
      institutionName: "",
      aimInLife: "",
      hobby: "",
      businessName: "",
      businessType: "",
      position: "",
      officialPosition: "",
    });
  };

  const handleAvatarOptionChange = (e) => {
    const avatarOption = e.target.value;
    let avatarUrl = "";

    if (avatarOption === "robot") {
      avatarUrl = `https://gravatar.com/avatar/${user.id}?s=400&d=robohash&r=x`;
    } else if (avatarOption === "cat") {
      avatarUrl = `https://robohash.org/${user.id}?set=set4&bgset=bg1&size=400x400`;
    } else if (avatarOption === "custom") {
      avatarUrl = profile.avatarCustomUrl;
    }

    setProfile({
      ...profile,
      avatarOption: avatarOption,
      avatar: avatarUrl,
    });
  };

  const handleAvatarCustomUrlChange = (e) => {
    setProfile({
      ...profile,
      avatarCustomUrl: e.target.value,
      avatar: e.target.value,
    });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setProfilePictureError("File size exceeds 5MB limit");
      return;
    }

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      setProfilePictureError("Only image files are allowed");
      return;
    }

    setProfilePictureError("");
    setProfile({ ...profile, profilePicture: file });
  };

  const removeProfilePicture = async () => {
    // If there's a saved profile picture, delete it from the server
    if (savedProfile.profilePicture) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5000/api/profile/${user.id}/picture`,
          {
            method: "DELETE",
            headers: {
              "x-auth-token": token,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete profile picture");
        }

        // Update local state to immediately reflect the removal of the profile picture
        setProfile({
          ...profile,
          profilePicture: null, // Remove the profile picture from the state
        });

        // Optionally update the saved profile to reflect the change
        setSavedProfile({
          ...savedProfile,
          profilePicture: null, // Remove the profile picture from the saved profile
        });

        toast.success("Profile picture removed");
      } catch (err) {
        toast.error("Failed to delete profile picture");
        console.error(err);
      }
    } else {
      // Update local state if there's no saved profile picture to remove
      setProfile({
        ...profile,
        profilePicture: null, // Remove the profile picture from the state
      });

      // Optionally update the saved profile to reflect the change
      setSavedProfile({
        ...savedProfile,
        profilePicture: null, // Remove the profile picture from the saved profile
      });

      toast.success("Profile picture removed");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");

      // Create FormData to handle file upload
      const formData = new FormData();

      // Append all profile fields
      Object.keys(profile).forEach((key) => {
        if (key === "profilePicture" && profile[key] instanceof File) {
          formData.append(key, profile[key]);
        } else if (key === "profilePicture" && profile[key] === null) {
          // Explicitly send null to remove profile picture
          formData.append(key, "");
        } else if (key !== "profilePicture" || profile[key] !== null) {
          formData.append(key, profile[key]);
        }
      });

      const response = await fetch(
        `http://localhost:5000/api/profile/${user.id}`,
        {
          method: "PUT",
          headers: {
            "x-auth-token": token,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const updatedProfile = await response.json();
        toast.success("Profile saved successfully!");
        setSavedProfile(updatedProfile);
        setProfile(updatedProfile);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to save profile");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const qrValue = `${window.location.origin}/profile/${user.id}`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <FiLoader className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-slate-600 font-medium">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-2 ">
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-800">
                Share Your Profile
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6 flex justify-center">
                <QRGenerator value={qrValue} profile={savedProfile} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(qrValue);
                    toast.success("Link copied to clipboard!");
                  }}
                  className="p-3 bg-white border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-md transition flex flex-col items-center gap-2"
                >
                  <FiLink className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-medium">Copy Link</span>
                </button>
                <button
                  onClick={() => {
                    window.location.href = `mailto:?body=${encodeURIComponent(
                      qrValue
                    )}`;
                    setShowShareModal(false);
                  }}
                  className="p-3 bg-white border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-md transition flex flex-col items-center gap-2"
                >
                  <FiMail className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-medium">Email</span>
                </button>
                <button
                  onClick={() => {
                    window.open(
                      `https://wa.me/?text=${encodeURIComponent(qrValue)}`,
                      "_blank"
                    );
                    setShowShareModal(false);
                  }}
                  className="p-3 bg-white border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-md transition flex flex-col items-center gap-2"
                >
                  <FiMessageSquare className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FiEdit className="w-5 h-5" />
              Edit Your Profile
            </h2>
            <div className="flex flex-col items-center space-y-4 mb-6">
              <div className="relative">
                {/* Profile Photo Container */}
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  {profile.profilePicture || savedProfile.profilePicture ? (
                    <>
                      <img
                        src={
                          profile.profilePicture instanceof File
                            ? URL.createObjectURL(profile.profilePicture)
                            : `http://localhost:5000/${savedProfile.profilePicture}`
                        }
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                      {/* Remove button - now always visible */}
                      <button
                        type="button"
                        onClick={removeProfilePicture}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-all"
                      >
                        <FiX className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <FiUser className="h-12 w-12" />
                      <span className="text-xs mt-2">No photo</span>
                    </div>
                  )}
                </div>

                {/* Camera Icon to Trigger File Upload */}
                <label className="absolute bottom-0 right-0 bg-gray-700 text-white rounded-full p-2 shadow-md hover:bg-gray-900 transition-all cursor-pointer">
                  <FiCamera className="h-5 w-5" />
                  <input
                    type="file"
                    name="profile_picture"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                    accept=".jpg,.jpeg,.png"
                    autoComplete="off"
                  />
                </label>
              </div>

              {/* Upload Instructions */}
              <p className="text-xs text-gray-500 text-center">
                JPG or PNG, max 5MB
              </p>

              {profilePictureError && (
                <p className="text-sm text-red-500 text-center">
                  {profilePictureError}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* User Type Dropdown */}
              <div className="form-group md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <FiUsers className="w-4 h-4" />
                  User Type
                </label>
                <select
                  name="userType"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl  focus:border-gray-500 transition"
                  value={profile.userType}
                  onChange={handleUserTypeChange}
                >
                  <option value="student">Student</option>
                  <option value="businessman">Businessman</option>
                  <option value="official">Official</option>
                </select>
              </div>

              {/* Full Name */}
              <div className="form-group">
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <FiUser className="w-4 h-4" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl  focus:border-gray-500 transition"
                  value={profile.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                />
              </div>

              {/* Profile Picture Upload */}

              {/* Avatar Options */}
              <div className="form-group md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <FiImage className="w-4 h-4" />
                  Avatar
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <select
                      name="avatarOption"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl  focus:border-gray-500 transition"
                      value={profile.avatarOption}
                      onChange={handleAvatarOptionChange}
                    >
                      <option value="none">No Avatar</option>
                      <option value="robot">Robot Avatar</option>
                      <option value="cat">Cat Avatar</option>
                      <option value="custom">Custom URL</option>
                    </select>
                  </div>
                  <div>
                    {profile.avatarOption === "custom" && (
                      <input
                        type="text"
                        name="avatarCustomUrl"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl  focus:border-gray-500 transition"
                        value={profile.avatarCustomUrl}
                        onChange={handleAvatarCustomUrlChange}
                        placeholder="https://example.com/avatar.jpg"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Student Specific Fields */}
              {profile.userType === "student" && (
                <>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <FiBook className="w-4 h-4" />
                      Institution Name
                    </label>
                    <input
                      type="text"
                      name="institutionName"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl  focus:border-gray-500 transition"
                      value={profile.institutionName}
                      onChange={handleChange}
                      placeholder="University Name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <FiBookOpen className="w-4 h-4" />
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl  focus:border-gray-500 transition"
                      value={profile.department}
                      onChange={handleChange}
                      placeholder="Computer Science"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <FiTarget className="w-4 h-4" />
                      Aim in Life
                    </label>
                    <input
                      type="text"
                      name="aimInLife"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl  focus:border-gray-500 transition"
                      value={profile.aimInLife}
                      onChange={handleChange}
                      placeholder="Become a Software Engineer"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <FiHeart className="w-4 h-4" />
                      Hobby
                    </label>
                    <input
                      type="text"
                      name="hobby"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl  focus:border-gray-500 transition"
                      value={profile.hobby}
                      onChange={handleChange}
                      placeholder="Photography, Reading, etc."
                    />
                  </div>
                </>
              )}

              {/* Businessman Specific Fields */}
              {profile.userType === "businessman" && (
                <>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <BiBuilding className="w-4 h-4" />
                      Business Name
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl  focus:border-gray-500 transition"
                      value={profile.businessName}
                      onChange={handleChange}
                      placeholder="ABC Enterprises"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <FiType className="w-4 h-4" />
                      Business Type
                    </label>
                    <input
                      type="text"
                      name="businessType"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl  focus:border-gray-500 transition"
                      value={profile.businessType}
                      onChange={handleChange}
                      placeholder="Retail, Manufacturing, etc."
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <FiBriefcase className="w-4 h-4" />
                      Position
                    </label>
                    <input
                      type="text"
                      name="position"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl  focus:border-gray-500 transition"
                      value={profile.position}
                      onChange={handleChange}
                      placeholder="CEO, Founder, etc."
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <BiBuilding className="w-4 h-4" />
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="company"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl  focus:border-gray-500 transition"
                      value={profile.company}
                      onChange={handleChange}
                      placeholder="ABC Corporation"
                    />
                  </div>
                </>
              )}

              {/* Official Specific Fields */}
              {profile.userType === "official" && (
                <>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <FiBriefcase className="w-4 h-4" />
                      Job Title
                    </label>
                    <input
                      type="text"
                      name="jobTitle"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl  focus:border-gray-500 transition"
                      value={profile.jobTitle}
                      onChange={handleChange}
                      placeholder="Software Engineer"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <FiAward className="w-4 h-4" />
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl  focus:border-gray-500 transition"
                      value={profile.department}
                      onChange={handleChange}
                      placeholder="IT Department"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <FiUsers className="w-4 h-4" />
                      Position
                    </label>
                    <input
                      type="text"
                      name="officialPosition"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl  focus:border-gray-500 transition"
                      value={profile.officialPosition}
                      onChange={handleChange}
                      placeholder="Senior Manager"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <BiBuilding className="w-4 h-4" />
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="company"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl  focus:border-gray-500 transition"
                      value={profile.company}
                      onChange={handleChange}
                      placeholder="ABC Corporation"
                    />
                  </div>
                </>
              )}

              {/* Common Fields */}
              <div className="form-group">
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <FiPhone className="w-4 h-4" />
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl  focus:border-gray-500 transition"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="0164696231"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <FiMail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl  focus:border-gray-500 transition"
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <FiGlobe className="w-4 h-4" />
                  Website
                </label>
                <input
                  type="text"
                  name="website"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl  focus:border-gray-500 transition"
                  value={profile.website}
                  onChange={handleChange}
                  placeholder="yourwebsite.com"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <FiLinkedin className="w-4 h-4" />
                  LinkedIn
                </label>
                <input
                  type="text"
                  name="linkedin"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl  focus:border-gray-500 transition"
                  value={profile.linkedin}
                  onChange={handleChange}
                  placeholder="linkedin.com/in/username"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <FiFacebook className="w-4 h-4" />
                  Facebook
                </label>
                <input
                  type="text"
                  name="facebook"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl  focus:border-gray-500 transition"
                  value={profile.facebook}
                  onChange={handleChange}
                  placeholder="facebook.com/username"
                />
              </div>
            </div>

            {/* Bio - Full Width */}
            <div className="form-group mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <FiFileText className="w-4 h-4" />
                Bio
              </label>
              <textarea
                name="bio"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl  focus:border-gray-500 transition resize-none"
                value={profile.bio}
                onChange={handleChange}
                placeholder="Something about yourself..."
                rows="3"
              />
            </div>

            {/* Save Button */}
            <div className="mt-8">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="bg-white rounded-2xl shadow-lg p-6 h-fit">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FiEye className="w-5 h-5" />
              Live Preview
            </h2>

            <div className="flex flex-col items-center">
              {/* Preview Card */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl text-white overflow-hidden shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border-b border-slate-700 flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center overflow-hidden shadow-xl border-2 border-white/20">
                      {profile.profilePicture instanceof File ? (
                        <img
                          src={URL.createObjectURL(profile.profilePicture)}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : savedProfile.profilePicture ? (
                        <img
                          src={`http://localhost:5000/${savedProfile.profilePicture}`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiUser className="w-10 h-10 text-white" />
                      )}
                    </div>
                  </div>
                  {/* Profile Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold truncate">
                      {profile.fullName || "Your Name"}
                    </h2>
                    <p className="text-slate-300 text-lg truncate">
                      {profile.userType === "student" &&
                        (profile.institutionName || "Student")}
                      {profile.userType === "businessman" &&
                        (profile.position || "Businessman")}
                      {profile.userType === "official" &&
                        (profile.jobTitle || "Official")}
                    </p>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  {/* User type specific details */}
                  {profile.userType === "student" && (
                    <>
                      {(profile.institutionName || profile.department) && (
                        <div className="grid grid-cols-2 gap-4">
                          {profile.institutionName && (
                            <div>
                              <p className="text-slate-400 text-sm">
                                Institution
                              </p>
                              <p className="font-medium">
                                {profile.institutionName}
                              </p>
                            </div>
                          )}
                          {profile.department && (
                            <div>
                              <p className="text-slate-400 text-sm">
                                Department
                              </p>
                              <p className="font-medium">
                                {profile.department}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      {profile.aimInLife && (
                        <div>
                          <p className="text-slate-400 text-sm">Aim in Life</p>
                          <p className="font-medium">{profile.aimInLife}</p>
                        </div>
                      )}
                      {profile.hobby && (
                        <div>
                          <p className="text-slate-400 text-sm">Hobby</p>
                          <p className="font-medium">{profile.hobby}</p>
                        </div>
                      )}
                    </>
                  )}

                  {profile.userType === "businessman" && (
                    <>
                      {(profile.businessName || profile.businessType) && (
                        <div className="grid grid-cols-2 gap-4">
                          {profile.businessName && (
                            <div>
                              <p className="text-slate-400 text-sm">Business</p>
                              <p className="font-medium">
                                {profile.businessName}
                              </p>
                            </div>
                          )}
                          {profile.businessType && (
                            <div>
                              <p className="text-slate-400 text-sm">Type</p>
                              <p className="font-medium">
                                {profile.businessType}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      {(profile.position || profile.company) && (
                        <div className="grid grid-cols-2 gap-4">
                          {profile.position && (
                            <div>
                              <p className="text-slate-400 text-sm">Position</p>
                              <p className="font-medium">{profile.position}</p>
                            </div>
                          )}
                          {profile.company && (
                            <div>
                              <p className="text-slate-400 text-sm">Company</p>
                              <p className="font-medium">{profile.company}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {profile.userType === "official" && (
                    <>
                      {(profile.jobTitle || profile.department) && (
                        <div className="grid grid-cols-2 gap-4">
                          {profile.jobTitle && (
                            <div>
                              <p className="text-slate-400 text-sm">
                                Job Title
                              </p>
                              <p className="font-medium">{profile.jobTitle}</p>
                            </div>
                          )}
                          {profile.department && (
                            <div>
                              <p className="text-slate-400 text-sm">
                                Department
                              </p>
                              <p className="font-medium">
                                {profile.department}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      {(profile.officialPosition || profile.company) && (
                        <div className="grid grid-cols-2 gap-4">
                          {profile.officialPosition && (
                            <div>
                              <p className="text-slate-400 text-sm">Position</p>
                              <p className="font-medium">
                                {profile.officialPosition}
                              </p>
                            </div>
                          )}
                          {profile.company && (
                            <div>
                              <p className="text-slate-400 text-sm">Company</p>
                              <p className="font-medium">{profile.company}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                  <div className="relative">
                    <p className="text-slate-400 text-sm">Avatar</p>
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center overflow-hidden shadow-xl mt-2">
                      {profile.avatar && profile.avatarOption !== "none" ? (
                        <img
                          src={profile.avatar}
                          alt="Avatar"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <FiUser className="w-8 h-8 text-white" />
                      )}
                    </div>
                  </div>
                  {profile.bio && (
                    <div className="bg-slate-700/50 rounded-xl p-4">
                      <p className="text-slate-300 italic">"{profile.bio}"</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {profile.phone && (
                      <div className="flex items-center gap-3">
                        <a
                          href={`tel:${profile.phone}`}
                          className="flex items-center gap-3"
                        >
                          <FiPhone className="w-4 h-4 text-purple-400" />
                          <span className="hover:text-purple-200">
                            {profile.phone}
                          </span>
                        </a>
                      </div>
                    )}
                    {profile.email && (
                      <div className="flex items-center gap-3">
                        <a
                          href={`mailto:${profile.email}`}
                          className="flex items-center gap-3"
                        >
                          <FiMail className="w-4 h-4 text-purple-400" />
                          <span className="hover:text-purple-200">
                            {profile.email}
                          </span>
                        </a>
                      </div>
                    )}
                    {profile.website && (
                      <div className="flex items-center gap-3">
                        <a
                          href={`https://${profile.website}`}
                          className="flex items-center gap-3"
                        >
                          <FiGlobe className="w-4 h-4 text-purple-400" />
                          <span className="hover:text-purple-200">
                            {profile.website}
                          </span>
                        </a>
                      </div>
                    )}
                  </div>

                  {(profile.linkedin ||
                    profile.facebook ||
                    profile.website) && (
                    <div className="flex justify-center gap-4 pt-4">
                      {profile.linkedin && (
                        <a
                          href={`https://${profile.linkedin}`}
                          className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition"
                        >
                          <FiLinkedin className="w-5 h-5" />
                        </a>
                      )}
                      {profile.facebook && (
                        <a
                          href={`https://${profile.facebook}`}
                          className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-900 transition"
                        >
                          <FiFacebook className="w-5 h-5" />
                        </a>
                      )}
                      {profile.website && (
                        <a
                          href={`https://${profile.website}`}
                          className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center hover:bg-slate-700 transition"
                        >
                          <FiGlobe className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Share Button - Moved inside the flex container */}
              <div className="mt-8 w-full max-w-md">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FiShare2 className="w-4 h-4" />
                  Share Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
