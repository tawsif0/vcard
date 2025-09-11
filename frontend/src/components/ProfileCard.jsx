import React, { useState, useEffect } from "react";
import QRGenerator from "./QRGenerator";
import ReactDOM from "react-dom";
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
  FiHome,
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiYoutube,
  FiInstagram,
  FiTwitter,
  FiGithub,
  FiTwitch,
  FiPocket,
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
    avatarOption: "none",
    avatarCustomUrl: "",
    profilePicture: null,
    institutionName: "",
    aimInLife: "",
    hobby: "",
    businessName: "",
    businessType: "",
    position: "",
    officialPosition: "",
    gender: "",
    whatsapp: "",
    homeAddress: "",
    showHomeAddress: false,
    officeAddress: "",
    showOfficeAddress: false,
    officialPhone: "",
    companyWebsite: "",
    socialMedias: [],
  });

  const [savedProfile, setSavedProfile] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [profilePictureError, setProfilePictureError] = useState("");

  // Social media options
  const socialMediaOptions = [
    { value: "linkedin", label: "LinkedIn", icon: <FiLinkedin /> },
    { value: "facebook", label: "Facebook", icon: <FiFacebook /> },
    { value: "instagram", label: "Instagram", icon: <FiInstagram /> },
    { value: "twitter", label: "Twitter", icon: <FiTwitter /> },
    { value: "youtube", label: "YouTube", icon: <FiYoutube /> },
    { value: "github", label: "GitHub", icon: <FiGithub /> },
    { value: "twitch", label: "Twitch", icon: <FiTwitch /> },
    { value: "pinterest", label: "Pinterest", icon: <FiPocket /> },
    { value: "custom", label: "Custom URL", icon: <FiGlobe /> },
  ];

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

          if (data.avatarOption === "robot" && !data.avatar) {
            data.avatar =
              data.gender === "female"
                ? "https://avatar.iran.liara.run/public/80"
                : "https://avatar.iran.liara.run/public/43";
          } else if (data.avatarOption === "cat" && !data.avatar) {
            data.avatar = `https://robohash.org/${user.id}?set=set4&bgset=bg1&size=400x400`;
          }

          // Initialize socialMedias if not present
          if (!data.socialMedias) {
            data.socialMedias = [];
          }

          setProfile(data);
          setSavedProfile(data);
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

  const handleCheckboxChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.checked });
  };

  const handleUserTypeChange = (e) => {
    setProfile({
      ...profile,
      userType: e.target.value,
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
      officeAddress: "",
      officialPhone: "",
      companyWebsite: "",
    });
  };

  const handleGenderChange = (e) => {
    setProfile({
      ...profile,
      gender: e.target.value,
      avatarOption: "none",
      avatar: "",
    });
  };

  const handleAvatarOptionChange = (e) => {
    const avatarOption = e.target.value;
    let avatarUrl = "";

    if (avatarOption === "robot") {
      // Use your male/female sources
      avatarUrl =
        profile.gender === "female"
          ? "https://avatar.iran.liara.run/public/80"
          : "https://avatar.iran.liara.run/public/43"; // default to male if gender not set
    } else if (avatarOption === "cat") {
      avatarUrl = `https://robohash.org/${user.id}?set=set4&bgset=bg1&size=400x400`;
    } else if (avatarOption === "custom") {
      avatarUrl = profile.avatarCustomUrl;
    }

    setProfile({
      ...profile,
      avatarOption,
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

    if (file.size > 5 * 1024 * 1024) {
      setProfilePictureError("File size exceeds 5MB limit");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setProfilePictureError("Only image files are allowed");
      return;
    }

    setProfilePictureError("");
    setProfile({ ...profile, profilePicture: file });
  };

  const removeProfilePicture = async () => {
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

        setProfile({
          ...profile,
          profilePicture: null,
        });

        setSavedProfile({
          ...savedProfile,
          profilePicture: null,
        });

        toast.success("Profile picture removed");
      } catch (err) {
        toast.error("Failed to delete profile picture");
        console.error(err);
      }
    } else {
      setProfile({
        ...profile,
        profilePicture: null,
      });

      setSavedProfile({
        ...savedProfile,
        profilePicture: null,
      });

      toast.success("Profile picture removed");
    }
  };

  const handleSocialMediaChange = (index, field, value) => {
    const updatedSocialMedias = [...profile.socialMedias];
    updatedSocialMedias[index][field] = value;
    setProfile({ ...profile, socialMedias: updatedSocialMedias });
  };

  const addSocialMedia = () => {
    setProfile({
      ...profile,
      socialMedias: [...profile.socialMedias, { platform: "", url: "" }],
    });
  };

  const removeSocialMedia = (index) => {
    const updatedSocialMedias = [...profile.socialMedias];
    updatedSocialMedias.splice(index, 1);
    setProfile({ ...profile, socialMedias: updatedSocialMedias });
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      Object.keys(profile).forEach((key) => {
        if (key === "profilePicture" && profile[key] instanceof File) {
          formData.append(key, profile[key]);
        } else if (key === "profilePicture" && profile[key] === null) {
          formData.append(key, "");
        } else if (key === "socialMedias") {
          formData.append(key, JSON.stringify(profile[key]));
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

  const Modal = () => {
    const qrValue = `${window.location.origin}/profile/${user.id}`;

    return (
      <div className="min-h-screen fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl w-full max-w-sm border border-gray-700/50 shadow-2xl relative z-60">
          <div className="flex justify-between items-center p-4 border-b border-gray-700/50">
            <h3 className="text-lg font-bold text-white">Share Your Profile</h3>
            <button
              onClick={() => setShowShareModal(false)}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4">
            <div className="mb-4 flex justify-center">
              <QRGenerator value={qrValue} profile={profile} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(qrValue);
                  toast.success("Link copied to clipboard!");
                }}
                className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:border-purple-500 transition flex flex-col items-center gap-1 text-white text-xs"
              >
                <FiLink className="w-4 h-4" />
                <span>Copy</span>
              </button>
              <button
                onClick={() => {
                  window.location.href = `mailto:?body=${encodeURIComponent(
                    qrValue
                  )}`;
                  setShowShareModal(false);
                }}
                className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:border-purple-500 transition flex flex-col items-center gap-1 text-white text-xs"
              >
                <FiMail className="w-4 h-4" />
                <span>Email</span>
              </button>
              <button
                onClick={() => {
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(qrValue)}`,
                    "_blank"
                  );
                  setShowShareModal(false);
                }}
                className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:border-purple-500 transition flex flex-col items-center gap-1 text-white text-xs"
              >
                <FiMessageSquare className="w-4 h-4 text-green-400" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the modal outside the main content using React Portal

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#020617] flex items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center relative z-10">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
            <FiLoader className="w-8 h-8 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-400 font-medium">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#020617] py-8 px-4 sm:px-6 lg:px-8 relative overflow-visible">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle 500px at 50% 100px, rgba(192,92,246,0.4), transparent)`,
        }}
      />
      <div>
        <button
          onClick={() => setShowShareModal(true)}
          className="bg-blue-500 text-white p-2 rounded-lg"
        >
          Show Modal
        </button>

        {/* Modal rendered outside the main content using React Portal */}
        {showShareModal &&
          ReactDOM.createPortal(
            <Modal />,
            document.getElementById("modal-root") // Make sure you have a div with id 'modal-root' in your index.html
          )}
      </div>
      <div className="mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column - Form */}
          <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-6 lg:col-span-2 border border-gray-700/30">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FiEdit className="w-5 h-5" />
              Edit Your Profile
            </h2>
            <div className="flex flex-col items-center space-y-4 mb-6">
              <div className="relative">
                {/* Profile Photo Container */}
                <div className="w-32 h-32 rounded-full border-4 border-gray-800 shadow-lg overflow-hidden bg-gray-800 flex items-center justify-center">
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
                      <button
                        type="button"
                        onClick={removeProfilePicture}
                        className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 transition-all"
                      >
                        <FiX className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500">
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
                <p className="text-sm text-red-400 text-center">
                  {profilePictureError}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* User Type Dropdown */}
              <div className="form-group md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiUsers className="w-4 h-4" />
                  User Type
                </label>
                <select
                  name="userType"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                  value={profile.userType}
                  onChange={handleUserTypeChange}
                >
                  <option value="student">Student</option>
                  <option value="businessman">Businessman</option>
                  <option value="serviceHolder">Service Holder</option>
                  <option value="contentCreator">Content Creator</option>
                </select>
              </div>
              {/* Gender Selection */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiUser className="w-4 h-4" />
                  Gender
                </label>
                <select
                  name="gender"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl hover:border-gray-500 text-white focus:border-gray-500 transition"
                  value={profile.gender}
                  onChange={handleGenderChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {/* Full Name */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiUser className="w-4 h-4" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  className="w-full px-4 py-3 bg-gray-800 border hover:border-gray-500 border-gray-700 rounded-xl text-white focus:border-gray-500 transition"
                  value={profile.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                />
              </div>
              {/* Avatar Options - Only show if gender is selected */}
              {profile.gender && (
                <div className="form-group md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FiImage className="w-4 h-4" />
                    Avatar
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <select
                        name="avatarOption"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-gray-500 transition"
                        value={profile.avatarOption}
                        onChange={handleAvatarOptionChange}
                      >
                        <option value="none">No Avatar</option>
                        <option value="robot">
                          {profile.gender === "female"
                            ? "Female Avatar"
                            : "Male Avatar"}
                        </option>
                        <option value="cat">Cat Avatar</option>
                        <option value="custom">Custom URL</option>
                      </select>
                    </div>
                    <div>
                      {profile.avatarOption === "custom" && (
                        <input
                          type="text"
                          name="avatarCustomUrl"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-gray-500 transition"
                          value={profile.avatarCustomUrl}
                          onChange={handleAvatarCustomUrlChange}
                          placeholder="https://example.com/avatar.jpg"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* Student Specific Fields */}
              {profile.userType === "student" && (
                <>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <FiBook className="w-4 h-4" />
                      Institution Name
                    </label>
                    <input
                      type="text"
                      name="institutionName"
                      className="w-full px-4 py-3 bg-gray-800 border hover:border-gray-500 border-gray-700 rounded-xl text-white focus:border-gray-500 transition"
                      value={profile.institutionName}
                      onChange={handleChange}
                      placeholder="University Name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <FiBookOpen className="w-4 h-4" />
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      className="w-full px-4 py-3 bg-gray-800 border hover:border-gray-500 border-gray-700 rounded-xl text-white focus:border-gray-500 transition"
                      value={profile.department}
                      onChange={handleChange}
                      placeholder="Computer Science"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <FiTarget className="w-4 h-4" />
                      Aim in Life
                    </label>
                    <input
                      type="text"
                      name="aimInLife"
                      className="w-full px-4 py-3 hover:border-gray-500 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-gray-500 transition"
                      value={profile.aimInLife}
                      onChange={handleChange}
                      placeholder="Become a Software Engineer"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <FiHeart className="w-4 h-4" />
                      Hobby
                    </label>
                    <input
                      type="text"
                      name="hobby"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
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
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <BiBuilding className="w-4 h-4" />
                      Business Name
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                      value={profile.businessName}
                      onChange={handleChange}
                      placeholder="ABC Enterprises"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <FiType className="w-4 h-4" />
                      Business Type
                    </label>
                    <input
                      type="text"
                      name="businessType"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                      value={profile.businessType}
                      onChange={handleChange}
                      placeholder="Retail, Manufacturing, etc."
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <FiBriefcase className="w-4 h-4" />
                      Position
                    </label>
                    <input
                      type="text"
                      name="position"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                      value={profile.position}
                      onChange={handleChange}
                      placeholder="CEO, Founder, etc."
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <BiBuilding className="w-4 h-4" />
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="company"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                      value={profile.company}
                      onChange={handleChange}
                      placeholder="ABC Corporation"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <FiGlobe className="w-4 h-4" />
                      Company Website
                    </label>
                    <input
                      type="text"
                      name="companyWebsite"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                      value={profile.companyWebsite}
                      onChange={handleChange}
                      placeholder="company.com"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <FiPhone className="w-4 h-4" />
                      Official Phone
                    </label>
                    <input
                      type="text"
                      name="officialPhone"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                      value={profile.officialPhone}
                      onChange={handleChange}
                      placeholder="0164696231"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <FiMapPin className="w-4 h-4" />
                      Office Address
                    </label>
                    <textarea
                      name="officeAddress"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition resize-none"
                      value={profile.officeAddress}
                      onChange={handleChange}
                      placeholder="Office address"
                      rows="2"
                    />
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        id="showOfficeAddress"
                        name="showOfficeAddress"
                        checked={profile.showOfficeAddress}
                        onChange={handleCheckboxChange}
                        className="mr-2"
                      />
                      <label
                        htmlFor="showOfficeAddress"
                        className="text-sm text-gray-300"
                      >
                        Show on profile
                      </label>
                    </div>
                  </div>
                </>
              )}
              {/* Service Holder Specific Fields */}
              {profile.userType === "serviceHolder" && (
                <>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <FiBriefcase className="w-4 h-4" />
                      Job Title
                    </label>
                    <input
                      type="text"
                      name="jobTitle"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl hover:border-gray-500 text-white focus:border-gray-500 transition"
                      value={profile.jobTitle}
                      onChange={handleChange}
                      placeholder="Software Engineer"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <FiAward className="w-4 h-4" />
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl hover:border-gray-500 text-white focus:border-gray-500 transition"
                      value={profile.department}
                      onChange={handleChange}
                      placeholder="IT Department"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <FiUsers className="w-4 h-4" />
                      Position
                    </label>
                    <input
                      type="text"
                      name="officialPosition"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl hover:border-gray-500 text-white focus:border-gray-500 transition"
                      value={profile.officialPosition}
                      onChange={handleChange}
                      placeholder="Senior Manager"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <BiBuilding className="w-4 h-4" />
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="company"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                      value={profile.company}
                      onChange={handleChange}
                      placeholder="ABC Corporation"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <FiGlobe className="w-4 h-4" />
                      Company Website
                    </label>
                    <input
                      type="text"
                      name="companyWebsite"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                      value={profile.companyWebsite}
                      onChange={handleChange}
                      placeholder="company.com"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <FiPhone className="w-4 h-4" />
                      Official Phone
                    </label>
                    <input
                      type="text"
                      name="officialPhone"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                      value={profile.officialPhone}
                      onChange={handleChange}
                      placeholder="0164696231"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <FiMapPin className="w-4 h-4" />
                      Office Address
                    </label>
                    <textarea
                      name="officeAddress"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-gray-500 transition resize-none"
                      value={profile.officeAddress}
                      onChange={handleChange}
                      placeholder="Office address"
                      rows="2"
                    />
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        id="showOfficeAddress"
                        name="showOfficeAddress"
                        checked={profile.showOfficeAddress}
                        onChange={handleCheckboxChange}
                        className="mr-2"
                      />
                      <label
                        htmlFor="showOfficeAddress"
                        className="text-sm text-gray-300"
                      >
                        Show on profile
                      </label>
                    </div>
                  </div>
                </>
              )}
              {/* Content Creator Specific Fields */}

              {/* Common Fields */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiPhone className="w-4 h-4" />
                  Personal Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  className="w-full px-4 py-3 bg-gray-800 border hover:border-gray-500 border-gray-700 rounded-xl text-white focus:border-gray-500 transition"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="0164696231"
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiMessageSquare className="w-4 h-4" />
                  WhatsApp
                </label>
                <input
                  type="text"
                  name="whatsapp"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                  value={profile.whatsapp}
                  onChange={handleChange}
                  placeholder="0164696231"
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
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiGlobe className="w-4 h-4" />
                  Personal Website
                </label>
                <input
                  type="text"
                  name="website"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl hover:border-gray-500 text-white focus:border-gray-500 transition"
                  value={profile.website}
                  onChange={handleChange}
                  placeholder="yourwebsite.com"
                />
              </div>
              <div className="form-group md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiHome className="w-4 h-4" />
                  Home Address
                </label>
                <textarea
                  name="homeAddress"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-gray-500 transition resize-none"
                  value={profile.homeAddress}
                  onChange={handleChange}
                  placeholder="Home address"
                  rows="2"
                />
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="showHomeAddress"
                    name="showHomeAddress"
                    checked={profile.showHomeAddress}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label
                    htmlFor="showHomeAddress"
                    className="text-sm text-gray-300"
                  >
                    Show on profile
                  </label>
                </div>
              </div>
            </div>
            {/* Bio - Full Width */}
            <div className="form-group mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <FiFileText className="w-4 h-4" />
                Bio
              </label>
              <textarea
                name="bio"
                className="w-full px-4 py-3 hover:border-gray-500 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-gray-500 transition resize-none"
                value={profile.bio}
                onChange={handleChange}
                placeholder="Something about yourself..."
                rows="3"
              />
            </div>
            <div className="form-group mt-6 md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <FiGlobe className="w-4 h-4" />
                Social Media Links
              </label>

              {(profile.socialMedias ?? []).map((social, index) => (
                <div key={index} className="flex items-center gap-3 mb-3">
                  {/* Number badge */}
                  <div
                    aria-hidden
                    className="shrink-0 w-7 h-7 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-sm font-semibold text-white"
                  >
                    {index + 1}
                  </div>

                  {/* Fields */}
                  <div className="flex-1 flex flex-col gap-2">
                    <select
                      value={social.platform}
                      onChange={(e) =>
                        handleSocialMediaChange(
                          index,
                          "platform",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white hover:border-gray-500 focus:border-gray-500 transition"
                    >
                      <option value="">Select Platform</option>
                      {socialMediaOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={social.url}
                      onChange={(e) =>
                        handleSocialMediaChange(index, "url", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white hover:border-gray-500 focus:border-gray-500 transition"
                      placeholder={
                        social.platform === "custom"
                          ? "Enter custom URL"
                          : `Enter ${social.platform || "social"} URL`
                      }
                    />
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeSocialMedia(index)}
                    className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                    aria-label={`Remove social media ${index + 1}`}
                    title="Remove"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addSocialMedia}
                className="mt-6 w-full justify-center flex items-center gap-2 px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition"
              >
                <FiPlus className="w-4 h-4" />
                Add Social Media
              </button>
            </div>
            {/* Save Button */}
            <div className="mt-8">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-xl font-medium hover:from-gray-600 hover:to-gray-500 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group relative overflow-hidden"
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
                      Save Profile
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

            <div className="flex flex-col items-center">
              {/* Preview Card */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl text-white overflow-hidden shadow-2xl w-full max-w-md border border-gray-700/30">
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border-b border-gray-700 flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full flex items-center justify-center overflow-hidden shadow-xl border-2 border-white/20">
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
                    <p className="text-gray-300 text-lg truncate">
                      {profile.userType === "student" &&
                        (profile.institutionName || "Student")}
                      {profile.userType === "businessman" &&
                        (profile.position || "Businessman")}
                      {profile.userType === "serviceHolder" &&
                        (profile.jobTitle || "Service Holder")}
                      {profile.userType === "contentCreator" &&
                        "Content Creator"}
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
                              <p className="text-gray-400 text-sm">
                                Institution
                              </p>
                              <p className="font-medium">
                                {profile.institutionName}
                              </p>
                            </div>
                          )}
                          {profile.department && (
                            <div>
                              <p className="text-gray-400 text-sm">
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
                          <p className="text-gray-400 text-sm">Aim in Life</p>
                          <p className="font-medium">{profile.aimInLife}</p>
                        </div>
                      )}
                      {profile.hobby && (
                        <div>
                          <p className="text-gray-400 text-sm">Hobby</p>
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
                              <p className="text-gray-400 text-sm">Business</p>
                              <p className="font-medium">
                                {profile.businessName}
                              </p>
                            </div>
                          )}
                          {profile.businessType && (
                            <div>
                              <p className="text-gray-400 text-sm">Type</p>
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
                              <p className="text-gray-400 text-sm">Position</p>
                              <p className="font-medium">{profile.position}</p>
                            </div>
                          )}
                          {profile.company && (
                            <div>
                              <p className="text-gray-400 text-sm">Company</p>
                              <p className="font-medium">{profile.company}</p>
                            </div>
                          )}
                        </div>
                      )}
                      {profile.companyWebsite && (
                        <div>
                          <p className="text-gray-400 text-sm">
                            Company Website
                          </p>
                          <a
                            href={
                              profile.companyWebsite.startsWith("http")
                                ? profile.companyWebsite
                                : `https://${profile.companyWebsite}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-purple-400 hover:text-purple-300"
                          >
                            {profile.companyWebsite}
                          </a>
                        </div>
                      )}
                      {profile.officialPhone && (
                        <div>
                          <p className="text-gray-400 text-sm">
                            Official Phone
                          </p>
                          <a
                            href={`tel:${profile.officialPhone}`}
                            className="font-medium"
                          >
                            {profile.officialPhone}
                          </a>
                        </div>
                      )}
                      {profile.showOfficeAddress && profile.officeAddress && (
                        <div>
                          <p className="text-gray-400 text-sm">
                            Office Address
                          </p>
                          <p className="font-medium">{profile.officeAddress}</p>
                        </div>
                      )}
                    </>
                  )}

                  {profile.userType === "serviceHolder" && (
                    <>
                      {(profile.jobTitle || profile.department) && (
                        <div className="grid grid-cols-2 gap-4">
                          {profile.jobTitle && (
                            <div>
                              <p className="text-gray-400 text-sm">Job Title</p>
                              <p className="font-medium">{profile.jobTitle}</p>
                            </div>
                          )}
                          {profile.department && (
                            <div>
                              <p className="text-gray-400 text-sm">
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
                              <p className="text-gray-400 text-sm">Position</p>
                              <p className="font-medium">
                                {profile.officialPosition}
                              </p>
                            </div>
                          )}
                          {profile.company && (
                            <div>
                              <p className="text-gray-400 text-sm">Company</p>
                              <p className="font-medium">{profile.company}</p>
                            </div>
                          )}
                        </div>
                      )}
                      {profile.companyWebsite && (
                        <div>
                          <p className="text-gray-400 text-sm">
                            Company Website
                          </p>
                          <a
                            href={
                              profile.companyWebsite.startsWith("http")
                                ? profile.companyWebsite
                                : `https://${profile.companyWebsite}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-purple-400 hover:text-purple-300"
                          >
                            {profile.companyWebsite}
                          </a>
                        </div>
                      )}
                      {profile.officialPhone && (
                        <div>
                          <p className="text-gray-400 text-sm">
                            Official Phone
                          </p>
                          <a
                            href={`tel:${profile.officialPhone}`}
                            className="font-medium"
                          >
                            {profile.officialPhone}
                          </a>
                        </div>
                      )}
                      {profile.showOfficeAddress && profile.officeAddress && (
                        <div>
                          <p className="text-gray-400 text-sm">
                            Office Address
                          </p>
                          <p className="font-medium">{profile.officeAddress}</p>
                        </div>
                      )}
                    </>
                  )}
                  {profile.gender && (
                    <div>
                      <p className="text-gray-400 text-sm">Gender</p>
                      <p className="font-medium capitalize">{profile.gender}</p>
                    </div>
                  )}
                  <div className="relative">
                    <p className="text-gray-400 text-sm">Avatar</p>
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full flex items-center justify-center overflow-hidden shadow-xl mt-2">
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
                    <div className="bg-gray-700/50 rounded-xl p-4">
                      <p className="text-gray-300 italic">"{profile.bio}"</p>
                    </div>
                  )}

                  {profile.showHomeAddress && profile.homeAddress && (
                    <div className="flex items-start gap-3">
                      <FiHome className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-400 text-sm">Home Address</p>
                        <p className="font-medium">{profile.homeAddress}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {profile.phone && (
                      <div className="flex items-center gap-3">
                        <a
                          href={`tel:${profile.phone}`}
                          className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                        >
                          <FiPhone className="w-4 h-4 text-purple-400" />
                          <span>{profile.phone}</span>
                        </a>
                      </div>
                    )}
                    {profile.whatsapp && (
                      <div className="flex items-center gap-3">
                        <a
                          href={`https://wa.me/${profile.whatsapp}`}
                          className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FiMessageSquare className="w-4 h-4 text-green-400" />
                          <span>{profile.whatsapp}</span>
                        </a>
                      </div>
                    )}
                    {profile.email && (
                      <div className="flex items-center gap-3">
                        <a
                          href={`mailto:${profile.email}`}
                          className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                        >
                          <FiMail className="w-4 h-4 text-purple-400" />
                          <span>{profile.email}</span>
                        </a>
                      </div>
                    )}
                    {profile.website && (
                      <div className="flex items-center gap-3">
                        <a
                          href={
                            profile.website.startsWith("http")
                              ? profile.website
                              : `https://${profile.website}`
                          }
                          className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FiGlobe className="w-4 h-4 text-purple-400" />
                          <span>{profile.website}</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {profile.socialMedias && profile.socialMedias.length > 0 && (
                    <div className="mt-6">
                      <div className="flex flex-wrap gap-1 mt-2">
                        {profile.socialMedias.map(
                          (social, index) =>
                            social.platform &&
                            social.url && (
                              <a
                                key={index}
                                href={
                                  social.url.startsWith("http")
                                    ? social.url
                                    : `https://${social.url}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition"
                                title={
                                  social.platform === "custom"
                                    ? "Custom Link"
                                    : socialMediaOptions.find(
                                        (opt) => opt.value === social.platform
                                      )?.label
                                }
                              >
                                {socialMediaOptions.find(
                                  (opt) => opt.value === social.platform
                                )?.icon || <FiGlobe className="w-5 h-5" />}
                              </a>
                            )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Share Button */}
              <div className="mt-8 w-full max-w-md">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-xl font-medium hover:from-gray-600 hover:to-gray-500 transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  <span className="relative flex items-center justify-center gap-2">
                    <FiShare2 className="w-4 h-4" />
                    Share Profile
                  </span>
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
