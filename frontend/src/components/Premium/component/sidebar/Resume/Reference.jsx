import React, { useState, useEffect } from "react";
import {
  FiEdit,
  FiEye,
  FiSave,
  FiPlus,
  FiTrash2,
  FiUser,
  FiMail,
  FiBriefcase,
  FiPhone,
  FiAward,
  FiMapPin,
  FiUpload,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
// TINYMCE_ADDED: Import TinyMCE Editor
import { Editor } from "@tinymce/tinymce-react";

const Reference = () => {
  const [references, setReferences] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(null);
  const [expandedReferenceId, setExpandedReferenceId] = useState(null);
  const [savingReference, setSavingReference] = useState({});

  // Fetch references on component mount
  useEffect(() => {
    fetchReferences();
  }, []);

  const fetchReferences = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/resume/references", {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch references");

      const data = await response.json();
      setReferences(data.references || []);
    } catch (error) {
      console.error("Error fetching references:", error);
      toast.error("Failed to load references");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReferenceChange = (id, field, value) => {
    setReferences((prev) =>
      prev.map((ref) =>
        ref._id === id ? { ...ref, [field]: value } : ref
      )
    );
  };

  // TINYMCE_ADDED: New handler for editor content changes
  const handleEditorChange = (id, content) => {
    handleReferenceChange(id, "desc", content);
  };

  const addNewReference = async () => {
    try {
      const token = localStorage.getItem("token");
      const newReference = {
        name: "",
        email: "",
        designation: "",
        phone: "",
        workplace: "",
        image: "",
        desc: "",
      };

      const response = await fetch("http://localhost:5000/api/resume/references", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(newReference),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to add reference");
      }

      const data = await response.json();
      const newReferenceWithId = data.reference;
      setReferences((prev) => [...prev, newReferenceWithId]);
      setExpandedReferenceId(newReferenceWithId._id); // Auto-expand new reference
      toast.success("Reference added successfully");
    } catch (error) {
      console.error("Error adding reference:", error);
      toast.error(error.message || "Failed to add reference");
    }
  };

  const updateReference = async (id, updateData) => {
    try {
      if (!id) {
        console.error("No ID provided for update");
        return false;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/resume/references/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to update reference");
      }

      const data = await response.json();
      setReferences((prev) =>
        prev.map((ref) => (ref._id === id ? data.reference : ref))
      );
      return true;
    } catch (error) {
      console.error("Error updating reference:", error);
      toast.error(error.message || "Failed to update reference");
      return false;
    }
  };

  const removeReference = async (id) => {
    // Allow deleting all references - no minimum requirement
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/resume/references/${id}`, {
        method: "DELETE",
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to delete reference");
      }

      setReferences((prev) => prev.filter((ref) => ref._id !== id));
      if (expandedReferenceId === id) setExpandedReferenceId(null);
      toast.success("Reference removed successfully");
    } catch (error) {
      console.error("Error deleting reference:", error);
      toast.error(error.message || "Failed to delete reference");
    }
  };

  const handleSaveReference = async (reference) => {
    setSavingReference(prev => ({ ...prev, [reference._id]: true }));
    
    const success = await updateReference(reference._id, {
      name: reference.name || "",
      email: reference.email || "",
      designation: reference.designation || "",
      phone: reference.phone || "",
      workplace: reference.workplace || "",
      image: reference.image || "",
      desc: reference.desc || "",
    });
    
    if (success) {
      toast.success("Reference saved successfully!");
    }
    
    setSavingReference(prev => ({ ...prev, [reference._id]: false }));
  };

  const handleSaveAll = async () => {
    if (references.length === 0) {
      toast.error("No references to save");
      return;
    }

    setIsSaving(true);
    try {
      const savePromises = references.map((ref) =>
        updateReference(ref._id, {
          name: ref.name || "",
          email: ref.email || "",
          designation: ref.designation || "",
          phone: ref.phone || "",
          workplace: ref.workplace || "",
          image: ref.image || "",
          desc: ref.desc || "",
        })
      );

      const results = await Promise.all(savePromises);
      const allSaved = results.every(result => result === true);
      
      if (allSaved) {
        toast.success("All references saved successfully!");
      } else {
        toast.error("Some references failed to save");
      }
    } catch (error) {
      console.error("Error saving references:", error);
      toast.error("Failed to save references");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle file upload for profile image
  const handleImageUpload = async (id, file) => {
    if (!file) return;

    try {
      setUploadingImage(id);
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
        throw new Error(errorData.msg || "Failed to upload image");
      }

      const data = await response.json();
      const imageUrl = data.filePath;

      // Update the reference with the new image URL
      await updateReference(id, { image: imageUrl });
      toast.success("Profile image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploadingImage(null);
    }
  };

  // Handle input changes WITHOUT auto-save to prevent typing issues
  const handleInputChange = (id, field, value) => {
    handleReferenceChange(id, field, value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#020617] py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading references...</div>
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
                Edit References
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={addNewReference}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 flex items-center gap-2 group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center gap-2">
                    <FiPlus className="w-4 h-4" />
                    Add Reference
                  </span>
                </button>
                {references.length > 0 && (
                  <button
                    onClick={handleSaveAll}
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
                          Save All
                        </>
                      )}
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {references.map((reference, index) => (
                <div
                  key={reference._id || index}
                  className="w-full bg-gray-800/50 rounded-xl border border-gray-700/50"
                >
                  {/* Dropdown Header */}
                  <div
                    className="flex flex-row justify-between items-center px-4 py-3 sm:px-6 sm:py-4 cursor-pointer select-none"
                    onClick={() =>
                      setExpandedReferenceId(
                        expandedReferenceId === reference._id ? null : reference._id
                      )
                    }
                    title={`Show/Hide Reference #${index + 1}`}
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                      {expandedReferenceId === reference._id ? (
                        <FiChevronUp className="mr-2" />
                      ) : (
                        <FiChevronDown className="mr-2" />
                      )}
                      Reference #{index + 1}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeReference(reference._id);
                      }}
                      className="p-2 text-red-400 hover:text-red-300 transition"
                      title="Remove Reference"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Expandable Content */}
                  {expandedReferenceId === reference._id && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-1 sm:pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Reference Name
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition placeholder-gray-500"
                            value={reference.name || ""}
                            onChange={(e) =>
                              handleInputChange(
                                reference._id,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="e.g., John Smith"
                          />
                        </div>

                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition placeholder-gray-500"
                            value={reference.email || ""}
                            onChange={(e) =>
                              handleInputChange(
                                reference._id,
                                "email",
                                e.target.value
                              )
                            }
                            placeholder="e.g., name@company.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Designation
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition placeholder-gray-500"
                            value={reference.designation || ""}
                            onChange={(e) =>
                              handleInputChange(
                                reference._id,
                                "designation",
                                e.target.value
                              )
                            }
                            placeholder="e.g., Senior Manager"
                          />
                        </div>

                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition placeholder-gray-500"
                            value={reference.phone || ""}
                            onChange={(e) =>
                              handleInputChange(
                                reference._id,
                                "phone",
                                e.target.value
                              )
                            }
                            placeholder="e.g., +1 (555) 123-4567"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Workplace/Company
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition placeholder-gray-500"
                            value={reference.workplace || ""}
                            onChange={(e) =>
                              handleInputChange(
                                reference._id,
                                "workplace",
                                e.target.value
                              )
                            }
                            placeholder="e.g., Google Inc."
                          />
                        </div>

                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Profile Image
                          </label>
                          
                          {/* Profile Image Preview */}
                          {reference.image ? (
                            <div className="mb-3">
                              <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                                <img
                                  src={`http://localhost:5000${reference.image}`}
                                  alt={`${reference.name} profile`}
                                  className="w-16 h-16 rounded-lg object-cover border border-gray-600"
                                  onError={(e) => {
                                    // If image fails to load, show the upload section
                                    handleInputChange(reference._id, "image", "");
                                  }}
                                />
                                <div className="flex-1">
                                  <p className="text-green-400 text-sm font-medium mb-1">✓ Image uploaded successfully</p>
                                  <p className="text-gray-400 text-xs">Image will appear in preview</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleInputChange(reference._id, "image", "")}
                                  className="p-2 text-red-400 hover:text-red-300 transition"
                                  title="Remove image"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : null}
                          
                          {/* Upload Section - Only show if no image exists */}
                          {!reference.image && (
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
                                      handleImageUpload(reference._id, file);
                                    }
                                  }}
                                />
                                <button
                                  className="w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-dashed border-gray-600 hover:border-cyan-500"
                                  disabled={uploadingImage === reference._id}
                                >
                                  {uploadingImage === reference._id ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <FiUpload className="w-4 h-4" />
                                      Click to upload profile image
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {/* Upload instructions */}
                          {!reference.image && (
                            <p className="mt-2 text-xs text-gray-400">
                              Supported formats: JPG, PNG, GIF, SVG. Max size: 5MB
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="form-group mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Reference Description & Relationship
                        </label>

                        {/* TinyMCE Editor */}
                        <div className="bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl focus-within:border-gray-500 transition">
                          <Editor
                            apiKey="h2ar80nttlx4hli43ugzp4wvv9ej7q3feifsu8mqssyfga6s"
                            value={reference.desc || ""}
                            onEditorChange={(content) => handleEditorChange(reference._id, content)}
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
                              placeholder: "Describe your relationship, work experience together, and why they're recommending you...",
                            }}
                          />
                        </div>
                      </div>

                      {/* Individual Save Button */}
                      <div className="mt-6">
                        <button
                          onClick={() => handleSaveReference(reference)}
                          disabled={savingReference[reference._id] || uploadingImage === reference._id}
                          className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                          <span className="relative flex items-center justify-center gap-2">
                            {savingReference[reference._id] ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <FiSave className="w-4 h-4" />
                                Save Reference
                              </>
                            )}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {references.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
                  <FiUser className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-400 mb-4">No references added yet</p>
                  <button
                    onClick={addNewReference}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 flex items-center gap-2 mx-auto group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative flex items-center gap-2">
                      <FiPlus className="w-4 h-4" />
                      Add Your First Reference
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Preview (unchanged) */}
          <div className="bg-transparent rounded-2xl p-6 border border-cyan-500/30 self-start overflow-y-auto backdrop-blur-lg">
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
                      Professional References
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-100">
                    <FiUser className="w-5 h-5" />
                    <span className="text-sm">{references.length} Reference{references.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-6 space-y-6">
                {references.map((reference, index) => (
                  <div
                    key={reference._id || index}
                    className="group relative"
                  >
                    <div className="relative flex items-start space-x-4 p-4 rounded-xl bg-gray-800/40 hover:bg-gray-700/50 transition-all duration-300 border border-cyan-500/20 hover:border-cyan-400/40">
                      {/* Profile Avatar */}
                      <div className="relative z-10 flex-shrink-0">
                        {reference.image ? (
                          <img
                            src={`http://localhost:5000${reference.image}`}
                            alt={`${reference.name} profile`}
                            className="w-12 h-12 rounded-lg object-cover shadow-lg border border-gray-600"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg ${reference.image ? 'hidden' : 'flex'}`}>
                          <FiUser className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                          <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {reference.name || "Reference Name"}
                          </h3>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-1 text-blue-300">
                            <FiBriefcase className="w-4 h-4" />
                            <span className="font-medium">{reference.designation || "Designation"}</span>
                          </div>
                          {reference.workplace && (
                            <div className="flex items-center gap-1 text-gray-400">
                              <span className="text-sm">at {reference.workplace}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 mb-3">
                          {reference.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <FiMail className="w-3 h-3" />
                              <span>{reference.email}</span>
                            </div>
                          )}
                          {reference.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <FiPhone className="w-3 h-3" />
                              <span>{reference.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* TINYMCE_UPDATED: Fixed preview to properly display HTML content */}
                        <div className="text-gray-300 leading-relaxed text-sm space-y-3 max-w-none preview-content">
                          {reference.desc ? (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: reference.desc,
                              }}
                              className="preview-html-content"
                            />
                          ) : (
                            <p className="text-gray-400 italic">No description provided. Add your relationship and work experience together.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {references.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>No references to display</p>
                    <p className="text-sm">Add some references to see the preview</p>
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

export default Reference;