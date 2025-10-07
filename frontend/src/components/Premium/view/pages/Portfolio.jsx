import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";

const Portfolio = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Sample portfolio items data with detailed information
  const portfolioItems = [
    { 
      id: 1, 
      category: "All Research", 
      title: "AI in Cinematic Visual Effects",
      description: "Advanced research on implementing artificial intelligence in modern film production and visual effects workflows.",
      client: "Aven Ethan",
      duration: "2 months",
      budget: "$3000",
      projectType: "Heavy",
      details: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Ex cepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
      image: "images/portfolio/1.jpg"
    },
     { 
      id: 2, 
      category: "All Bot Development", 
      title: "Advanced Chatbot System",
      description: "Development of an intelligent chatbot system with natural language processing capabilities.",
      client: "Tech Solutions Inc",
      duration: "3 months",
      budget: "$5000",
      projectType: "Complex",
      details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      image: "images/portfolio/2.jpg"
    },
    { 
      id: 3, 
      category: "Portfolio", 
      title: "Creative Portfolio Design",
      description: "Modern and responsive portfolio website design with interactive elements and animations.",
      client: "Creative Studio",
      duration: "1 month",
      budget: "$2500",
      projectType: "Medium",
      details: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
      image: "images/portfolio/3.jpg"
    },
    { 
      id: 4, 
      category: "Image Generation", 
      title: "AI-Powered Art Creation",
      description: "Innovative AI-based image generation system for creating unique digital artwork.",
      client: "Art Gallery Pro",
      duration: "4 months",
      budget: "$7000",
      projectType: "Heavy",
      details: "Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
      image: "images/portfolio/4.jpg"
    },
    { 
      id: 5, 
      category: "Content Creation", 
      title: "Brand Content Strategy",
      description: "Comprehensive content creation and marketing strategy for emerging brands.",
      client: "Startup Hub",
      duration: "2 months",
      budget: "$3500",
      projectType: "Medium",
      details: "Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.",
      image: "images/portfolio/5.jpg"
    },
    { 
      id: 6, 
      category: "All Research", 
      title: "Machine Learning Analytics",
      description: "Research project focused on advanced machine learning algorithms for data analytics.",
      client: "Data Corp",
      duration: "5 months",
      budget: "$8000",
      projectType: "Heavy",
      details: "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.",
      image: "images/portfolio/6.jpg"
    },
    { 
      id: 7, 
      category: "All Bot Development", 
      title: "E-commerce Bot Assistant",
      description: "Intelligent shopping assistant bot for e-commerce platforms with recommendation engine.",
      client: "ShopSmart",
      duration: "3 months",
      budget: "$6000",
      projectType: "Complex",
      details: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.",
      image: "images/portfolio/7.jpg"
    },
    { 
      id: 8, 
      category: "Image Generation", 
      title: "Digital Art Collections",
      description: "Curated collection of AI-generated digital artworks for modern galleries and exhibitions.",
      client: "Modern Gallery",
      duration: "2 months",
      budget: "$4000",
      projectType: "Medium",
      details: "Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.",
      image: "images/portfolio/8.jpg"
    },
  ];

  const filters = [
    "All",
    "All Research",
    "All Bot Development",
    "Portfolio",
    "Image Generation",
    "Content Creation"
  ];

  // Filter portfolio items based on active filter
  const filteredItems = activeFilter === "All" 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === activeFilter);

  const openModal = (project) => {
    setSelectedProject(project);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedProject(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="min-h-screen bg-gray-200 p-4 md:p-8">
      {/* Portfolio Section */}
      <section id="portfolio" className="mt-16">
        <div className="container mx-auto px-4">
          {/* Navigation Component */}
          <div className="relative mb-16">
            <Navigation />
          </div>
          
          <div className="bg-white rounded-xl shadow">
            {/* Portfolio Content */}
            <div className="p-8">
              {/* Title - Same style as Contact */}
              <div className="pb-6 mb-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <h2 className="text-3xl font-bold relative pl-6 before:content-[''] before:absolute before:left-0 before:top-1/2 before:transform before:-translate-y-1/2 before:w-1 before:h-8 before:bg-indigo-600">
                    My Portfolio
                  </h2>
                  <p className="text-gray-600 max-w-xl text-left">
                    Explore my diverse range of projects spanning research, bot development, 
                    creative design, and innovative solutions. Each project represents my 
                    commitment to excellence and innovation.
                  </p>
                </div>
              </div>

              {/* Portfolio Filters */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      activeFilter === filter
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Portfolio Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-400 rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 relative"
                    onClick={() => openModal(item)}
                  >
                    {/* Image Container - Square aspect ratio */}
                    <div className="relative w-full aspect-square bg-gray-400 transition-colors duration-300 flex items-center justify-center">
                      {/* Placeholder for image - Always visible */}
                      <div className="text-center group-hover:opacity-0 transition-opacity duration-300">
                        <div className="text-6xl font-bold text-gray-700">
                          384X384
                        </div>
                      </div>
                      
                      {/* Hover Information Overlay */}
                      <div className="absolute inset-0 bg-green-400 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-4">
                        <div className="text-center text-white">
                          {/* Small category label */}
                          <div className="text-xs font-medium mb-2 uppercase tracking-wide">
                            {item.category}
                          </div>
                          {/* Project title */}
                          <h3 className="text-lg font-bold mb-2">
                            {item.title}
                          </h3>
                          {/* View icon */}
                          <div className="inline-flex items-center justify-center w-10 h-10 bg-white bg-opacity-30 rounded-full">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              <div className="text-center">
                <button className="bg-transparent border-2 border-green-500 text-green-500 px-8 py-3 rounded-lg font-medium hover:bg-green-500 hover:text-white transition-colors">
                  Load More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal - Completely Transparent Background */}
      {selectedProject && (
        <div className="fixed inset-0 bg-transparent z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto" onClick={closeModal}>
          <div className="bg-white rounded-2xl max-w-6xl w-full my-8 shadow-2xl transform transition-all duration-300" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <div className="flex justify-end p-6 pb-0">
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-green-500 transition-all duration-200 p-3 rounded-2xl hover:bg-green-50 transform hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Main Content */}
            <div className="px-8 pb-8">
              {/* Main Title */}
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900">
                  {selectedProject.title}
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-green-600 mx-auto mt-4 rounded-full"></div>
              </div>

              {/* Image Section */}
              <div className="bg-gray-50 rounded-2xl p-8 mb-12">
                <div className="bg-gray-200 rounded-xl h-96 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-600 mb-4">1176×654</div>
                    <div className="text-2xl font-semibold text-gray-700">{selectedProject.title}</div>
                  </div>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column - Description */}
                <div className="space-y-6">
                  <h3 className="text-3xl font-bold text-gray-900">
                    Project Overview
                  </h3>
                  <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
                    <p>
                      {selectedProject.details}
                    </p>
                    <p>
                      Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed qui perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque faudan tium, totam rem aperiam, eaque ipsa quae ab illo invenione veritatis et quasi architecto basate vitae dicta sunt explicabo.
                    </p>
                  </div>
                </div>

                {/* Right Column - Project Information */}
                <div className="space-y-8">
                  <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                    <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <span className="w-2 h-8 bg-green-500 rounded-full mr-3"></span>
                      Project Details
                    </h4>
                    
                    <div className="space-y-4">
                      {[
                        { label: "Project Type", value: selectedProject.projectType },
                        { label: "Category", value: selectedProject.category },
                        { label: "Client", value: selectedProject.client },
                        { label: "Duration", value: selectedProject.duration },
                        { label: "Budget", value: selectedProject.budget }
                      ].map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                          <span className="font-semibold text-gray-700">{item.label}</span>
                          <span className={`font-medium ${item.label === "Budget" ? "text-green-600 text-lg" : "text-gray-900"}`}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Live Demo Button */}
                    <div className="mt-8">
                      <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                        View Live Demo
                      </button>
                    </div>

                    {/* Share Section */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">Share Project:</span>
                        <div className="flex space-x-3">
                          {[
                            { bg: "bg-blue-600", hover: "hover:bg-blue-700", label: "f" },
                            { bg: "bg-gray-800", hover: "hover:bg-gray-900", label: "g" },
                            { bg: "bg-pink-600", hover: "hover:bg-pink-700", label: "h" },
                            { bg: "bg-blue-400", hover: "hover:bg-blue-500", label: "i" }
                          ].map((social, index) => (
                            <button 
                              key={index}
                              className={`w-10 h-10 ${social.bg} text-white rounded-xl flex items-center justify-center ${social.hover} transition-all duration-300 transform hover:scale-110 hover:rotate-12`}
                            >
                              <span className="text-sm font-bold">{social.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

           
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;