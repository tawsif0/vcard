import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHome,
  FiUser,
  FiFileText,
  FiBriefcase,
  FiBook,
  FiMail,
  FiChevronDown,
  FiChevronRight,
  FiChevronLeft,
  FiChevronUp,
  FiLogOut,
  FiArrowLeft,
  FiZap,
  FiSettings,
  FiMenu,
  FiX,
} from "react-icons/fi";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import AuthContext from "../../../../context/AuthContext";

const Sidebar = ({
  activeView,
  setActiveView,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  // Close sidebar on mobile when clicking outside or selecting item
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, []);

  const navItems = [
    {
      name: "Home",
      icon: <FiHome />,
      children: [
        { name: "Dashboard", component: "DashboardHome" },
        { name: "Home Card", component: "homeCard" },
      ],
    },
    {
      name: "About",
      icon: <FiUser />,
      children: [
        { name: "About Me", component: "aboutMe" },
        { name: "Services", component: "services" },
        { name: "Testimonials", component: "testimonials" },
        { name: "Pricing Plan", component: "pricing" },
        { name: "Brand & Clients", component: "clients" },
        { name: "About Page", component: "aboutPage" },
      ],
    },
    {
      name: "Resume",
      icon: <FiFileText />,
      children: [
        { name: "Work Experience", component: "workExperience" },
        { name: "My Skills", component: "mySkills" },
        { name: "Award & Achievements", component: "awards" },
        { name: "More About Me", component: "moreAboutMe" },
        { name: "References", component: "reference" },
        { name: "Resume Page", component: "resumePage" },
      ],
    },
    {
      name: "Portfolio",
      icon: <FiBriefcase />,
      children: [{ name: "Portfolio", component: "portfolio" }],
    },
    {
      name: "Blog",
      icon: <FiBook />,
      children: [
        { name: "Blog Category", component: "blogCategory" },
        { name: "Modify Blog Category", component: "modifyBlogCategory" },
        { name: "Blog Create", component: "blogCreate" },
        { name: "Modify Blog", component: "modifyBlog" },
        { name: "Blog Page", component: "blogPage" },
      ],
    },
    {
      name: "Contact",
      icon: <FiMail />,
      children: [
        { name: "Contact", component: "contact" },
        { name: "Contacted Users", component: "contactedUsers" },
      ],
    },
    {
      name: "Profile Settings",
      icon: <FiSettings />,
      component: "profileSettings",
    },
  ];

  const toggleMenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      if (isOpen) {
        setExpandedMenus({});
      }
      setIsOpen(!isOpen);
    }
  };

  const handleItemClick = (item) => {
    if (item.children) {
      toggleMenu(item.name);
    } else {
      setActiveView(item.component);
      if (window.innerWidth < 768) {
        setIsMobileOpen(false);
      }
    }
  };

  const handleChildItemClick = (component) => {
    setActiveView(component);
    if (window.innerWidth < 768) {
      setIsMobileOpen(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    toast.success("Logout successful!");
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 800);
  };

  // Determine sidebar state based on screen size and mobile toggle
  const sidebarOpen = window.innerWidth < 768 ? isMobileOpen : isOpen;

  return (
    <>
      {/* Mobile Overlay */}
      {window.innerWidth < 768 && isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: window.innerWidth < 768 ? (isMobileOpen ? 0 : -300) : 0,
          width: window.innerWidth < 768 ? 256 : isOpen ? 256 : 80,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`bg-gradient-to-b from-gray-900 to-gray-800 h-full flex flex-col border-r border-gray-700 shadow-xl overflow-hidden fixed md:relative z-50 ${
          window.innerWidth < 768 ? "w-64" : ""
        }`}
      >
        {/* Header */}
        <div
          className="cursor-pointer flex items-center justify-between p-3 ml-2 border-b border-gray-700 h-16"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleToggleSidebar}
        >
          {sidebarOpen ? (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <h1 className="text-xl font-bold text-white">Premium User</h1>
              <p className="text-xs text-gray-400">Dashboard</p>
            </motion.div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-md">
              <FiZap className="w-4 h-4" />
            </div>
          )}

          {window.innerWidth < 768 ? (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="cursor-pointer rounded-lg text-gray-300 hover:text-white transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          ) : (
            <motion.button
              whileHover={{}}
              animate={{
                x: isHovered ? (isOpen ? -4 : 4) : 0,
                scale: isHovered ? 1.2 : 1,
              }}
              transition={{ type: "spring", stiffness: 300 }}
              className="cursor-pointer rounded-lg text-gray-300 transition-colors"
            >
              {isOpen ? <FiChevronLeft /> : <FiChevronRight />}
            </motion.button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-4">
          <ul className="space-y-2">
            {navItems
              .filter(
                (item) =>
                  !(window.innerWidth < 768 && item.name === "Profile Settings")
              )
              .map((item) => (
                <li key={item.name}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleItemClick(item)}
                    className={`flex items-center w-full p-4 rounded-xl transition-all ${
                      sidebarOpen
                        ? "justify-between px-4"
                        : "justify-center px-0"
                    } ${
                      activeView === item.component
                        ? "bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border border-purple-500/30 font-medium shadow-sm"
                        : expandedMenus[item.name]
                        ? "bg-gray-700 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    <div
                      className={`flex items-center ${
                        sidebarOpen ? "space-x-3" : ""
                      }`}
                    >
                      <span className="w-5 h-5 flex items-center justify-center">
                        {item.icon}
                      </span>
                      {sidebarOpen && (
                        <span className="capitalize font-medium text-sm md:text-base">
                          {item.name}
                        </span>
                      )}
                    </div>

                    {sidebarOpen &&
                      item.children &&
                      (expandedMenus[item.name] ? (
                        <FiChevronUp className="w-4 h-4" />
                      ) : (
                        <FiChevronDown className="w-4 h-4" />
                      ))}
                  </motion.button>

                  <AnimatePresence>
                    {expandedMenus[item.name] &&
                      sidebarOpen &&
                      item.children && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden ml-6 border-l border-gray-600 pl-3 mt-2"
                        >
                          {item.children.map((child, index) => (
                            <motion.li
                              key={child.name}
                              whileHover={{ x: -2 }}
                              className="mb-1"
                            >
                              <button
                                onClick={() =>
                                  handleChildItemClick(child.component)
                                }
                                className={`text-sm py-2.5 px-4 w-full text-left rounded-lg transition-colors ${
                                  activeView === child.component
                                    ? "bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border border-purple-500/30 font-medium shadow-sm"
                                    : "text-gray-400 hover:bg-gray-700 hover:text-white"
                                } ${index === 0 ? "rounded-t-lg" : ""} ${
                                  index === item.children.length - 1
                                    ? "rounded-b-lg"
                                    : ""
                                }`}
                              >
                                {child.name}
                              </button>
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}
                  </AnimatePresence>
                </li>
              ))}
          </ul>

          {/* Premium Status */}
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 mx-2 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-yellow-400 text-sm font-semibold">
                  PREMIUM
                </span>
              </div>
              <p className="text-gray-300 text-sm">
                Full access to all features
              </p>
            </motion.div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <motion.div
            className="flex items-center"
            whileHover={sidebarOpen ? { scale: 1.005 } : {}}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white flex items-center justify-center font-bold shadow-md">
              <FiZap className="w-5 h-5" />
            </div>

            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 min-w-0 ml-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-[700] text-white truncate">
                    {user?.name || "User Name"}
                  </p>
                  <div className="flex gap-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      className="p-1 rounded-md hover:bg-gray-700 cursor-pointer transition-colors"
                      title="Logout"
                    >
                      <FiLogOut className="w-4 h-4 text-gray-400 hover:text-red-400" />
                    </motion.button>
                  </div>
                </div>
                <p className="text-xs text-gray-400 font-[600] truncate mt-0.5">
                  {user?.email || "Premium User"}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.aside>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden w-full max-w-md"
            >
              <div className="p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500 mb-4">
                  <FiLogOut className="h-5 w-5 text-white" />
                </div>

                <h3 className="text-lg font-medium text-white mb-2">
                  Ready to leave?
                </h3>
                <p className="text-sm text-gray-300 mb-6">
                  Are you sure you want to sign out of your premium account?
                </p>

                <div className="flex justify-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowLogoutConfirm(false)}
                    className="px-5 py-2.5 text-sm font-medium rounded-lg cursor-pointer bg-gray-600 text-white hover:bg-gray-700 transition-all shadow-sm"
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmLogout}
                    className="px-5 py-2.5 text-sm font-medium rounded-lg bg-red-600 cursor-pointer text-white hover:bg-red-700 transition-all shadow-sm"
                  >
                    Logout
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
