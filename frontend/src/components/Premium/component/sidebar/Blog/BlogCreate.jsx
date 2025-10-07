import React, { useState, useEffect, useRef, useContext } from "react";
import {
  FiEdit,
  FiEye,
  FiSave,
  FiPlus,
  FiTrash2,
  FiUpload,
  FiType,
  FiFileText,
  FiX,
  FiImage,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import AuthContext from "../../../../../context/AuthContext";

// TINYMCE_ADDED: Import TinyMCE Editor
import { Editor } from "@tinymce/tinymce-react";

const BlogCreate = () => {
  const { checkAuth } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState({});
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  // Form state - only for new blog creation
  const [form, setForm] = useState({
    title: "",
    category: "",
    content: "",
  });
  const [files, setFiles] = useState({ image: null });

  // TINYMCE_REMOVED: Removed textareaRef and formatting functions since TinyMCE handles formatting

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

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/blog-categories",
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(data.data || []);
        }
      }
    } catch (err) {
      console.error("Fetch categories error:", err);
      toast.error("Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch categories on component mount
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

        // Fetch categories only
        await fetchCategories();
      } catch (err) {
        console.error("Fetch error:", err);
        if (err.message.includes("401")) {
          toast.error("Authentication failed. Please log in again.");
        } else {
          toast.error(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      hasFetchedRef.current = false;
    };
  }, []);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // TINYMCE_ADDED: New handler for editor content changes
  const handleEditorChange = (content) => {
    handleFormChange("content", content);
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPEG, PNG, GIF, etc.)");
      return;
    }

    // Check file extension
    const fileExt = file.name.split(".").pop().toLowerCase();
    const allowedExt = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
    if (!allowedExt.includes(fileExt)) {
      toast.error("Only JPEG, PNG, GIF, WebP, and BMP images are allowed!");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Additional check for very small files
    if (file.size < 100) {
      toast.error("File appears to be too small or corrupt");
      return;
    }

    setUploadingImages((prev) => ({ ...prev, new: true }));

    try {
      const formData = new FormData();
      formData.append("image", file);

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/blogs/upload", {
        method: "POST",
        headers: {
          "x-auth-token": token,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Upload failed with status: ${response.status}`
        );
      }

      if (!data.success) {
        throw new Error(data.message || "Upload failed");
      }

      // Update form with FULL image URL
      const fullImageUrl = `http://localhost:5000${data.imageUrl}`;
      setFiles((prev) => ({ ...prev, image: fullImageUrl }));
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploadingImages((prev) => ({ ...prev, new: false }));
    }
  };

  const handleCreateBlog = async () => {
    if (!form.title || !form.category || !form.content) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!files.image) {
      toast.error("Please upload a blog image");
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");

      // FIXED: Now we're directly storing the category name (string) in the form state
      const blogData = {
        title: form.title,
        category: form.category, // This is now the category name string
        content: form.content,
        image: files.image,
        excerpt: form.content.replace(/<[^>]*>/g, "").substring(0, 150) + "...", // TINYMCE_UPDATED: Strip HTML tags for excerpt
        date: new Date().toISOString().split("T")[0],
      };

      const response = await fetch("http://localhost:5000/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(blogData),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please log in again.");
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Blog created successfully!");
        // Reset form
        setForm({ title: "", category: "", content: "" });
        setFiles({ image: null });
      } else {
        throw new Error(data.message || "Failed to create blog");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // TINYMCE_REMOVED: Removed all formatting functions (formatText, parseFormattedText) since TinyMCE handles all formatting internally

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center relative z-10">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-400 font-medium">Loading...</p>
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
            Create New Blog
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Create and publish a new blog post with rich text formatting and
            image uploads
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-6 lg:col-span-2 border border-gray-700/30">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <FiEdit className="w-5 h-5" />
              Blog Creation Form
            </h2>

            {/* New Blog Creation Form */}
            <div className="space-y-6">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiType className="w-4 h-4" />
                  Blog Title *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                  value={form.title}
                  onChange={(e) => handleFormChange("title", e.target.value)}
                  placeholder="Enter blog title"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiImage className="w-4 h-4" />
                  Blog Image *
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative group">
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition pr-10 group-hover:pr-10"
                      value={files.image || ""}
                      onChange={(e) => setFiles({ image: e.target.value })}
                      placeholder="Image URL or upload using button →"
                    />
                    {files.image && (
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100"
                        onClick={() => setFiles({ image: null })}
                        title="Remove image URL"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      id="image-upload-new"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleImageUpload(file);
                        }
                        e.target.value = "";
                      }}
                      disabled={uploadingImages["new"]}
                    />
                    <label
                      htmlFor="image-upload-new"
                      className={`px-4 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-medium 
                        hover:from-cyan-700 hover:to-teal-700 transition flex items-center gap-2 cursor-pointer ${
                          uploadingImages["new"]
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      title="Upload Image"
                    >
                      {uploadingImages["new"] ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FiUpload className="w-4 h-4" />
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiType className="w-4 h-4" />
                  Category *
                </label>
                <select
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                  value={form.category}
                  onChange={(e) => handleFormChange("category", e.target.value)}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option
                      key={category.id || category._id}
                      value={category.name} // FIXED: Store category name instead of ID
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <FiFileText className="w-4 h-4" />
                  Content *
                </label>

                {/* TINYMCE_REPLACED: Replaced custom formatting toolbar and textarea with TinyMCE Editor */}
                <div className="bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl focus-within:border-gray-500 transition">
                  <Editor
                    apiKey="h2ar80nttlx4hli43ugzp4wvv9ej7q3feifsu8mqssyfga6s" // TINYMCE_ADDED: Your API key
                    value={form.content}
                    onEditorChange={handleEditorChange}
                    init={{
                      height: 400,
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
                        h1, h2, h3, h4, h5, h6 { 
                          color: #f9fafb; 
                          margin: 16px 0 8px 0;
                          font-weight: bold;
                        }
                        h1 { font-size: 24px; }
                        h2 { font-size: 20px; }
                        h3 { font-size: 18px; }
                        h4 { font-size: 16px; }
                        blockquote { 
                          border-left: 4px solid #60a5fa; 
                          padding-left: 16px; 
                          margin: 16px 0;
                          font-style: italic;
                          color: #d1d5db;
                        }
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

              <button
                onClick={handleCreateBlog}
                disabled={isSaving}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-green-500/20 transform hover:-translate-y-0.5 border border-green-500/30"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center justify-center gap-2">
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Blog...
                    </>
                  ) : (
                    <>
                      <FiPlus className="w-4 h-4" />
                      Create Blog Post
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Live Preview Section */}
          <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-700/30 sticky top-8 self-start overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FiEye className="w-5 h-5" />
              Live Preview
            </h2>

            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 rounded-2xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-all duration-500 border border-gray-600/30 hover:border-cyan-500/30">
              {/* Sophisticated Header */}
              <div className="relative bg-gradient-to-r from-slate-800 via-gray-800 to-slate-900 p-6 overflow-hidden border-b border-gray-700/50">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/5"></div>
                <div className="absolute top-4 right-4 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-purple-500/10 rounded-full blur-lg"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg border border-cyan-400/30">
                      <FiFileText className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        Our Blog
                      </h2>
                      <p className="text-cyan-200 text-sm opacity-80">
                        Latest articles and insights
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {form.title || form.content || files.image ? (
                  <div className="group relative bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5 overflow-hidden">
                    {/* Blog Image */}
                    {files.image && (
                      <div className="w-full h-48 bg-gradient-to-br from-cyan-600 to-teal-600 overflow-hidden">
                        <img
                          src={
                            files.image.startsWith("/uploads")
                              ? `http://localhost:5000${files.image}`
                              : files.image
                          }
                          alt={form.title || "Blog Image"}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.classList.add(
                              "bg-gradient-to-br",
                              "from-cyan-600",
                              "to-teal-600"
                            );
                          }}
                        />
                      </div>
                    )}

                    <div className="p-5">
                      {/* Category Badge */}
                      {form.category && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-cyan-600/20 to-teal-600/20 border border-cyan-500/30 mb-3">
                          <span className="text-xs font-medium text-cyan-300">
                            {form.category}{" "}
                            {/* FIXED: Directly use the category name from form state */}
                          </span>
                        </div>
                      )}

                      {/* Blog Title */}
                      <h3 className="text-xl font-bold text-white mb-3 leading-tight">
                        {form.title || "Untitled Blog"}
                      </h3>

                      {/* Blog Content Preview */}
                      <div className="text-gray-300 text-sm leading-relaxed mb-4 max-w-none preview-content">
                        {form.content ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html:
                                form.content.substring(0, 500) +
                                (form.content.length > 500 ? "..." : ""),
                            }}
                            className="preview-html-content"
                          />
                        ) : (
                          <p className="text-gray-400 italic">
                            No content yet...
                          </p>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
                        <div className="inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30">
                          <span className="text-xs font-medium text-green-300">
                            New Post
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">Preview</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-600/50">
                      <FiEye className="w-7 h-7 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">
                      Start Creating
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Fill in the form to see a live preview of your blog post
                      here
                    </p>
                  </div>
                )}
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
        .preview-content h1,
        .preview-content h2,
        .preview-content h3,
        .preview-content h4,
        .preview-content h5,
        .preview-content h6 {
          color: #f9fafb;
          margin: 16px 0 8px 0;
          font-weight: bold;
        }
        .preview-content h1 {
          font-size: 24px;
        }
        .preview-content h2 {
          font-size: 20px;
        }
        .preview-content h3 {
          font-size: 18px;
        }
        .preview-content h4 {
          font-size: 16px;
        }
        .preview-content blockquote {
          border-left: 4px solid #60a5fa;
          padding-left: 16px;
          margin: 16px 0;
          font-style: italic;
          color: #d1d5db;
        }
      `}</style>
    </div>
  );
};

export default BlogCreate;
