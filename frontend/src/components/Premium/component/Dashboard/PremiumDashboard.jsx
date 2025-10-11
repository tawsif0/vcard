import React, { useState, useEffect } from "react";
import { FiMenu, FiZap, FiUser, FiSettings } from "react-icons/fi";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
//Premium Components
import Sidebar from "../sidebar/Sidebar";
// About Components
import AboutMe from "../sidebar/About/AboutMe";
import Services from "../sidebar/About/Services";
import Testimonials from "../sidebar/About/Testimonials";
import PricingPlan from "../sidebar/About/PricingPlan";
import BrandAndClient from "../sidebar/About/BrandAndClient";
//Resume Components
import AwardAndAchievements from "../sidebar/Resume/AwardAndAchievements";
import Reference from "../sidebar/Resume/Reference";
import MoreAboutMe from "../sidebar/Resume/MoreAboutMe";
import MySkills from "../sidebar/Resume/MySkills";
import WorkExperience from "../sidebar/Resume/WorkExperience";

import Contact from "../sidebar/Contact/Contact";
//Portfolio Components
import Portfolio from "../sidebar/Portfolio/Portfolio";

import PortfolioCategory from "../sidebar/Portfolio/PortfolioCategory";
import CreatePortfolio from "../sidebar/Portfolio/CreatePortfolio";

import DashboardHome from "../sidebar/Home/DashboardHome";
import HomeCard from "../sidebar/Home/HomeCard";
import AboutPage from "../sidebar/About/AboutPage";
import ResumePage from "../sidebar/Resume/ResumePage";
import ContactedUser from "../sidebar/Contact/ContactedUser";
import PremiumSettings from "../sidebar/PremiumSettings";
//Blog Components
import BlogCategory from "../sidebar/Blog/BlogCategory";
import ModifyBlogCategory from "../sidebar/Blog/ModifyBlogCategory";
import BlogCreate from "../sidebar/Blog/BlogCreate";
import ModifyBlog from "../sidebar/Blog/ModifyBlog";

import BlogPage from "../sidebar/Blog/BlogPage";

import ProfileShare from "../sidebar/ProfileShare";

import Education from "../sidebar/Resume/Education";

