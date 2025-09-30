/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  FiUser,
  FiMapPin,
  FiCamera,
  FiSave,
  FiEye,
  FiGlobe,
  FiLinkedin,
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiYoutube,
  FiGithub,
  FiBriefcase,
  FiX,
  FiImage,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { MdImageNotSupported } from "react-icons/md";
import { RiSparklingFill } from "react-icons/ri";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

const HomeCard = ({ user }) => {
  const [profile, setProfile] = useState({
    fullName: "",
    designation: "",
    city: "",
    profilePicture: null,
    socialMedias: [],
  });

  const [selectedTemplate, setSelectedTemplate] = useState("influencer");
  const [savedProfile, setSavedProfile] = useState({});
  const [showImage, setShowImage] = useState(true);

  const socialMediaOptions = [
    {
      value: "linkedin",
      label: "LinkedIn",
      icon: <FiLinkedin />,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
    },
    {
      value: "facebook",
      label: "Facebook",
      icon: <FiFacebook />,
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
      borderColor: "border-blue-600/30",
    },
    {
      value: "instagram",
      label: "Instagram",
      icon: <FiInstagram />,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/30",
    },
    {
      value: "twitter",
      label: "Twitter",
      icon: <FiTwitter />,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
      borderColor: "border-blue-400/30",
    },
    {
      value: "youtube",
      label: "YouTube",
      icon: <FiYoutube />,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
    },
    {
      value: "github",
      label: "GitHub",
      icon: <FiGithub />,
      color: "text-gray-400",
      bgColor: "bg-gray-400/10",
      borderColor: "border-gray-400/30",
    },
    {
      value: "custom",
      label: "Custom URL",
      icon: <FiGlobe />,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      borderColor: "border-purple-400/30",
    },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("profileData");
    if (saved) {
      const parsedData = JSON.parse(saved);
      setSavedProfile(parsedData);
      setProfile(parsedData);
      setShowImage(!!parsedData.profilePicture);
    }
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleProfilePictureChange = (e) => {
    if (!showImage) return;

    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setProfile({ ...profile, profilePicture: file });
    }
  };

  const removeProfilePicture = () => {
    setProfile({ ...profile, profilePicture: null });
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

  const handleSave = () => {
    localStorage.setItem("profileData", JSON.stringify(profile));
    setSavedProfile(profile);
    toast.success("Profile saved successfully!");
  };

  const toggleImage = () => {
    setShowImage(!showImage);
    if (showImage) {
      setProfile({ ...profile, profilePicture: null });
    }
  };

  // TEMPLATE COMPONENTS - ALL RECTANGULAR

  const TemplateInfluencer = () => (
    <div className="bg-gradient-to-br from-gray-950 via-purple-950 to-black rounded-xl p-8 text-white shadow-2xl w-full max-w-sm mx-auto relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)]"></div>

      <div className="absolute top-10 right-10 w-2 h-2 bg-purple-400 rounded-full opacity-60 animate-ping"></div>
      <div className="absolute top-20 left-12 w-1.5 h-1.5 bg-indigo-400 rounded-full opacity-40 animate-pulse"></div>
      <div className="absolute bottom-20 right-16 w-1 h-1 bg-purple-300 rounded-full opacity-50 animate-ping"></div>

      <div className="relative z-10">
        {showImage && (
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/40 via-indigo-600/40 to-purple-600/40 rounded-full blur-xl"></div>

              <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 p-[2px]">
                <div className="w-full h-full rounded-full overflow-hidden bg-black">
                  {profile.profilePicture ? (
                    <img
                      src={URL.createObjectURL(profile.profilePicture)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-700 to-indigo-700">
                      <FiUser className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
              </div>

              <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-black rounded-lg border-2 border-purple-500 flex items-center justify-center shadow-lg backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-0.5 p-1">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-transparent"></div>
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <h1 className="text-2xl font-bold text-center mb-2 tracking-tight">
          <span className="bg-gradient-to-r from-purple-200 via-white to-purple-200 bg-clip-text text-transparent">
            {profile.fullName || "YOUR NAME"}
          </span>
        </h1>

        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-purple-500"></div>
          <p className="text-sm font-semibold text-purple-400 tracking-wide uppercase">
            {profile.designation || "Creator"}
          </p>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-purple-500"></div>
        </div>

        <div className="flex items-center justify-center gap-2 text-gray-400 mb-6 text-xs">
          <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
          <span>{profile.city || "Global"}</span>
          <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-purple-600 rotate-45"></div>
            <div className="w-1 h-1 bg-purple-500 rotate-45"></div>
            <div className="w-1 h-1 bg-purple-600 rotate-45"></div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {profile.socialMedias.map(
            (social, index) =>
              social.platform &&
              social.url && (
                <a
                  key={index}
                  href={social.url}
                  className="group relative"
                  title={
                    socialMediaOptions.find(
                      (opt) => opt.value === social.platform
                    )?.label
                  }
                >
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-20 blur-md transition-all duration-300 rounded-lg"></div>

                    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-gray-950 rounded-lg border border-gray-800 flex items-center justify-center group-hover:border-purple-500 group-hover:bg-gradient-to-br group-hover:from-purple-950 group-hover:to-gray-950 transition-all duration-300 group-hover:scale-110">
                      <span className="text-base">
                        {
                          socialMediaOptions.find(
                            (opt) => opt.value === social.platform
                          )?.icon
                        }
                      </span>
                    </div>

                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 border-t-2 border-r-2 border-purple-500/50 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  </div>
                </a>
              )
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-900 flex items-center justify-center text-xs">
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-purple-700"></div>
            <div className="w-1 h-3 bg-purple-600"></div>
            <div className="w-1 h-3 bg-purple-500"></div>
            <div className="w-1 h-3 bg-purple-600"></div>
            <div className="w-1 h-3 bg-purple-700"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const TemplateHero = () => (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-8 text-white shadow-2xl border border-gray-700/50 w-full max-w-sm mx-auto relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-gray-700 rounded-full opacity-20 -translate-x-32 -translate-y-32"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gray-700 rounded-full opacity-20 translate-x-16 translate-y-16"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between">
        {showImage && (
          <div className="relative mb-6 lg:mb-0">
            <div className="w-32 h-32 bg-[rgba(155,110,197,0.25)] rounded-full flex items-center justify-center relative overflow-hidden shadow-2xl">
              {profile.profilePicture ? (
                <img
                  src={URL.createObjectURL(profile.profilePicture)}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[rgba(155,110,197,0.25)]">
                  <FiUser className="w-12 h-12 text-white/80" />
                </div>
              )}
            </div>
          </div>
        )}

        <div
          className={`flex-1 ${
            showImage ? "lg:ml-6" : ""
          } text-center lg:text-left`}
        >
          <div className="text-green-400 font-semibold text-sm mb-3">
            {profile.designation || "Professional"} From{" "}
            {profile.city || "Your City"}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 leading-tight">
            {profile.fullName ? (
              <>
                {profile.fullName.split(" ")[0]}
                <br />
                <span className="text-purple-300">
                  {profile.fullName.split(" ").slice(1).join(" ")}
                </span>
              </>
            ) : (
              "Your Name"
            )}
          </h1>

          <div className="flex flex-wrap gap-2 mt-4 justify-center lg:justify-start">
            {profile.socialMedias.map(
              (social, index) =>
                social.platform &&
                social.url && (
                  <a
                    key={index}
                    href={social.url}
                    className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-all"
                  >
                    {
                      socialMediaOptions.find(
                        (opt) => opt.value === social.platform
                      )?.icon
                    }
                  </a>
                )
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const TemplateExecutive = () => (
    <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-xl p-8 text-white shadow-2xl border border-blue-500/20 w-full max-w-sm mx-auto relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center gap-6 mb-6">
          {showImage && (
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-xl border-2 border-blue-400/50 overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-600 shadow-xl">
                {profile.profilePicture ? (
                  <img
                    src={URL.createObjectURL(profile.profilePicture)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiUser className="w-8 h-8 text-white/80" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-xl font-bold text-white mb-1">
              {profile.fullName || "Your Name"}
            </h1>
            <p className="text-blue-200 text-sm font-medium mb-2">
              {profile.designation || "Executive Title"}
            </p>
            <p className="text-gray-300 text-xs flex items-center gap-1">
              <FiMapPin className="w-3 h-3" />
              {profile.city || "Location"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {profile.socialMedias.map(
            (social, index) =>
              social.platform &&
              social.url && (
                <a
                  key={index}
                  href={social.url}
                  className="w-10 h-10 bg-blue-800/40 rounded-lg flex items-center justify-center hover:bg-blue-700/50 transition-all border border-blue-600/30"
                  title={
                    socialMediaOptions.find(
                      (opt) => opt.value === social.platform
                    )?.label
                  }
                >
                  {
                    socialMediaOptions.find(
                      (opt) => opt.value === social.platform
                    )?.icon
                  }
                </a>
              )
          )}
        </div>
      </div>
    </div>
  );

  const TemplateMinimalist = () => (
    <div className="bg-white rounded-xl p-8 text-gray-900 shadow-2xl border border-gray-100 w-full max-w-sm mx-auto relative overflow-hidden">
      <div className="relative z-10 text-center">
        {showImage && (
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-gray-200 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
              {profile.profilePicture ? (
                <img
                  src={URL.createObjectURL(profile.profilePicture)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <FiUser className="w-10 h-10 text-gray-600" />
                </div>
              )}
            </div>
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {profile.fullName || "Your Name"}
        </h1>
        <p className="text-blue-600 text-lg font-medium mb-2">
          {profile.designation || "Professional Role"}
        </p>
        <p className="text-gray-500 text-sm flex items-center justify-center gap-2 mb-4">
          <FiMapPin className="w-3 h-3" />
          {profile.city || "Based in City"}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {profile.socialMedias.map(
            (social, index) =>
              social.platform &&
              social.url && (
                <a
                  key={index}
                  href={social.url}
                  className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-all hover:scale-110 text-gray-600"
                >
                  {
                    socialMediaOptions.find(
                      (opt) => opt.value === social.platform
                    )?.icon
                  }
                </a>
              )
          )}
        </div>
      </div>
    </div>
  );

  const TemplateCreative = () => (
    <div className="bg-[rgba(42,30,53,0.25)] rounded-xl p-8 text-white shadow-2xl w-full max-w-sm mx-auto relative overflow-hidden">
      <div className="relative z-10 text-center">
        {showImage && (
          <div className="relative inline-block mb-6">
            <div className="w-28 h-28 rounded-full border-4 border-white/30 shadow-2xl overflow-hidden bg-white/20 backdrop-blur-sm">
              {profile.profilePicture ? (
                <img
                  src={URL.createObjectURL(profile.profilePicture)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FiUser className="w-12 h-12 text-white/80" />
                </div>
              )}
            </div>
          </div>
        )}

        <h1 className="text-3xl font-black mb-2 text-white drop-shadow-lg">
          {profile.fullName ? profile.fullName.toUpperCase() : "YOUR NAME"}
        </h1>
        <p className="text-white/90 text-xl mb-3 font-semibold">
          {profile.designation || "CREATIVE PROFESSIONAL"}
        </p>
        <p className="text-white/80 text-lg flex items-center justify-center gap-2 mb-6">
          <FiMapPin className="w-4 h-4" />
          {profile.city || "YOUR LOCATION"}
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          {profile.socialMedias.map(
            (social, index) =>
              social.platform &&
              social.url && (
                <a
                  key={index}
                  href={social.url}
                  className="w-12 h-12 bg-white/25 rounded-lg flex items-center justify-center hover:bg-white/35 transition-all hover:scale-110 backdrop-blur-sm text-white"
                >
                  {
                    socialMediaOptions.find(
                      (opt) => opt.value === social.platform
                    )?.icon
                  }
                </a>
              )
          )}
        </div>
      </div>
    </div>
  );

  const TemplateGlass = () => (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 text-white shadow-2xl border border-white/10 w-full max-w-sm mx-auto relative overflow-hidden backdrop-blur-md">
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {profile.fullName || "Your Name"}
            </h1>
            <p className="text-purple-300 text-sm font-medium">
              {profile.designation || "Professional"}
            </p>
          </div>
          {showImage && (
            <div className="w-16 h-16 rounded-xl border-2 border-white/20 overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
              {profile.profilePicture ? (
                <img
                  src={URL.createObjectURL(profile.profilePicture)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FiUser className="w-6 h-6 text-white/60" />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-white/80">
            <FiMapPin className="w-4 h-4 text-purple-400" />
            <span className="text-sm">{profile.city || "Your City"}</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {profile.socialMedias.map(
            (social, index) =>
              social.platform &&
              social.url && (
                <a
                  key={index}
                  href={social.url}
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 backdrop-blur-sm"
                >
                  {
                    socialMediaOptions.find(
                      (opt) => opt.value === social.platform
                    )?.icon
                  }
                </a>
              )
          )}
        </div>
      </div>
    </div>
  );

  const TemplateNeonGlow = () => (
    <div className="bg-gradient-to-br from-purple-900 via-black to-blue-900 rounded-xl p-8 text-white shadow-2xl border border-purple-500/30 w-full max-w-sm mx-auto relative overflow-hidden">
      <div className="relative z-10 text-center">
        {showImage && (
          <div className="w-24 h-24 rounded-full border-4 border-purple-400/50 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm shadow-2xl">
            {profile.profilePicture ? (
              <img
                src={URL.createObjectURL(profile.profilePicture)}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center shadow-inner">
                <FiUser className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
        )}

        <h1 className="text-3xl font-black mb-3 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
          {profile.fullName || "YOUR NAME"}
        </h1>
        <p className="text-purple-200 text-lg font-semibold mb-2">
          {profile.designation || "PROFESSIONAL TITLE"}
        </p>
        <p className="text-blue-300 text-sm flex items-center justify-center gap-2 mb-6">
          <FiMapPin className="w-4 h-4" />
          {profile.city || "YOUR LOCATION"}
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          {profile.socialMedias.map(
            (social, index) =>
              social.platform &&
              social.url && (
                <a
                  key={index}
                  href={social.url}
                  className="w-12 h-12 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-lg flex items-center justify-center hover:from-purple-500/50 hover:to-blue-500/50 transition-all hover:scale-110 border border-purple-400/30 backdrop-blur-sm shadow-lg"
                >
                  {
                    socialMediaOptions.find(
                      (opt) => opt.value === social.platform
                    )?.icon
                  }
                </a>
              )
          )}
        </div>
      </div>
    </div>
  );

  const TemplateCyberpunk = () => (
    <div className="bg-black rounded-xl p-8 text-white shadow-2xl border border-cyan-400/40 w-full max-w-sm mx-auto relative overflow-hidden">
      <div className="relative z-10 text-center">
        {showImage && (
          <div className="w-32 h-32 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-cyan-400/20 transform rotate-45 rounded-lg scale-90"></div>
            <div className="absolute inset-0 bg-pink-400/20 transform -rotate-45 rounded-lg scale-90"></div>

            <div className="absolute inset-1 flex items-center justify-center overflow-hidden rounded-lg bg-gray-900 border border-cyan-400/30">
              {profile.profilePicture ? (
                <img
                  src={URL.createObjectURL(profile.profilePicture)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500 to-pink-500">
                  <FiUser className="w-10 h-10 text-white" />
                </div>
              )}
            </div>
          </div>
        )}

        <h1 className="text-2xl font-bold mb-2 text-cyan-300 uppercase tracking-wider">
          {profile.fullName || "YOUR IDENTITY"}
        </h1>
        <p className="text-pink-300 text-sm font-mono mb-3 border border-pink-400/30 inline-block px-3 py-1 rounded-full">
          {profile.designation || "SYSTEM_PROGRAMMER"}
        </p>
        <p className="text-gray-400 text-xs font-mono flex items-center justify-center gap-2 mb-6">
          <FiMapPin className="w-3 h-3" />
          {profile.city || "LOCATION: UNKNOWN"}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {profile.socialMedias.map(
            (social, index) =>
              social.platform &&
              social.url && (
                <a
                  key={index}
                  href={social.url}
                  className="w-10 h-10 bg-gray-800 border border-cyan-400/30 rounded-lg flex items-center justify-center hover:bg-cyan-400/20 hover:border-cyan-400 transition-all font-mono text-cyan-300"
                >
                  {
                    socialMediaOptions.find(
                      (opt) => opt.value === social.platform
                    )?.icon
                  }
                </a>
              )
          )}
        </div>
      </div>
    </div>
  );

  const TemplateLuxuryGold = () => (
    <div className="bg-gradient-to-br from-gray-900 via-black to-yellow-900 rounded-xl p-8 text-white shadow-2xl border border-yellow-600/30 w-full max-w-sm mx-auto relative overflow-hidden">
      <div className="absolute top-4 left-4 w-3 h-3 bg-yellow-400 opacity-60"></div>
      <div className="absolute top-4 right-4 w-3 h-3 bg-yellow-400 opacity-60"></div>
      <div className="absolute bottom-4 left-4 w-3 h-3 bg-yellow-400 opacity-60"></div>
      <div className="absolute bottom-4 right-4 w-3 h-3 bg-yellow-400 opacity-60"></div>

      <div className="relative z-10 text-center">
        {showImage && (
          <div className="w-24 h-24 rounded-full border-2 border-yellow-500/50 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-yellow-600/10 to-yellow-400/10">
            {profile.profilePicture ? (
              <img
                src={URL.createObjectURL(profile.profilePicture)}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full border border-yellow-400/30 flex items-center justify-center">
                <FiUser className="w-8 h-8 text-yellow-300" />
              </div>
            )}
          </div>
        )}

        <h1 className="text-2xl font-light mb-3 text-yellow-100 tracking-wide">
          {profile.fullName || "Your Name"}
        </h1>
        <p className="text-yellow-300 text-lg font-medium mb-2 italic">
          {profile.designation || "Executive Professional"}
        </p>
        <p className="text-yellow-400/80 text-sm flex items-center justify-center gap-2 mb-6">
          <FiMapPin className="w-3 h-3" />
          {profile.city || "Global Presence"}
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          {profile.socialMedias.map(
            (social, index) =>
              social.platform &&
              social.url && (
                <a
                  key={index}
                  href={social.url}
                  className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center hover:bg-yellow-500/30 transition-all border border-yellow-500/30 text-yellow-200"
                >
                  {
                    socialMediaOptions.find(
                      (opt) => opt.value === social.platform
                    )?.icon
                  }
                </a>
              )
          )}
        </div>
      </div>
    </div>
  );

  const TemplateMinimalDark = () => (
    <div className="bg-gray-900 rounded-xl p-8 text-white shadow-2xl border border-gray-700 w-full max-w-sm mx-auto relative overflow-hidden">
      <div className="relative z-10 text-center">
        {showImage && (
          <div className="w-20 h-20 rounded-full border-2 border-white/10 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-700">
            {profile.profilePicture ? (
              <img
                src={URL.createObjectURL(profile.profilePicture)}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <FiUser className="w-6 h-6 text-white/60" />
              </div>
            )}
          </div>
        )}

        <h1 className="text-xl font-bold mb-2 text-white">
          {profile.fullName || "Your Name"}
        </h1>
        <p className="text-gray-400 text-sm mb-3">
          {profile.designation || "Professional"}
        </p>
        <p className="text-gray-500 text-xs flex items-center justify-center gap-2 mb-6">
          <FiMapPin className="w-3 h-3" />
          {profile.city || "Based in City"}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {profile.socialMedias.map(
            (social, index) =>
              social.platform &&
              social.url && (
                <a
                  key={index}
                  href={social.url}
                  className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-all text-gray-400 hover:text-white"
                >
                  {
                    socialMediaOptions.find(
                      (opt) => opt.value === social.platform
                    )?.icon
                  }
                </a>
              )
          )}
        </div>
      </div>
    </div>
  );

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case "influencer":
        return <TemplateInfluencer />;
      case "hero":
        return <TemplateHero />;
      case "executive":
        return <TemplateExecutive />;
      case "minimalist":
        return <TemplateMinimalist />;
      case "creative":
        return <TemplateCreative />;
      case "glass":
        return <TemplateGlass />;
      case "neon":
        return <TemplateNeonGlow />;
      case "cyberpunk":
        return <TemplateCyberpunk />;
      case "luxury":
        return <TemplateLuxuryGold />;
      case "minimal":
        return <TemplateMinimalDark />;
      default:
        return <TemplateInfluencer />;
    }
  };

  const templates = [
    { id: "influencer", name: "Influencer", component: <TemplateInfluencer /> },
    { id: "hero", name: "Hero", component: <TemplateHero /> },
    { id: "executive", name: "Executive", component: <TemplateExecutive /> },
    { id: "minimalist", name: "Minimalist", component: <TemplateMinimalist /> },
    { id: "creative", name: "Creative", component: <TemplateCreative /> },
    { id: "glass", name: "Glass", component: <TemplateGlass /> },
    { id: "neon", name: "Neon Glow", component: <TemplateNeonGlow /> },
    { id: "cyberpunk", name: "Cyberpunk", component: <TemplateCyberpunk /> },
    { id: "luxury", name: "Luxury Gold", component: <TemplateLuxuryGold /> },
    { id: "minimal", name: "Minimal Dark", component: <TemplateMinimalDark /> },
  ];

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8 relative overflow-visible">
      <div className="mx-auto relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Create Your Digital Card
          </h1>
          <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto">
            Design your perfect professional identity with premium templates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-6 lg:col-span-2 border border-gray-700/30">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FiUser className="w-5 h-5 text-purple-400" />
              Your Information
            </h2>

            {showImage && (
              <div className="flex flex-col items-center space-y-4 mb-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-gray-800 shadow-lg overflow-hidden bg-gray-800 flex items-center justify-center">
                    {profile.profilePicture ? (
                      <>
                        <img
                          src={URL.createObjectURL(profile.profilePicture)}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
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

                  <label className="absolute bottom-0 right-0 bg-gray-700 text-white rounded-full p-2 shadow-md hover:bg-gray-600 transition-all cursor-pointer">
                    <FiCamera className="h-5 w-5" />
                    <input
                      type="file"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                      accept="image/*"
                      disabled={!showImage}
                    />
                  </label>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  JPG or PNG, max 5MB
                </p>
              </div>
            )}
            <div className="flex items-center justify-between mb-6 bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                {showImage ? (
                  <FiImage className="w-5 h-5 text-purple-400" />
                ) : (
                  <MdImageNotSupported className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="text-white font-medium text-sm">
                    Profile Image
                  </p>
                  <p className="text-gray-400 text-xs">
                    {showImage
                      ? "Image will be shown in templates"
                      : "Image will be hidden from templates"}
                  </p>
                </div>
              </div>

              <button
                onClick={toggleImage}
                className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                  showImage ? "bg-purple-600" : "bg-gray-600"
                }`}
              >
                <motion.div
                  className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md"
                  animate={{
                    x: showImage ? 28 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiUser className="w-4 h-4" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                  value={profile.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiBriefcase className="w-4 h-4" />
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl hover:border-gray-500 text-white focus:border-gray-500 transition"
                  value={profile.designation}
                  onChange={handleChange}
                  placeholder="Software Engineer"
                />
              </div>

              <div className="form-group md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiMapPin className="w-4 h-4" />
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                  value={profile.city}
                  onChange={handleChange}
                  placeholder="New York"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                <FiGlobe className="w-4 h-4" />
                Social Media Links
              </label>

              <div className="space-y-3">
                {(profile.socialMedias ?? []).map((social, index) => {
                  const selectedOption = socialMediaOptions.find(
                    (opt) => opt.value === social.platform
                  );

                  return (
                    <div
                      key={index}
                      className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-12 h-12 rounded-lg ${
                            selectedOption?.bgColor || "bg-gray-700"
                          } border ${
                            selectedOption?.borderColor || "border-gray-600"
                          } flex items-center justify-center flex-shrink-0 ${
                            selectedOption?.color || "text-gray-400"
                          }`}
                        >
                          {selectedOption?.icon || <FiGlobe />}
                        </div>

                        <div className="flex-1 space-y-2">
                          <select
                            value={social.platform}
                            onChange={(e) =>
                              handleSocialMediaChange(
                                index,
                                "platform",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm hover:border-gray-500 focus:border-purple-500 transition"
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
                              handleSocialMediaChange(
                                index,
                                "url",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm hover:border-gray-500 focus:border-purple-500 transition placeholder-gray-500"
                            placeholder={
                              social.platform === "custom"
                                ? "https://yourwebsite.com"
                                : social.platform
                                ? `Enter your ${social.platform} URL`
                                : "Enter URL"
                            }
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeSocialMedia(index)}
                          className="w-10 h-10 bg-red-600/10 border border-red-600/30 text-red-400 rounded-lg hover:bg-red-600/20 hover:border-red-600/50 transition-all flex items-center justify-center flex-shrink-0"
                          aria-label="Remove social media"
                          title="Remove"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={addSocialMedia}
                className="mt-4 w-full px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all flex items-center justify-center gap-2 font-medium"
              >
                <FiPlus className="w-4 h-4" />
                Add Social Media Link
              </button>
            </div>

            <div className="mt-8">
              <button
                onClick={handleSave}
                className="w-full px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-xl font-medium hover:from-gray-600 hover:to-gray-500 transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <span className="relative flex items-center justify-center gap-2">
                  <FiSave className="w-5 h-5" />
                  Save Profile
                </span>
              </button>
            </div>
          </div>

          <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-700/30 sticky top-8 self-start overflow-y-auto max-h-[calc(100vh-4rem)]">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FiEye className="w-5 h-5" />
              Live Preview
            </h2>

            <div className="flex flex-col items-center">
              <div className="flex flex-wrap gap-2 mb-6 justify-center">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedTemplate === template.id
                        ? "bg-purple-600 text-white shadow-md shadow-purple-500/30"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {template.name}
                  </button>
                ))}
              </div>

              <div className="w-full max-w-sm transform hover:scale-105 transition-transform duration-300">
                {renderTemplate()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeCard;
