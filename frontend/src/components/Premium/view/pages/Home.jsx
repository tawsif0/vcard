/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { User, MapPin, Briefcase, MoreHorizontal } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import * as THREE from "three";
import {
  FiFacebook,
  FiGithub,
  FiGlobe,
  FiInstagram,
  FiLinkedin,
  FiTwitter,
  FiYoutube
} from "react-icons/fi";
import { FaTiktok } from "react-icons/fa";
import Navigation from "../components/Navigation";

const Home = ({ userId }) => {
  const [homeCardData, setHomeCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMoreSocials, setShowMoreSocials] = useState(false);

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    loadHomeCardData();
  }, [userId]);

  const loadHomeCardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_BASE_URL}/homeCard/my-homecard`, {
        headers: {
          "x-auth-token": token
        }
      });

      if (response.data.homeCard) {
        setHomeCardData(response.data.homeCard);
      }
    } catch (error) {
      console.error("Error loading home card:", error);
      if (error.response?.status !== 404) {
        toast.error("Failed to load profile data");
      }
    } finally {
      setLoading(false);
    }
  };

  const getProfilePictureUrl = () => {
    if (homeCardData?.profileData?.profilePicture) {
      return `${API_BASE_URL.replace("/api", "")}/${
        homeCardData.profileData.profilePicture
      }`;
    }
    return "images/hero/hero-img.png";
  };

  const getSocialIcon = (platform) => {
    const icons = {
      facebook: <FiFacebook className="w-5 h-5" />,
      linkedin: <FiLinkedin className="w-5 h-5" />,
      instagram: <FiInstagram className="w-5 h-5" />,
      twitter: <FiTwitter className="w-5 h-5" />,
      youtube: <FiYoutube className="w-5 h-5" />,
      github: <FiGithub className="w-5 h-5" />,
      tiktok: <FaTiktok className="w-5 h-5" />
    };
    return icons[platform.toLowerCase()] || <FiGlobe className="w-5 h-5" />;
  };

  const getVisibleSocials = () => {
    if (!homeCardData?.profileData?.socialMedias) return [];
    return homeCardData.profileData.socialMedias.slice(0, 5);
  };

  const getHiddenSocials = () => {
    if (!homeCardData?.profileData?.socialMedias) return [];
    return homeCardData.profileData.socialMedias.slice(5);
  };

  const SocialMoreModal = ({ template }) => {
    if (!showMoreSocials) return null;

    const getModalStyle = () => {
      switch (template) {
        case "influencer":
          return "bg-gradient-to-br from-purple-900 to-blue-900 ";
        case "hero":
          return "bg-gradient-to-br from-gray-900 to-black";
        case "executive":
          return "bg-gradient-to-br from-slate-900 to-blue-900";
        case "minimalist":
          return "bg-white";
        case "creative":
          return "bg-[rgba(42,30,53,0.95)] backdrop-blur-md";
        case "neon":
          return "bg-gradient-to-br from-purple-900 via-black to-blue-900";
        case "cyberpunk":
          return "bg-black";
        case "luxury":
          return "bg-gradient-to-br from-gray-900 via-black to-yellow-900";
        case "minimal":
          return "bg-gray-900";
        default:
          return "bg-gradient-to-br from-purple-900 to-blue-900";
      }
    };

    const getTextColor = () => {
      switch (template) {
        case "minimalist":
          return "text-gray-900";
        default:
          return "text-white";
      }
    };

    const getButtonStyle = () => {
      switch (template) {
        case "influencer":
          return "bg-purple-600 hover:bg-purple-700";
        case "hero":
          return "bg-green-600 hover:bg-green-700";
        case "executive":
          return "bg-blue-600 hover:bg-blue-700";
        case "minimalist":
          return "bg-blue-600 hover:bg-blue-700 text-white";
        case "creative":
          return "bg-white/20 hover:bg-white/30 backdrop-blur-sm";
        case "neon":
          return "bg-purple-600 hover:bg-purple-700";
        case "cyberpunk":
          return "bg-cyan-600 hover:bg-cyan-700";
        case "luxury":
          return "bg-yellow-600 hover:bg-yellow-700";
        case "minimal":
          return "bg-gray-700 hover:bg-gray-600";
        default:
          return "bg-purple-600 hover:bg-purple-700";
      }
    };

    const getIconBgStyle = () => {
      switch (template) {
        case "influencer":
          return "bg-white/10 hover:bg-white/20";
        case "hero":
          return "bg-gray-800 hover:bg-gray-700";
        case "executive":
          return "bg-blue-800/40 hover:bg-blue-700/50";
        case "minimalist":
          return "bg-gray-100 hover:bg-gray-200 text-gray-600";
        case "creative":
          return "bg-white/20 hover:bg-white/30 backdrop-blur-sm";
        case "neon":
          return "bg-purple-500/30 hover:bg-purple-500/50";
        case "cyberpunk":
          return "bg-gray-800 hover:bg-cyan-400/20";
        case "luxury":
          return "bg-yellow-600/20 hover:bg-yellow-500/30 border border-yellow-500/30";
        case "minimal":
          return "bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white";
        default:
          return "bg-white/10 hover:bg-white/20";
      }
    };

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className={`relative rounded-2xl p-6 max-w-sm w-full mx-auto shadow-2xl max-h-[50vh] flex flex-col ${getModalStyle()}`}
        >
          <div className="text-center mb-4">
            <h3 className={`text-xl font-bold ${getTextColor()}`}>
              Social Links
            </h3>
            <p className={`text-sm mt-1 ${getTextColor()} opacity-80`}>
              {getHiddenSocials().length} more connections
            </p>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-3 gap-3">
              {getHiddenSocials().map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${getIconBgStyle()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowMoreSocials(false)}
                >
                  <div className="w-8 h-8 flex items-center justify-center mb-3 rounded-lg bg-white/10">
                    {getSocialIcon(social.platform)}
                  </div>
                  <span
                    className={`text-sm font-medium capitalize ${getTextColor()} text-center`}
                  >
                    {social.platform}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <button
              onClick={() => setShowMoreSocials(false)}
              className={`w-full py-3 rounded-xl transition-all font-medium hover:scale-105 active:scale-95 ${getButtonStyle()} ${getTextColor()}`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Template rendering function
  const renderTemplate = () => {
    if (!homeCardData) return null;

    switch (homeCardData.template) {
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

  // Template Components
  const TemplateInfluencer = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
      if (!canvasRef.current) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 350 / 230, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true
      });

      renderer.setSize(350, 230);
      renderer.setPixelRatio(window.devicePixelRatio);

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
        opacity: 0.6
      });

      const particlesMesh = new THREE.Points(
        particlesGeometry,
        particlesMaterial
      );
      scene.add(particlesMesh);

      camera.position.z = 3;

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
      <div className="w-full max-w-2xl flex justify-center items-center rounded-2xl text-white shadow-2xl relative overflow-hidden border border-purple-500/30 bg-black min-h-[400px] mx-auto">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-blue-900/40 to-pink-900/50"></div>
        <div className="relative z-10 h-full flex flex-col justify-center items-center p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {homeCardData.showImage && (
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-gray-400/60 overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 shadow-2xl">
                    {homeCardData.profileData.profilePicture ? (
                      <img
                        src={getProfilePictureUrl()}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-700 via-pink-600 to-cyan-600">
                        <User className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 min-w-0 text-center md:text-left">
              <p className="text-lg font-medium mb-3 opacity-90">
                Hey, my name is
              </p>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                {homeCardData.profileData.fullName || "User"}
              </h1>
              <div className="space-y-3">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <Briefcase className="w-6 h-6 text-orange-400" />
                  <span className="text-base text-gray-300">Known for</span>
                  <span className="text-lg font-bold text-orange-400 flex-1 truncate">
                    {homeCardData.profileData.designation || "Professional"}
                  </span>
                </div>
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <MapPin className="w-6 h-6 text-purple-300" />
                  <span className="text-base text-gray-300">Based in</span>
                  <span className="text-lg font-semibold text-purple-300 flex-1 truncate">
                    {homeCardData.profileData.city || "Location"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {homeCardData.profileData.socialMedias?.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-8 justify-center md:justify-start">
              {getVisibleSocials().map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all border border-white/20 hover:scale-110"
                >
                  {getSocialIcon(social.platform)}
                </a>
              ))}
              {getHiddenSocials().length > 0 && (
                <button
                  onClick={() => setShowMoreSocials(true)}
                  className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all border border-white/20 hover:scale-110"
                >
                  <MoreHorizontal className="w-6 h-6" />
                </button>
              )}
            </div>
          )}
        </div>
        <SocialMoreModal template="influencer" />
        <div className="absolute top-3 right-3 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-70 animate-ping"></div>
        <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-3 left-3 w-1 h-1 bg-pink-400 rounded-full opacity-50"></div>
        <div className="absolute bottom-3 right-3 w-1 h-1 bg-purple-400 rounded-full opacity-50"></div>
      </div>
    );
  };

  const TemplateHero = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
      if (!canvasRef.current) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 350 / 230, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true
      });

      renderer.setSize(350, 230);
      renderer.setPixelRatio(window.devicePixelRatio);

      const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
      const material = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        wireframe: true,
        transparent: true,
        opacity: 0.3
      });

      const cubes = [];
      for (let i = 0; i < 3; i++) {
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4
        );
        cubes.push(cube);
        scene.add(cube);
      }

      camera.position.z = 3;

      const animate = () => {
        requestAnimationFrame(animate);
        cubes.forEach((cube) => {
          cube.rotation.x += 0.01;
          cube.rotation.y += 0.01;
        });
        renderer.render(scene, camera);
      };

      animate();

      return () => {
        renderer.dispose();
      };
    }, []);

    return (
      <div className="flex justify-center w-full max-w-2xl rounded-2xl text-white shadow-2xl relative overflow-hidden border border-gray-700/50 bg-gradient-to-br from-gray-900 to-black min-h-[400px] mx-auto">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute top-0 left-0 w-40 h-40 bg-purple-600 rounded-full opacity-10 -translate-x-20 -translate-y-20"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-600 rounded-full opacity-10 translate-x-12 translate-y-12"></div>

        <div className="relative z-10 min-h-full p-8 flex items-center justify-center flex-col">
          <div className="flex flex-col md:flex-row items-center gap-6 w-full mx-auto max-w-md">
            {homeCardData.showImage && (
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full flex items-center justify-center relative overflow-hidden shadow-2xl border border-purple-400/30">
                  {homeCardData.profileData.profilePicture ? (
                    <img
                      src={getProfilePictureUrl()}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600/40 to-blue-600/40">
                      <User className="w-16 h-16 text-white/80" />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex-1 min-w-0 text-center md:text-left">
              <div className="text-green-400 font-semibold text-lg mb-3 leading-tight">
                {homeCardData.profileData.designation || "Professional"} From{" "}
                {homeCardData.profileData.city || "Your City"}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                {homeCardData.profileData.fullName ? (
                  <span className="text-purple-300">
                    {homeCardData.profileData.fullName}
                  </span>
                ) : (
                  <>Your name</>
                )}
              </h1>

              {homeCardData.profileData.socialMedias?.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                  {getVisibleSocials().map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gray-700 transition-all text-white border border-gray-600/50 hover:border-purple-400/50 hover:scale-110"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {getSocialIcon(social.platform)}
                    </a>
                  ))}
                  {getHiddenSocials().length > 0 && (
                    <button
                      onClick={() => setShowMoreSocials(true)}
                      className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gray-700 transition-all text-white border border-gray-600/50 hover:border-purple-400/50 hover:scale-110"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full opacity-60"></div>
        <div className="absolute bottom-4 left-4 w-3 h-3 bg-purple-400 rounded-full opacity-60"></div>
        <SocialMoreModal template="hero" />
      </div>
    );
  };

  // TEMPLATE: EXECUTIVE
  const TemplateExecutive = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
      if (!canvasRef.current) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 350 / 230, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true
      });

      renderer.setSize(350, 230);
      renderer.setPixelRatio(window.devicePixelRatio);

      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 100;
      const posArray = new Float32Array(particlesCount * 3);

      for (let i = 0; i < particlesCount; i++) {
        posArray[i * 3] = (Math.random() - 0.5) * 5;
        posArray[i * 3 + 1] = (Math.random() - 0.5) * 5;
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 5;
      }

      particlesGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(posArray, 3)
      );

      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.015,
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.5
      });

      const particlesMesh = new THREE.Points(
        particlesGeometry,
        particlesMaterial
      );
      scene.add(particlesMesh);

      camera.position.z = 3;

      const animate = () => {
        requestAnimationFrame(animate);
        particlesMesh.rotation.x += 0.001;
        particlesMesh.rotation.y += 0.003;
        renderer.render(scene, camera);
      };

      animate();

      return () => {
        renderer.dispose();
      };
    }, []);

    return (
      <div className="w-full max-w-2xl flex justify-center items-center bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-8 text-white shadow-2xl border border-blue-500/20 relative overflow-hidden min-h-[400px] mx-auto">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div className="relative z-10 h-full flex flex-col justify-center">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
            {homeCardData.showImage && (
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-2xl border-4 border-blue-400/50 overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-600 shadow-2xl">
                  {homeCardData.profileData.profilePicture ? (
                    <img
                      src={getProfilePictureUrl()}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-white/80" />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex-1 min-w-0 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {homeCardData.profileData.fullName || "Your Name"}
              </h1>
              <p className="text-blue-200 text-xl font-medium mb-4">
                {homeCardData.profileData.designation || "Executive Title"}
              </p>
              <p className="text-gray-300 text-lg flex items-center gap-2 justify-center md:justify-start">
                <MapPin className="w-5 h-5" />
                {homeCardData.profileData.city || "Location"}
              </p>
            </div>
          </div>

          {homeCardData.profileData.socialMedias?.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4">
              {getVisibleSocials().map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="w-14 h-14 bg-blue-800/40 rounded-xl flex items-center justify-center hover:bg-blue-700/50 transition-all border border-blue-600/30 hover:scale-110"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {getSocialIcon(social.platform)}
                </a>
              ))}
              {getHiddenSocials().length > 0 && (
                <button
                  onClick={() => setShowMoreSocials(true)}
                  className="w-14 h-14 bg-blue-800/40 rounded-xl flex items-center justify-center hover:bg-blue-700/50 transition-all border border-blue-600/30 hover:scale-110"
                >
                  <MoreHorizontal className="w-6 h-6" />
                </button>
              )}
            </div>
          )}
        </div>
        <SocialMoreModal template="executive" />
      </div>
    );
  };

  // TEMPLATE: MINIMALIST
  const TemplateMinimalist = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
      if (!canvasRef.current) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 350 / 230, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true
      });

      renderer.setSize(350, 230);
      renderer.setPixelRatio(window.devicePixelRatio);

      const geometry = new THREE.TorusGeometry(1, 0.05, 16, 100);
      const material = new THREE.MeshBasicMaterial({
        color: 0xcccccc,
        transparent: true,
        opacity: 0.1
      });

      const torus = new THREE.Mesh(geometry, material);
      scene.add(torus);

      camera.position.z = 3;

      const animate = () => {
        requestAnimationFrame(animate);
        torus.rotation.x += 0.005;
        torus.rotation.y += 0.005;
        renderer.render(scene, camera);
      };

      animate();

      return () => {
        renderer.dispose();
      };
    }, []);

    return (
      <div className="w-full max-w-2xl bg-white rounded-2xl p-8 text-gray-900 shadow-2xl border border-gray-100 relative overflow-hidden min-h-[400px] mx-auto">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        <div className="relative z-10 text-center h-full flex flex-col justify-center">
          {homeCardData.showImage && (
            <div className="relative inline-block mb-8 mx-auto">
              <div className="w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl">
                {homeCardData.profileData.profilePicture ? (
                  <img
                    src={getProfilePictureUrl()}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <User className="w-16 h-16 text-gray-600" />
                  </div>
                )}
              </div>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {homeCardData.profileData.fullName || "Your Name"}
          </h1>
          <p className="text-blue-600 text-2xl font-medium mb-4">
            {homeCardData.profileData.designation || "Professional Role"}
          </p>
          <p className="text-gray-500 text-lg flex items-center justify-center gap-3 mb-8">
            <MapPin className="w-5 h-5" />
            {homeCardData.profileData.city || "Based in City"}
          </p>

          {homeCardData.profileData.socialMedias?.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4">
              {getVisibleSocials().map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-all hover:scale-110 text-gray-600"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {getSocialIcon(social.platform)}
                </a>
              ))}
              {getHiddenSocials().length > 0 && (
                <button
                  onClick={() => setShowMoreSocials(true)}
                  className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-all hover:scale-110 text-gray-600"
                >
                  <MoreHorizontal className="w-6 h-6" />
                </button>
              )}
            </div>
          )}
        </div>
        <SocialMoreModal template="minimalist" />
      </div>
    );
  };

  // TEMPLATE: CREATIVE
  const TemplateCreative = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
      if (!canvasRef.current) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 350 / 230, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true
      });

      renderer.setSize(350, 230);
      renderer.setPixelRatio(window.devicePixelRatio);

      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 80;
      const posArray = new Float32Array(particlesCount * 3);
      const colorArray = new Float32Array(particlesCount * 3);

      for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 6;
        colorArray[i] = Math.random();
      }

      particlesGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(posArray, 3)
      );
      particlesGeometry.setAttribute(
        "color",
        new THREE.BufferAttribute(colorArray, 3)
      );

      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.03,
        vertexColors: true,
        transparent: true,
        opacity: 0.7
      });

      const particlesMesh = new THREE.Points(
        particlesGeometry,
        particlesMaterial
      );
      scene.add(particlesMesh);

      camera.position.z = 3;

      const animate = () => {
        requestAnimationFrame(animate);
        particlesMesh.rotation.x += 0.002;
        particlesMesh.rotation.y += 0.004;
        renderer.render(scene, camera);
      };

      animate();

      return () => {
        renderer.dispose();
      };
    }, []);

    return (
      <div className="w-full max-w-2xl bg-[rgba(42,30,53,0.25)] rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden min-h-[400px] mx-auto">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div className="relative z-10 text-center h-full flex flex-col justify-center">
          {homeCardData.showImage && (
            <div className="relative inline-block mb-8 mx-auto">
              <div className="w-36 h-36 rounded-full border-4 border-white/30 shadow-2xl overflow-hidden bg-white/20 backdrop-blur-sm">
                {homeCardData.profileData.profilePicture ? (
                  <img
                    src={getProfilePictureUrl()}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-20 h-20 text-white/80" />
                  </div>
                )}
              </div>
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-black mb-4 text-white drop-shadow-lg">
            {homeCardData.profileData.fullName
              ? homeCardData.profileData.fullName.toUpperCase()
              : "YOUR NAME"}
          </h1>
          <p className="text-white/90 text-2xl mb-6 font-semibold">
            {homeCardData.profileData.designation || "CREATIVE PROFESSIONAL"}
          </p>
          <p className="text-white/80 text-xl flex items-center justify-center gap-3 mb-8">
            <MapPin className="w-6 h-6" />
            {homeCardData.profileData.city || "YOUR LOCATION"}
          </p>

          {homeCardData.profileData.socialMedias?.length > 0 && (
            <div className="flex flex-wrap justify-center gap-5">
              {getVisibleSocials().map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="w-16 h-16 bg-white/25 rounded-xl flex items-center justify-center hover:bg-white/35 transition-all hover:scale-110 backdrop-blur-sm text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {getSocialIcon(social.platform)}
                </a>
              ))}
              {getHiddenSocials().length > 0 && (
                <button
                  onClick={() => setShowMoreSocials(true)}
                  className="w-16 h-16 bg-white/25 rounded-xl flex items-center justify-center hover:bg-white/35 transition-all hover:scale-110 backdrop-blur-sm text-white"
                >
                  <MoreHorizontal className="w-7 h-7" />
                </button>
              )}
            </div>
          )}
        </div>
        <SocialMoreModal template="creative" />
      </div>
    );
  };

  // TEMPLATE: NEON GLOW
  const TemplateNeonGlow = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
      if (!canvasRef.current) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 350 / 230, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true
      });

      renderer.setSize(350, 230);
      renderer.setPixelRatio(window.devicePixelRatio);

      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 60;
      const posArray = new Float32Array(particlesCount * 3);

      for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 5;
      }

      particlesGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(posArray, 3)
      );

      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.03,
        color: 0xec4899,
        transparent: true,
        opacity: 0.6
      });

      const particlesMesh = new THREE.Points(
        particlesGeometry,
        particlesMaterial
      );
      scene.add(particlesMesh);

      camera.position.z = 3;

      const animate = () => {
        requestAnimationFrame(animate);
        particlesMesh.rotation.x += 0.003;
        particlesMesh.rotation.z += 0.002;
        renderer.render(scene, camera);
      };

      animate();

      return () => {
        renderer.dispose();
      };
    }, []);

    return (
      <div className="w-full max-w-2xl bg-gradient-to-br from-purple-900 via-black to-blue-900 rounded-2xl p-8 text-white shadow-2xl border border-purple-500/30 relative overflow-hidden min-h-[400px] mx-auto">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        <div className="relative z-10 text-center h-full flex flex-col justify-center">
          {homeCardData.showImage && (
            <div className="w-32 h-32 rounded-full border-4 border-purple-400/50 mx-auto mb-8 flex items-center justify-center bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm shadow-2xl">
              {homeCardData.profileData.profilePicture ? (
                <img
                  src={getProfilePictureUrl()}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center shadow-inner">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            {homeCardData.profileData.fullName || "YOUR NAME"}
          </h1>
          <p className="text-purple-200 text-2xl font-semibold mb-4">
            {homeCardData.profileData.designation || "PROFESSIONAL TITLE"}
          </p>
          <p className="text-blue-300 text-lg flex items-center justify-center gap-3 mb-8">
            <MapPin className="w-5 h-5" />
            {homeCardData.profileData.city || "YOUR LOCATION"}
          </p>

          {homeCardData.profileData.socialMedias?.length > 0 && (
            <div className="flex flex-wrap justify-center gap-5">
              {getVisibleSocials().map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="w-16 h-16 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-xl flex items-center justify-center hover:from-purple-500/50 hover:to-blue-500/50 transition-all hover:scale-110 border border-purple-400/30 backdrop-blur-sm shadow-lg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {getSocialIcon(social.platform)}
                </a>
              ))}
              {getHiddenSocials().length > 0 && (
                <button
                  onClick={() => setShowMoreSocials(true)}
                  className="w-16 h-16 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-xl flex items-center justify-center hover:from-purple-500/50 hover:to-blue-500/50 transition-all hover:scale-110 border border-purple-400/30 backdrop-blur-sm shadow-lg"
                >
                  <MoreHorizontal className="w-7 h-7" />
                </button>
              )}
            </div>
          )}
        </div>
        <SocialMoreModal template="neon" />
      </div>
    );
  };

  // TEMPLATE: CYBERPUNK
  const TemplateCyberpunk = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
      if (!canvasRef.current) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true
      });

      // Set renderer to full screen
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);

      // Create multiple grid layers for depth
      const gridGeometry = new THREE.PlaneGeometry(15, 15, 15, 15);
      const gridMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        wireframe: true,
        transparent: true,
        opacity: 0.15
      });

      // Main centered grid
      const mainGrid = new THREE.Mesh(gridGeometry, gridMaterial);
      mainGrid.rotation.x = -Math.PI / 2;
      scene.add(mainGrid);

      // Secondary grid for depth
      const secondaryGrid = new THREE.Mesh(gridGeometry, gridMaterial);
      secondaryGrid.rotation.x = -Math.PI / 2;
      secondaryGrid.position.z = -2;
      secondaryGrid.material.opacity = 0.1;
      scene.add(secondaryGrid);

      // Third grid for more complexity
      const thirdGrid = new THREE.Mesh(gridGeometry, gridMaterial);
      thirdGrid.rotation.x = -Math.PI / 2;
      thirdGrid.position.z = 2;
      thirdGrid.material.opacity = 0.08;
      scene.add(thirdGrid);

      // Add some floating particles
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 50;
      const posArray = new Float32Array(particlesCount * 3);

      for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 20;
      }

      particlesGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(posArray, 3)
      );

      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        color: 0xff00ff,
        transparent: true,
        opacity: 0.6
      });

      const particlesMesh = new THREE.Points(
        particlesGeometry,
        particlesMaterial
      );
      scene.add(particlesMesh);

      // Position camera to look down at the centered grid
      camera.position.set(0, 8, 0);
      camera.lookAt(0, 0, 0);

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener("resize", handleResize);

      const animate = () => {
        requestAnimationFrame(animate);

        // Rotate grids at different speeds for parallax effect
        mainGrid.rotation.z += 0.004;
        secondaryGrid.rotation.z += 0.002;
        thirdGrid.rotation.z -= 0.003;

        // Float particles
        particlesMesh.rotation.y += 0.001;

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        window.removeEventListener("resize", handleResize);
        renderer.dispose();
      };
    }, []);

    return (
      <div className="w-full max-w-2xl flex items-center justify-center bg-black rounded-2xl p-8 text-white shadow-2xl border border-cyan-400/40 relative overflow-hidden min-h-[400px] mx-auto">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ width: "100%", height: "100%" }}
        />

        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70"></div>

        <div className="relative z-10 text-center flex flex-col justify-center items-center w-full h-full min-h-[300px]">
          {homeCardData.showImage && (
            <div className="w-40 h-40 mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-cyan-400/20 transform rotate-45 rounded-lg scale-90"></div>
              <div className="absolute inset-0 bg-pink-400/20 transform -rotate-45 rounded-lg scale-90"></div>

              <div className="absolute inset-2 flex items-center justify-center overflow-hidden rounded-lg bg-gray-900 border border-cyan-400/30">
                {homeCardData.profileData.profilePicture ? (
                  <img
                    src={getProfilePictureUrl()}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500 to-pink-500">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-cyan-300 uppercase tracking-wider bg-black/50 px-4 py-2 rounded-lg border border-cyan-400/30">
            {homeCardData.profileData.fullName || "YOUR IDENTITY"}
          </h1>
          <p className="text-pink-300 text-lg font-mono mb-6 border border-pink-400/30 inline-block px-4 py-2 rounded-full bg-black/50">
            {homeCardData.profileData.designation || "SYSTEM_PROGRAMMER"}
          </p>
          <p className="text-gray-400 text-base font-mono flex items-center justify-center gap-3 mb-8 bg-black/50 px-4 py-2 rounded-lg border border-gray-600/30">
            <MapPin className="w-4 h-4" />
            {homeCardData.profileData.city || "LOCATION: UNKNOWN"}
          </p>

          {homeCardData.profileData.socialMedias?.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4">
              {getVisibleSocials().map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="w-14 h-14 bg-gray-800 border border-cyan-400/30 rounded-xl flex items-center justify-center hover:bg-cyan-400/20 hover:border-cyan-400 transition-all font-mono text-cyan-300 hover:scale-110 backdrop-blur-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {getSocialIcon(social.platform)}
                </a>
              ))}
              {getHiddenSocials().length > 0 && (
                <button
                  onClick={() => setShowMoreSocials(true)}
                  className="w-14 h-14 bg-gray-800 border border-cyan-400/30 rounded-xl flex items-center justify-center hover:bg-cyan-400/20 hover:border-cyan-400 transition-all font-mono text-cyan-300 hover:scale-110 backdrop-blur-sm"
                >
                  <MoreHorizontal className="w-6 h-6" />
                </button>
              )}
            </div>
          )}
        </div>
        <SocialMoreModal template="cyberpunk" />
      </div>
    );
  };

  // TEMPLATE: LUXURY GOLD
  const TemplateLuxuryGold = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
      if (!canvasRef.current) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 350 / 230, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true
      });

      renderer.setSize(350, 230);
      renderer.setPixelRatio(window.devicePixelRatio);

      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 30;
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
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.4
      });

      const particlesMesh = new THREE.Points(
        particlesGeometry,
        particlesMaterial
      );
      scene.add(particlesMesh);

      camera.position.z = 3;

      const animate = () => {
        requestAnimationFrame(animate);
        particlesMesh.rotation.y += 0.001;
        renderer.render(scene, camera);
      };

      animate();

      return () => {
        renderer.dispose();
      };
    }, []);

    return (
      <div className="w-full max-w-2xl bg-gradient-to-br from-gray-900 via-black to-yellow-900 rounded-2xl p-8 text-white shadow-2xl border border-yellow-600/30 relative overflow-hidden min-h-[400px] mx-auto">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute top-6 left-6 w-4 h-4 bg-yellow-400 opacity-60"></div>
        <div className="absolute top-6 right-6 w-4 h-4 bg-yellow-400 opacity-60"></div>
        <div className="absolute bottom-6 left-6 w-4 h-4 bg-yellow-400 opacity-60"></div>
        <div className="absolute bottom-6 right-6 w-4 h-4 bg-yellow-400 opacity-60"></div>
        <div className="relative z-10 text-center h-full flex flex-col justify-center">
          {homeCardData.showImage && (
            <div className="w-32 h-32 rounded-full border-4 border-yellow-500/50 mx-auto mb-8 flex items-center justify-center bg-gradient-to-br from-yellow-600/10 to-yellow-400/10">
              {homeCardData.profileData.profilePicture ? (
                <img
                  src={getProfilePictureUrl()}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border border-yellow-400/30 flex items-center justify-center">
                  <User className="w-12 h-12 text-yellow-300" />
                </div>
              )}
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-light mb-6 text-yellow-100 tracking-wide">
            {homeCardData.profileData.fullName || "Your Name"}
          </h1>
          <p className="text-yellow-300 text-2xl font-medium mb-4 italic">
            {homeCardData.profileData.designation || "Executive Professional"}
          </p>
          <p className="text-yellow-400/80 text-lg flex items-center justify-center gap-3 mb-8">
            <MapPin className="w-5 h-5" />
            {homeCardData.profileData.city || "Global Presence"}
          </p>

          {homeCardData.profileData.socialMedias?.length > 0 && (
            <div className="flex flex-wrap justify-center gap-5">
              {getVisibleSocials().map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="w-14 h-14 bg-yellow-600/20 rounded-xl flex items-center justify-center hover:bg-yellow-500/30 transition-all border border-yellow-500/30 text-yellow-200 hover:scale-110"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {getSocialIcon(social.platform)}
                </a>
              ))}
              {getHiddenSocials().length > 0 && (
                <button
                  onClick={() => setShowMoreSocials(true)}
                  className="w-14 h-14 bg-yellow-600/20 rounded-xl flex items-center justify-center hover:bg-yellow-500/30 transition-all border border-yellow-500/30 text-yellow-200 hover:scale-110"
                >
                  <MoreHorizontal className="w-6 h-6" />
                </button>
              )}
            </div>
          )}
        </div>
        <SocialMoreModal template="luxury" />
      </div>
    );
  };

  // TEMPLATE: MINIMAL DARK
  const TemplateMinimalDark = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
      if (!canvasRef.current) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 350 / 230, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true
      });

      renderer.setSize(350, 230);
      renderer.setPixelRatio(window.devicePixelRatio);

      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 25;
      const posArray = new Float32Array(particlesCount * 3);

      for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 4;
      }

      particlesGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(posArray, 3)
      );

      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.015,
        color: 0xffffff,
        transparent: true,
        opacity: 0.3
      });

      const particlesMesh = new THREE.Points(
        particlesGeometry,
        particlesMaterial
      );
      scene.add(particlesMesh);

      camera.position.z = 3;

      const animate = () => {
        requestAnimationFrame(animate);
        particlesMesh.rotation.y += 0.002;
        renderer.render(scene, camera);
      };

      animate();

      return () => {
        renderer.dispose();
      };
    }, []);

    return (
      <div className="w-full max-w-2xl bg-gray-900 rounded-2xl p-8 text-white shadow-2xl border border-gray-700 relative overflow-hidden min-h-[400px] mx-auto">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        <div className="relative z-10 text-center h-full flex flex-col justify-center">
          {homeCardData.showImage && (
            <div className="w-28 h-28 rounded-full border-2 border-white/10 mx-auto mb-8 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-700">
              {homeCardData.profileData.profilePicture ? (
                <img
                  src={getProfilePictureUrl()}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                  <User className="w-10 h-10 text-white/60" />
                </div>
              )}
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            {homeCardData.profileData.fullName || "Your Name"}
          </h1>
          <p className="text-gray-400 text-xl mb-6">
            {homeCardData.profileData.designation || "Professional"}
          </p>
          <p className="text-gray-500 text-lg flex items-center justify-center gap-3 mb-8">
            <MapPin className="w-5 h-5" />
            {homeCardData.profileData.city || "Based in City"}
          </p>

          {homeCardData.profileData.socialMedias?.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4">
              {getVisibleSocials().map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gray-700 transition-all text-gray-400 hover:text-white hover:scale-110"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {getSocialIcon(social.platform)}
                </a>
              ))}
              {getHiddenSocials().length > 0 && (
                <button
                  onClick={() => setShowMoreSocials(true)}
                  className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gray-700 transition-all text-gray-400 hover:text-white hover:scale-110"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
        <SocialMoreModal template="minimal" />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex justify-center items-center p-4 md:p-8">
      <div className="w-full">
        {homeCardData?.template &&
        homeCardData.template !== "TemplateInfluencer" ? (
          <div className="w-full max-w-7xl relative transform transition-transform duration-300 mx-auto">
            {renderTemplate()}
            <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 z-20">
              <Navigation />
            </div>
          </div>
        ) : (
          <div className="relative">
            <TemplateInfluencer />
            <div className="absolute left-1/2 -translate-x-1/2 z-20">
              <Navigation />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