const PremiumDashboard = () => {
  const [activeView, setActiveView] = useState(() => {
    const savedView = localStorage.getItem("premiumActiveView");
    try {
      return savedView ? JSON.parse(savedView) : "DashboardHome";
    } catch {
      return "DashboardHome";
    }
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Update localStorage whenever activeView changes
  useEffect(() => {
    if (typeof activeView === "string") {
      localStorage.setItem("premiumActiveView", JSON.stringify(activeView));
    } else {
      localStorage.setItem("premiumActiveView", JSON.stringify(activeView));
    }
  }, [activeView]);

  const renderView = () => {
    const currentView =
      typeof activeView === "object" ? activeView.view : activeView;

    switch (currentView) {
      // Dashboard Home
      case "DashboardHome":
        return <DashboardHome />;
      case "homeCard":
        return <HomeCard />;
      // About Section
      case "aboutMe":
        return <AboutMe />;
      case "services":
        return <Services />;
      case "testimonials":
        return <Testimonials />;
      case "pricing":
        return <PricingPlan />;
      case "clients":
        return <BrandAndClient />;
      case "aboutPage":
        return <AboutPage />;
      // Resume Section
      case "workExperience":
        return <WorkExperience />;
      case "education":
        return <Education />;
      case "mySkills":
        return <MySkills />;
      case "awards":
        return <AwardAndAchievements />;
      case "moreAboutMe":
        return <MoreAboutMe />;
      case "reference":
        return <Reference />;
      case "resumePage":
        return <ResumePage />;
      // Portfolio Section
      case "portfolio":
        return <Portfolio />;
      case "portfolioCategory":
        return <PortfolioCategory />;
      case "createPortfolio":
        return <CreatePortfolio />;
      // Blog Section
      case "blogCategory":
        return <BlogCategory />;
      case "modifyBlogCategory":
        return <ModifyBlogCategory />;
      case "blogCreate":
        return <BlogCreate />;
      case "modifyBlog":
        return <ModifyBlog />;
      case "blogPage":
        return <BlogPage />;
      // Contact Section
      case "contact":
        return <Contact />;
      case "contactedUsers":
        return <ContactedUser />;
      case "profileSettings":
        return <PremiumSettings />;
      case "profileShare":
        return <ProfileShare />;

      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen flex items-center justify-center p-2 md:p-4 relative">
      {/* Mobile Header */}
      {isMobile && (
        <div
          className="fixed top-0 left-0 right-0 h-16 
    bg-gradient-to-r from-gray-900/80 via-gray-800/70 to-gray-900/80 
    backdrop-blur-xl border-b border-gray-700/60 
    flex items-center justify-between px-4 z-50 md:hidden 
    shadow-[0_8px_20px_rgba(0,0,0,0.5)] animate-slideDown"
        >
          {/* Left: Menu Button */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-2xl text-gray-300 
      hover:text-white hover:bg-gray-700/60 
      transition-all duration-300 shadow-md active:scale-90 
      border border-gray-600/50 hover:border-purple-500/40"
          >
            <FiMenu className="w-6 h-6" />
          </button>

          {/* Center: Brand */}
          <div className="flex items-center space-x-3">
            <div
              className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500
        text-white flex items-center justify-center font-bold shadow-lg"
            >
              {/* Glow ring */}
              <span
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 
        opacity-40 blur-md animate-pulse"
              ></span>
              <FiZap className="w-5 h-5 relative z-10 drop-shadow-md" />
            </div>
            <span
              className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 
      font-extrabold text-xl tracking-wide drop-shadow-sm animate-gradientText"
            >
              Dashboard
            </span>
          </div>

          {/* Right: Profile / Settings */}
          <motion.button
            whileHover={{ scale: 1.08, rotate: 3 }}
            whileTap={{ scale: 0.9, rotate: -3 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            onClick={() => setActiveView("profileSettings")}
            className="w-10 h-10 rounded-2xl 
  bg-gray-700/60 backdrop-blur-md 
  flex items-center justify-center 
  text-gray-300 shadow-md 
  border border-gray-600/40 
  transition-colors duration-300"
          >
            <FiSettings className="w-5 h-5 text-white drop-shadow-sm" />
          </motion.button>
        </div>
      )}

      {/* Content - Maintains original PC design structure */}
      <div
        className={`flex w-full bg-[#020617] rounded-3xl md:rounded-3xl shadow-2xl overflow-hidden border border-gray-700 relative ${
          isMobile ? "mt-16 mb-2 h-[calc(100vh-5rem)]" : "h-[95vh]"
        } `}
      >
        {/* Sidebar */}
        <div className={isMobile ? "fixed inset-y-0 left-0 z-50" : "relative"}>
          <Sidebar
            activeView={activeView}
            setActiveView={setActiveView}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
          />
        </div>

        {/* Main Content Area - Exactly like original PC version */}
        <div className="flex-1 h-full overflow-auto p-4 md:p-4 relative">
          {/* Animated blobs - Same as original */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full opacity-10 animate-pulse"
                style={{
                  width: `${Math.random() * 200 + 100}px`,
                  height: `${Math.random() * 200 + 100}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  background: "linear-gradient(145deg, #a855f7, #6366f1)",
                  animationDuration: `${Math.random() * 10 + 15}s`,
                  animationDelay: `${i * 2}s`
                }}
              />
            ))}
          </div>
          {/* Rendered view content */}
          <div className="relative z-10">{renderView()}</div>
        </div>
      </div>

      {/* Overlay Design - Same as original */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle 500px at 50% 100px, rgba(168,85,247,0.25), transparent)`
        }}
      />
    </div>
  );
};

export default PremiumDashboard;
