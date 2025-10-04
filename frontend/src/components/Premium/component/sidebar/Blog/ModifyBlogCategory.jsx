import React, { useState, useEffect, useRef, useContext } from "react";
import { FiEdit, FiEye, FiSave, FiPlus, FiTrash2 } from "react-icons/fi";
import { toast } from "react-hot-toast";
import AuthContext from "../../../../../context/AuthContext"; // Adjust import path as needed

const ModifyBlogCategory = () => {
  const { checkAuth } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
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

  // Fetch categories data from backend
  useEffect(() => {
    const fetchCategoriesData = async () => {
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

        const response = await fetch(
          "http://localhost:5000/api/blog-categories",
          {
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
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        // Handle the response format that includes success and data properties
        if (data.success) {
          setCategories(data.data || []);
        } else {
          throw new Error(data.message || "Failed to fetch categories");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        if (err.message.includes("401")) {
          toast.error("Authentication failed. Please log in again.");
        } else {
          toast.error(err.message);
        }
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoriesData();

    return () => {
      hasFetchedRef.current = false;
    };
  }, []);

  const startEditing = (category) => {
    setEditingId(category._id);
    setEditName(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleUpdate = async (categoryId) => {
    if (!editName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      toast.error("Please log in to update category");
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");

      // Find the category to get the numeric ID
      const categoryToUpdate = categories.find((cat) => cat._id === categoryId);
      if (!categoryToUpdate) {
        toast.error("Category not found");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/blog-categories/${categoryToUpdate.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({ name: editName }),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please log in again.");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success("Category updated successfully!");
          setEditingId(null);
          setEditName("");

          // Update the local state instead of refreshing
          setCategories((prevCategories) =>
            prevCategories.map((cat) =>
              cat._id === categoryId ? { ...cat, name: editName } : cat
            )
          );
        } else {
          throw new Error(data.message || "Failed to update category");
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update category");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (categoryId) => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      toast.error("Please log in to delete category");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // Find the category to get the numeric ID
      const categoryToDelete = categories.find((cat) => cat._id === categoryId);
      if (!categoryToDelete) {
        toast.error("Category not found");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/blog-categories/${categoryToDelete.id}`,
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

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success("Category deleted successfully!");
          // Update the local state instead of refreshing
          setCategories((prevCategories) =>
            prevCategories.filter((cat) => cat._id !== categoryId)
          );
        } else {
          throw new Error(data.message || "Failed to delete category");
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete category");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const addNewCategory = () => {
    // Trigger the create category event
    window.dispatchEvent(new CustomEvent("openCreateCategoryModal"));
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center relative z-10">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-400 font-medium">
            Loading categories...
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
            Blog Categories
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column - Form */}
          <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-6 lg:col-span-2 border border-gray-700/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiEdit className="w-5 h-5" />
                Manage Categories
              </h2>
            </div>

            <div className="space-y-4">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
                >
                  {editingId === category._id ? (
                    <div className="flex items-center gap-4">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                        placeholder="Category name"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdate(category._id)}
                          disabled={isSaving}
                          className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                        >
                          {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <FiSave className="w-4 h-4" />
                          )}
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center gap-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">
                            {category.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {category.name}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditing(category)}
                          className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:-translate-y-0.5 border border-blue-500/30"
                          title="Edit Category"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="p-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-500/20 transform hover:-translate-y-0.5 border border-red-500/30"
                          title="Delete Category"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {categories.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl bg-gray-800/30">
                  <FiEdit className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 italic">No categories found</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Add your first category to get started
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Preview */}
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
                      <FiEdit className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        Blog Categories
                      </h2>
                      <p className="text-cyan-200 text-sm opacity-80">
                        Organize your blog content
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {categories.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                      Available Categories
                    </h3>

                    <div className="grid grid-cols-1 gap-3">
                      {categories.map((category) => (
                        <div
                          key={category._id}
                          className="group relative p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                              <span className="text-white font-bold text-sm">
                                {category.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-semibold text-base">
                                {category.name}
                              </p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full border border-cyan-500/30">
                                Active
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-gray-700/50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Total Categories:</span>
                        <span className="text-cyan-300 font-semibold">
                          {categories.length}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 px-4 border-2 border-dashed border-gray-600/50 rounded-xl bg-gray-800/30">
                    <FiEye className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 italic">
                      No categories to display
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Add categories to see them here
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
};

export default ModifyBlogCategory;
