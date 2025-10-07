import React, { useState, useEffect, useRef, useContext } from "react";
import {
  FiEdit,
  FiEye,
  FiSave,
  FiPlus,
  FiTrash2,
  FiCalendar,
  FiDollarSign,
  FiUser,
  FiFolder,
  FiType,
  FiUpload,
  FiCode,
  FiGlobe,
  FiX,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Editor } from "@tinymce/tinymce-react";
import AuthContext from "../../../../../context/AuthContext"; // Adjust path as needed

const CreatePortfolio = () => {
  const { checkAuth } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(null);
  const [techInput, setTechInput] = useState("");
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [savingProject, setSavingProject] = useState({});
  const hasFetchedRef = useRef(false);

  // Loading timeout hook
  const useLoadingTimeout = (loadingState, timeout = 10000) => {
    const [timedOut, setTimedOut] = useState(false);
    useEffect(() => {
      if (loadingState) {
        const timer = setTimeout(() => {
          setTimedOut(true);
        }, timeout);
        return () => clearTimeout(timer);
      } else {
        setTimedOut(false);
      }
    }, [loadingState, timeout]);
    return timedOut;
  };
  const loadingTimedOut = useLoadingTimeout(isLoading, 10000);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        toast.error("Please log in to access this page");
        return;
      }
      if (hasFetchedRef.current) {
        return;
      }
      try {
        setIsLoading(true);
        hasFetchedRef.current = true;
        
        // Fetch projects
        const projectsResponse = await fetch("http://localhost:5000/api/portfolio/projects", {
          headers: {
            "x-auth-token": token,
          },
        });

        if (projectsResponse.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          toast.error("Session expired. Please log in again.");
          return;
        }

        if (!projectsResponse.ok) {
          throw new Error("Failed to fetch projects");
        }

        const projectsData = await projectsResponse.json();
        setProjects(projectsData.projects || []);

        // Fetch categories
        const categoriesResponse = await fetch("http://localhost:5000/api/portfolio/categories", {
          headers: {
            "x-auth-token": token,
          },
        });

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.categories || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.message.includes("401")) {
          toast.error("Authentication failed. Please log in again.");
        } else {
          toast.error(error.message || "Failed to load data");
        }
        setProjects([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      hasFetchedRef.current = false;
    };
  }, []);

  const addNewProject = async () => {
    try {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        toast.error("Please log in to add projects");
        return;
      }

      const token = localStorage.getItem("token");
      const newProject = {
        title: "",
        projectType: "",
        category: "",
        client: "",
        duration: "",
        budget: "",
        description: "",
        image: "",
        technologies: [],
        status: "planning"
      };

      const response = await fetch("http://localhost:5000/api/portfolio/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to add project");
      }

      const data = await response.json();
      setProjects((prev) => [...prev, data.project]);
      setExpandedProjectId(data.project._id); // Auto-expand when new is added
      toast.success("Project added successfully");
    } catch (error) {
      console.error("Error adding project:", error);
      toast.error(error.message || "Failed to add project");
    }
  };

  const updateProject = async (id, updateData) => {
    try {
      if (!id) {
        console.error("No ID provided for update");
        return false;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/portfolio/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(updateData),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please log in again.");
        return false;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to update project");
      }

      const data = await response.json();
      setProjects((prev) =>
        prev.map((project) => (project._id === id ? data.project : project))
      );
      return true;
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error(error.message || "Failed to update project");
      return false;
    }
  };

  const removeProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        toast.error("Please log in to remove projects");
        return;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/portfolio/projects/${id}`, {
        method: "DELETE",
        headers: {
          "x-auth-token": token,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please log in again.");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to delete project");
      }

      setProjects((prev) => prev.filter((project) => project._id !== id));
      if (expandedProjectId === id) setExpandedProjectId(null);
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error(error.message || "Failed to delete project");
    }
  };

  // Handle input changes WITHOUT auto-save to prevent typing issues
  const handleProjectChange = (id, field, value) => {
    setProjects((prev) =>
      prev.map((project) =>
        project._id === id ? { ...project, [field]: value } : project
      )
    );
  };

  const handleEditorChange = (id, content) => {
    handleProjectChange(id, "description", content);
  };

  const handleSaveProject = async (project) => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      toast.error("Please log in to save changes");
      return;
    }

    setSavingProject((prev) => ({ ...prev, [project._id]: true }));
    try {
      const success = await updateProject(project._id, {
        title: project.title || "",
        projectType: project.projectType || "",
        category: project.category || "",
        client: project.client || "",
        duration: project.duration || "",
        budget: project.budget || "",
        description: project.description || "",
        image: project.image || "",
        technologies: project.technologies || [],
        status: project.status || "planning"
      });

      if (success) {
        toast.success("Project saved successfully!");
      }
    } catch (error) {
      // Error is already handled in updateProject
    } finally {
      setSavingProject((prev) => ({ ...prev, [project._id]: false }));
    }
  };

  const handleSaveAllProjects = async () => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      toast.error("Please log in to save changes");
      return;
    }

    if (projects.length === 0) {
      toast.error("No projects to save");
      return;
    }

    setIsSaving(true);
    try {
      const savePromises = projects.map(project => 
        updateProject(project._id, {
          title: project.title || "",
          projectType: project.projectType || "",
          category: project.category || "",
          client: project.client || "",
          duration: project.duration || "",
          budget: project.budget || "",
          description: project.description || "",
          image: project.image || "",
          technologies: project.technologies || [],
          status: project.status || "planning"
        })
      );

      const results = await Promise.all(savePromises);
      const allSaved = results.every(result => result === true);
      
      if (allSaved) {
        toast.success("All projects saved successfully!");
      } else {
        toast.error("Some projects failed to save");
      }
    } catch (error) {
      console.error("Error saving projects:", error);
      toast.error("Failed to save projects");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (id, file) => {
    if (!file) return;

    try {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        toast.error("Please log in to upload image");
        return;
      }

      setUploadingImage(id);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("http://localhost:5000/api/portfolio/upload-image", {
        method: "POST",
        headers: {
          "x-auth-token": token,
        },
        body: formData,
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please log in again.");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to upload image");
      }

      const data = await response.json();
      const imageUrl = data.filePath;

      // Update the project with the new image URL
      await updateProject(id, { image: imageUrl });
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploadingImage(null);
    }
  };

  // Handle image removal
  const handleImageRemove = async (id) => {
    try {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        toast.error("Please log in to remove image");
        return;
      }

      // Update the project with empty image
      await updateProject(id, { image: "" });
      toast.success("Image removed successfully");
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error(error.message || "Failed to remove image");
    }
  };

  // Technology management
  const addTechnology = async (projectId) => {
    if (techInput.trim() === "") return;
    
    const project = projects.find(p => p._id === projectId);
    if (!project) return;

    const currentTechs = project.technologies || [];
    if (!currentTechs.includes(techInput.trim())) {
      const updatedTechs = [...currentTechs, techInput.trim()];
      // Update both state and backend
      setProjects(prev =>
        prev.map(p => p._id === projectId ? { ...p, technologies: updatedTechs } : p)
      );
      await updateProject(projectId, { technologies: updatedTechs });
    }
    setTechInput("");
  };

  const removeTechnology = async (projectId, technology) => {
    const project = projects.find(p => p._id === projectId);
    if (!project) return;

    const updatedTechs = project.technologies.filter(t => t !== technology);
    // Update both state and backend
    setProjects(prev =>
      prev.map(p => p._id === projectId ? { ...p, technologies: updatedTechs } : p)
    );
    await updateProject(projectId, { technologies: updatedTechs });
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center relative z-10">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-400 font-medium">
            Loading portfolio projects...
          </p>
          {loadingTimedOut && (
            <p className="mt-2 text-yellow-400 text-sm">
              Taking longer than expected. Check your connection.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen py-4 px-2 sm:px-4 lg:px-8 relative overflow-visible">
      <div className="w-full mx-auto relative z-10">
        <div className="text-center mb-5 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">
            Portfolio Projects
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start w-full">
          {/* Left Column - Form */}
          <div className="w-full bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-2 sm:p-4 md:p-6 lg:col-span-2 border border-gray-700/30">
            <div className="flex justify-between items-center mb-6 px-2 sm:px-0">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiEdit className="w-5 h-5" />
                Edit Portfolio Projects
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={addNewProject}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 flex items-center gap-2 group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center gap-2">
                    <FiPlus className="w-4 h-4" />
                    Add Project
                  </span>
                </button>
                {projects.length > 0 && (
                  <button
                    onClick={handleSaveAllProjects}
                    disabled={isSaving}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 flex items-center gap-2 group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transform hover:-translate-y-0.5 border border-purple-500/30"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative flex items-center gap-2">
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving All...
                        </>
                      ) : (
                        <>
                          <FiSave className="w-4 h-4" />
                          Save All Projects
                        </>
                      )}
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {projects.map((project, index) => (
                <div
                  key={project._id}
                  className="w-full bg-gray-800/50 rounded-xl border border-gray-700/50"
                >
                  <div
                    className="flex flex-row justify-between items-center px-4 py-3 sm:px-6 sm:py-4 cursor-pointer select-none"
                    onClick={() =>
                      setExpandedProjectId(
                        expandedProjectId === project._id ? null : project._id
                      )
                    }
                    title={`Show/Hide Project #${index + 1}`}
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                      {expandedProjectId === project._id ? (
                        <FiChevronUp className="mr-2" />
                      ) : (
                        <FiChevronDown className="mr-2" />
                      )}
                      Project #{index + 1}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeProject(project._id);
                      }}
                      className="p-2 text-red-400 hover:text-red-300 transition"
                      title="Remove Project"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {expandedProjectId === project._id && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-1 sm:pt-2">
                      {/* Project Title */}
                      <div className="form-group mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                          <FiType className="w-4 h-4" />
                          Project Title
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition placeholder-gray-500"
                          value={project.title || ""}
                          onChange={(e) =>
                            handleProjectChange(project._id, "title", e.target.value)
                          }
                          placeholder="e.g., E-commerce Platform Development"
                        />
                      </div>

                      {/* Project Type and Category */}
                      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 mb-4">
                        {/* Project Type - Input Field */}
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                            <FiFolder className="w-4 h-4" />
                            Project Type
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition placeholder-gray-500"
                            value={project.projectType || ""}
                            onChange={(e) =>
                              handleProjectChange(project._id, "projectType", e.target.value)
                            }
                            placeholder="e.g., Web Application, Mobile App, E-commerce"
                          />
                        </div>

                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                            <FiGlobe className="w-4 h-4" />
                            Category
                          </label>
                          <select
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition appearance-none cursor-pointer"
                            value={project.category || ""}
                            onChange={(e) =>
                              handleProjectChange(project._id, "category", e.target.value)
                            }
                          >
                            <option value="">Select Category</option>
                            {categories.map(category => (
                              <option key={category._id} value={category.name}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                          {categories.length === 0 && (
                            <p className="text-xs text-yellow-400 mt-1">
                              No categories found. Please add categories in Portfolio Categories first.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Client, Duration, Budget */}
                      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 mb-4">
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                            <FiUser className="w-4 h-4" />
                            Client
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition placeholder-gray-500"
                            value={project.client || ""}
                            onChange={(e) =>
                              handleProjectChange(project._id, "client", e.target.value)
                            }
                            placeholder="e.g., TechCorp Inc."
                          />
                        </div>

                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                            <FiCalendar className="w-4 h-4" />
                            Duration
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition placeholder-gray-500"
                            value={project.duration || ""}
                            onChange={(e) =>
                              handleProjectChange(project._id, "duration", e.target.value)
                            }
                            placeholder="e.g., 3 months"
                          />
                        </div>

                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                            <FiDollarSign className="w-4 h-4" />
                            Budget
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition placeholder-gray-500"
                            value={project.budget || ""}
                            onChange={(e) =>
                              handleProjectChange(project._id, "budget", e.target.value)
                            }
                            placeholder="e.g., $10,000"
                          />
                        </div>
                      </div>

                      {/* Technologies Input Field */}
                      <div className="form-group mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Technologies & Tools Used
                        </label>
                        
                        {/* Input for adding technologies */}
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={techInput}
                            onChange={(e) => setTechInput(e.target.value)}
                            placeholder="Enter technology (e.g., React, Node.js, MongoDB)"
                            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-purple-500 transition placeholder-gray-500"
                            onKeyPress={(e) => e.key === 'Enter' && addTechnology(project._id)}
                          />
                          <button
                            onClick={() => addTechnology(project._id)}
                            disabled={!techInput.trim()}
                            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <FiPlus className="w-4 h-4" />
                            Add
                          </button>
                        </div>

                        {/* Display selected technologies */}
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech, techIndex) => (
                              <span
                                key={techIndex}
                                className="px-3 py-2 bg-blue-600/20 text-blue-300 rounded-lg border border-blue-500/30 flex items-center gap-2 group hover:bg-blue-600/30 transition-colors"
                              >
                                {tech}
                                <button
                                  type="button"
                                  onClick={() => removeTechnology(project._id, tech)}
                                  className="text-blue-200 hover:text-white transition"
                                >
                                  <FiX className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {(!project.technologies || project.technologies.length === 0) && (
                          <p className="text-gray-400 text-sm italic">
                            No technologies added yet. Start typing and press Enter or click Add.
                          </p>
                        )}
                      </div>

                      {/* Project Image */}
                      <div className="form-group mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Project Image/Screenshot
                        </label>
                        
                        {project.image ? (
                          <div className="mb-3">
                            <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                              <img
                                src={`http://localhost:5000${project.image}`}
                                alt={`${project.title} preview`}
                                className="w-20 h-20 rounded-lg object-cover border border-gray-600"
                                onError={(e) => {
                                  // If image fails to load, remove it
                                  handleImageRemove(project._id);
                                }}
                              />
                              <div className="flex-1">
                                <p className="text-green-400 text-sm font-medium mb-1">✓ Image uploaded successfully</p>
                                <p className="text-gray-400 text-xs">Image will appear in preview</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleImageRemove(project._id)}
                                className="p-2 text-red-400 hover:text-red-300 transition"
                                title="Remove image"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : null}
                        
                        {!project.image && (
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    handleImageUpload(project._id, file);
                                  }
                                }}
                              />
                              <button
                                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-dashed border-gray-600 hover:border-purple-500"
                                disabled={uploadingImage === project._id}
                              >
                                {uploadingImage === project._id ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <FiUpload className="w-4 h-4" />
                                    Upload Project Image
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {!project.image && (
                          <p className="mt-2 text-xs text-gray-400">
                            Supported formats: JPG, PNG, GIF. Max size: 5MB
                          </p>
                        )}
                      </div>

                      {/* Project Description */}
                      <div className="form-group mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Project Description & Details
                        </label>

                        <div className="bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl focus-within:border-gray-500 transition">
                          <Editor
                            apiKey="h2ar80nttlx4hli43ugzp4wvv9ej7q3feifsu8mqssyfga6s"
                            value={project.description || ""}
                            onEditorChange={(content) => handleEditorChange(project._id, content)}
                            init={{
                              height: 300,
                              menubar: false,
                              plugins: [
                                "advlist",
                                "autolink",
                                "lists",
                                "link",
                                "image",
                                "charmap",
                                "preview",
                                "anchor",
                                "searchreplace",
                                "visualblocks",
                                "code",
                                "fullscreen",
                                "insertdatetime",
                                "media",
                                "table",
                                "code",
                                "help",
                                "wordcount",
                              ],
                              toolbar:
                                "undo redo | blocks | bold italic underline strikethrough | " +
                                "forecolor backcolor | alignleft aligncenter alignright alignjustify | " +
                                "bullist numlist outdent indent | link image | removeformat | help",
                              skin: "oxide-dark",
                              content_css: "dark",
                              content_style: `
                                body { 
                                  background: #1f2937; 
                                  color: #f9fafb; 
                                  font-family: Inter, sans-serif; 
                                  font-size: 14px; 
                                  line-height: 1.6; 
                                }
                                p { margin: 0 0 12px 0; }
                                ul, ol { margin: 0 0 12px 0; padding-left: 20px; }
                                li { margin-bottom: 4px; }
                                strong { font-weight: bold; }
                                em { font-style: italic; }
                                u { text-decoration: underline; }
                                a { color: #60a5fa; text-decoration: underline; }
                                a:hover { color: #93c5fd; }
                                code { background: #374151; color: #6ee7b7; padding: 2px 4px; border-radius: 4px; font-family: 'Courier New', monospace; }
                              `,
                              branding: false,
                              statusbar: false,
                              elementpath: false,
                              paste_data_images: true,
                              default_link_target: "_blank",
                              link_assume_external_targets: true,
                              target_list: false,
                              link_title: false,
                              automatic_uploads: true,
                              file_picker_types: "image",
                              images_upload_url: "http://localhost:5000/api/upload",
                              relative_urls: false,
                              remove_script_host: false,
                              convert_urls: true,
                            }}
                          />
                        </div>
                      </div>

                      {/* Individual Save Button */}
                      <div className="mt-6">
                        <button
                          onClick={() => handleSaveProject(project)}
                          disabled={savingProject[project._id]}
                          className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                          <span className="relative flex items-center justify-center gap-2">
                            {savingProject[project._id] ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <FiSave className="w-4 h-4" />
                                Save Project
                              </>
                            )}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {projects.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
                  <p className="text-gray-400 mb-4">
                    No portfolio projects added yet
                  </p>
                  <button
                    onClick={addNewProject}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 flex items-center gap-2 mx-auto group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative flex items-center gap-2">
                      <FiPlus className="w-4 h-4" />
                      Add Your First Project
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Live Preview */}
          <div className="w-full bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-2 sm:p-4 md:p-6 border border-gray-700/30 sticky top-8 self-start overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FiEye className="w-5 h-5" />
              Live Preview
            </h2>

            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 rounded-2xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-all duration-500 border border-gray-600/30 hover:border-cyan-500/30">
              <div className="relative bg-gradient-to-r from-slate-800 via-gray-800 to-slate-900 p-6 overflow-hidden border-b border-gray-700/50">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/5"></div>
                <div className="absolute top-4 right-4 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-purple-500/10 rounded-full blur-lg"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg border border-cyan-400/30">
                      <FiCode className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        Portfolio Projects
                      </h2>
                      <p className="text-cyan-200 text-sm opacity-80">
                        {projects.length} Project{projects.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {projects.length > 0 ? (
                  <div className="space-y-6">
                    {projects.map((project, index) => (
                      <div
                        key={project._id || index}
                        className="group relative p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5"
                      >
                        {/* Project Image */}
                        {project.image && (
                          <div className="w-full h-48 overflow-hidden rounded-lg mb-4">
                            <img
                              src={`http://localhost:5000${project.image}`}
                              alt={project.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        {/* Project Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                              {project.title || "Project Title"}
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {project.projectType && (
                                <span className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs border border-blue-500/30">
                                  {project.projectType}
                                </span>
                              )}
                              {project.category && (
                                <span className="px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-xs border border-green-500/30">
                                  {project.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Project Meta */}
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-300">
                            <FiUser className="w-4 h-4 text-blue-400" />
                            <span>{project.client || "Client Name"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <FiCalendar className="w-4 h-4 text-green-400" />
                            <span>{project.duration || "Duration"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <FiDollarSign className="w-4 h-4 text-yellow-400" />
                            <span>{project.budget || "Budget"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <FiFolder className="w-4 h-4 text-purple-400" />
                            <span>{project.category || "Category"}</span>
                          </div>
                        </div>

                        {/* Technologies */}
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-300 mb-2">Technologies Used:</h4>
                            <div className="flex flex-wrap gap-1">
                              {project.technologies.map(tech => (
                                <span
                                  key={tech}
                                  className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs border border-gray-600"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        <div className="text-gray-300 leading-relaxed text-sm space-y-3 max-w-none preview-content">
                          {project.description ? (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: project.description,
                              }}
                              className="preview-html-content"
                            />
                          ) : (
                            <p className="text-gray-400 italic">No project description provided. Add details about the project development process and outcomes.</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-700/50">
                      <FiCode className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-400 mb-2">No projects to display</p>
                    <p className="text-gray-500 text-sm">Add some portfolio projects to see the preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom styles for the preview content */}
      <style jsx>{`
        .preview-content ul,
        .preview-content ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        .preview-content li {
          margin-bottom: 0.25rem;
          list-style-position: outside;
        }
        .preview-content ul li {
          list-style-type: disc;
        }
        .preview-content ol li {
          list-style-type: decimal;
        }
        .preview-content strong {
          font-weight: bold;
        }
        .preview-content em {
          font-style: italic;
        }
        .preview-content u {
          text-decoration: underline;
        }
        .preview-content a {
          color: #60a5fa;
          text-decoration: underline;
        }
        .preview-content a:hover {
          color: #93c5fd;
        }
        .preview-content code {
          background: #374151;
          color: #6ee7b7;
          padding: 2px 4px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.875em;
        }
      `}</style>
    </div>
  );
};

export default CreatePortfolio;