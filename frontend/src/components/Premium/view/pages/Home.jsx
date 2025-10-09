/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { User, MapPin, Briefcase } from "lucide-react";
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
  FiYoutube,
} from "react-icons/fi";
import { FaTiktok } from "react-icons/fa";
import Navigation from "../components/Navigation";

const Home = ({ userId }) => {
  const [homeCardData, setHomeCardData] = useState(null);
  const [loading, setLoading] = useState(true);

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
          "x-auth-token": token,
        },
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
      facebook: <FiFacebook className="w-4 h-4" />,
      linkedin: <FiLinkedin className="w-4 h-4" />,
      instagram: <FiInstagram className="w-4 h-4" />,
      twitter: <FiTwitter className="w-4 h-4" />,
      youtube: <FiYoutube className="w-4 h-4" />,
      github: <FiGithub className="w-4 h-4" />,
      tiktok: <FaTiktok className="w-4 h-4" />,
    };
    return icons[platform.toLowerCase()] || <FiGlobe className="w-4 h-4" />;
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

  // Default Template (Your Original Card Design)

  // Template Components (keeping all your existing templates)
  const TemplateInfluencer = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
      if (!canvasRef.current) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 350 / 230, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
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
        opacity: 0.6,
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
      <div className="w-full rounded-xl text-white shadow-2xl relative overflow-hidden border border-purple-500/30 bg-black min-h-[300px]">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-blue-900/40 to-pink-900/50"></div>

        <div className="relative z-10 h-full flex flex-col justify-center p-6">
          <div className="flex items-center gap-4">
            {homeCardData.showImage && (
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-2 border-gray-400/60 overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg">
                    {homeCardData.profileData.profilePicture ? (
                      <img
                        src={getProfilePictureUrl()}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-700 via-pink-600 to-cyan-600">
                        <User className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>

                  {homeCardData.profileData.socialMedias?.slice(0, 4).map(
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
                            {getSocialIcon(social.platform)}
                          </a>
                        </div>
                      )
                  )}
                </div>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium mb-2 opacity-90">
                Hey, my name is
              </p>
              <h1 className="text-xl font-bold leading-tight mb-3">
                {homeCardData.profileData.fullName || "User"}
              </h1>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-gray-300">Known for</span>
                  <span className="text-sm font-bold text-orange-400 flex-1 truncate">
                    {homeCardData.profileData.designation || "Professional"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-300" />
                  <span className="text-sm text-gray-300">Based in</span>
                  <span className="text-sm font-semibold text-purple-300 flex-1 truncate">
                    {homeCardData.profileData.city || "Location"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {homeCardData.profileData.socialMedias?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {homeCardData.profileData.socialMedias.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all border border-white/20"
                >
                  {getSocialIcon(social.platform)}
                </a>
              ))}
            </div>
          )}
        </div>
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
        antialias: true,
      });

      renderer.setSize(350, 230);
      renderer.setPixelRatio(window.devicePixelRatio);

      const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
      const material = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
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
      <div className="w-full rounded-xl text-white shadow-2xl relative overflow-hidden border border-gray-700/50 bg-gradient-to-br from-gray-900 to-black min-h-[300px]">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute top-0 left-0 w-40 h-40 bg-purple-600 rounded-full opacity-10 -translate-x-20 -translate-y-20"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-600 rounded-full opacity-10 translate-x-12 translate-y-12"></div>

        <div className="relative z-10 h-full p-6 flex items-center">
          <div className="flex items-center gap-4 w-full">
            {homeCardData.showImage && (
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full flex items-center justify-center relative overflow-hidden shadow-lg border border-purple-400/30">
                  {homeCardData.profileData.profilePicture ? (
                    <img
                      src={getProfilePictureUrl()}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600/40 to-blue-600/40">
                      <User className="w-6 h-6 text-white/80" />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="text-green-400 font-semibold text-sm mb-2 leading-tight">
                {homeCardData.profileData.designation || "Professional"} From{" "}
                {homeCardData.profileData.city || "Your City"}
              </div>

              <h1 className="text-lg font-bold text-white mb-2 leading-tight">
                {homeCardData.profileData.fullName ? (
                  <span className="text-purple-300">
                    {homeCardData.profileData.fullName}
                  </span>
                ) : (
                  <>Your name</>
                )}
              </h1>

              {homeCardData.profileData.socialMedias?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {homeCardData.profileData.socialMedias.map(
                    (social, index) =>
                      social.platform &&
                      social.url && (
                        <a
                          key={index}
                          href={social.url}
                          className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center hover:bg-gray-700 transition-all text-white border border-gray-600/50 hover:border-purple-400/50"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {getSocialIcon(social.platform)}
                        </a>
                      )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-green-400 rounded-full opacity-60"></div>
        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-60"></div>
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
        antialias: true,
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
        opacity: 0.5,
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
      <div className="w-full bg-gradient-to-br from-slate-900 to-blue-900 rounded-xl p-6 text-white shadow-2xl border border-blue-500/20 relative overflow-hidden min-h-[300px]">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        <div className="relative z-10 h-full flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            {homeCardData.showImage && (
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-xl border-2 border-blue-400/50 overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-600 shadow-xl">
                  {homeCardData.profileData.profilePicture ? (
                    <img
                      src={getProfilePictureUrl()}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white/80" />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white mb-1">
                {homeCardData.profileData.fullName || "Your Name"}
              </h1>
              <p className="text-blue-200 text-sm font-medium mb-2">
                {homeCardData.profileData.designation || "Executive Title"}
              </p>
              <p className="text-gray-300 text-xs flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {homeCardData.profileData.city || "Location"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {homeCardData.profileData.socialMedias?.map(
              (social, index) =>
                social.platform &&
                social.url && (
                  <a
                    key={index}
                    href={social.url}
                    className="w-10 h-10 bg-blue-800/40 rounded-lg flex items-center justify-center hover:bg-blue-700/50 transition-all border border-blue-600/30"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {getSocialIcon(social.platform)}
                  </a>
                )
            )}
          </div>
        </div>
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
        antialias: true,
      });

      renderer.setSize(350, 230);
      renderer.setPixelRatio(window.devicePixelRatio);

      const geometry = new THREE.TorusGeometry(1, 0.05, 16, 100);
      const material = new THREE.MeshBasicMaterial({
        color: 0xcccccc,
        transparent: true,
        opacity: 0.1,
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
      <div className="w-full bg-white rounded-xl p-8 text-gray-900 shadow-2xl border border-gray-100 relative overflow-hidden min-h-[300px]">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        <div className="relative z-10 text-center h-full flex flex-col justify-center">
          {homeCardData.showImage && (
            <div className="relative inline-block mb-6 mx-auto">
              <div className="w-24 h-24 rounded-full border-4 border-gray-200 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
                {homeCardData.profileData.profilePicture ? (
                  <img
                    src={getProfilePictureUrl()}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <User className="w-10 h-10 text-gray-600" />
                  </div>
                )}
              </div>
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {homeCardData.profileData.fullName || "Your Name"}
          </h1>
          <p className="text-blue-600 text-lg font-medium mb-2">
            {homeCardData.profileData.designation || "Professional Role"}
          </p>
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2 mb-4">
            <MapPin className="w-3 h-3" />
            {homeCardData.profileData.city || "Based in City"}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {homeCardData.profileData.socialMedias?.map(
              (social, index) =>
                social.platform &&
                social.url && (
                  <a
                    key={index}
                    href={social.url}
                    className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-all hover:scale-110 text-gray-600"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {getSocialIcon(social.platform)}
                  </a>
                )
            )}
          </div>
        </div>
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
        antialias: true,
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
        opacity: 0.7,
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
      <div className="w-full bg-[rgba(42,30,53,0.25)] rounded-xl p-8 text-white shadow-2xl relative overflow-hidden min-h-[300px]">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        <div className="relative z-10 text-center h-full flex flex-col justify-center">
          {homeCardData.showImage && (
            <div className="relative inline-block mb-6 mx-auto">
              <div className="w-28 h-28 rounded-full border-4 border-white/30 shadow-2xl overflow-hidden bg-white/20 backdrop-blur-sm">
                {homeCardData.profileData.profilePicture ? (
                  <img
                    src={getProfilePictureUrl()}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 text-white/80" />
                  </div>
                )}
              </div>
            </div>
          )}

          <h1 className="text-3xl font-black mb-2 text-white drop-shadow-lg">
            {homeCardData.profileData.fullName
              ? homeCardData.profileData.fullName.toUpperCase()
              : "YOUR NAME"}
          </h1>
          <p className="text-white/90 text-xl mb-3 font-semibold">
            {homeCardData.profileData.designation || "CREATIVE PROFESSIONAL"}
          </p>
          <p className="text-white/80 text-lg flex items-center justify-center gap-2 mb-6">
            <MapPin className="w-4 h-4" />
            {homeCardData.profileData.city || "YOUR LOCATION"}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {homeCardData.profileData.socialMedias?.map(
              (social, index) =>
                social.platform &&
                social.url && (
                  <a
                    key={index}
                    href={social.url}
                    className="w-12 h-12 bg-white/25 rounded-lg flex items-center justify-center hover:bg-white/35 transition-all hover:scale-110 backdrop-blur-sm text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {getSocialIcon(social.platform)}
                  </a>
                )
            )}
          </div>
        </div>
      </div>
    );
  };

  // TEMPLATE: GLASS
  const TemplateGlass = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
      if (!canvasRef.current || !containerRef.current) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
      });

      const updateSize = () => {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
      };

      updateSize();
      window.addEventListener("resize", updateSize);

      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 40;
      const posArray = new Float32Array(particlesCount * 3);

      for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 5;
      }

      particlesGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(posArray, 3)
      );

      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.025,
        color: 0xa855f7,
        transparent: true,
        opacity: 0.4,
      });

      const particlesMesh = new THREE.Points(
        particlesGeometry,
        particlesMaterial
      );
      scene.add(particlesMesh);

      camera.position.z = 3;

      const animate = () => {
        requestAnimationFrame(animate);
        particlesMesh.rotation.y += 0.003;
        renderer.render(scene, camera);
      };

      animate();

      return () => {
        window.removeEventListener("resize", updateSize);
        renderer.dispose();
      };
    }, []);

    return (
      <div className="w-full max-w-7xl mx-auto flex justify-center items-center px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl text-white shadow-2xl border border-white/10 relative overflow-hidden backdrop-blur-md min-h-[300px]">
        <div ref={containerRef} className="w-full max-w-5xl ">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          <div className="relative z-10 h-full flex flex-col justify-center items-center">
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 mb-6">
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
                  {homeCardData.profileData.fullName || "Your Name"}
                </h1>
                <p className="text-purple-300 text-sm sm:text-base font-medium">
                  {homeCardData.profileData.designation || "Professional"}
                </p>
              </div>
              {homeCardData.showImage && (
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-xl border-2 border-white/20 overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm flex-shrink-0">
                  {homeCardData.profileData.profilePicture ? (
                    <img
                      src={getProfilePictureUrl()}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 sm:w-10 sm:h-10 text-white/60" />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="w-full space-y-3 mb-6">
              <div className="flex items-center justify-center sm:justify-start gap-3 text-white/80">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
                <span className="text-sm sm:text-base">
                  {homeCardData.profileData.city || "Your City"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {homeCardData.profileData.socialMedias?.map(
                (social, index) =>
                  social.platform &&
                  social.url && (
                    <a
                      key={index}
                      href={social.url}
                      className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 backdrop-blur-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {getSocialIcon(social.platform)}
                    </a>
                  )
              )}
            </div>
          </div>
        </div>
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
        antialias: true,
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
        opacity: 0.6,
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
      <div className="w-full bg-gradient-to-br from-purple-900 via-black to-blue-900 rounded-xl p-8 text-white shadow-2xl border border-purple-500/30 relative overflow-hidden min-h-[300px]">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        <div className="relative z-10 text-center h-full flex flex-col justify-center">
          {homeCardData.showImage && (
            <div className="w-24 h-24 rounded-full border-4 border-purple-400/50 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm shadow-2xl">
              {homeCardData.profileData.profilePicture ? (
                <img
                  src={getProfilePictureUrl()}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center shadow-inner">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
          )}

          <h1 className="text-3xl font-black mb-3 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            {homeCardData.profileData.fullName || "YOUR NAME"}
          </h1>
          <p className="text-purple-200 text-lg font-semibold mb-2">
            {homeCardData.profileData.designation || "PROFESSIONAL TITLE"}
          </p>
          <p className="text-blue-300 text-sm flex items-center justify-center gap-2 mb-6">
            <MapPin className="w-4 h-4" />
            {homeCardData.profileData.city || "YOUR LOCATION"}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {homeCardData.profileData.socialMedias?.map(
              (social, index) =>
                social.platform &&
                social.url && (
                  <a
                    key={index}
                    href={social.url}
                    className="w-12 h-12 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-lg flex items-center justify-center hover:from-purple-500/50 hover:to-blue-500/50 transition-all hover:scale-110 border border-purple-400/30 backdrop-blur-sm shadow-lg"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {getSocialIcon(social.platform)}
                  </a>
                )
            )}
          </div>
        </div>
      </div>
    );
  };

  // TEMPLATE: CYBERPUNK
  const TemplateCyberpunk = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
      if (!canvasRef.current) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 350 / 230, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
      });

      renderer.setSize(350, 230);
      renderer.setPixelRatio(window.devicePixelRatio);

      const geometry = new THREE.PlaneGeometry(10, 10, 10, 10);
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        wireframe: true,
        transparent: true,
        opacity: 0.2,
      });

      const grid = new THREE.Mesh(geometry, material);
      grid.rotation.x = -Math.PI / 3;
      scene.add(grid);

      camera.position.z = 5;
      camera.position.y = 2;

      const animate = () => {
        requestAnimationFrame(animate);
        grid.rotation.z += 0.002;
        renderer.render(scene, camera);
      };

      animate();

      return () => {
        renderer.dispose();
      };
    }, []);

    return (
      <div className="w-full bg-black rounded-xl p-8 text-white shadow-2xl border border-cyan-400/40 relative overflow-hidden min-h-[300px]">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        <div className="relative z-10 text-center h-full flex flex-col justify-center">
          {homeCardData.showImage && (
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-cyan-400/20 transform rotate-45 rounded-lg scale-90"></div>
              <div className="absolute inset-0 bg-pink-400/20 transform -rotate-45 rounded-lg scale-90"></div>

              <div className="absolute inset-1 flex items-center justify-center overflow-hidden rounded-lg bg-gray-900 border border-cyan-400/30">
                {homeCardData.profileData.profilePicture ? (
                  <img
                    src={getProfilePictureUrl()}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500 to-pink-500">
                    <User className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>
            </div>
          )}

          <h1 className="text-2xl font-bold mb-2 text-cyan-300 uppercase tracking-wider">
            {homeCardData.profileData.fullName || "YOUR IDENTITY"}
          </h1>
          <p className="text-pink-300 text-sm font-mono mb-3 border border-pink-400/30 inline-block px-3 py-1 rounded-full">
            {homeCardData.profileData.designation || "SYSTEM_PROGRAMMER"}
          </p>
          <p className="text-gray-400 text-xs font-mono flex items-center justify-center gap-2 mb-6">
            <MapPin className="w-3 h-3" />
            {homeCardData.profileData.city || "LOCATION: UNKNOWN"}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {homeCardData.profileData.socialMedias?.map(
              (social, index) =>
                social.platform &&
                social.url && (
                  <a
                    key={index}
                    href={social.url}
                    className="w-10 h-10 bg-gray-800 border border-cyan-400/30 rounded-lg flex items-center justify-center hover:bg-cyan-400/20 hover:border-cyan-400 transition-all font-mono text-cyan-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {getSocialIcon(social.platform)}
                  </a>
                )
            )}
          </div>
        </div>
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
        antialias: true,
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
        opacity: 0.4,
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
      <div className="w-full bg-gradient-to-br from-gray-900 via-black to-yellow-900 rounded-xl p-8 text-white shadow-2xl border border-yellow-600/30 relative overflow-hidden min-h-[300px]">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute top-4 left-4 w-3 h-3 bg-yellow-400 opacity-60"></div>
        <div className="absolute top-4 right-4 w-3 h-3 bg-yellow-400 opacity-60"></div>
        <div className="absolute bottom-4 left-4 w-3 h-3 bg-yellow-400 opacity-60"></div>
        <div className="absolute bottom-4 right-4 w-3 h-3 bg-yellow-400 opacity-60"></div>

        <div className="relative z-10 text-center h-full flex flex-col justify-center">
          {homeCardData.showImage && (
            <div className="w-24 h-24 rounded-full border-2 border-yellow-500/50 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-yellow-600/10 to-yellow-400/10">
              {homeCardData.profileData.profilePicture ? (
                <img
                  src={getProfilePictureUrl()}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-16 h-16 rounded-full border border-yellow-400/30 flex items-center justify-center">
                  <User className="w-8 h-8 text-yellow-300" />
                </div>
              )}
            </div>
          )}

          <h1 className="text-2xl font-light mb-3 text-yellow-100 tracking-wide">
            {homeCardData.profileData.fullName || "Your Name"}
          </h1>
          <p className="text-yellow-300 text-lg font-medium mb-2 italic">
            {homeCardData.profileData.designation || "Executive Professional"}
          </p>
          <p className="text-yellow-400/80 text-sm flex items-center justify-center gap-2 mb-6">
            <MapPin className="w-3 h-3" />
            {homeCardData.profileData.city || "Global Presence"}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {homeCardData.profileData.socialMedias?.map(
              (social, index) =>
                social.platform &&
                social.url && (
                  <a
                    key={index}
                    href={social.url}
                    className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center hover:bg-yellow-500/30 transition-all border border-yellow-500/30 text-yellow-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {getSocialIcon(social.platform)}
                  </a>
                )
            )}
          </div>
        </div>
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
        antialias: true,
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
        opacity: 0.3,
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
      <div className="w-full bg-gray-900 rounded-xl p-8 text-white shadow-2xl border border-gray-700 relative overflow-hidden min-h-[300px]">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        <div className="relative z-10 text-center h-full flex flex-col justify-center">
          {homeCardData.showImage && (
            <div className="w-20 h-20 rounded-full border-2 border-white/10 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-700">
              {homeCardData.profileData.profilePicture ? (
                <img
                  src={getProfilePictureUrl()}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  <User className="w-6 h-6 text-white/60" />
                </div>
              )}
            </div>
          )}

          <h1 className="text-xl font-bold mb-2 text-white">
            {homeCardData.profileData.fullName || "Your Name"}
          </h1>
          <p className="text-gray-400 text-sm mb-3">
            {homeCardData.profileData.designation || "Professional"}
          </p>
          <p className="text-gray-500 text-xs flex items-center justify-center gap-2 mb-6">
            <MapPin className="w-3 h-3" />
            {homeCardData.profileData.city || "Based in City"}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {homeCardData.profileData.socialMedias?.map(
              (social, index) =>
                social.platform &&
                social.url && (
                  <a
                    key={index}
                    href={social.url}
                    className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-all text-gray-400 hover:text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {getSocialIcon(social.platform)}
                  </a>
                )
            )}
          </div>
        </div>
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
    <div className="min-h-screen w-full max-w-full flex justify-center items-center bg-gray-200 p-4 md:p-8">
      <div className="relative">
        {homeCardData?.template && homeCardData.template !== "default" ? (
          <div className="relative transform hover:scale-101 transition-transform duration-300">
            {renderTemplate()}

            {/* Navigation inside card at bottom */}
            <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 z-20">
              <Navigation />
            </div>
          </div>
        ) : (
          <div className="relative">
            <TemplateInfluencer />

            {/* Navigation inside card at bottom */}
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
