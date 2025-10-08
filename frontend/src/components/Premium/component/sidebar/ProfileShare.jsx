/* eslint-disable no-unused-vars */
import React, { useRef, useEffect, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import {
  FiSave,
  FiEdit,
  FiUser,
  FiBriefcase,
  FiGlobe,
  FiLoader,
  FiEye,
  FiEyeOff,
  FiUpload,
  FiImage,
  FiTrash2,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import axios from "axios";

const ProfileShare = () => {
  const qrRef = useRef(null);
  const [qrCodeInstance, setQrCodeInstance] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAvatarInQR, setShowAvatarInQR] = useState(true);
  const [showLogoInQR, setShowLogoInQR] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  // Profile Data - Will be populated from Home Card
  const [profileData, setProfileData] = useState({
    fullName: "",
    designation: "",
    profilePicture: null,
    logo: null,
    city: "",
    socialMedias: [],
  });

  // Editable fields - Auto-filled from Home Card
  const [editableData, setEditableData] = useState({
    fullName: "",
    designation: "",
    profileUrl: "",
  });

  // QR Code Settings
  const [qrSettings, setQrSettings] = useState({
    dotColor: "#06b6d4",
    bgColor: "transparent",
    pattern: "square",
  });

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Load profile share data from API and Home Card data
  useEffect(() => {
    loadProfileShare();
    loadHomeCardData();
  }, []);

  // Load Home Card data to populate profile information
  const loadHomeCardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/homeCard/my-homecard`, {
        headers: {
          "x-auth-token": token,
        },
      });

      if (response.data.homeCard) {
        const homeCard = response.data.homeCard;
        const userId = homeCard.userId._id || homeCard.userId;

        // Generate correct public profile URL
        const profileUrl = `${window.location.origin}/profile/${userId}`;

        if (homeCard.profileData) {
          const homeCardProfile = {
            fullName: homeCard.profileData.fullName || "",
            designation: homeCard.profileData.designation || "",
            city: homeCard.profileData.city || "",
            profilePicture: homeCard.profileData.profilePicture
              ? `${API_BASE_URL.replace("/api", "")}/${
                  homeCard.profileData.profilePicture
                }`
              : null,
            socialMedias: homeCard.profileData.socialMedias || [],
          };

          setProfileData((prev) => ({
            ...prev,
            ...homeCardProfile,
          }));

          setEditableData((prev) => ({
            ...prev,
            fullName: homeCardProfile.fullName,
            designation: homeCardProfile.designation,
            profileUrl: profileUrl, // Use generated URL
          }));
        }
      }
    } catch (error) {
      console.error("Error loading home card data:", error);
    }
  };

  const loadProfileShare = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_BASE_URL}/profile-share`, {
        headers: {
          "x-auth-token": token,
        },
      });

      if (response.data.success) {
        const profileShare = response.data.data;
        const profileDataFromAPI = {
          fullName: profileShare.profileData?.fullName || "",
          designation: profileShare.profileData?.designation || "",
          city: profileShare.profileData?.city || "",
          profilePicture: profileShare.profileData?.profilePicture
            ? `${API_BASE_URL.replace("/api", "")}${
                profileShare.profileData.profilePicture
              }`
            : null,
          logo: profileShare.profileData?.logo
            ? `${API_BASE_URL.replace("/api", "")}${
                profileShare.profileData.logo
              }`
            : null,
          socialMedias: profileShare.profileData?.socialMedias || [],
        };

        setProfileData((prev) => ({
          ...prev,
          ...profileDataFromAPI,
        }));

        // Initialize editable data with profile share data (overrides home card if exists)
        setEditableData((prev) => ({
          fullName: profileDataFromAPI.fullName || prev.fullName,
          designation: profileDataFromAPI.designation || prev.designation,
          profileUrl: profileShare.profileData?.profileUrl || prev.profileUrl,
        }));

        // Set QR settings
        if (profileShare.qrSettings) {
          setQrSettings(profileShare.qrSettings);
        }

        // Set display settings
        if (profileShare.displaySettings) {
          setShowAvatarInQR(profileShare.displaySettings.showAvatarInQR);
          setShowLogoInQR(profileShare.displaySettings.showLogoInQR);
        }
      }
    } catch (error) {
      console.error("Error loading profile share:", error);
      if (error.response?.status !== 404) {
        toast.error("Failed to load profile data");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle logo upload
  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    try {
      setLogoUploading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("logo", file);

      const response = await axios.post(
        `${API_BASE_URL}/profile-share/upload-logo`,
        formData,
        {
          headers: {
            "x-auth-token": token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        const logoUrl = `${API_BASE_URL.replace("/api", "")}${
          response.data.logoUrl
        }`;

        setProfileData((prev) => ({
          ...prev,
          logo: logoUrl,
        }));

        // Auto-enable logo in QR and disable profile picture
        setShowLogoInQR(true);
        setShowAvatarInQR(false);

        toast.success("Logo uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to upload logo");
      }
    } finally {
      setLogoUploading(false);
      // Reset file input
      event.target.value = "";
    }
  };

  // Handle logo removal
  const handleRemoveLogo = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.delete(
        `${API_BASE_URL}/profile-share/remove-logo`,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      if (response.data.success) {
        setProfileData((prev) => ({
          ...prev,
          logo: null,
        }));

        // Switch back to profile picture if logo was showing
        if (showLogoInQR) {
          setShowLogoInQR(false);
          setShowAvatarInQR(true);
        }

        toast.success("Logo removed successfully!");
      }
    } catch (error) {
      console.error("Error removing logo:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to remove logo");
      }
    }
  };

  // Initialize QR Code
  useEffect(() => {
    if (!editableData.profileUrl) return;

    const qrOptions = {
      width: 200,
      height: 200,
      data: editableData.profileUrl,
      dotsOptions: {
        color: qrSettings.dotColor,
        type: qrSettings.pattern,
      },
      backgroundOptions: {
        color: qrSettings.bgColor,
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 5,
        imageSize: 0.3,
        hideBackgroundDots: true,
      },
    };

    // Add image to QR code based on which one is enabled
    if (showAvatarInQR && profileData.profilePicture) {
      qrOptions.image = profileData.profilePicture;
    } else if (showLogoInQR && profileData.logo) {
      qrOptions.image = profileData.logo;
    }

    const qr = new QRCodeStyling(qrOptions);

    if (qrRef.current) {
      qrRef.current.innerHTML = "";
      qr.append(qrRef.current);
    }

    setQrCodeInstance(qr);

    return () => {
      if (qrRef.current) qrRef.current.innerHTML = "";
    };
  }, [
    editableData.profileUrl,
    showAvatarInQR,
    showLogoInQR,
    profileData.profilePicture,
    profileData.logo,
  ]);

  // Update QR Code when settings change
  useEffect(() => {
    if (!qrCodeInstance || !editableData.profileUrl) return;

    const updateOptions = {
      data: editableData.profileUrl,
      dotsOptions: {
        color: qrSettings.dotColor,
        type: qrSettings.pattern,
      },
      backgroundOptions: {
        color: qrSettings.bgColor,
      },
    };

    // Add or remove image based on which one is enabled
    if (showAvatarInQR && profileData.profilePicture) {
      updateOptions.image = profileData.profilePicture;
    } else if (showLogoInQR && profileData.logo) {
      updateOptions.image = profileData.logo;
    } else {
      updateOptions.image = undefined;
    }

    qrCodeInstance.update(updateOptions);
  }, [
    qrSettings,
    editableData.profileUrl,
    qrCodeInstance,
    showAvatarInQR,
    showLogoInQR,
    profileData.profilePicture,
    profileData.logo,
  ]);

  // Handle toggle functions with mutual exclusion
  const toggleAvatarInQR = () => {
    if (!showAvatarInQR) {
      setShowAvatarInQR(true);
      setShowLogoInQR(false);
    } else {
      setShowAvatarInQR(false);
    }
  };

  const toggleLogoInQR = () => {
    if (!showLogoInQR) {
      setShowLogoInQR(true);
      setShowAvatarInQR(false);
    } else {
      setShowLogoInQR(false);
    }
  };

  // Handle editable field changes
  const handleEditableChange = (field, value) => {
    setEditableData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save profile updates
  const saveProfileUpdates = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const profileShareData = {
        profileData: {
          fullName: editableData.fullName,
          designation: editableData.designation,
          profileUrl: editableData.profileUrl,
          city: profileData.city,
          socialMedias: profileData.socialMedias,
          profilePicture: profileData.profilePicture,
          logo: profileData.logo,
        },
        qrSettings: qrSettings,
        displaySettings: {
          showAvatarInQR: showAvatarInQR,
          showLogoInQR: showLogoInQR,
        },
      };

      const response = await axios.put(
        `${API_BASE_URL}/profile-share`,
        profileShareData,
        {
          headers: {
            "x-auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );

      // Update local profile data
      setProfileData((prev) => ({
        ...prev,
        fullName: editableData.fullName,
        designation: editableData.designation,
      }));

      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  // Copy profile link to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editableData.profileUrl);
      toast.success("Profile link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy link");
    }
  };

  // Share on social media
  const shareOnSocial = (platform) => {
    const text = `Check out ${
      editableData.fullName || profileData.fullName
    }'s profile`;
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(editableData.profileUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        editableData.profileUrl
      )}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        editableData.profileUrl
      )}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(
        text + " " + editableData.profileUrl
      )}`,
    };

    window.open(urls[platform], "_blank", "width=600,height=400");
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Reset to original values when canceling edit
      setEditableData({
        fullName: profileData.fullName,
        designation: profileData.designation,
        profileUrl: editableData.profileUrl,
      });
    }
    setIsEditing(!isEditing);
  };

  if (loading) {
    return (
      <div className="w-full py-8 px-4 sm:px-6 lg:px-8 relative overflow-visible min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8 relative overflow-visible min-h-screen">
      <div className="mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Share Your Profile
          </h1>
          <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto">
            Generate a QR code and share your professional profile across
            platforms
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Profile Info */}
          <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-700/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                Profile Information
              </h2>
              <button
                onClick={toggleEdit}
                className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  isEditing
                    ? "bg-gray-600 text-white hover:bg-gray-500"
                    : "bg-cyan-600 text-white hover:bg-cyan-500"
                }`}
              >
                {isEditing ? (
                  <>Cancel</>
                ) : (
                  <>
                    <FiEdit className="w-4 h-4" />
                    Edit
                  </>
                )}
              </button>
            </div>

            <div className="text-center mb-8">
              <div className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-cyan-500/30 overflow-hidden bg-gray-800">
                {profileData.profilePicture ? (
                  <img
                    src={profileData.profilePicture}
                    alt={profileData.fullName || "Profile"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-600 to-blue-600">
                    <FiUser className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4 max-w-md mx-auto">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editableData.fullName}
                      onChange={(e) =>
                        handleEditableChange("fullName", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={editableData.designation}
                      onChange={(e) =>
                        handleEditableChange("designation", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                      placeholder="Enter your designation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                      Profile URL
                    </label>
                    <input
                      type="text"
                      value={editableData.profileUrl}
                      onChange={(e) =>
                        handleEditableChange("profileUrl", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono text-sm"
                      placeholder="Enter your profile URL"
                    />
                  </div>

                  <button
                    onClick={saveProfileUpdates}
                    disabled={saving}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <FiLoader className="w-5 h-5 animate-spin" />
                    ) : (
                      <FiSave className="w-5 h-5" />
                    )}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {profileData.fullName || "Your Name"}
                  </h2>
                  <p className="text-lg text-cyan-400 font-semibold mb-3">
                    {profileData.designation || "Your Designation"}
                  </p>
                  {profileData.city && (
                    <p className="text-gray-300 mb-2">
                      <FiUser className="w-4 h-4 inline mr-2" />
                      {profileData.city}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Logo Upload Section - Redesigned */}
            <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-700/30 mb-6">
              <h3 className="text-xl font-bold text-white mb-4 text-center">
                Logo Settings
              </h3>

              <div className="text-center">
                {profileData.logo ? (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 mx-auto mb-4 border-2 border-cyan-500/30 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
                      <img
                        src={profileData.logo}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-sm text-gray-300 mb-4">Current Logo</p>
                    <div className="flex gap-2 justify-center">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          disabled={logoUploading}
                        />
                        <div className="px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                          {logoUploading ? (
                            <FiLoader className="w-4 h-4 animate-spin" />
                          ) : (
                            <FiUpload className="w-4 h-4" />
                          )}
                          Change Logo
                        </div>
                      </label>
                      <button
                        onClick={handleRemoveLogo}
                        className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center bg-gray-800/50">
                      <FiImage className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-sm text-gray-300 mb-4">
                      No logo uploaded
                    </p>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={logoUploading}
                      />
                      <div className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        {logoUploading ? (
                          <FiLoader className="w-4 h-4 animate-spin" />
                        ) : (
                          <FiUpload className="w-4 h-4" />
                        )}
                        Upload Logo
                      </div>
                    </label>
                    <p className="text-xs text-gray-400 mt-2">
                      Upload a logo to display in QR code (max 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Link Sharing Card */}
            <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-700/30">
              <h3 className="text-2xl font-bold text-white mb-4 text-center">
                Share Profile Link
              </h3>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={editableData.profileUrl}
                  readOnly={!isEditing}
                  onChange={(e) =>
                    isEditing &&
                    handleEditableChange("profileUrl", e.target.value)
                  }
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-600 bg-gray-800 text-gray-300 font-mono text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all font-semibold whitespace-nowrap border border-emerald-500/30 hover:border-emerald-400/50"
                >
                  Copy
                </button>
              </div>

              <p className="text-sm text-gray-400 text-center">
                Share this link directly or let people scan your QR code to view
                your profile
              </p>
            </div>

            {/* Share Buttons */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                Share Profile
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => shareOnSocial("twitter")}
                  className="flex items-center justify-center gap-2 p-3 bg-blue-500/90 text-white rounded-xl hover:bg-blue-600 transition-all border border-blue-500/30 hover:border-blue-400/50"
                >
                  <span>🐦</span> Twitter
                </button>
                <button
                  onClick={() => shareOnSocial("linkedin")}
                  className="flex items-center justify-center gap-2 p-3 bg-blue-700/90 text-white rounded-xl hover:bg-blue-800 transition-all border border-blue-600/30 hover:border-blue-500/50"
                >
                  <span>💼</span> LinkedIn
                </button>
                <button
                  onClick={() => shareOnSocial("facebook")}
                  className="flex items-center justify-center gap-2 p-3 bg-blue-600/90 text-white rounded-xl hover:bg-blue-700 transition-all border border-blue-500/30 hover:border-blue-400/50"
                >
                  <span>👥</span> Facebook
                </button>
                <button
                  onClick={() => shareOnSocial("whatsapp")}
                  className="flex items-center justify-center gap-2 p-3 bg-green-500/90 text-white rounded-xl hover:bg-green-600 transition-all border border-green-500/30 hover:border-green-400/50"
                >
                  <span>💬</span> WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - QR Code & Sharing */}
          <div className="space-y-8">
            {/* QR Code Card */}
            <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-700/30 text-center">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Scan QR Code</h3>
                <div className="flex gap-2">
                  <button
                    onClick={toggleAvatarInQR}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      showAvatarInQR
                        ? "bg-cyan-600 text-white hover:bg-cyan-500"
                        : "bg-gray-600 text-white hover:bg-gray-500"
                    }`}
                    disabled={!profileData.profilePicture}
                  >
                    {showAvatarInQR ? (
                      <>
                        <FiEyeOff className="w-4 h-4" />
                        Hide Profile
                      </>
                    ) : (
                      <>
                        <FiEye className="w-4 h-4" />
                        Show Profile
                      </>
                    )}
                  </button>
                  <button
                    onClick={toggleLogoInQR}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      showLogoInQR
                        ? "bg-cyan-600 text-white hover:bg-cyan-500"
                        : "bg-gray-600 text-white hover:bg-gray-500"
                    }`}
                    disabled={!profileData.logo}
                  >
                    {showLogoInQR ? (
                      <>
                        <FiEyeOff className="w-4 h-4" />
                        Hide Logo
                      </>
                    ) : (
                      <>
                        <FiImage className="w-4 h-4" />
                        Show Logo
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <div
                  ref={qrRef}
                  className="rounded-2xl bg-gray-800/50 p-4 border-2 border-gray-600/30"
                />
              </div>

              {/* Current Image Status */}
              <div className="mb-4 p-3 bg-gray-800/50 rounded-xl">
                <p className="text-sm text-gray-300">
                  Currently showing:{" "}
                  <span className="text-cyan-400 font-medium">
                    {showAvatarInQR && "Profile Picture"}
                    {showLogoInQR && "Logo"}
                    {!showAvatarInQR && !showLogoInQR && "No Image"}
                  </span>
                </p>
              </div>

              {/* QR Customization */}
              <div className="space-y-4 mb-6">
                <div className="flex gap-4 justify-center">
                  <label className="flex flex-col items-center gap-2">
                    <span className="text-sm font-medium text-gray-300">
                      Dot Color
                    </span>
                    <input
                      type="color"
                      value={qrSettings.dotColor}
                      onChange={(e) =>
                        setQrSettings((prev) => ({
                          ...prev,
                          dotColor: e.target.value,
                        }))
                      }
                      className="w-10 h-10 rounded-lg border-2 border-gray-600 cursor-pointer bg-gray-700"
                    />
                  </label>
                  <label className="flex flex-col items-center gap-2">
                    <span className="text-sm font-medium text-gray-300">
                      Background
                    </span>
                    <input
                      type="color"
                      value={qrSettings.bgColor}
                      onChange={(e) =>
                        setQrSettings((prev) => ({
                          ...prev,
                          bgColor: e.target.value,
                        }))
                      }
                      className="w-10 h-10 rounded-lg border-2 border-gray-600 cursor-pointer bg-gray-700"
                    />
                  </label>
                </div>

                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pattern Style
                  </label>
                  <select
                    value={qrSettings.pattern}
                    onChange={(e) =>
                      setQrSettings((prev) => ({
                        ...prev,
                        pattern: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-600 bg-gray-800 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  >
                    <option value="square">Square</option>
                    <option value="dots">Dots</option>
                    <option value="rounded">Rounded</option>
                    <option value="classy">Classy</option>
                    <option value="classy-rounded">Classy Rounded</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() =>
                  qrCodeInstance?.download({
                    extension: "png",
                    name: `${editableData.fullName || "profile"}-qr-code`,
                  })
                }
                className="w-full group relative bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 overflow-hidden border border-cyan-500/30"
              >
                <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <span className="relative">Download QR Code</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileShare;
