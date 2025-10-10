/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
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
  FiLoader,
  FiCheck,
  FiRotateCw,
  FiZoomIn,
} from "react-icons/fi";
import { FaTiktok } from "react-icons/fa";
import { MdImageNotSupported } from "react-icons/md";
import { RiSparklingFill } from "react-icons/ri";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import axios from "axios";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Modal from "react-modal";

Modal.setAppElement("#root");

// Image Cropper Component
const ImageCropper = ({ isOpen, onClose, onCropComplete, aspect = 1 }) => {
  const [src, setSrc] = useState(null);
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({
    unit: "%",
    width: 50,
    aspect,
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setSrc(reader.result);
        setCrop({ unit: "%", width: 50, aspect });
      });
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = (img) => {
    setImage(img);
    // Set initial crop to cover the image
    const minDimension = Math.min(img.width, img.height);
    setCrop({
      unit: "px",
      width: minDimension,
      height: minDimension,
      x: (img.width - minDimension) / 2,
      y: (img.height - minDimension) / 2,
    });
  };

  const getCroppedImg = (image, crop, fileName) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error("Canvas is empty");
            return;
          }
          blob.name = fileName;
          resolve(blob);
        },
        "image/jpeg",
        0.9
      );
    });
  };

  const handleCropComplete = async () => {
    if (image && completedCrop?.width && completedCrop?.height) {
      try {
        const croppedImageBlob = await getCroppedImg(
          image,
          completedCrop,
          "profile-picture.jpg"
        );

        // Create object URL for preview
        const croppedImageUrl = URL.createObjectURL(croppedImageBlob);

        onCropComplete(croppedImageUrl, croppedImageBlob);
        handleClose();
      } catch (error) {
        console.error("Error cropping image:", error);
        toast.error("Failed to crop image");
      }
    }
  };

  const handleClose = () => {
    setSrc(null);
    setImage(null);
    setCrop({ unit: "%", width: 50, aspect });
    setCompletedCrop(null);
    onClose();
  };

  const rotateImage = () => {
    if (imgRef.current) {
      const currentRotation =
        parseInt(
          imgRef.current.style.transform
            .replace("rotate(", "")
            .replace("deg)", "")
        ) || 0;
      imgRef.current.style.transform = `rotate(${currentRotation + 90}deg)`;
    }
  };

  const zoomIn = () => {
    setCrop((prev) => ({
      ...prev,
      width: Math.max(10, prev.width - 10),
    }));
  };

  const zoomOut = () => {
    setCrop((prev) => ({
      ...prev,
      width: Math.min(100, prev.width + 10),
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="fixed inset-0 flex items-center justify-center z-50"
      overlayClassName="fixed inset-0 bg-black bg-opacity-75 z-40"
    >
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl mx-4 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Crop Profile Picture</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {!src ? (
          <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="text-gray-400 mb-4">
              <FiZoomIn className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-300 mb-4">Select an image to crop</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Choose Image
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-center">
              <ReactCrop
                crop={crop}
                onChange={(newCrop) => setCrop(newCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                circularCrop
                className="max-h-96"
              >
                <img
                  ref={imgRef}
                  src={src}
                  onLoad={(e) => onImageLoad(e.currentTarget)}
                  alt="Crop preview"
                  style={{ transform: "rotate(0deg)" }}
                />
              </ReactCrop>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={rotateImage}
                  className="p-2 bg-gray-800 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                  title="Rotate"
                >
                  <FiRotateCw className="w-5 h-5" />
                </button>
                <button
                  onClick={zoomIn}
                  className="p-2 bg-gray-800 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                  title="Zoom In"
                >
                  <FiZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={zoomOut}
                  className="p-2 bg-gray-800 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                  title="Zoom Out"
                >
                  <FiZoomIn className="w-5 h-5 transform rotate-180" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  Change Image
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-700 rounded-lg text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropComplete}
                  className="px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition-colors flex items-center gap-2"
                  disabled={!completedCrop}
                >
                  <FiCheck className="w-4 h-4" />
                  Apply Crop
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

const HomeCard = ({ user }) => {
  const [profile, setProfile] = useState({
    fullName: "",
    designation: "",
    city: "",
    profilePicture: null,
    profilePictureFile: null,
    socialMedias: [],
  });

  const [selectedTemplate, setSelectedTemplate] = useState("influencer");
  const [savedProfile, setSavedProfile] = useState({});
  const [showImage, setShowImage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);

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
      value: "tiktok",
      label: "TikTok",
      icon: <FaTiktok />,
      color: "text-white",
      bgColor: "bg-black/10",
      borderColor: "border-white/20",
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

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Load home card data from API
  useEffect(() => {
    loadHomeCard();
  }, []);

  const loadHomeCard = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_BASE_URL}/homeCard/my-homecard`, {
        headers: {
          "x-auth-token": token,
        },
      });

      if (response.data.homeCard) {
        const homeCard = response.data.homeCard;

        // Set template
        setSelectedTemplate(homeCard.template || "influencer");

        // Set show image preference
        setShowImage(
          homeCard.showImage !== undefined ? homeCard.showImage : true
        );

        // Set profile data
        if (homeCard.profileData) {
          const profileData = {
            fullName: homeCard.profileData.fullName || "",
            designation: homeCard.profileData.designation || "",
            city: homeCard.profileData.city || "",
            // Create full URL for saved profile picture
            profilePicture: homeCard.profileData.profilePicture
              ? `${API_BASE_URL.replace("/api", "")}/${
                  homeCard.profileData.profilePicture
                }`
              : null,
            socialMedias: homeCard.profileData.socialMedias || [],
          };
          setProfile(profileData);
          setSavedProfile(profileData);
        }
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error("Failed to load home card");
      }
    }
  };

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
      setCropModalOpen(true);
    }
  };

  const handleCropComplete = (croppedImageUrl, croppedImageBlob) => {
    // Create a File object from the blob
    const croppedFile = new File([croppedImageBlob], "profile-picture.jpg", {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    setProfile({
      ...profile,
      profilePicture: croppedImageUrl,
      profilePictureFile: croppedFile,
    });
  };

  const removeProfilePicture = () => {
    // Revoke the object URL to avoid memory leaks
    if (profile.profilePicture && profile.profilePicture.startsWith("blob:")) {
      URL.revokeObjectURL(profile.profilePicture);
    }
    setProfile({
      ...profile,
      profilePicture: null,
      profilePictureFile: null,
    });
    setCropModalOpen(false);
  };

  useEffect(() => {
    return () => {
      // Clean up object URLs when component unmounts
      if (
        profile.profilePicture &&
        profile.profilePicture.startsWith("blob:")
      ) {
        URL.revokeObjectURL(profile.profilePicture);
      }
    };
  }, []);

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
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("template", selectedTemplate);
      formData.append("fullName", profile.fullName);
      formData.append("designation", profile.designation);
      formData.append("city", profile.city);
      formData.append("socialMedias", JSON.stringify(profile.socialMedias));
      formData.append("showImage", showImage.toString());

      // Add profile picture file if selected
      if (profile.profilePictureFile) {
        formData.append("profilePicture", profile.profilePictureFile);
      }

      // If profile picture is removed
      if (!profile.profilePicture && savedProfile.profilePicture) {
        formData.append("removeProfilePicture", "true");
      }

      const response = await axios.put(
        `${API_BASE_URL}/homeCard/my-homecard`,
        formData,
        {
          headers: {
            "x-auth-token": token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSavedProfile(profile);
      toast.success("Home card saved successfully!");
    } catch (error) {
      console.error("Error saving home card:", error);
      toast.error("Failed to save home card");
    } finally {
      setSaving(false);
    }
  };

  const toggleImage = () => {
    setShowImage(!showImage);
    if (showImage && profile.profilePicture) {
      setProfile({
        ...profile,
        profilePicture: null,
        profilePictureFile: null,
      });
    }
  };

  // TEMPLATE COMPONENTS - ALL RECTANGULAR
  const TemplateInfluencer = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
      if (!canvasRef.current) return;

      // Three.js Scene Setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 300 / 180, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
      });

      renderer.setSize(300, 180);
      renderer.setPixelRatio(window.devicePixelRatio);

      // Simple particles background
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 50;
      const posArray = new Float32Array(particlesCount * 3);

      for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 5;
      }

      particlesGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(posArray, 3)
      );

      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        color: 0xffffff,
        transparent: true,
        opacity: 0.6,
      });

      const particlesMesh = new THREE.Points(
        particlesGeometry,
        particlesMaterial
      );
      scene.add(particlesMesh);

      camera.position.z = 3;

      // Animation
      const animate = () => {
        requestAnimationFrame(animate);
        particlesMesh.rotation.y += 0.005;
        renderer.render(scene, camera);
      };

      animate();

      return () => {
        renderer.dispose();
      };
    }, []);

    return (
      <div className="w-[350px] h-[230px] rounded-xl text-white shadow-2xl mx-auto relative overflow-hidden border border-purple-500/30 bg-black">
        {/* Three.js Background */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-blue-900/40 to-pink-900/50"></div>

        {/* Content - Properly Centered */}
        <div className="relative z-10 h-full flex flex-col justify-center p-4">
          <div className="flex items-center gap-2">
            {/* Left - Profile image */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-gray-400/60 overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg">
                  {profile.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-700 via-pink-600 to-cyan-600">
                      <FiUser className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Floating social icons */}
                {profile.socialMedias.slice(0, 4).map(
                  (social, index) =>
                    social.platform &&
                    social.url && (
                      <div
                        key={index}
                        className={`absolute w-4 h-4 bg-white/95 rounded-full flex items-center justify-center shadow-md border border-white/40 ${
                          index === 0
                            ? "-top-1 -right-1"
                            : index === 1
                            ? "-bottom-1 -left-1"
                            : index === 2
                            ? "top-0 -left-2"
                            : "-bottom-1 right-1"
                        }`}
                      >
                        <a
                          href={social.url}
                          className="flex items-center justify-center w-full h-full text-gray-800 text-[6px]"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {
                            socialMediaOptions.find(
                              (opt) => opt.value === social.platform
                            )?.icon
                          }
                        </a>
                      </div>
                    )
                )}
              </div>
            </div>

            {/* Right - Text content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium mb-1 opacity-90">
                Hey, my name is
              </p>

              <div className="mb-2">
                <h1 className="text-sm font-bold leading-tight truncate">
                  {profile.fullName ? profile.fullName : "Johnson"}
                </h1>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-gray-300 whitespace-nowrap">
                    Known for
                  </span>
                  <span className="text-[11px] font-bold text-orange-400 truncate flex-1">
                    {profile.designation || "Influencing & Content Creation"}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-gray-300 whitespace-nowrap">
                    Based in
                  </span>
                  <span className="text-[11px] font-semibold text-purple-300 truncate flex-1">
                    {profile.city || "New York"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Corner accents */}
        <div className="absolute top-3 right-3 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-70 animate-ping"></div>
        <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-3 left-3 w-1 h-1 bg-pink-400 rounded-full opacity-50"></div>
        <div className="absolute bottom-3 right-3 w-1 h-1 bg-purple-400 rounded-full opacity-50"></div>
      </div>
    );
  };

  const TemplateHero = () => (
    <div className="w-[350px] h-[230px] rounded-xl text-white shadow-2xl mx-auto relative overflow-hidden border border-gray-700/50 bg-gradient-to-br from-gray-900 to-black">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-purple-600 rounded-full opacity-10 -translate-x-20 -translate-y-20"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-600 rounded-full opacity-10 translate-x-12 translate-y-12"></div>

      <div className="relative z-10 h-full p-4 flex items-center">
        <div className="flex items-center gap-3 w-full">
          {/* Left - Profile Image */}
          {showImage && (
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full flex items-center justify-center relative overflow-hidden shadow-lg border border-purple-400/30">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600/40 to-blue-600/40">
                    <FiUser className="w-6 h-6 text-white/80" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right - Content */}
          <div className="flex-1 min-w-0">
            <div className="text-green-400 font-semibold text-sm mb-2 leading-tight">
              {profile.designation || "Professional"} From{" "}
              {profile.city || "Your City"}
            </div>

            <h1 className="text-sm font-bold text-white mb-1 leading-tight">
              {profile.fullName ? (
                <>
                  <span className="text-purple-300 text-sm">
                    {profile.fullName}
                  </span>
                </>
              ) : (
                <>Your name</>
              )}
            </h1>

            {/* Social Links - Compact Grid */}
            {profile.socialMedias.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {profile.socialMedias.map(
                  (social, index) =>
                    social.platform &&
                    social.url && (
                      <a
                        key={index}
                        href={social.url}
                        className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center hover:bg-gray-700 transition-all text-white text-[10px] border border-gray-600/50 hover:border-purple-400/50"
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
            )}
          </div>
        </div>
      </div>

      {/* Corner Accents */}
      <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-green-400 rounded-full opacity-60"></div>
      <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-60"></div>
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
                    src={profile.profilePicture}
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
                  src={profile.profilePicture}
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
                  src={profile.profilePicture}
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
                  src={profile.profilePicture}
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
                src={profile.profilePicture}
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
                  src={profile.profilePicture}
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
                src={profile.profilePicture}
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
                src={profile.profilePicture}
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
                          src={profile.profilePicture}
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
                disabled={saving}
                className="w-full px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-xl font-medium hover:from-gray-600 hover:to-gray-500 transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <span className="relative flex items-center justify-center gap-2">
                  {saving ? (
                    <FiLoader className="w-5 h-5 animate-spin" />
                  ) : (
                    <FiSave className="w-5 h-5" />
                  )}
                  {saving ? "Saving..." : "Save Profile"}
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

      {/* Image Cropper Modal */}
      <ImageCropper
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={handleCropComplete}
        aspect={1} // 1:1 ratio for circular profile pictures
      />
    </div>
  );
};

export default HomeCard;
