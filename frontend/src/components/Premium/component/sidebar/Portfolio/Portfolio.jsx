import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FiFolder, 
  FiEye, 
  FiX, 
  FiExternalLink, 
  FiCalendar,
  FiUser,
  FiDollarSign,
  FiCode,
  FiShare2,
  FiPlus
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const Portfolio = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const [portfolioData, setPortfolioData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(9);

  // Fetch portfolio data on component mount
  useEffect(() => {
    fetchPortfolioData();
    fetchAllCategories();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/portfolio", {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch portfolio data");

      const data = await response.json();
      console.log("Portfolio API Response:", data);
      
      setPortfolioData(data.projects || []);
      
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
      toast.error("Failed to load portfolio data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/portfolio/categories", {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch categories");

      const data = await response.json();
      const allCategories = ["All", ...(data.categories?.map(cat => cat.name) || [])];
      setCategories(allCategories);
      
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories(["All"]);
    }
  };

  // Function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return `http://localhost:5000${imagePath}`;
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  // Filter portfolio items based on active filter
  const filteredItems = activeFilter === "All" 
    ? portfolioData 
    : portfolioData.filter(item => item.category === activeFilter);

  // Calculate pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredItems.slice(0, indexOfLastProject);
  const totalPages = Math.ceil(filteredItems.length / projectsPerPage);
  const hasMoreProjects = currentProjects.length < filteredItems.length;

  // Load more function
  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  const openModal = (project) => {
    setSelectedProject(project);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedProject(null);
    document.body.style.overflow = 'auto';
  };

  // Function to parse formatted text for description
  const parseFormattedText = (text) => {
    if (!text) return null;
    
    return text.split("\n").map((line, index) => {
      if (line.trim().startsWith("•")) {
        return (
          <div key={index} className="flex items-start mb-2">
            <span className="mr-3 text-purple-400 mt-1 flex-shrink-0">•</span>
            <span className="text-gray-300">{line.replace("•", "").trim()}</span>
          </div>
        );
      }

      let formattedLine = line;
      formattedLine = formattedLine.replace(
        /\*\*(.*?)\*\*/g,
        "<strong class='text-white font-semibold'>$1</strong>"
      );
      formattedLine = formattedLine.replace(
        /\*(.*?)\*/g,
        "<em class='text-gray-300 italic'>$1</em>"
      );
      formattedLine = formattedLine.replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline hover:text-blue-300 transition-colors">$1</a>'
      );
      formattedLine = formattedLine.replace(
        /`(.*?)`/g,
        '<code class="bg-gray-700 px-1 py-0.5 rounded text-cyan-300 font-mono text-sm">$1</code>'
      );

      return (
        <p
          key={index}
          className="text-gray-300 leading-relaxed text-sm mb-3"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Check if any projects exist
  const hasProjects = portfolioData.length > 0;
  const hasFilteredProjects = filteredItems.length > 0;

  // Count projects for each category
  const getProjectCount = (category) => {
    if (category === "All") return portfolioData.length;
    return portfolioData.filter(item => item.category === category).length;
  };

  return (
    <div className="min-h-screen w-full px-4 sm:px-4 lg:px-2 relative overflow-visible">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-5 bg-purple-500"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: i * 2,
            }}
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-4">
            My Portfolio
          </h1>
          <p className="text-gray-400 text-lg">
            A showcase of my creative projects and professional work
          </p>
        </motion.div>

        {/* Portfolio Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 mr-4">
                <FiFolder className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Projects</h2>
            </div>
            <div className="text-gray-400">
              {filteredItems.length} project{filteredItems.length !== 1 ? 's' : ''}
              {hasFilteredProjects && ` (showing ${currentProjects.length})`}
            </div>
          </div>

          {/* Portfolio Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {categories.map((filter) => {
              const projectCount = getProjectCount(filter);
              
              return (
                <motion.button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeFilter === filter
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700"
                  }`}
                >
                  {filter}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeFilter === filter 
                      ? "bg-white/20 text-white" 
                      : "bg-gray-700 text-gray-300"
                  }`}>
                    {projectCount}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Portfolio Grid */}
          {hasFilteredProjects ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {currentProjects.map((project, index) => (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-transparent backdrop-blur-lg rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 border border-gray-700 hover:border-purple-500/50"
                    onClick={() => openModal(project)}
                  >
                    {/* Image Container - Smaller height */}
                    <div className="relative w-full aspect-[4/3] bg-gray-700 transition-colors duration-300 flex items-center justify-center overflow-hidden">
                      {/* Project Image or Placeholder */}
                      {project.image ? (
                        <img
                          src={getImageUrl(project.image)}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            console.log("Project image failed to load:", e.target.src);
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                          onLoad={(e) => {
                            console.log("Project image loaded successfully:", e.target.src);
                          }}
                        />
                      ) : null}
                      
                      {/* Placeholder when no image */}
                      <div className={`text-center ${project.image ? 'hidden' : 'flex'} flex-col items-center justify-center w-full h-full`}>
                        <div className="text-2xl font-bold text-gray-500 mb-1">
                          {project.title?.charAt(0) || 'P'}
                        </div>
                        <div className="text-xs text-gray-400">No Image</div>
                      </div>
                      
                      {/* Hover Information Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end p-3">
                        <div className="text-center text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          {/* Small category label */}
                          <div className="text-xs font-medium mb-1 uppercase tracking-wide text-purple-300">
                            {project.category}
                          </div>
                          {/* Project title */}
                          <h3 className="text-sm font-bold mb-2 line-clamp-2">
                            {project.title || "Untitled Project"}
                          </h3>
                          {/* View icon */}
                          <div className="inline-flex items-center justify-center w-8 h-8 bg-purple-600 rounded-full">
                            <FiEye className="w-3 h-3" />
                          </div>
                        </div>
                      </div>

                      {/* Project Type Badge */}
                      {project.projectType && (
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs border border-blue-500/30">
                            {project.projectType}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Below Image - Reduced padding */}
                    <div className="p-3">
                      <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">
                        {project.title || "Untitled Project"}
                      </h3>
                      <p className="text-gray-400 text-xs line-clamp-2">
                        {project.description || "No description available."}
                      </p>
                      
                      {/* Technologies Preview */}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {project.technologies.slice(0, 2).map((tech, index) => (
                            <span
                              key={index}
                              className="px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded text-xs border border-gray-600"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 2 && (
                            <span className="px-1.5 py-0.5 bg-gray-700 text-gray-400 rounded text-xs border border-gray-600">
                              +{project.technologies.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMoreProjects && (
                <div className="text-center">
                  <motion.button
                    onClick={loadMore}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-transparent border-2 border-purple-500 text-purple-400 px-8 py-3 rounded-xl font-medium hover:bg-purple-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
                  >
                    <FiPlus className="w-4 h-4" />
                    Load More ({filteredItems.length - currentProjects.length} remaining)
                  </motion.button>
                </div>
              )}
            </>
          ) : (
            // No projects in selected filter
            <div className="text-center py-12 text-gray-400">
              <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiFolder className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-lg mb-2">No projects found</p>
              <p className="text-sm">
                {`No projects found in the "${activeFilter}" category.`}
              </p>
            </div>
          )}
        </motion.section>
      </div>

      {/* Modal - Project Details */}
      {selectedProject && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto"
          onClick={closeModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-2xl max-w-6xl w-full my-8 shadow-2xl border border-purple-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="flex justify-end p-6 pb-0">
              <motion.button 
                onClick={closeModal}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-gray-400 hover:text-purple-400 transition-all duration-200 p-3 rounded-2xl hover:bg-purple-500/10"
              >
                <FiX className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Main Content */}
            <div className="px-8 pb-8">
              {/* Main Title */}
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white">
                  {selectedProject.title || "Untitled Project"}
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto mt-4 rounded-full"></div>
              </div>

              {/* Image Section */}
              <div className="bg-gray-800/50 rounded-2xl p-8 mb-12 border border-gray-700/50">
                {selectedProject.image ? (
                  <div className="bg-gray-700 rounded-xl h-96 flex items-center justify-center overflow-hidden">
                    <img
                      src={getImageUrl(selectedProject.image)}
                      alt={selectedProject.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden text-center text-gray-400">
                      <div className="text-5xl font-bold mb-4">Image Not Available</div>
                      <div className="text-2xl font-semibold">{selectedProject.title}</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded-xl h-96 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <div className="text-5xl font-bold mb-4">1176×654</div>
                      <div className="text-2xl font-semibold">{selectedProject.title}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column - Description */}
                <div className="space-y-6">
                  <h3 className="text-3xl font-bold text-white">
                    Project Overview
                  </h3>
                  <div className="prose prose-invert max-w-none">
                    {parseFormattedText(selectedProject.description) || (
                      <p className="text-gray-400 italic">
                        No project description provided. This project showcases innovative solutions and cutting-edge technology implementation.
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column - Project Information */}
                <div className="space-y-8">
                  <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50">
                    <h4 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <span className="w-2 h-8 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full mr-3"></span>
                      Project Details
                    </h4>
                    
                    <div className="space-y-4">
                      {[
                        { icon: FiFolder, label: "Project Type", value: selectedProject.projectType || "Not specified" },
                        { icon: FiFolder, label: "Category", value: selectedProject.category || "Uncategorized" },
                        { icon: FiUser, label: "Client", value: selectedProject.client || "Not specified" },
                        { icon: FiCalendar, label: "Duration", value: selectedProject.duration || "Not specified" },
                        { icon: FiDollarSign, label: "Budget", value: selectedProject.budget || "Not specified" }
                      ].map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-3 border-b border-gray-700 last:border-b-0">
                          <div className="flex items-center text-gray-300">
                            <item.icon className="w-4 h-4 mr-2 text-purple-400" />
                            <span className="font-semibold">{item.label}</span>
                          </div>
                          <span className={`font-medium ${item.label === "Budget" ? "text-green-400 text-lg" : "text-white"}`}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Technologies Section */}
                    {selectedProject.technologies && selectedProject.technologies.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-700">
                        <h5 className="text-lg font-semibold text-white mb-3 flex items-center">
                          <FiCode className="w-5 h-5 mr-2 text-purple-400" />
                          Technologies Used
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.technologies.map((tech, index) => (
                            <span
                              key={index}
                              className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm border border-gray-600"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Live Demo Button */}
                    <div className="mt-8">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <FiExternalLink className="w-5 h-5" />
                        View Live Demo
                      </motion.button>
                    </div>

                    {/* Share Section */}
                    <div className="mt-8 pt-6 border-t border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-300 flex items-center gap-2">
                          <FiShare2 className="w-4 h-4" />
                          Share Project:
                        </span>
                        <div className="flex space-x-3">
                          {[
                            { bg: "bg-blue-600", hover: "hover:bg-blue-700", label: "f" },
                            { bg: "bg-gray-700", hover: "hover:bg-gray-600", label: "g" },
                            { bg: "bg-pink-600", hover: "hover:bg-pink-700", label: "h" },
                            { bg: "bg-blue-400", hover: "hover:bg-blue-500", label: "i" }
                          ].map((social, index) => (
                            <motion.button 
                              key={index}
                              whileHover={{ scale: 1.1, rotate: 12 }}
                              whileTap={{ scale: 0.9 }}
                              className={`w-10 h-10 ${social.bg} text-white rounded-xl flex items-center justify-center ${social.hover} transition-all duration-300`}
                            >
                              <span className="text-sm font-bold">{social.label}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Portfolio;