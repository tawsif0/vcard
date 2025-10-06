import React, { useState, useEffect } from "react";
import {
  FiEdit,
  FiEye,
  FiSave,
  FiPlus,
  FiTrash2,
  FiBook,
  FiTool,
  FiHeart,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const MoreAboutMe = () => {
  const [categories, setCategories] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newItemInputs, setNewItemInputs] = useState({});

  // Fetch about categories from backend
  const fetchAboutCategories = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/resume/about-categories", {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data.aboutCategories || []);
      
      // Initialize empty new item inputs for each category
      const initialInputs = {};
      data.aboutCategories?.forEach(cat => {
        initialInputs[cat._id] = "";
      });
      setNewItemInputs(initialInputs);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutCategories();
  }, []);

  // Update category in backend
  const updateAboutCategory = async (id, updateData) => {
    try {
      if (!id) {
        console.error("No ID provided for update");
        return false;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/resume/about-categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to update category");
      }

      const data = await response.json();
      setCategories(prev =>
        prev.map((category) => (category._id === id ? data.category : category))
      );
      return true;
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(error.message || "Failed to update category");
      return false;
    }
  };

  const handleCategoryChange = (categoryId, field, value) => {
    setCategories(prev =>
      prev.map(category =>
        category._id === categoryId ? { ...category, [field]: value } : category
      )
    );
  };

  const handleItemChange = (categoryId, itemIndex, value) => {
    setCategories(prev =>
      prev.map(category =>
        category._id === categoryId
          ? {
              ...category,
              items: category.items.map((item, index) =>
                index === itemIndex ? value : item
              ),
            }
          : category
      )
    );
  };

  const handleNewItemInputChange = (categoryId, value) => {
    setNewItemInputs(prev => ({
      ...prev,
      [categoryId]: value
    }));
  };

  const addNewItem = async (categoryId) => {
    const newItemValue = newItemInputs[categoryId] || "";
    
    if (!newItemValue.trim()) {
      toast.error("Please enter an item name");
      return;
    }

    const category = categories.find(cat => cat._id === categoryId);
    if (!category) return;

    const updatedItems = [
      ...(category.items || []),
      newItemValue.trim()
    ];

    const success = await updateAboutCategory(categoryId, { items: updatedItems });
    
    if (success) {
      // Clear the input for this specific category
      setNewItemInputs(prev => ({
        ...prev,
        [categoryId]: ""
      }));
      toast.success("Item added successfully");
    }
  };

  const removeItem = async (categoryId, itemIndex) => {
    const category = categories.find(cat => cat._id === categoryId);
    if (!category) return;

    const updatedItems = (category.items || []).filter((_, index) => index !== itemIndex);
    
    const success = await updateAboutCategory(categoryId, { items: updatedItems });
    
    if (success) {
      toast.success("Item removed successfully");
    }
  };

  const addNewCategory = async () => {
    try {
      const token = localStorage.getItem("token");
      const newCategory = {
        title: "New Category",
        icon: "FiBook",
        items: []
      };

      const response = await fetch("http://localhost:5000/api/resume/about-categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to add category");
      }

      const data = await response.json();
      setCategories((prev) => [...prev, data.category]);
      
      // Add new item input for this category
      setNewItemInputs(prev => ({
        ...prev,
        [data.category._id]: ""
      }));
      
      toast.success("Category added successfully");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error(error.message || "Failed to add category");
    }
  };

  const removeCategory = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/resume/about-categories/${id}`, {
        method: "DELETE",
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to delete category");
      }

      setCategories(prev => prev.filter(category => category._id !== id));
      
      // Remove from newItemInputs as well
      setNewItemInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[id];
        return newInputs;
      });

      toast.success("Category removed successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error.message || "Failed to delete category");
    }
  };

  const handleSave = async () => {
    if (categories.length === 0) {
      toast.error("No categories to save");
      return;
    }

    setIsSaving(true);
    try {
      // Save all categories with their items
      const savePromises = categories.map((category) =>
        updateAboutCategory(category._id, {
          title: category.title || "",
          icon: category.icon || "FiBook",
          items: category.items || []
        })
      );

      const results = await Promise.all(savePromises);
      const allSaved = results.every(result => result === true);
      
      if (allSaved) {
        toast.success("Information saved successfully!");
      } else {
        toast.error("Some categories failed to save");
      }
    } catch (error) {
      console.error("Error saving categories:", error);
      toast.error("Failed to save information");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle input changes WITHOUT auto-save to prevent typing issues
  const handleInputChange = (id, field, value) => {
    handleCategoryChange(id, field, value);
  };

  // Handle item changes WITHOUT auto-save to prevent typing issues
  const handleItemInputChange = (categoryId, itemIndex, value) => {
    handleItemChange(categoryId, itemIndex, value);
  };

  // Manual save for category title on blur
  const handleTitleBlur = async (id) => {
    const category = categories.find(cat => cat._id === id);
    if (category && category.title) {
      await updateAboutCategory(id, { title: category.title });
    }
  };

  // Manual save for item on blur
  const handleItemBlur = async (categoryId, itemIndex) => {
    const category = categories.find(cat => cat._id === categoryId);
    if (category && category.items && category.items[itemIndex]) {
      await updateAboutCategory(categoryId, { items: category.items });
    }
  };

  const getIconComponent = (iconName) => {
    const icons = {
      FiBook: FiBook,
      FiTool: FiTool,
      FiHeart: FiHeart,
    };
    const IconComponent = icons[iconName] || FiBook;
    return <IconComponent className="w-4 h-4" />;
  };

  // Handle key press for adding items (Enter key)
  const handleKeyPress = (e, categoryId) => {
    if (e.key === 'Enter') {
      addNewItem(categoryId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#020617] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
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
                Edit About Me
              </h2>
              <button
                onClick={addNewCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Add Category
              </button>
            </div>

            <div className="space-y-6">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        className="text-lg font-semibold text-white bg-transparent border-b border-gray-600 focus:border-blue-500 focus:outline-none pb-1 w-full placeholder-gray-500"
                        value={category.title || ""}
                        onChange={e =>
                          handleInputChange(
                            category._id,
                            "title",
                            e.target.value
                          )
                        }
                        onBlur={() => handleTitleBlur(category._id)}
                        placeholder="Category title"
                      />
                    </div>
                    <button
                      onClick={() => removeCategory(category._id)}
                      className="p-2 text-red-400 hover:text-red-300 transition ml-4"
                      title="Remove Category"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 mb-4">
                    {category.items && category.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-center gap-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30"
                      >
                        <div className="text-blue-400 flex-shrink-0">
                          {getIconComponent(category.icon)}
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-lg text-white focus:border-gray-500 focus:outline-none transition text-sm placeholder-gray-500"
                            value={item}
                            onChange={e =>
                              handleItemInputChange(
                                category._id,
                                itemIndex,
                                e.target.value
                              )
                            }
                            onBlur={() => handleItemBlur(category._id, itemIndex)}
                            placeholder="Item name"
                          />
                        </div>
                        <button
                          onClick={() => removeItem(category._id, itemIndex)}
                          className="p-2 text-red-400 hover:text-red-300 transition"
                          title="Remove Item"
                        >
                          <FiTrash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Item to Category */}
                  <div className="mt-4 p-4 bg-gray-800/20 rounded-lg border border-dashed border-gray-600">
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          New Item Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-lg text-white focus:border-gray-500 focus:outline-none transition text-sm placeholder-gray-500"
                          value={newItemInputs[category._id] || ""}
                          onChange={e => 
                            handleNewItemInputChange(category._id, e.target.value)
                          }
                          onKeyPress={(e) => handleKeyPress(e, category._id)}
                          placeholder="Enter new item name"
                        />
                      </div>
                      <button
                        onClick={() => addNewItem(category._id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 text-sm mb-2"
                      >
                        <FiPlus className="w-3 h-3" />
                        Add Item
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {categories.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <FiBook className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No categories added yet.</p>
                  <p className="text-sm">Click "Add Category" to get started.</p>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="mt-8">
              <button
                onClick={handleSave}
                disabled={isSaving || categories.length === 0}
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

          {/* Right Column - Preview */}
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
                      More About Me
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-100">
                    <FiBook className="w-5 h-5" />
                    <span className="text-sm">{categories.length} Categor{categories.length !== 1 ? 'ies' : 'y'}</span>
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-6 space-y-6">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className="bg-gray-800/40 rounded-xl p-4 border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300"
                  >
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <div className="text-cyan-400">
                        {getIconComponent(category.icon)}
                      </div>
                      {category.title || "Category Name"}
                    </h3>
                    <div className="space-y-2">
                      {category.items && category.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition group"
                        >
                          <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0"></div>
                          <span className="text-gray-300 text-sm">
                            {item}
                          </span>
                        </div>
                      ))}
                      {(!category.items || category.items.length === 0) && (
                        <p className="text-gray-400 text-sm italic p-3">No items added to this category</p>
                      )}
                    </div>
                  </div>
                ))}

                {categories.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>No categories to display</p>
                    <p className="text-sm">Add some categories to see the preview</p>
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

export default MoreAboutMe;