import React, { useState, useEffect, useContext } from "react";
import { FiEdit, FiEye, FiSave, FiUpload, FiTrash2 } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { Editor } from "@tinymce/tinymce-react";
import AuthContext from "../../../../../context/AuthContext"; // Adjust import path as needed

const Navbar = () => {
  const { checkAuth } = useContext(AuthContext);
  const [navbarData, setNavbarData] = useState({
    name: "",
    logo: "",
    content: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Fetch navbar data on component mount
  useEffect(() => {
    fetchNavbarData();
  }, []);

  const fetchNavbarData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoading(false);
        toast.error("Please log in to access this page");
        return;
      }

      const response = await fetch("http://localhost:5000/api/navbar", {
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

      if (!response.ok) throw new Error("Failed to fetch navbar data");

      const data = await response.json();
      setNavbarData(data.navbar || { name: "", logo: "", content: "" });
    } catch (error) {
      console.error("Error fetching navbar data:", error);
      toast.error("Failed to load navbar data");
      // Set default data
      setNavbarData({ name: "", logo: "", content: "" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setNavbarData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditorChange = (content) => {
    handleChange("content", content);
  };

  // Handle logo upload
  const handleLogoUpload = async (file) => {
    if (!file) return;

    // Check authentication before uploading
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      toast.error("Please log in to upload logo");
      return;
    }

    try {
      setUploadingLogo(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("logo", file);

      const response = await fetch(
        "http://localhost:5000/api/navbar/upload-logo",
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
      handleChange("logo", logoUrl);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error(error.message || "Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    // Check authentication before saving
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      toast.error("Please log in to save changes");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/navbar", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(navbarData),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please log in again.");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to save navbar");
      }

      toast.success("Navbar saved successfully!");
    } catch (error) {
      console.error("Error saving navbar:", error);
      toast.error(error.message || "Failed to save navbar");
    } finally {
      setIsSaving(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center relative z-10">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-400 font-medium">
            Loading navbar information...
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
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8 relative overflow-visible">
      <div className="mx-auto relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Navigation Bar
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column - Form */}
          <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-6 lg:col-span-2 border border-gray-700/30">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FiEdit className="w-5 h-5" />
              Edit Navigation Bar
            </h2>

            <div className="space-y-6">
              {/* Logo Upload Section */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Navbar Logo
                </label>

                {/* Logo Preview */}
                {navbarData.logo ? (
                  <div className="mb-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <img
                        src={`http://localhost:5000${navbarData.logo}`}
                        alt="Navbar logo"
                        className="w-16 h-16 rounded-lg object-cover border border-gray-600"
                        onError={(e) => {
                          handleChange("logo", "");
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-green-400 text-sm font-medium mb-1">
                          ✓ Logo uploaded successfully
                        </p>
                        <p className="text-gray-400 text-xs">
                          Image will appear in navigation
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleChange("logo", "")}
                        className="p-2 text-red-400 hover:text-red-300 transition"
                        title="Remove logo"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Upload Section */}
                {!navbarData.logo && (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleLogoUpload(file);
                          }
                        }}
                      />
                      <button
                        className="w-full px-4 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-dashed border-gray-600 hover:border-blue-500"
                        disabled={uploadingLogo}
                      >
                        {uploadingLogo ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <FiUpload className="w-4 h-4" />
                            Click to upload navbar logo
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {!navbarData.logo && (
                  <p className="mt-2 text-xs text-gray-400">
                    Supported formats: JPG, PNG, GIF, SVG. Max size: 5MB
                  </p>
                )}
              </div>

              {/* Navbar Name Field */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Navbar Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition placeholder-gray-500"
                  value={navbarData.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., John Doe Portfolio"
                />
              </div>

              {/* Text Editor */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Navigation Content
                </label>
                <div className="bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl focus-within:border-gray-500 transition">
                  <Editor
                    apiKey="h2ar80nttlx4hli43ugzp4wvv9ej7q3feifsu8mqssyfga6s"
                    value={navbarData.content || ""}
                    onEditorChange={handleEditorChange}
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
                      placeholder: "Add your navigation menu items here...",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8">
              <button
                onClick={handleSave}
                disabled={isSaving}
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
                      Save Navigation Bar
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-700/30 sticky top-8 self-start overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FiEye className="w-5 h-5" />
              Live Preview
            </h2>

            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 rounded-2xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-all duration-500 border border-gray-600/30 hover:border-cyan-500/30">
              {/* Preview Header */}
              <div className="relative bg-gradient-to-r from-slate-800 via-gray-800 to-slate-900 p-6 overflow-hidden border-b border-gray-700/50">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/5"></div>
                <div className="absolute top-4 right-4 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-purple-500/10 rounded-full blur-lg"></div>

                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="relative">
                      <h2 className="text-2xl font-bold text-white">
                        Navigation Bar
                      </h2>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-6">
                <div className="bg-gray-800/40 rounded-xl p-6 border border-cyan-500/20">
                  {/* Navbar Preview */}
                  <nav className="flex items-center justify-between p-4 bg-gray-900/80 rounded-lg border border-gray-700/50">
                    {/* Logo and Name */}
                    <div className="flex items-center gap-4">
                      {navbarData.logo ? (
                        <img
                          src={`http://localhost:5000${navbarData.logo}`}
                          alt="Navbar logo"
                          className="w-10 h-10 rounded-lg object-cover border border-gray-600"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            L
                          </span>
                        </div>
                      )}
                      <span className="text-white font-semibold text-lg">
                        {navbarData.name || "Your Name"}
                      </span>
                    </div>
                  </nav>

                  {/* Navigation Content Preview */}
                  {navbarData.content && (
                    <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
                      <h3 className="text-cyan-300 font-semibold mb-3 text-sm">
                        Navigation Content:
                      </h3>
                      <div className="text-gray-300 text-sm leading-relaxed preview-content">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: navbarData.content,
                          }}
                          className="preview-html-content"
                        />
                      </div>
                    </div>
                  )}

                  {!navbarData.content && (
                    <div className="mt-6 p-6 bg-gray-900/50 rounded-lg border border-gray-700/30 text-center">
                      <FiEdit className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 italic text-sm">
                        Add navigation content to see preview
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Use the editor to create your navigation menu
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom styles for the preview content */}
      <style>{`
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
          color: #e5e7eb;
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
        .preview-content p {
          margin-bottom: 0.75rem;
        }
        .preview-content h1,
        .preview-content h2,
        .preview-content h3,
        .preview-content h4,
        .preview-content h5,
        .preview-content h6 {
          color: #e5e7eb;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default Navbar;
