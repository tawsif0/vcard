import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiPlus, FiTrash2, FiEdit, FiSave, FiFolder } from "react-icons/fi";
import { toast } from "react-hot-toast";

const PortfolioCategory = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = async () => {
    if (newCategory.trim() === "") {
      toast.error("Category name cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/portfolio/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ name: newCategory.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to add category");
      }

      const data = await response.json();
      setCategories((prev) => [...prev, data.category]);
      setNewCategory("");
      toast.success("Category added successfully");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error(error.message || "Failed to add category");
    }
  };

  const updateCategory = async (id, name) => {
    try {
      if (!id) {
        console.error("No ID provided for update");
        return false;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/portfolio/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to update category");
      }

      const data = await response.json();
      setCategories((prev) =>
        prev.map((category) => (category._id === id ? data.category : category))
      );
      return true;
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(error.message || "Failed to update category");
      return false;
    }
  };

  const removeCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the category "${name}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/portfolio/categories/${id}`, {
        method: "DELETE",
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to delete category");
      }

      setCategories((prev) => prev.filter((category) => category._id !== id));
      if (editingId === id) {
        setEditingId(null);
        setEditValue("");
      }
      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error.message || "Failed to delete category");
    }
  };

  const startEditing = (category) => {
    setEditingId(category._id);
    setEditValue(category.name);
  };

  const saveEdit = async () => {
    if (editValue.trim() === "") {
      toast.error("Category name cannot be empty");
      return;
    }

    try {
      const success = await updateCategory(editingId, editValue.trim());
      if (success) {
        setEditingId(null);
        setEditValue("");
        toast.success("Category updated successfully");
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleSave = async () => {
    if (categories.length === 0) {
      toast.error("No categories to save");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/portfolio/categories/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ categories }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to save categories");
      }

      toast.success("All categories saved successfully");
    } catch (error) {
      console.error("Error saving categories:", error);
      toast.error(error.message || "Failed to save categories");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#020617] py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 sm:px-4 relative overflow-visible">
      <div className="mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column - Category Management */}
          <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-6 lg:col-span-2 border border-gray-700/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiFolder className="w-5 h-5" />
                Portfolio Categories
              </h2>
              <div className="text-sm text-gray-400">
                {categories.length} category{categories.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Add Category Form */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Add New Category
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter category name..."
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-purple-500 transition placeholder-gray-500"
                  onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                />
                <button
                  onClick={addCategory}
                  disabled={!newCategory.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FiPlus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>

            {/* Categories List */}
            <div className="space-y-4">
              {categories.map((category, index) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
                >
                  {editingId === category._id ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 transition"
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={saveEdit}
                          disabled={!editValue.trim()}
                          className="p-2 text-green-400 hover:text-green-300 transition disabled:opacity-50"
                          title="Save"
                        >
                          <FiSave className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-2 text-gray-400 hover:text-gray-300 transition"
                          title="Cancel"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                          {index + 1}
                        </div>
                        <div>
                          <span className="text-white font-semibold text-lg block">{category.name}</span>
                          <span className="text-gray-400 text-sm">
                            Created: {new Date(category.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditing(category)}
                          className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition flex items-center gap-2"
                          title="Edit Category"
                        >
                          <FiEdit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => removeCategory(category._id, category.name)}
                          className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition flex items-center gap-2"
                          title="Delete Category"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {categories.length === 0 && (
                <div className="text-center py-12 text-gray-400 rounded-xl border-2 border-dashed border-gray-700/50">
                  <FiFolder className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No categories yet</p>
                  <p className="text-sm">Add your first category to get started</p>
                </div>
              )}
            </div>

            {/* Save Button */}
            {categories.length > 0 && (
              <div className="mt-8">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  <span className="relative flex items-center justify-center gap-2">
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving Categories...
                      </>
                    ) : (
                      <>
                        <FiSave className="w-5 h-5" />
                        Save All Categories
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
              Categories Preview
            </h2>
            
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 rounded-2xl shadow-2xl overflow-hidden border border-purple-400/20 backdrop-blur-xl">
              {/* Preview Header */}
              <div className="bg-gradient-to-r from-purple-600/90 to-blue-600/90 p-6 text-white border-b border-purple-400/30">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="relative">
                    <h2 className="text-2xl font-bold">
                      Portfolio Categories
                    </h2>
                    <p className="text-purple-100 text-sm mt-1">
                      Manage your project categories
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-purple-100 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-400/30">
                    <FiFolder className="w-4 h-4" />
                    <span className="text-sm">{categories.length} category{categories.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-6 space-y-4">
                {categories.map((category, index) => (
                  <div
                    key={category._id}
                    className="group relative bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl p-4 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg group-hover:text-purple-300 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Available for portfolio projects
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400 mb-1">Created</div>
                        <div className="text-sm text-white">
                          {new Date(category.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {categories.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <FiFolder className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg mb-1">No categories to display</p>
                    <p className="text-sm">Add categories to see them here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <FiFolder className="w-4 h-4" />
                How to use:
              </h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Add categories for your portfolio projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Categories will be available in Create Portfolio</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Edit or delete categories as needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Save to persist categories</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCategory;