import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FiBriefcase, 
  FiAward, 
  FiUser, 
  FiStar, 
  FiBookOpen,
  FiCalendar,
  FiMapPin,
  FiMail,
  FiPhone,
  FiExternalLink,
  FiUsers,
  FiBriefcase as FiWork,
  FiBook
} from "react-icons/fi";

const ResumePage = () => {
  const [workExperiences, setWorkExperiences] = useState([]);
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [awards, setAwards] = useState([]);
  const [aboutCategories, setAboutCategories] = useState([]);
  const [references, setReferences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchWorkExperiences(),
          fetchEducation(),
          fetchSkills(),
          fetchAwards(),
          fetchAboutCategories(),
          fetchReferences()
        ]);
      } catch (error) {
        console.error("Error fetching resume data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Your existing API functions
  const fetchWorkExperiences = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/resume/work-experiences", {
        headers: { "x-auth-token": token },
      });
      if (!response.ok) throw new Error("Failed to fetch experiences");
      const data = await response.json();
      console.log("Work Experiences API Response:", data); // Debug log
      setWorkExperiences(data.workExperiences || []);
    } catch (error) {
      console.error("Error fetching work experiences:", error);
    }
  };

  // Fetch Education
  const fetchEducation = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/resume/education", {
        headers: { "x-auth-token": token },
      });
      if (!response.ok) throw new Error("Failed to fetch education");
      const data = await response.json();
      console.log("Education API Response:", data); // Debug log
      setEducation(data.education || []);
    } catch (error) {
      console.error("Error fetching education:", error);
    }
  };

  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/resume/skills", {
        headers: { "x-auth-token": token },
      });
      
      if (!response.ok) throw new Error("Failed to fetch skills");
      
      const data = await response.json();
      console.log("Skills API Response:", data); // Debug log
      
      // Handle different possible response structures
      if (data.skills && Array.isArray(data.skills)) {
        setSkills(data.skills);
      } else if (Array.isArray(data)) {
        setSkills(data);
      } else {
        setSkills([]);
      }
    } catch (error) {
      console.error("Error fetching skills:", error);
      setSkills([]);
    }
  };

  // Function to get skill level label
  const getSkillLevelLabel = (level) => {
    if (level >= 90) return "Expert";
    if (level >= 80) return "Advanced";
    if (level >= 70) return "Intermediate";
    if (level >= 60) return "Beginner";
    return "Novice";
  };

  const fetchAwards = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/resume/awards", {
        headers: { "x-auth-token": token },
      });
      if (!response.ok) throw new Error("Failed to fetch awards");
      const data = await response.json();
      console.log("Awards API Response:", data); // Debug log
      setAwards(data.awards || []);
    } catch (error) {
      console.error("Error fetching awards:", error);
    }
  };

  const fetchAboutCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/resume/about-categories", {
        headers: { "x-auth-token": token },
      });
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setAboutCategories(data.aboutCategories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchReferences = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/resume/references", {
        headers: { "x-auth-token": token },
      });
      if (!response.ok) throw new Error("Failed to fetch references");
      const data = await response.json();
      setReferences(data.references || []);
    } catch (error) {
      console.error("Error fetching references:", error);
    }
  };

  // Function to get full image URL - IMPROVED
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    console.log("Original image path:", imagePath); // Debug log
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    // If it's a relative path starting with /, construct the full URL
    if (imagePath.startsWith('/')) return `http://localhost:5000${imagePath}`;
    // If it's just a filename without path, construct the path
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  // Format date function - UPDATED for awards year
  const formatDate = (dateString) => {
    if (!dateString) return "Present";
    
    // If it's just a year (like "2025"), return as is
    if (/^\d{4}$/.test(dateString)) {
      return dateString;
    }
    
    // If it's a full date string, format it
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
      });
    } catch (error) {
      // If date parsing fails, return the original string
      return dateString;
    }
  };

  // Function to get skill level color
  const getSkillColor = (level) => {
    if (level >= 80) return "from-green-400 to-emerald-600";
    if (level >= 60) return "from-blue-400 to-cyan-600";
    if (level >= 40) return "from-yellow-400 to-orange-600";
    return "from-red-400 to-pink-600";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Check if any section has data - IMPROVED SKILLS CHECK
  const hasWorkExperiences = workExperiences.length > 0;
  const hasEducation = education.length > 0;
  const hasSkills = skills && skills.length > 0;
  const hasAwards = awards.length > 0;
  const hasAboutCategories = aboutCategories.length > 0;
  const hasReferences = references.length > 0;

  console.log("Work Experiences:", workExperiences); // Debug log
  console.log("Education:", education); // Debug log
  console.log("Awards:", awards); // Debug log
  console.log("References:", references); // Debug log

  // If no data at all
  if (!hasWorkExperiences && !hasEducation && !hasSkills && !hasAwards && !hasAboutCategories && !hasReferences) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <FiUser className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">No Resume Data Yet</h2>
          <p>Add some information to your resume to see it here!</p>
        </div>
      </div>
    );
  }

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

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-4">
            Professional Resume
          </h1>
          <p className="text-gray-400 text-lg">
            A comprehensive overview of my professional journey
          </p>
        </motion.div>

        {/* Work Experience Section - Only show if has data */}
        {hasWorkExperiences && (
          <motion.section
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center mb-8">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 mr-4">
                <FiBriefcase className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Work Experience</h2>
            </div>

            <div className="grid gap-6">
              {workExperiences.map((experience, index) => (
                <motion.div
                  key={experience._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {experience.title || experience.role}
                      </h3>
                      <p className="text-purple-400 font-medium mb-1">
                        {experience.company}
                      </p>
                      <div className="flex items-center text-gray-400 text-sm flex-wrap gap-2">
                        <div className="flex items-center">
                          <FiCalendar className="w-4 h-4 mr-1" />
                          {formatDate(experience.startDate)} - {formatDate(experience.endDate)}
                        </div>
                        {experience.location && (
                          <div className="flex items-center">
                            <FiMapPin className="w-4 h-4 mr-1" />
                            {experience.location}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Work Experience Image - Check multiple field names */}
                    {(experience.image || experience.logo || experience.companyLogo) && (
                      <div className="mt-4 md:mt-0">
                        <img
                          src={getImageUrl(experience.image || experience.logo || experience.companyLogo)}
                          alt={experience.company}
                          className="w-16 h-16 rounded-lg object-cover border-2 border-purple-500/50"
                          onError={(e) => {
                            console.log("Work experience image failed to load:", e.target.src);
                            e.target.style.display = 'none';
                          }}
                          onLoad={(e) => {
                            console.log("Work experience image loaded successfully:", e.target.src);
                          }}
                        />
                      </div>
                    )}
                  </div>
                  {experience.description && (
                    <p className="text-gray-300 leading-relaxed">
                      {experience.description}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Education Section - Added under Work Experience */}
        {hasEducation && (
          <motion.section
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <div className="flex items-center mb-8">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 mr-4">
                <FiBook className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Education</h2>
            </div>

            <div className="grid gap-6">
              {education.map((edu, index) => (
                <motion.div
                  key={edu._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {edu.degree || "Degree Name"}
                      </h3>
                      <p className="text-blue-400 font-medium mb-1">
                        {edu.university || "University Name"}
                      </p>
                      <div className="flex items-center text-gray-400 text-sm flex-wrap gap-2">
                        <div className="flex items-center">
                          <FiCalendar className="w-4 h-4 mr-1" />
                          {formatDate(edu.startDate)} - {edu.current ? "Present" : formatDate(edu.endDate)}
                        </div>
                        {edu.location && (
                          <div className="flex items-center">
                            <FiMapPin className="w-4 h-4 mr-1" />
                            {edu.location}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Education Logo */}
                    {edu.logo && (
                      <div className="mt-4 md:mt-0">
                        <img
                          src={getImageUrl(edu.logo)}
                          alt={edu.university || "Institution"}
                          className="w-16 h-16 rounded-lg object-cover border-2 border-blue-500/50"
                          onError={(e) => {
                            console.log("Education logo failed to load:", e.target.src);
                            e.target.style.display = 'none';
                          }}
                          onLoad={(e) => {
                            console.log("Education logo loaded successfully:", e.target.src);
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Description - Handle HTML content from TinyMCE */}
                  {edu.desc && (
                    <div className="mt-4">
                      <div className="text-gray-300 leading-relaxed">
                        <div
                          dangerouslySetInnerHTML={{ __html: edu.desc }}
                          className="education-description"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Fallback if no description */}
                  {!edu.desc && (
                    <p className="text-gray-400 italic">
                      No description provided. Add your coursework, achievements, and learning experiences.
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Skills Section - Only show if has data */}
        {hasSkills && (
          <motion.section
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center mb-8">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 mr-4">
                <FiStar className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">My Skills</h2>
            </div>

            <div className="space-y-8">
              {skills.map((category, index) => (
                <motion.div
                  key={category._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 hover:border-green-500/50 transition-all duration-300"
                >
                  {/* Category Header */}
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-4">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {category.category || category.name || "Skills Category"}
                      </h3>
                      {category.description && (
                        <p className="text-gray-400 text-sm mt-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.items && category.items.map((skill, skillIndex) => (
                      <motion.div
                        key={skill._id || skillIndex}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 + skillIndex * 0.05 }}
                        className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-4 border border-gray-600 hover:border-green-500/50 transition-all duration-300 group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-md font-semibold text-white group-hover:text-green-400 transition-colors">
                            {skill.name || skill.title || 'Skill'}
                          </h4>
                          {skill.image && (
                            <img
                              src={getImageUrl(skill.image)}
                              alt={skill.name || skill.title}
                              className="w-8 h-8 rounded object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                        
                        {/* Skill Level */}
                        {(skill.level !== undefined || skill.proficiency !== undefined) && (
                          <>
                            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                              <div
                                className={`bg-gradient-to-r ${getSkillColor(skill.level || skill.proficiency)} h-2 rounded-full transition-all duration-1000`}
                                style={{ width: `${skill.level || skill.proficiency}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-400">
                              <span className="text-xs">Proficiency</span>
                              <div className="flex items-center gap-2">
                                <span className="text-white/60 text-xs">
                                  {getSkillLevelLabel(skill.level || skill.proficiency)}
                                </span>
                                <span className="text-white font-bold text-sm w-10 text-right">
                                  {skill.level || skill.proficiency}%
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                        
                        {skill.description && (
                          <p className="text-gray-400 text-sm mt-3">
                            {skill.description}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Empty State for Category */}
                  {(!category.items || category.items.length === 0) && (
                    <div className="text-center py-8 text-gray-400">
                      <FiStar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No skills added to this category</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Awards Section - UPDATED with proper fields from AwardAndAchievements.jsx */}
        {hasAwards && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center mb-8">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 mr-4">
                <FiAward className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Awards & Achievements</h2>
            </div>

            <div className="grid gap-6">
              {awards.map((award, index) => (
                <motion.div
                  key={award._id || index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 hover:border-yellow-500/50 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                        {award.title || "Award Title"}
                      </h3>
                      
                      {/* Awarding Association */}
                      <p className="text-yellow-400 font-medium mb-2">
                        {award.association || award.issuer || "Awarding Organization"}
                      </p>
                      
                      {/* Year - Fixed to show actual year instead of "Present" */}
                      <div className="flex items-center text-gray-400 text-sm mb-3">
                        <FiCalendar className="w-4 h-4 mr-1" />
                        <span className="font-semibold">
                          {award.year || formatDate(award.date) || "Year"}
                        </span>
                      </div>
                      
                      {/* Location */}
                      {award.location && (
                        <div className="flex items-center text-gray-400 text-sm mb-3">
                          <FiMapPin className="w-4 h-4 mr-1" />
                          {award.location}
                        </div>
                      )}
                      
                      {/* Description - Handle HTML content from TinyMCE */}
                      {award.desc && (
                        <div className="text-gray-300 leading-relaxed mt-4">
                          <div
                            dangerouslySetInnerHTML={{ __html: award.desc }}
                            className="award-description"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Awards Logo */}
                    {award.logo && (
                      <div className="ml-6 flex-shrink-0">
                        <img
                          src={getImageUrl(award.logo)}
                          alt={award.title || "Award"}
                          className="w-20 h-20 rounded-xl object-cover border-2 border-yellow-500/50"
                          onError={(e) => {
                            console.log("Award logo failed to load:", e.target.src);
                            e.target.style.display = 'none';
                          }}
                          onLoad={(e) => {
                            console.log("Award logo loaded successfully:", e.target.src);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* More About Me Section - Only show if has data */}
        {hasAboutCategories && (
          <motion.section
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-12"
          >
            <div className="flex items-center mb-8">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 mr-4">
                <FiUser className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">More About Me</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aboutCategories.map((category, index) => {
                // Handle different possible field names for title/category name
                const categoryName = category.name || category.title || category.categoryName || "About Me";
                
                return (
                  <motion.div
                    key={category._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 hover:border-indigo-500/50 transition-all duration-300 group"
                  >
                    <div className="flex items-center mb-4">
                      {category.image && (
                        <img
                          src={getImageUrl(category.image)}
                          alt={categoryName}
                          className="w-12 h-12 rounded-lg object-cover mr-4 border-2 border-indigo-500/50"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                        {categoryName}
                      </h3>
                    </div>
                    
                    {/* Handle different possible field names for description */}
                    {(category.description || category.details || category.summary) && (
                      <p className="text-gray-300 leading-relaxed mb-4">
                        {category.description || category.details || category.summary}
                      </p>
                    )}
                    
                    {/* Handle items array - with better field name detection */}
                    {(category.items || category.subItems || category.points || category.detailsList) && (
                      <div className="mt-4">
                        <ul className="space-y-2">
                          {(category.items || category.subItems || category.points || category.detailsList || []).map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start text-gray-400">
                              <FiBookOpen className="w-4 h-4 mr-2 text-indigo-500 mt-1 flex-shrink-0" />
                              <span>{typeof item === 'string' ? item : (item.name || item.title || item.text || 'Item')}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* References Section - UPDATED with proper fields from Reference.jsx */}
        {hasReferences && (
          <motion.section
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="mb-12"
          >
            <div className="flex items-center mb-8">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 mr-4">
                <FiExternalLink className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Professional References</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {references.map((reference, index) => (
                <motion.div
                  key={reference._id || index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 hover:border-red-500/50 transition-all duration-300 group"
                >
                  <div className="flex items-start mb-4">
                    {reference.image && (
                      <img
                        src={getImageUrl(reference.image)}
                        alt={reference.name}
                        className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-red-500/50"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white group-hover:text-red-400 transition-colors mb-1">
                        {reference.name || "Reference Name"}
                      </h3>
                      
                      {/* Designation and Workplace */}
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        {reference.designation && (
                          <div className="flex items-center text-red-400 font-medium">
                            <FiBriefcase className="w-4 h-4 mr-1" />
                            {reference.designation}
                          </div>
                        )}
                        {reference.workplace && (
                          <div className="flex items-center text-gray-400 text-sm">
                            <FiWork className="w-3 h-3 mr-1" />
                            at {reference.workplace}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Information */}
                  <div className="space-y-2 mb-4">
                    {reference.email && (
                      <div className="flex items-center text-gray-300">
                        <FiMail className="w-4 h-4 mr-2 text-red-500" />
                        <a href={`mailto:${reference.email}`} className="hover:text-red-400 transition-colors text-sm">
                          {reference.email}
                        </a>
                      </div>
                    )}
                    {reference.phone && (
                      <div className="flex items-center text-gray-300">
                        <FiPhone className="w-4 h-4 mr-2 text-red-500" />
                        <a href={`tel:${reference.phone}`} className="hover:text-red-400 transition-colors text-sm">
                          {reference.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Description - Handle HTML content from TinyMCE */}
                  {reference.desc && (
                    <div className="mt-4">
                      <div className="text-gray-300 leading-relaxed text-sm">
                        <div
                          dangerouslySetInnerHTML={{ __html: reference.desc }}
                          className="reference-description"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Fallback if no description */}
                  {!reference.desc && (
                    <p className="text-gray-400 text-sm italic">
                      Professional reference available upon request.
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* Add custom styles for HTML content */}
      <style jsx>{`
        .education-description ul,
        .education-description ol,
        .award-description ul,
        .award-description ol,
        .reference-description ul,
        .reference-description ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        .education-description li,
        .award-description li,
        .reference-description li {
          margin-bottom: 0.25rem;
          list-style-position: outside;
        }
        .education-description ul li,
        .award-description ul li,
        .reference-description ul li {
          list-style-type: disc;
        }
        .education-description ol li,
        .award-description ol li,
        .reference-description ol li {
          list-style-type: decimal;
        }
        .education-description strong,
        .award-description strong,
        .reference-description strong {
          font-weight: bold;
          color: #f9fafb;
        }
        .education-description em,
        .award-description em,
        .reference-description em {
          font-style: italic;
        }
        .education-description u,
        .award-description u,
        .reference-description u {
          text-decoration: underline;
        }
        .education-description a,
        .award-description a,
        .reference-description a {
          color: #60a5fa;
          text-decoration: underline;
        }
        .education-description a:hover,
        .award-description a:hover,
        .reference-description a:hover {
          color: #93c5fd;
        }
      `}</style>
    </div>
  );
};

export default ResumePage;