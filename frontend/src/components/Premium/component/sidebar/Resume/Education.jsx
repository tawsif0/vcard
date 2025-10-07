import React, { useState, useEffect, useRef, useContext } from "react";
import {
  FiEdit,
  FiEye,
  FiSave,
  FiPlus,
  FiTrash2,
  FiCalendar,
  FiMapPin,
  FiBook,
  FiUpload,
  FiChevronDown,
  FiChevronUp,
  FiUser,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { Editor } from "@tinymce/tinymce-react";
import AuthContext from "../../../../../context/AuthContext"; // Adjust path as needed

const Education = () => {
  const { checkAuth } = useContext(AuthContext);
  const [education, setEducation] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(null);
  const [expandedEducationId, setExpandedEducationId] = useState(null);
  const [savingEducation, setSavingEducation] = useState({});
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

  // Fetch education on component mount
  useEffect(() => {
    const fetchEducation = async () => {
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
        const response = await fetch("http://localhost:5000/api/resume/education", {
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
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        setEducation(data.education || []);
      } catch (error) {
        console.error("Error fetching education:", error);
        if (error.message.includes("401")) {
          toast.error("Authentication failed. Please log in again.");
        } else {
          toast.error(error.message || "Failed to load education");
        }
        setEducation([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEducation();
    return () => {
      hasFetchedRef.current = false;
    };
  }, []);

  const handleEducationChange = (id, field, value) => {
    setEducation((prev) =>
      prev.map((edu) =>
        edu._id === id ? { ...edu, [field]: value } : edu
      )
    );
  };

  const handleEditorChange = (id, content) => {
    handleEducationChange(id, "desc", content);
  };

  const addNewEducation = async () => {
    try {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        toast.error("Please log in to add education");
        return;
      }

      const token = localStorage.getItem("token");
      const newEducation = {
        degree: "",
        university: "",
        location: "",
        startDate: new Date().toISOString().slice(0, 7),
        endDate: "",
        current: false,
        logo: "",
        desc: "",
      };

      const response = await fetch("http://localhost:5000/api/resume/education", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(newEducation),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to add education");
      }

      const data = await response.json();
      setEducation((prev) => [...prev, data.education]);
      setExpandedEducationId(data.education._id); // Auto-expand when new is added
      toast.success("Education added successfully");
    } catch (error) {
      console.error("Error adding education:", error);
      toast.error(error.message || "Failed to add education");
    }
  };

  const updateEducation = async (id, updateData) => {
    try {
      if (!id) {
        console.error("No ID provided for update");
        return false;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/resume/education/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please log in again.");
        return false;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to update education");
      }

      const data = await response.json();
      setEducation((prev) =>
        prev.map((edu) => (edu._id === id ? data.education : edu))
      );
      return true;
    } catch (error) {
      console.error("Error updating education:", error);
      toast.error(error.message || "Failed to update education");
      return false;
    }
  };

  const removeEducation = async (id) => {
    try {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        toast.error("Please log in to remove education");
        return;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/resume/education/${id}`,
        {
          method: "DELETE",
          headers: {
            "x-auth-token": token,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please log in again.");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to delete education");
      }

      setEducation((prev) => prev.filter((edu) => edu._id !== id));
      if (expandedEducationId === id) setExpandedEducationId(null);
      toast.success("Education removed successfully");
    } catch (error) {
      console.error("Error deleting education:", error);
      toast.error(error.message || "Failed to delete education");
    }
  };

  const handleSaveEducation = async (edu) => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      toast.error("Please log in to save changes");
      return;
    }

    setSavingEducation((prev) => ({ ...prev, [edu._id]: true }));
    try {
      const success = await updateEducation(edu._id, {
        degree: edu.degree || "",
        university: edu.university || "",
        location: edu.location || "",
        startDate: edu.startDate || new Date().toISOString().slice(0, 7),
        endDate: edu.current ? "" : (edu.endDate || ""),
        current: edu.current || false,
        logo: edu.logo || "",
        desc: edu.desc || "",
      });

      if (success) {
        toast.success("Education saved successfully!");
      }
    } catch (error) {
      // Error is already handled in updateEducation
    } finally {
      setSavingEducation((prev) => ({ ...prev, [edu._id]: false }));
    }
  };

  const handleSaveAllEducation = async () => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      toast.error("Please log in to save changes");
      return;
    }

    if (education.length === 0) {
      toast.error("No education entries to save");
      return;
    }

    setIsSaving(true);
    try {
      const savePromises = education.map((edu) =>
        updateEducation(edu._id, {
          degree: edu.degree || "",
          university: edu.university || "",
          location: edu.location || "",
          startDate: edu.startDate || new Date().toISOString().slice(0, 7),
          endDate: edu.current ? "" : (edu.endDate || ""),
          current: edu.current || false,
          logo: edu.logo || "",
          desc: edu.desc || "",
        })
      );

      const results = await Promise.all(savePromises);
      const allSaved = results.every((result) => result === true);

      if (allSaved) {
        toast.success("All education entries saved successfully!");
      } else {
        toast.error("Some education entries failed to save");
      }
    } catch (error) {
      console.error("Error saving education:", error);
      toast.error("Failed to save education");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle file upload for university logo - FIXED VERSION
  const handleLogoUpload = async (id, file) => {
    if (!file) return;

    try {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        toast.error("Please log in to upload logo");
        return;
      }

      setUploadingLogo(id);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("logo", file);

      const response = await fetch(
        "http://localhost:5000/api/resume/upload-logo",
        {
          method: "POST",
          headers: {
            "x-auth-token": token,
          },
          body: formData,
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please log in again.");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to upload logo");
      }

      const data = await response.json();
      const logoUrl = data.filePath;

      // Get the current education data to preserve all fields
      const currentEducation = education.find(edu => edu._id === id);
      if (!currentEducation) {
        throw new Error("Education entry not found");
      }

      // Update the education with the new logo URL while preserving all other fields
      const updateData = {
        ...currentEducation, // Preserve all existing fields
        logo: logoUrl // Only update the logo field
      };

      await updateEducation(id, updateData);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error(error.message || "Failed to upload logo");
    } finally {
      setUploadingLogo(null);
    }
  };

  // Handle image removal - FIXED VERSION
  const handleImageRemove = async (id) => {
    try {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        toast.error("Please log in to remove image");
        return;
      }

      // Get the current education data to preserve all fields
      const currentEducation = education.find(edu => edu._id === id);
      if (!currentEducation) {
        throw new Error("Education entry not found");
      }

      // Update the education with empty logo while preserving all other fields
      const updateData = {
        ...currentEducation, // Preserve all existing fields
        logo: "" // Only update the logo field
      };

      await updateEducation(id, updateData);
      toast.success("Logo removed successfully");
    } catch (error) {
      console.error("Error removing logo:", error);
      toast.error(error.message || "Failed to remove logo");
    }
  };

  // Handle input changes WITHOUT auto-save to prevent typing issues
  const handleInputChange = (id, field, value) => {
    handleEducationChange(id, field, value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString + "-01");
      return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
    } catch (error) {
      return "";
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center relative z-10">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-400 font-medium">
            Loading education...
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
            Education
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start w-full">
          {/* Left Column - Form */}
          <div className="w-full bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-2 sm:p-4 md:p-6 lg:col-span-2 border border-gray-700/30">
            <div className="flex justify-between items-center mb-6 px-2 sm:px-0">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiEdit className="w-5 h-5" />
                Edit Education
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={addNewEducation}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 flex items-center gap-2 group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center gap-2">
                    <FiPlus className="w-4 h-4" />
                    Add Education
                  </span>
                </button>
                {education.length > 0 && (
                  <button
                    onClick={handleSaveAllEducation}
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
                          Save All Education
                        </>
                      )}
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {education.map((edu, index) => (
                <div
                  key={edu._id}
                  className="w-full bg-gray-800/50 rounded-xl border border-gray-700/50"
                >
                  <div
                    className="flex flex-row justify-between items-center px-4 py-3 sm:px-6 sm:py-4 cursor-pointer select-none"
                    onClick={() =>
                      setExpandedEducationId(
                        expandedEducationId === edu._id ? null : edu._id
                      )
                    }
                    title={`Show/Hide Education #${index + 1}`}
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                      {expandedEducationId === edu._id ? (
                        <FiChevronUp className="mr-2" />
                      ) : (
                        <FiChevronDown className="mr-2" />
                      )}
                      Education #{index + 1}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeEducation(edu._id);
                      }}
                      className="p-2 text-red-400 hover:text-red-300 transition"
                      title="Remove Education"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {expandedEducationId === edu._id && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-1 sm:pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 mb-4">
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Degree/Certificate
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition placeholder-gray-500"
                            value={edu.degree || ""}
                            onChange={(e) =>
                              handleInputChange(edu._id, "degree", e.target.value)
                            }
                            placeholder="e.g., Bachelor of Computer Science"
                          />
                        </div>

                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            University/Institution
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition placeholder-gray-500"
                            value={edu.university || ""}
                            onChange={(e) =>
                              handleInputChange(edu._id, "university", e.target.value)
                            }
                            placeholder="e.g., Harvard University"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 mb-4">
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Location
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition placeholder-gray-500"
                            value={edu.location || ""}
                            onChange={(e) =>
                              handleInputChange(edu._id, "location", e.target.value)
                            }
                            placeholder="e.g., Cambridge, MA, USA"
                          />
                        </div>

                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            University Logo
                          </label>
                          
                          {/* Logo Preview */}
                          {edu.logo ? (
                            <div className="mb-3">
                              <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                                <img
                                  src={`http://localhost:5000${edu.logo}`}
                                  alt={`${edu.university} logo`}
                                  className="w-16 h-16 rounded-lg object-cover border border-gray-600"
                                  onError={(e) => {
                                    // If image fails to load, remove it
                                    handleImageRemove(edu._id);
                                  }}
                                />
                                <div className="flex-1">
                                  <p className="text-green-400 text-sm font-medium mb-1">✓ Logo uploaded successfully</p>
                                  <p className="text-gray-400 text-xs">Image will appear in preview</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleImageRemove(edu._id)}
                                  className="p-2 text-red-400 hover:text-red-300 transition"
                                  title="Remove logo"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : null}
                          
                          {/* Upload Section - Only show if no logo exists */}
                          {!edu.logo && (
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
                                      handleLogoUpload(edu._id, file);
                                    }
                                  }}
                                />
                                <button
                                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-dashed border-gray-600 hover:border-blue-500"
                                  disabled={uploadingLogo === edu._id}
                                >
                                  {uploadingLogo === edu._id ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <FiUpload className="w-4 h-4" />
                                      Click to upload university logo
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {/* Upload instructions */}
                          {!edu.logo && (
                            <p className="mt-2 text-xs text-gray-400">
                              Supported formats: JPG, PNG, GIF, SVG. Max size: 5MB
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 mb-4">
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Start Date
                          </label>
                          <input
                            type="month"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                            value={edu.startDate || ""}
                            onChange={(e) =>
                              handleInputChange(edu._id, "startDate", e.target.value)
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
                            value={edu.endDate || ""}
                            onChange={(e) =>
                              handleInputChange(edu._id, "endDate", e.target.value)
                            }
                            disabled={edu.current}
                          />
                        </div>

                        <div className="form-group flex items-end">
                          <label className="flex items-center text-sm font-medium text-gray-300 mb-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="mr-2 w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
                              checked={edu.current || false}
                              onChange={(e) =>
                                handleInputChange(edu._id, "current", e.target.checked)
                              }
                            />
                            Currently studying here
                          </label>
                        </div>
                      </div>

                      <div className="form-group mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Education Description & Achievements
                        </label>

                        <div className="bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl focus-within:border-gray-500 transition">
                          <Editor
                            apiKey="h2ar80nttlx4hli43ugzp4wvv9ej7q3feifsu8mqssyfga6s"
                            value={edu.desc || ""}
                            onEditorChange={(content) => handleEditorChange(edu._id, content)}
                            init={{
                              height: 250,
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
                              placeholder: "• Relevant coursework and projects...\n• Academic achievements and awards...\n• Extracurricular activities and leadership roles...",
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-6">
                        <button
                          onClick={() => handleSaveEducation(edu)}
                          disabled={savingEducation[edu._id]}
                          className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                          <span className="relative flex items-center justify-center gap-2">
                            {savingEducation[edu._id] ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <FiSave className="w-4 h-4" />
                                Save Education
                              </>
                            )}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {education.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
                  <p className="text-gray-400 mb-4">
                    No education entries added yet
                  </p>
                  <button
                    onClick={addNewEducation}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 flex items-center gap-2 mx-auto group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative flex items-center gap-2">
                      <FiPlus className="w-4 h-4" />
                      Add Your First Education
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
                      <FiBook className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        Education
                      </h2>
                      <p className="text-cyan-200 text-sm opacity-80">
                        {education.length} Entr{education.length !== 1 ? "ies" : "y"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {education.length > 0 ? (
                  <div className="space-y-6">
                    {education.map((edu, index) => (
                      <div
                        key={edu._id || index}
                        className="group relative p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5"
                      >
                        <div className="flex items-start space-x-4">
                          {/* University Logo/Icon */}
                          <div className="relative z-10 flex-shrink-0">
                            {edu.logo ? (
                              <img
                                src={`http://localhost:5000${edu.logo}`}
                                alt={`${edu.university} logo`}
                                className="w-12 h-12 rounded-lg object-cover shadow-lg border border-gray-600"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg ${
                                edu.logo ? "hidden" : "flex"
                              }`}
                            >
                              <FiBook className="w-6 h-6 text-white" />
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                                {edu.degree || "Degree Name"}
                              </h3>
                              <div className="flex items-center gap-2 text-cyan-300 text-sm">
                                <FiCalendar className="w-4 h-4" />
                                <span>
                                  {formatDate(edu.startDate) || "Start Date"} -{" "}
                                  {edu.current ? "Present" : (formatDate(edu.endDate) || "End Date")}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                              <div className="flex items-center gap-1 text-blue-300">
                                <FiUser className="w-4 h-4" />
                                <span className="font-medium">{edu.university || "University Name"}</span>
                              </div>
                              {edu.location && (
                                <div className="flex items-center gap-1 text-gray-400">
                                  <FiMapPin className="w-3 h-3" />
                                  <span className="text-sm">{edu.location}</span>
                                </div>
                              )}
                            </div>

                            <div className="text-gray-300 leading-relaxed text-sm space-y-3 max-w-none preview-content">
                              {edu.desc ? (
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: edu.desc,
                                  }}
                                  className="preview-html-content"
                                />
                              ) : (
                                <p className="text-gray-400 italic">No description provided. Add your academic achievements and coursework details.</p>
                              )}
                            </div>

                            {edu.current && (
                              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 mt-3">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                                <span className="text-green-300 text-xs font-medium">Currently Studying</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-700/50">
                      <FiBook className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-400 mb-2">No education to display</p>
                    <p className="text-gray-500 text-sm">Add some education entries to see the preview</p>
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

export default Education;