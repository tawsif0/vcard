import React, { useState, useEffect } from "react";
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
  FiX
} from "react-icons/fi";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
// TINYMCE_ADDED: Import TinyMCE Editor
import { Editor } from "@tinymce/tinymce-react";

const CreatePortfolio = () => {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(null);
  const [techInput, setTechInput] = useState("");

  // Fetch data on component mount
  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/portfolio/projects", {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch projects");

      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/portfolio/categories", {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch categories");

      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const addNewProject = async () => {
    try {
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to update project");
      }

      const data = await response.json();
      // Update the project in state with the response data
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
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/portfolio/projects/${id}`, {
        method: "DELETE",
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to delete project");
      }

      setProjects((prev) => prev.filter((project) => project._id !== id));
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error(error.message || "Failed to delete project");
    }
  };

  // Handle input changes with immediate update to backend
  const handleProjectChange = async (id, field, value) => {
    // First update local state immediately for better UX
    setProjects((prev) =>
      prev.map((project) =>
        project._id === id ? { ...project, [field]: value } : project
      )
    );

    // Then update in backend (but don't wait for it)
    try {
      await updateProject(id, { [field]: value });
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      // Don't show toast for every field change to avoid spam
    }
  };

  // TINYMCE_ADDED: New handler for editor content changes
  const handleEditorChange = (id, content) => {
    handleProjectChange(id, "description", content);
  };

  // Handle image upload
  const handleImageUpload = async (id, file) => {
    if (!file) return;

    try {
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

  // TINYMCE_REMOVED: Removed all formatting functions (formatText, parseFormattedText, etc.)
  // since TinyMCE handles all formatting internally

  const handleSave = async () => {
    if (projects.length === 0) {
      toast.error("No projects to save");
      return;
    }

    setIsSaving(true);
    try {
      // Instead of bulk save, save each project individually to ensure proper IDs
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

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#020617] py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 sm:px-4 lg:px-2 relative overflow-visible">
      <div className="mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column - Form */}
          <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-6 lg:col-span-2 border border-gray-700/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiCode className="w-5 h-5" />
                Portfolio Projects
              </h2>
              <button
                onClick={addNewProject}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Add Project
              </button>
            </div>

            <div className="space-y-6">
              {projects.map((project, index) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Project #{index + 1}
                    </h3>
                    <button
                      onClick={() => removeProject(project._id)}
                      className="p-2 text-red-400 hover:text-red-300 transition"
                      title="Remove Project"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Project Description & Details
                    </label>

                    {/* TINYMCE_REPLACED: Replaced custom formatting toolbar and textarea with TinyMCE Editor */}
                    <div className="bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl focus-within:border-gray-500 transition">
                      <Editor
                        apiKey="h2ar80nttlx4hli43ugzp4wvv9ej7q3feifsu8mqssyfga6s" // TINYMCE_ADDED: Your API key
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
                          images_upload_url: "http://localhost:5000/api/upload", // Optional: Add your upload endpoint
                          relative_urls: false,
                          remove_script_host: false,
                          convert_urls: true,
                        }}
                      />
                    </div>

                    {/* TINYMCE_REMOVED: Removed formatting tips since TinyMCE has visual toolbar */}
                  </div>
                </motion.div>
              ))}

              {projects.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <FiCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No portfolio projects added yet.</p>
                  <p className="text-sm">Click "Add Project" to start documenting your portfolio projects.</p>
                </div>
              )}
            </div>

            {/* Save Button */}
            {projects.length > 0 && (
              <div className="mt-8">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  <span className="relative flex items-center justify-center gap-2">
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving Projects...
                      </>
                    ) : (
                      <>
                        <FiSave className="w-4 h-4" />
                        Save All Projects
                      </>
                    )}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="bg-transparent rounded-2xl p-6 border border-purple-500/30  self-start overflow-y-auto backdrop-blur-lg">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FiEye className="w-5 h-5" />
              Live Preview
            </h2>

            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 rounded-2xl shadow-2xl overflow-hidden border border-purple-400/20 backdrop-blur-xl">
              {/* Preview Header */}
              <div className="bg-gradient-to-r from-purple-600/90 to-blue-600/90 p-4 text-white border-b border-purple-400/30">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="relative">
                    <h2 className="text-2xl font-bold">
                      Portfolio Projects
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-purple-100">
                    <FiCode className="w-5 h-5" />
                    <span className="text-sm">{projects.length} Project{projects.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-6 space-y-8">
                {projects.map((project, index) => (
                  <div
                    key={project._id}
                    className="group relative"
                  >
                    <div className="relative rounded-xl bg-gray-800/40 hover:bg-gray-700/50 transition-all duration-300 border border-purple-500/20 hover:border-purple-400/40 overflow-hidden">
                      {/* Project Image */}
                      {project.image && (
                        <div className="w-full h-48 overflow-hidden">
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
                      
                      <div className="p-6">
                        {/* Project Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors mb-2">
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
                        <div className="prose prose-invert max-w-none">
                          {project.description ? (
                            // TINYMCE_UPDATED: Fixed preview to properly display HTML content
                            <div className="text-gray-300 leading-relaxed text-sm space-y-3 max-w-none preview-content">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: project.description,
                                }}
                                className="preview-html-content"
                              />
                            </div>
                          ) : (
                            <p className="text-gray-400 italic">No project description provided. Add details about the project development process and outcomes.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {projects.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-lg mb-2">No projects to display</p>
                    <p className="text-sm">Add some portfolio projects to see the preview</p>
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