/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  FiEdit,
  FiEye,
  FiSave,
  FiPlus,
  FiTrash2,
  FiAward,
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiUpload,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
// TINYMCE_ADDED: Import TinyMCE Editor
import { Editor } from "@tinymce/tinymce-react";

const AwardAndAchievements = () => {
  const [awards, setAwards] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(null);

  // Fetch awards on component mount
  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/resume/awards", {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch awards");

      const data = await response.json();
      setAwards(data.awards || []);
    } catch (error) {
      console.error("Error fetching awards:", error);
      toast.error("Failed to load awards");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAwardChange = (id, field, value) => {
    setAwards((prev) =>
      prev.map((award) =>
        award._id === id ? { ...award, [field]: value } : award
      )
    );
  };

  // TINYMCE_ADDED: New handler for editor content changes
  const handleEditorChange = (id, content) => {
    handleAwardChange(id, "desc", content);
  };

  const addNewAward = async () => {
    try {
      const token = localStorage.getItem("token");
      const newAward = {
        title: "",
        year: new Date().getFullYear().toString(),
        association: "",
        location: "",
        logo: "",
        desc: "",
      };

      const response = await fetch("http://localhost:5000/api/resume/awards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(newAward),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to add award");
      }

      const data = await response.json();
      setAwards((prev) => [...prev, data.award]);
      toast.success("Award added successfully");
    } catch (error) {
      console.error("Error adding award:", error);
      toast.error(error.message || "Failed to add award");
    }
  };

  const updateAward = async (id, updateData) => {
    try {
      if (!id) {
        console.error("No ID provided for update");
        return false;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/resume/awards/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to update award");
      }

      const data = await response.json();
      setAwards((prev) =>
        prev.map((award) => (award._id === id ? data.award : award))
      );
      return true;
    } catch (error) {
      console.error("Error updating award:", error);
      toast.error(error.message || "Failed to update award");
      return false;
    }
  };

  const removeAward = async (id) => {
    // Allow deleting all awards - no minimum requirement
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/resume/awards/${id}`,
        {
          method: "DELETE",
          headers: {
            "x-auth-token": token,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to delete award");
      }

      setAwards((prev) => prev.filter((award) => award._id !== id));
      toast.success("Award removed successfully");
    } catch (error) {
      console.error("Error deleting award:", error);
      toast.error(error.message || "Failed to delete award");
    }
  };

  const handleSave = async () => {
    if (awards.length === 0) {
      toast.error("No awards to save");
      return;
    }

    setIsSaving(true);
    try {
      const savePromises = awards.map((award) =>
        updateAward(award._id, {
          title: award.title || "",
          year: award.year || new Date().getFullYear().toString(),
          association: award.association || "",
          location: award.location || "",
          logo: award.logo || "",
          desc: award.desc || "",
        })
      );

      const results = await Promise.all(savePromises);
      const allSaved = results.every((result) => result === true);

      if (allSaved) {
        toast.success("Awards saved successfully!");
      } else {
        toast.error("Some awards failed to save");
      }
    } catch (error) {
      console.error("Error saving awards:", error);
      toast.error("Failed to save awards");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle file upload for award logo
  const handleLogoUpload = async (id, file) => {
    if (!file) return;

    try {
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to upload logo");
      }

      const data = await response.json();
      const logoUrl = data.filePath;

      // Update the award with the new logo URL
      await updateAward(id, { logo: logoUrl });
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error(error.message || "Failed to upload logo");
    } finally {
      setUploadingLogo(null);
    }
  };

  // TINYMCE_REMOVED: Removed all formatting functions (formatText, parseFormattedText, etc.)
  // since TinyMCE handles all formatting internally

  // Handle input changes WITHOUT auto-save to prevent typing issues
  const handleInputChange = (id, field, value) => {
    handleAwardChange(id, field, value);
  };

  // Manual save for description field
  const handleDescriptionBlur = async (id) => {
    const award = awards.find((award) => award._id === id);
    if (award && award.desc) {
      await updateAward(id, { desc: award.desc });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#020617] py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading awards...</div>
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
                Edit Awards & Achievements
              </h2>
              <button
                onClick={addNewAward}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Add Award
              </button>
            </div>

            <div className="space-y-6">
              {awards.map((award, index) => (
                <div
                  key={award._id || index}
                  className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Award #{index + 1}
                    </h3>
                    <button
                      onClick={() => removeAward(award._id)}
                      className="p-2 text-red-400 hover:text-red-300 transition"
                      title="Remove Award"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Award Title
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition placeholder-gray-500"
                        value={award.title || ""}
                        onChange={(e) =>
                          handleInputChange(award._id, "title", e.target.value)
                        }
                        placeholder="e.g., Best Developer Award"
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Award Year
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition placeholder-gray-500"
                        value={award.year || ""}
                        onChange={(e) =>
                          handleInputChange(award._id, "year", e.target.value)
                        }
                        placeholder="e.g., 2023"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Awarding Association
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition placeholder-gray-500"
                        value={award.association || ""}
                        onChange={(e) =>
                          handleInputChange(
                            award._id,
                            "association",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Developer Association"
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition placeholder-gray-500"
                        value={award.location || ""}
                        onChange={(e) =>
                          handleInputChange(
                            award._id,
                            "location",
                            e.target.value
                          )
                        }
                        placeholder="e.g., New York, USA"
                      />
                    </div>
                  </div>

                  <div className="form-group mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Award Logo
                    </label>

                    {/* Logo Preview */}
                    {award.logo ? (
                      <div className="mb-3">
                        <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                          <img
                            src={`http://localhost:5000${award.logo}`}
                            alt={`${award.title} logo`}
                            className="w-16 h-16 rounded-lg object-cover border border-gray-600"
                            onError={(e) => {
                              // If image fails to load, show the upload section
                              handleInputChange(award._id, "logo", "");
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-green-400 text-sm font-medium mb-1">
                              ✓ Logo uploaded successfully
                            </p>
                            <p className="text-gray-400 text-xs">
                              Image will appear in preview
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleInputChange(award._id, "logo", "")
                            }
                            className="p-2 text-red-400 hover:text-red-300 transition"
                            title="Remove logo"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {/* Upload Section - Only show if no logo exists */}
                    {!award.logo && (
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
                                handleLogoUpload(award._id, file);
                              }
                            }}
                          />
                          <button
                            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-dashed border-gray-600 hover:border-blue-500"
                            disabled={uploadingLogo === award._id}
                          >
                            {uploadingLogo === award._id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <FiUpload className="w-4 h-4" />
                                Click to upload award logo
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Upload instructions */}
                    {!award.logo && (
                      <p className="mt-2 text-xs text-gray-400">
                        Supported formats: JPG, PNG, GIF, SVG. Max size: 5MB
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Award Description & Achievements
                    </label>

                    {/* TINYMCE_REPLACED: Replaced custom formatting toolbar and textarea with TinyMCE Editor */}
                    <div className="bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl focus-within:border-gray-500 transition">
                      <Editor
                        apiKey="h2ar80nttlx4hli43ugzp4wvv9ej7q3feifsu8mqssyfga6s" // TINYMCE_ADDED: Your API key
                        value={award.desc || ""}
                        onEditorChange={(content) =>
                          handleEditorChange(award._id, content)
                        }
                        onBlur={() => handleDescriptionBlur(award._id)}
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
                          images_upload_url: "http://localhost:5000/api/upload", // Optional: Add your upload endpoint
                          relative_urls: false,
                          remove_script_host: false,
                          convert_urls: true,
                        }}
                      />
                    </div>

                    {/* TINYMCE_REMOVED: Removed formatting tips since TinyMCE has visual toolbar */}
                  </div>
                </div>
              ))}

              {awards.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <FiAward className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No awards added yet.</p>
                  <p className="text-sm">Click "Add Award" to get started.</p>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="mt-8">
              <button
                onClick={handleSave}
                disabled={isSaving || awards.length === 0}
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
                      Awards & Achievements
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-100">
                    <FiAward className="w-5 h-5" />
                    <span className="text-sm">
                      {awards.length} Award{awards.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-6 space-y-6">
                {awards.map((award, index) => (
                  <div key={award._id || index} className="group relative">
                    <div className="relative flex items-start space-x-4 p-4 rounded-xl bg-gray-800/40 hover:bg-gray-700/50 transition-all duration-300 border border-cyan-500/20 hover:border-cyan-400/40">
                      {/* Award Logo/Icon */}
                      <div className="relative z-10 flex-shrink-0">
                        {award.logo ? (
                          <img
                            src={`http://localhost:5000${award.logo}`}
                            alt={`${award.title} logo`}
                            className="w-12 h-12 rounded-lg object-cover shadow-lg border border-gray-600"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg ${
                            award.logo ? "hidden" : "flex"
                          }`}
                        >
                          <FiAward className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                          <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {award.title || "Award Title"}
                          </h3>
                          <div className="flex items-center gap-2 text-cyan-300 text-sm">
                            <FiCalendar className="w-4 h-4" />
                            <span className="font-semibold">
                              {award.year || "Year"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-1 text-blue-300">
                            <FiUsers className="w-4 h-4" />
                            <span className="font-medium">
                              {award.association || "Association"}
                            </span>
                          </div>
                          {award.location && (
                            <div className="flex items-center gap-1 text-gray-400">
                              <FiMapPin className="w-3 h-3" />
                              <span className="text-sm">{award.location}</span>
                            </div>
                          )}
                        </div>

                        <div className="prose prose-invert max-w-none">
                          {award.desc ? (
                            // TINYMCE_UPDATED: Fixed preview to properly display HTML content
                            <div className="text-gray-300 leading-relaxed text-sm space-y-3 max-w-none preview-content">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: award.desc,
                                }}
                                className="preview-html-content"
                              />
                            </div>
                          ) : (
                            <p className="text-gray-400 italic">
                              No description provided. Add award details and
                              achievements.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {awards.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>No awards to display</p>
                    <p className="text-sm">
                      Add some awards to see the preview
                    </p>
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

export default AwardAndAchievements;
