import React, { useState, useRef, useEffect } from "react";
import {
  FiEdit,
  FiEye,
  FiSave,
  FiPlus,
  FiTrash2,
  FiCalendar,
  FiBriefcase,
  FiMapPin,
  FiUpload,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
// TINYMCE_ADDED: Import TinyMCE Editor
import { Editor } from "@tinymce/tinymce-react";

const WorkExperience = () => {
  const [experiences, setExperiences] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(null);
  // TINYMCE_REMOVED: Removed textareaRefs and autoSaveTimeouts

  // Fetch work experiences on component mount
  useEffect(() => {
    fetchWorkExperiences();
  }, []);

  const fetchWorkExperiences = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/resume/work-experiences", {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch experiences");

      const data = await response.json();
      setExperiences(data.workExperiences || []);
    } catch (error) {
      console.error("Error fetching work experiences:", error);
      toast.error("Failed to load work experiences");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExperienceChange = (id, field, value) => {
    setExperiences((prev) =>
      prev.map((exp) =>
        exp._id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  // TINYMCE_ADDED: New handler for editor content changes
  const handleEditorChange = (id, content) => {
    handleExperienceChange(id, "desc", content);
  };

  const addNewExperience = async () => {
    try {
      const token = localStorage.getItem("token");
      const newExperience = {
        role: "",
        company: "",
        location: "",
        startDate: new Date().toISOString().slice(0, 7),
        endDate: "",
        current: false,
        logo: "",
        desc: "",
      };

      const response = await fetch("http://localhost:5000/api/resume/work-experiences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(newExperience),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to add experience");
      }

      const data = await response.json();
      setExperiences((prev) => [...prev, data.experience]);
      toast.success("Work experience added successfully");
    } catch (error) {
      console.error("Error adding work experience:", error);
      toast.error(error.message || "Failed to add work experience");
    }
  };

  const updateExperience = async (id, updateData) => {
    try {
      if (!id) {
        console.error("No ID provided for update");
        return false;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/resume/work-experiences/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to update experience");
      }

      const data = await response.json();
      setExperiences((prev) =>
        prev.map((exp) => (exp._id === id ? data.experience : exp))
      );
      return true;
    } catch (error) {
      console.error("Error updating work experience:", error);
      toast.error(error.message || "Failed to update work experience");
      return false;
    }
  };

  const removeExperience = async (id) => {
    // Allow deleting all experiences - no minimum requirement
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/resume/work-experiences/${id}`, {
        method: "DELETE",
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to delete experience");
      }

      setExperiences((prev) => prev.filter((exp) => exp._id !== id));
      toast.success("Experience removed successfully");
    } catch (error) {
      console.error("Error deleting work experience:", error);
      toast.error(error.message || "Failed to delete work experience");
    }
  };

  const handleSave = async () => {
    if (experiences.length === 0) {
      toast.error("No experiences to save");
      return;
    }

    setIsSaving(true);
    try {
      const savePromises = experiences.map((exp) =>
        updateExperience(exp._id, {
          role: exp.role || "",
          company: exp.company || "",
          location: exp.location || "",
          startDate: exp.startDate || new Date().toISOString().slice(0, 7),
          endDate: exp.current ? "" : (exp.endDate || ""),
          current: exp.current || false,
          logo: exp.logo || "",
          desc: exp.desc || "",
        })
      );

      const results = await Promise.all(savePromises);
      const allSaved = results.every(result => result === true);
      
      if (allSaved) {
        toast.success("Work experiences saved successfully!");
      } else {
        toast.error("Some experiences failed to save");
      }
    } catch (error) {
      console.error("Error saving experiences:", error);
      toast.error("Failed to save experiences");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle file upload for company logo
  const handleLogoUpload = async (id, file) => {
    if (!file) return;

    try {
      setUploadingLogo(id);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("logo", file);

      const response = await fetch("http://localhost:5000/api/resume/upload-logo", {
        method: "POST",
        headers: {
          "x-auth-token": token,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to upload logo");
      }

      const data = await response.json();
      const logoUrl = data.filePath;

      // Update the experience with the new logo URL
      await updateExperience(id, { logo: logoUrl });
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error(error.message || "Failed to upload logo");
    } finally {
      setUploadingLogo(null);
    }
  };

  // TINYMCE_REMOVED: Removed all formatting functions (formatText, parseFormattedText) since TinyMCE handles formatting

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString + "-01");
      return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
    } catch (error) {
      return "";
    }
  };

  const calculateDuration = (startDate, endDate, current) => {
    if (!startDate) return "";
    
    try {
      const start = new Date(startDate + "-01");
      const end = current ? new Date() : new Date((endDate || "") + "-01");
      
      const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                    (end.getMonth() - start.getMonth());
      
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      
      if (years === 0) {
        return `${remainingMonths} mos`;
      } else if (remainingMonths === 0) {
        return `${years} yr${years > 1 ? 's' : ''}`;
      } else {
        return `${years} yr${years > 1 ? 's' : ''} ${remainingMonths} mos`;
      }
    } catch (error) {
      return "";
    }
  };

  // Handle input changes WITHOUT auto-save to prevent typing issues
  const handleInputChange = (id, field, value) => {
    handleExperienceChange(id, field, value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#020617] py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading work experiences...</div>
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
                <FiEdit className="w-5 h-5" />
                Edit Work Experience
              </h2>
              <button
                onClick={addNewExperience}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Add Experience
              </button>
            </div>

            <div className="space-y-6">
              {experiences.map((experience, index) => (
                <div
                  key={experience._id || index}
                  className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Experience #{index + 1}
                    </h3>
                    <button
                      onClick={() => removeExperience(experience._id)}
                      className="p-2 text-red-400 hover:text-red-300 transition"
                      title="Remove Experience"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Role/Position
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition placeholder-gray-500"
                        value={experience.role || ""}
                        onChange={(e) =>
                          handleInputChange(
                            experience._id,
                            "role",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Senior Developer"
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition placeholder-gray-500"
                        value={experience.company || ""}
                        onChange={(e) =>
                          handleInputChange(
                            experience._id,
                            "company",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Google, Microsoft"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition placeholder-gray-500"
                        value={experience.location || ""}
                        onChange={(e) =>
                          handleInputChange(
                            experience._id,
                            "location",
                            e.target.value
                          )
                        }
                        placeholder="e.g., San Francisco, CA"
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Company Logo
                      </label>
                      
                      {/* Logo Preview */}
                      {experience.logo ? (
                        <div className="mb-3">
                          <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                            <img
                              src={`http://localhost:5000${experience.logo}`}
                              alt={`${experience.company} logo`}
                              className="w-16 h-16 rounded-lg object-cover border border-gray-600"
                              onError={(e) => {
                                // If image fails to load, show the upload section
                                handleInputChange(experience._id, "logo", "");
                              }}
                            />
                            <div className="flex-1">
                              <p className="text-green-400 text-sm font-medium mb-1">✓ Logo uploaded successfully</p>
                              <p className="text-gray-400 text-xs">Image will appear in preview</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleInputChange(experience._id, "logo", "")}
                              className="p-2 text-red-400 hover:text-red-300 transition"
                              title="Remove logo"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : null}
                      
                      {/* Upload Section - Only show if no logo exists */}
                      {!experience.logo && (
                        <div className="flex gap-2">
                          {/* Upload Button */}
                          <div className="relative flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  handleLogoUpload(experience._id, file);
                                }
                              }}
                            />
                            <button
                              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-dashed border-gray-600 hover:border-blue-500"
                              disabled={uploadingLogo === experience._id}
                            >
                              {uploadingLogo === experience._id ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <FiUpload className="w-4 h-4" />
                                  Click to upload company logo
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Upload instructions */}
                      {!experience.logo && (
                        <p className="mt-2 text-xs text-gray-400">
                          Supported formats: JPG, PNG, GIF, SVG. Max size: 5MB
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Start Date
                      </label>
                      <input
                        type="month"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                        value={experience.startDate || ""}
                        onChange={(e) =>
                          handleInputChange(
                            experience._id,
                            "startDate",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        End Date
                      </label>
                      <input
                        type="month"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        value={experience.endDate || ""}
                        onChange={(e) =>
                          handleInputChange(
                            experience._id,
                            "endDate",
                            e.target.value
                          )
                        }
                        disabled={experience.current}
                      />
                    </div>

                    <div className="form-group flex items-end">
                      <label className="flex items-center text-sm font-medium text-gray-300 mb-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mr-2 w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
                          checked={experience.current || false}
                          onChange={(e) =>
                            handleInputChange(
                              experience._id,
                              "current",
                              e.target.checked
                            )
                          }
                        />
                        Currently working here
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Role Description & Achievements
                    </label>

                    {/* TINYMCE_REPLACED: Replaced custom formatting toolbar and textarea with TinyMCE Editor */}
                    <div className="bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl focus-within:border-gray-500 transition">
                      <Editor
                        apiKey="h2ar80nttlx4hli43ugzp4wvv9ej7q3feifsu8mqssyfga6s"
                        value={experience.desc || ""}
                        onEditorChange={(content) => handleEditorChange(experience._id, content)}
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
                          placeholder: "• Developed and maintained web applications...\n• Collaborated with cross-functional teams...\n• Implemented new features using React and Node.js...",
                        }}
                      />
                    </div>

                    {/* TINYMCE_REMOVED: Removed formatting tips since TinyMCE has visual toolbar */}
                  </div>
                </div>
              ))}

              {experiences.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <FiBriefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No work experiences added yet.</p>
                  <p className="text-sm">Click "Add Experience" to get started.</p>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="mt-8">
              <button
                onClick={handleSave}
                disabled={isSaving || experiences.length === 0}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <span className="relative flex items-center justify-center gap-2">
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" />
                      Save All Changes
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Right Column - Transparent Preview */}
          <div className="bg-transparent rounded-2xl p-6 border border-cyan-500/30  self-start overflow-y-auto backdrop-blur-lg">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FiEye className="w-5 h-5" />
              Live Preview
            </h2>

            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 rounded-2xl shadow-2xl overflow-hidden border border-cyan-400/20 backdrop-blur-xl">
              {/* Preview Header */}
              <div className="bg-gradient-to-r from-cyan-600/90 to-blue-600/90 p-4 text-white border-b border-cyan-400/30">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="relative">
                    <h2 className="text-2xl font-bold">
                      Work Experience
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-100">
                    <FiBriefcase className="w-5 h-5" />
                    <span className="text-sm">{experiences.length} Position{experiences.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-6 space-y-6">
                {experiences.map((experience, index) => (
                  <div
                    key={experience._id || index}
                    className="group relative"
                  >
                    <div className="relative flex items-start space-x-4 p-4 rounded-xl bg-gray-800/40 hover:bg-gray-700/50 transition-all duration-300 border border-cyan-500/20 hover:border-cyan-400/40">
                      {/* Company Logo/Icon */}
                      <div className="relative z-10 flex-shrink-0">
                        {experience.logo ? (
                          <img
                            src={`http://localhost:5000${experience.logo}`}
                            alt={`${experience.company} logo`}
                            className="w-12 h-12 rounded-lg object-cover shadow-lg border border-gray-600"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg ${experience.logo ? 'hidden' : 'flex'}`}>
                          <FiBriefcase className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                          <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {experience.role || "Your Role"}
                          </h3>
                          <div className="flex items-center gap-2 text-cyan-300 text-sm">
                            <FiCalendar className="w-4 h-4" />
                            <span>
                              {formatDate(experience.startDate) || "Start Date"} -{" "}
                              {experience.current ? "Present" : (formatDate(experience.endDate) || "End Date")}
                            </span>
                            {experience.startDate && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-300">
                                  {calculateDuration(experience.startDate, experience.endDate, experience.current)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-1 text-blue-300">
                            <FiBriefcase className="w-4 h-4" />
                            <span className="font-medium">{experience.company || "Company Name"}</span>
                          </div>
                          {experience.location && (
                            <div className="flex items-center gap-1 text-gray-400">
                              <FiMapPin className="w-3 h-3" />
                              <span className="text-sm">{experience.location}</span>
                            </div>
                          )}
                        </div>

                        {/* TINYMCE_UPDATED: Fixed preview to properly display HTML content */}
                        <div className="text-gray-300 leading-relaxed text-sm space-y-3 max-w-none preview-content">
                          {experience.desc ? (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: experience.desc,
                              }}
                              className="preview-html-content"
                            />
                          ) : (
                            <p className="text-gray-400 italic">No description provided. Add your responsibilities and achievements.</p>
                          )}
                        </div>

                        {experience.current && (
                          <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 mt-3">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                            <span className="text-green-300 text-xs font-medium">Current Position</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {experiences.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>No work experiences to display</p>
                    <p className="text-sm">Add some experiences to see the preview</p>
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
      `}</style>
    </div>
  );
};

export default WorkExperience;