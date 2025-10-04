import React, { useState, useEffect, useRef, useContext } from "react";
import {
  FiEdit,
  FiSave,
  FiTrash2,
  FiUpload,
  FiType,
  FiFileText,
  FiX,
  FiArrowLeft,
  FiImage,
  FiEye,
  FiBold,
  FiItalic,
  FiList,
  FiLink,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import AuthContext from "../../../../../context/AuthContext";

const ModifyBlog = () => {
  const { checkAuth } = useContext(AuthContext);
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [content, setContent] = useState("");
  const [currentImage, setCurrentImage] = useState("");
  const hasFetchedRef = useRef(false);

  const textareaRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    category: "",
  });

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

  const getCategoryName = (categoryValue) => {
    if (!categoryValue) return "Uncategorized";

    if (
      typeof categoryValue === "string" &&
      !categoryValue.match(/^[0-9a-fA-F]{24}$/)
    ) {
      const foundCategory = categories.find(
        (cat) =>
          cat.name === categoryValue ||
          String(cat._id) === categoryValue ||
          String(cat.id) === categoryValue
      );
      return foundCategory ? foundCategory.name : categoryValue;
    }

    if (typeof categoryValue === "object" && categoryValue !== null) {
      return categoryValue.name || "Uncategorized";
    }

    const foundCategory = categories.find(
      (cat) =>
        String(cat._id) === String(categoryValue) ||
        String(cat.id) === String(categoryValue) ||
        cat.name === String(categoryValue)
    );

    return foundCategory ? foundCategory.name : "Uncategorized";
  };

  const getCategoryId = (categoryValue) => {
    if (!categoryValue) return "";

    if (
      typeof categoryValue === "string" &&
      categoryValue.match(/^[0-9a-fA-F]{24}$/)
    ) {
      return categoryValue;
    }

    if (typeof categoryValue === "number") {
      return String(categoryValue);
    }

    if (typeof categoryValue === "object" && categoryValue._id) {
      return categoryValue._id;
    }

    if (typeof categoryValue === "object" && categoryValue.id) {
      return String(categoryValue.id);
    }

    if (typeof categoryValue === "string") {
      const foundCategory = categories.find(
        (cat) =>
          cat.name === categoryValue ||
          String(cat._id) === categoryValue ||
          String(cat.id) === categoryValue
      );
      return foundCategory
        ? foundCategory._id || String(foundCategory.id)
        : categoryValue;
    }

    return String(categoryValue);
  };

  useEffect(() => {
    const fetchBlogsData = async () => {
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

        const categoriesResponse = await fetch(
          "http://localhost:5000/api/blog-categories",
          {
            headers: {
              "x-auth-token": token,
            },
          }
        );

        let categoriesArray = [];
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();

          if (Array.isArray(categoriesData)) {
            categoriesArray = categoriesData;
          } else if (
            categoriesData &&
            Array.isArray(categoriesData.categories)
          ) {
            categoriesArray = categoriesData.categories;
          } else if (
            categoriesData &&
            categoriesData.data &&
            Array.isArray(categoriesData.data)
          ) {
            categoriesArray = categoriesData.data;
          } else if (
            categoriesData &&
            categoriesData.success &&
            Array.isArray(categoriesData.data)
          ) {
            categoriesArray = categoriesData.data;
          }

          setCategories(categoriesArray);
        } else {
          setCategories([]);
        }

        const blogsResponse = await fetch("http://localhost:5000/api/blogs", {
          headers: {
            "x-auth-token": token,
          },
        });

        if (blogsResponse.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          toast.error("Session expired. Please log in again.");
          return;
        }

        if (!blogsResponse.ok) {
          const errorData = await blogsResponse.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${blogsResponse.status}`
          );
        }

        const blogsData = await blogsResponse.json();

        let blogsArray = [];
        if (Array.isArray(blogsData)) {
          blogsArray = blogsData;
        } else if (blogsData && Array.isArray(blogsData.blogs)) {
          blogsArray = blogsData.blogs;
        } else if (
          blogsData &&
          blogsData.data &&
          Array.isArray(blogsData.data)
        ) {
          blogsArray = blogsData.data;
        } else if (
          blogsData &&
          blogsData.success &&
          Array.isArray(blogsData.data)
        ) {
          blogsArray = blogsData.data;
        }

        setBlogs(blogsArray);
      } catch (err) {
        console.error("Fetch error:", err);
        if (err.message.includes("401")) {
          toast.error("Authentication failed. Please log in again.");
        } else if (err.message.includes("Failed to fetch")) {
          toast.error(
            "Cannot connect to server. Make sure the backend is running on port 5000."
          );
        } else {
          toast.error(err.message);
        }
        setBlogs([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogsData();

    return () => {
      hasFetchedRef.current = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPEG, PNG, GIF, etc.)");
      return;
    }

    const fileExt = file.name.split(".").pop().toLowerCase();
    const allowedExt = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
    if (!allowedExt.includes(fileExt)) {
      toast.error("Only JPEG, PNG, GIF, WebP, and BMP images are allowed!");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingImages((prev) => ({ ...prev, [editingId || "new"]: true }));

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

      const fullImageUrl = `http://localhost:5000${data.imageUrl}`;
      setCurrentImage(fullImageUrl);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploadingImages((prev) => ({ ...prev, [editingId || "new"]: false }));
    }
  };

  const removeImage = () => {
    setCurrentImage("");
  };

  const startEditing = (blog) => {
    const categoryId = getCategoryId(blog.category);

    setForm({
      title: blog.title || "",
      category: categoryId,
    });
    setContent(blog.content || "");
    setCurrentImage(blog.image || "");
    setEditingId(blog._id || blog.id);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ title: "", category: "" });
    setContent("");
    setCurrentImage("");
  };

  const handleSave = async () => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      toast.error("Please log in to save changes");
      return;
    }

    if (!form.title || !form.category || !content) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");

      const blogData = {
        title: form.title,
        category: form.category,
        content: content,
        image: currentImage,
      };

      let response;
      if (editingId) {
        response = await fetch(`http://localhost:5000/api/blogs/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify(blogData),
        });
      } else {
        response = await fetch("http://localhost:5000/api/blogs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify(blogData),
        });
      }

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please log in again.");
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(
          editingId
            ? "Blog updated successfully!"
            : "Blog created successfully!"
        );
        cancelForm();
        const refreshResponse = await fetch("http://localhost:5000/api/blogs", {
          headers: {
            "x-auth-token": token,
          },
        });
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData.success) {
            setBlogs(refreshData.data || []);
          }
        }
      } else {
        throw new Error(data.message || "Failed to save blog");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      toast.error("Please log in to delete");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this blog post?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:5000/api/blogs/${id}`, {
        method: "DELETE",
        headers: {
          "x-auth-token": token,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success("Blog deleted successfully!");
          setBlogs((prev) =>
            prev.filter((blog) => (blog._id || blog.id) !== id)
          );
        } else {
          throw new Error(data.message || "Failed to delete blog");
        }
      } else {
        if (response.status === 404) {
          throw new Error("Blog not found. It may have been already deleted.");
        } else if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          toast.error("Session expired. Please log in again.");
          return;
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Failed to delete blog (Status: ${response.status})`
          );
        }
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message);
    }
  };

  const formatText = (format) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let formattedText = "";
    let newStart = start;
    let newEnd = end;

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`;
        newStart = start + 2;
        newEnd = end + 2;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        newStart = start + 1;
        newEnd = end + 1;
        break;
      case "bullet":
        if (selectedText) {
          formattedText = `• ${selectedText}`;
          newStart = start + 2;
          newEnd = end + 2;
        } else {
          formattedText = "• ";
          newStart = start + 2;
          newEnd = start + 2;
        }
        break;
      case "link":
        formattedText = `[${selectedText || "link"}](${
          selectedText ? "url" : "https://example.com"
        })`;
        newStart = start + 1;
        newEnd = selectedText ? end + 1 : start + 5;
        break;
      default:
        formattedText = selectedText;
    }

    const newContent =
      content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newStart, newEnd);
      }
    }, 0);
  };

  const parseFormattedText = (text) => {
    if (!text) return null;

    return text.split("\n").map((line, index) => {
      if (line.trim().startsWith("•")) {
        return (
          <div key={index} className="flex items-start">
            <span className="mr-2">•</span>
            <span>{line.replace("•", "").trim()}</span>
          </div>
        );
      }

      let formattedLine = line;
      formattedLine = formattedLine.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
      );
      formattedLine = formattedLine.replace(/\*(.*?)\*/g, "<em>$1</em>");
      formattedLine = formattedLine.replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a href="$2" class="text-blue-600 underline">$1</a>'
      );

      return (
        <p
          key={index}
          className="text-white leading-relaxed text-sm mb-3"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  const getEditingBlog = () => {
    if (!editingId) return null;
    return blogs.find((blog) => (blog._id || blog.id) === editingId);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center relative z-10">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-400 font-medium">Loading blogs...</p>
          {loadingTimedOut && (
            <p className="mt-2 text-yellow-400 text-sm">
              Taking longer than expected. Check your connection.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (showForm) {
    const editingBlog = getEditingBlog();

    return (
      <div className="w-full py-8 px-4 sm:px-6 lg:px-8 relative overflow-visible">
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              {editingId ? "Edit Blog Post" : "Create New Blog Post"}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-700/30 lg:col-span-2">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FiEdit className="w-5 h-5" />
                {editingId ? "Edit Blog Post" : "Create New Blog Post"}
              </h2>

              <div className="space-y-6">
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FiType className="w-4 h-4" />
                    Blog Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter blog title"
                  />
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FiType className="w-4 h-4" />
                    Category *
                  </label>
                  <select
                    name="category"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                    value={form.category}
                    onChange={handleChange}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option
                        key={category._id || category.id}
                        value={category._id || category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {form.category && (
                    <p className="text-sm text-gray-400 mt-1">
                      Selected: {getCategoryName(form.category)}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FiImage className="w-4 h-4" />
                    Blog Image
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative group">
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition pr-10 group-hover:pr-10"
                        value={currentImage}
                        onChange={(e) => setCurrentImage(e.target.value)}
                        placeholder="Image URL or upload using button →"
                      />
                      {currentImage && (
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100"
                          onClick={removeImage}
                          title="Remove image URL"
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleImageUpload(file);
                          }
                          e.target.value = "";
                        }}
                        disabled={uploadingImages[editingId || "new"]}
                      />
                      <label
                        htmlFor="image-upload"
                        className={`px-4 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-medium 
                          hover:from-cyan-700 hover:to-teal-700 transition flex items-center gap-2 cursor-pointer ${
                            uploadingImages[editingId || "new"]
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        title="Upload Image"
                      >
                        {uploadingImages[editingId || "new"] ? (
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
                    <FiFileText className="w-4 h-4" />
                    Content *
                  </label>

                  <div className="flex gap-2 mb-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <button
                      type="button"
                      onClick={() => formatText("bold")}
                      className="p-2 hover:bg-gray-700 rounded transition"
                      title="Bold"
                    >
                      <FiBold className="w-4 h-4 text-gray-300" />
                    </button>
                    <button
                      type="button"
                      onClick={() => formatText("italic")}
                      className="p-2 hover:bg-gray-700 rounded transition"
                      title="Italic"
                    >
                      <FiItalic className="w-4 h-4 text-gray-300" />
                    </button>
                    <button
                      type="button"
                      onClick={() => formatText("bullet")}
                      className="p-2 hover:bg-gray-700 rounded transition"
                      title="Bullet List"
                    >
                      <FiList className="w-4 h-4 text-gray-300" />
                    </button>
                    <button
                      type="button"
                      onClick={() => formatText("link")}
                      className="p-2 hover:bg-gray-700 rounded transition"
                      title="Add Link"
                    >
                      <FiLink className="w-4 h-4 text-gray-300" />
                    </button>
                  </div>

                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition min-h-[200px] resize-none"
                    placeholder="Enter blog content"
                  />

                  <div className="mt-2 text-xs text-gray-400">
                    <p>
                      Formatting tips: Use **bold**, *italic*, • bullet points,
                      [links](url)
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={cancelForm}
                  className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300 flex items-center justify-center gap-2 border border-gray-600"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 group relative bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30"
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
                        {editingId ? "Update Blog Post" : "Create Blog Post"}
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>

            <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-700/30 sticky top-8 self-start overflow-y-auto">
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
                  {form.title || currentImage || content ? (
                    <div className="group relative bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5 overflow-hidden">
                      {currentImage && (
                        <div className="w-full h-48 bg-gradient-to-br from-cyan-600 to-teal-600 overflow-hidden">
                          <img
                            src={
                              currentImage.startsWith("/uploads")
                                ? `http://localhost:5000${currentImage}`
                                : currentImage
                            }
                            alt={form.title || "Blog"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = "none";
                              const fallback = e.target.nextSibling;
                              if (fallback && fallback.style) {
                                fallback.style.display = "flex";
                              }
                            }}
                          />
                          <div className="w-full h-full bg-gradient-to-br from-cyan-600 to-teal-600 hidden items-center justify-center text-white text-sm font-bold">
                            Blog Image
                          </div>
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-semibold text-white">
                            {form.title || "Blog Title"}
                          </h3>
                          <span className="text-xs bg-cyan-600 text-white px-2 py-1 rounded-full">
                            {editingId ? "Editing" : "New"}
                          </span>
                        </div>

                        {form.category && (
                          <p className="text-cyan-300 text-sm mb-3">
                            {getCategoryName(form.category)}
                          </p>
                        )}

                        <div className="text-gray-300 text-sm leading-relaxed">
                          {parseFormattedText(content) || (
                            <p className="text-gray-400 italic">
                              Blog content preview will appear here...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-700">
                        <FiFileText className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-400 mb-4">
                        No content to preview yet
                      </p>
                      <p className="text-gray-500 text-sm">
                        Start editing to see the preview here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8 relative overflow-visible">
      <div className="mx-auto relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Blog Management
          </h1>
        </div>

        <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-700/30">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FiEdit className="w-5 h-5" />
              Blog Posts
            </h2>
          </div>

          <div className="space-y-4">
            {blogs.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
                <FiFileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">
                  No Blog Posts Yet
                </h3>
                <p className="text-gray-500 mb-6">
                  There are no blog posts to manage
                </p>
              </div>
            ) : (
              blogs.map((blog) => (
                <div
                  key={blog._id || blog.id}
                  className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 rounded-2xl shadow-lg overflow-hidden transform hover:scale-[1.01] transition-all duration-500 border border-gray-700/50 hover:border-cyan-500/30 group"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          {blog.image && (
                            <img
                              src={blog.image}
                              alt={blog.title}
                              className="w-16 h-16 object-cover rounded-xl"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {blog.title}
                            </h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                              <span>
                                Category: {getCategoryName(blog.category)}
                              </span>
                              <span>•</span>
                              <span>
                                {blog.date
                                  ? new Date(blog.date).toLocaleDateString()
                                  : new Date().toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-300 line-clamp-2">
                          {blog.content}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => startEditing(blog)}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-medium hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 flex items-center gap-2 border border-cyan-500/30 shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5"
                        >
                          <FiEdit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(blog._id || blog.id)}
                          className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-medium hover:from-red-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-2 border border-red-500/30 shadow-lg hover:shadow-xl hover:shadow-red-500/20 transform hover:-translate-y-0.5"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModifyBlog;
