import React, { useState, useRef, useEffect } from "react";
import {
  FiEdit,
  FiEye,
  FiSave,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiStar,
  FiAward,
  FiTrendingUp,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const MySkills = () => {
  const [skills, setSkills] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newSkillNames, setNewSkillNames] = useState({}); // Separate state for each category
  const [newSkillLevels, setNewSkillLevels] = useState({}); // Separate state for each category
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [savingCategory, setSavingCategory] = useState({});

  // Fetch skills on component mount
  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/resume/skills", {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch skills");

      const data = await response.json();
      setSkills(data.skills || []);
      
      // Initialize separate states for each category
      const initialNewSkillNames = {};
      const initialNewSkillLevels = {};
      data.skills?.forEach(category => {
        initialNewSkillNames[category._id] = "";
        initialNewSkillLevels[category._id] = 50;
      });
      setNewSkillNames(initialNewSkillNames);
      setNewSkillLevels(initialNewSkillLevels);
    } catch (error) {
      console.error("Error fetching skills:", error);
      toast.error("Failed to load skills");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillChange = (categoryId, skillIndex, field, value) => {
    setSkills(prev =>
      prev.map(category =>
        category._id === categoryId
          ? {
              ...category,
              items: category.items.map((skill, index) =>
                index === skillIndex ? { ...skill, [field]: value } : skill
              ),
            }
          : category
      )
    );
  };

  const handleCategoryChange = (categoryId, field, value) => {
    setSkills(prev =>
      prev.map(category =>
        category._id === categoryId ? { ...category, [field]: value } : category
      )
    );
  };

  const updateSkillCategory = async (id, updateData) => {
    try {
      if (!id) {
        console.error("No ID provided for update");
        return false;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/resume/skills/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to update skill category");
      }

      const data = await response.json();
      setSkills(prev =>
        prev.map((category) => (category._id === id ? data.category : category))
      );
      return true;
    } catch (error) {
      console.error("Error updating skill category:", error);
      toast.error(error.message || "Failed to update skill category");
      return false;
    }
  };

  const addNewSkill = async (categoryId) => {
    const skillName = newSkillNames[categoryId]?.trim();
    const skillLevel = newSkillLevels[categoryId] || 50;

    if (!skillName) {
      toast.error("Please enter a skill name");
      return;
    }

    const category = skills.find(cat => cat._id === categoryId);
    if (!category) return;

    const updatedItems = [
      ...(category.items || []),
      { name: skillName, level: skillLevel }
    ];

    const success = await updateSkillCategory(categoryId, { items: updatedItems });
    
    if (success) {
      // Reset only this category's new skill inputs
      setNewSkillNames(prev => ({ ...prev, [categoryId]: "" }));
      setNewSkillLevels(prev => ({ ...prev, [categoryId]: 50 }));
      toast.success("Skill added successfully");
    }
  };

  const removeSkill = async (categoryId, skillIndex) => {
    const category = skills.find(cat => cat._id === categoryId);
    if (!category) return;

    const updatedItems = (category.items || []).filter((_, index) => index !== skillIndex);
    
    const success = await updateSkillCategory(categoryId, { items: updatedItems });
    
    if (success) {
      toast.success("Skill removed successfully");
    }
  };

  const addNewCategory = async () => {
    try {
      const token = localStorage.getItem("token");
      const newCategory = {
        category: "New Category",
        items: [],
      };

      const response = await fetch("http://localhost:5000/api/resume/skills", {
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
      const newCategoryWithId = data.category;
      
      setSkills((prev) => [...prev, newCategoryWithId]);
      
      // Initialize new skill inputs for this category
      setNewSkillNames(prev => ({ ...prev, [newCategoryWithId._id]: "" }));
      setNewSkillLevels(prev => ({ ...prev, [newCategoryWithId._id]: 50 }));
      
      setExpandedCategoryId(newCategoryWithId._id); // Auto-expand new category
      toast.success("Category added successfully");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error(error.message || "Failed to add category");
    }
  };

  const removeCategory = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/resume/skills/${id}`, {
        method: "DELETE",
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to delete category");
      }

      setSkills(prev => prev.filter(category => category._id !== id));
      
      // Clean up the state for removed category
      setNewSkillNames(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      setNewSkillLevels(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      
      if (expandedCategoryId === id) setExpandedCategoryId(null);
      toast.success("Category removed successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error.message || "Failed to delete category");
    }
  };

  const handleSaveCategory = async (category) => {
    setSavingCategory(prev => ({ ...prev, [category._id]: true }));
    
    const success = await updateSkillCategory(category._id, {
      category: category.category || "",
      items: category.items || []
    });
    
    if (success) {
      toast.success("Category saved successfully!");
    }
    
    setSavingCategory(prev => ({ ...prev, [category._id]: false }));
  };

  const handleSaveAll = async () => {
    if (skills.length === 0) {
      toast.error("No skills to save");
      return;
    }

    setIsSaving(true);
    try {
      const savePromises = skills.map((category) =>
        updateSkillCategory(category._id, {
          category: category.category || "",
          items: category.items || []
        })
      );

      const results = await Promise.all(savePromises);
      const allSaved = results.every(result => result === true);
      
      if (allSaved) {
        toast.success("All skills saved successfully!");
      } else {
        toast.error("Some skills failed to save");
      }
    } catch (error) {
      console.error("Error saving skills:", error);
      toast.error("Failed to save skills");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle input changes
  const handleInputChange = (id, field, value) => {
    handleCategoryChange(id, field, value);
  };

  const handleSkillInputChange = (categoryId, skillIndex, field, value) => {
    handleSkillChange(categoryId, skillIndex, field, value);
  };

  // Handle new skill name change for specific category
  const handleNewSkillNameChange = (categoryId, value) => {
    setNewSkillNames(prev => ({ ...prev, [categoryId]: value }));
  };

  // Handle new skill level change for specific category
  const handleNewSkillLevelChange = (categoryId, value) => {
    setNewSkillLevels(prev => ({ ...prev, [categoryId]: parseInt(value) || 0 }));
  };

  // Plus/Minus button handlers for skill level
  const handleLevelIncrease = (categoryId, skillIndex, currentLevel) => {
    const newLevel = Math.min(100, currentLevel + 1);
    handleSkillChange(categoryId, skillIndex, "level", newLevel);
  };

  const handleLevelDecrease = (categoryId, skillIndex, currentLevel) => {
    const newLevel = Math.max(0, currentLevel - 1);
    handleSkillChange(categoryId, skillIndex, "level", newLevel);
  };

  // Plus/Minus for new skill level by category
  const handleNewLevelIncrease = (categoryId) => {
    setNewSkillLevels(prev => ({
      ...prev,
      [categoryId]: Math.min(100, (prev[categoryId] || 50) + 1)
    }));
  };

  const handleNewLevelDecrease = (categoryId) => {
    setNewSkillLevels(prev => ({
      ...prev,
      [categoryId]: Math.max(0, (prev[categoryId] || 50) - 1)
    }));
  };

  // Function to get gradient color based on skill level
  const getSkillColor = (level) => {
    if (level >= 80) return "from-green-400 to-emerald-600";
    if (level >= 60) return "from-blue-400 to-cyan-600";
    if (level >= 40) return "from-yellow-400 to-orange-600";
    return "from-red-400 to-pink-600";
  };

  // Function to get skill level label
  const getSkillLevelLabel = (level) => {
    if (level >= 90) return "Expert";
    if (level >= 80) return "Advanced";
    if (level >= 70) return "Intermediate";
    if (level >= 60) return "Beginner";
    return "Novice";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#020617] py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading skills...</div>
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
                Edit Skills
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={addNewCategory}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 flex items-center gap-2 group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center gap-2">
                    <FiPlus className="w-4 h-4" />
                    Add Category
                  </span>
                </button>
                {skills.length > 0 && (
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
              {skills.map((category, index) => (
                <div
                  key={category._id || index}
                  className="w-full bg-gray-800/50 rounded-xl border border-gray-700/50"
                >
                  {/* Dropdown Header */}
                  <div
                    className="flex flex-row justify-between items-center px-4 py-3 sm:px-6 sm:py-4 cursor-pointer select-none"
                    onClick={() =>
                      setExpandedCategoryId(
                        expandedCategoryId === category._id ? null : category._id
                      )
                    }
                    title={`Show/Hide Category #${index + 1}`}
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                      {expandedCategoryId === category._id ? (
                        <FiChevronUp className="mr-2" />
                      ) : (
                        <FiChevronDown className="mr-2" />
                      )}
                      Category #{index + 1}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCategory(category._id);
                      }}
                      className="p-2 text-red-400 hover:text-red-300 transition"
                      title="Remove Category"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Expandable Content */}
                  {expandedCategoryId === category._id && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-1 sm:pt-2">
                      {/* Category Name Input */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Category Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition placeholder-gray-500"
                          value={category.category || ""}
                          onChange={e =>
                            handleInputChange(
                              category._id,
                              "category",
                              e.target.value
                            )
                          }
                          placeholder="e.g., Programming Languages"
                        />
                      </div>

                      {/* Existing Skills */}
                      <div className="space-y-3 mb-6">
                        <label className="block text-sm font-medium text-gray-300">
                          Skills
                        </label>
                        {category.items && category.items.map((skill, skillIndex) => (
                          <div
                            key={skillIndex}
                            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30"
                          >
                            {/* Skill Name Input */}
                            <div className="flex-1 w-full sm:w-auto">
                              <input
                                type="text"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-lg text-white focus:border-gray-500 transition text-sm placeholder-gray-500"
                                value={skill.name || ""}
                                onChange={e =>
                                  handleSkillInputChange(
                                    category._id,
                                    skillIndex,
                                    "name",
                                    e.target.value
                                  )
                                }
                                placeholder="Skill name"
                              />
                            </div>
                            
                            {/* Level Control - Mobile Responsive */}
                            <div className="flex items-center gap-2 w-full sm:w-64">
                              <div className="flex items-center justify-between w-full bg-gray-800/50 rounded-lg p-1 border border-gray-700/50">
                                <button
                                  onClick={() => handleLevelDecrease(category._id, skillIndex, skill.level || 0)}
                                  className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-300 flex items-center justify-center"
                                  disabled={(skill.level || 0) <= 0}
                                >
                                  <FiMinus className="w-3 h-3" />
                                </button>
                                
                                <div className="flex flex-col items-center mx-2 flex-1 min-w-0">
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="1"
                                    className="w-full accent-purple-500"
                                    value={skill.level || 0}
                                    onChange={e =>
                                      handleSkillInputChange(
                                        category._id,
                                        skillIndex,
                                        "level",
                                        parseInt(e.target.value)
                                      )
                                    }
                                  />
                                  <div className="flex items-center gap-2 mt-1 w-full">
                                    <span className="text-white text-xs font-medium whitespace-nowrap">
                                      {skill.level || 0}%
                                    </span>
                                    {/* Level Input Field */}
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      className="w-12 px-1 py-0.5 bg-gray-700 border border-gray-600 rounded text-white text-xs text-center"
                                      value={skill.level || 0}
                                      onChange={e => {
                                        const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                        handleSkillInputChange(
                                          category._id,
                                          skillIndex,
                                          "level",
                                          value
                                        );
                                      }}
                                    />
                                  </div>
                                </div>
                                
                                <button
                                  onClick={() => handleLevelIncrease(category._id, skillIndex, skill.level || 0)}
                                  className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-300 flex items-center justify-center"
                                  disabled={(skill.level || 0) >= 100}
                                >
                                  <FiPlus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => removeSkill(category._id, skillIndex)}
                              className="p-2 text-red-400 hover:text-red-300 transition flex-shrink-0 self-center"
                              title="Remove Skill"
                            >
                              <FiTrash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add New Skill to Category */}
                      <div className="mt-4 p-4 bg-gray-800/20 rounded-lg border border-dashed border-gray-600">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">Add New Skill</h4>
                        <div className="flex flex-col sm:flex-row gap-3 items-end">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Skill Name
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-lg text-white focus:border-gray-500 transition text-sm placeholder-gray-500"
                              value={newSkillNames[category._id] || ""}
                              onChange={e => handleNewSkillNameChange(category._id, e.target.value)}
                              placeholder="Enter skill name"
                            />
                          </div>
                          
                          <div className="w-full sm:w-64">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Level
                            </label>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-between w-full bg-gray-800/50 rounded-lg p-1 border border-gray-700/50">
                                <button
                                  onClick={() => handleNewLevelDecrease(category._id)}
                                  className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-300 flex items-center justify-center"
                                  disabled={(newSkillLevels[category._id] || 50) <= 0}
                                >
                                  <FiMinus className="w-3 h-3" />
                                </button>
                                
                                <div className="flex flex-col items-center mx-2 flex-1 min-w-0">
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="1"
                                    className="w-full accent-purple-500"
                                    value={newSkillLevels[category._id] || 50}
                                    onChange={e => handleNewSkillLevelChange(category._id, e.target.value)}
                                  />
                                  <div className="flex items-center gap-2 mt-1 w-full">
                                    <span className="text-white text-xs font-medium whitespace-nowrap">
                                      {newSkillLevels[category._id] || 50}%
                                    </span>
                                    {/* Level Input Field for New Skill */}
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      className="w-12 px-1 py-0.5 bg-gray-700 border border-gray-600 rounded text-white text-xs text-center"
                                      value={newSkillLevels[category._id] || 50}
                                      onChange={e => {
                                        const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                        handleNewSkillLevelChange(category._id, value);
                                      }}
                                    />
                                  </div>
                                </div>
                                
                                <button
                                  onClick={() => handleNewLevelIncrease(category._id)}
                                  className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-300 flex items-center justify-center"
                                  disabled={(newSkillLevels[category._id] || 50) >= 100}
                                >
                                  <FiPlus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => addNewSkill(category._id)}
                            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-medium hover:from-cyan-700 hover:to-teal-700 transition flex items-center gap-2 text-sm flex-shrink-0 w-full sm:w-auto justify-center"
                          >
                            <FiPlus className="w-3 h-3" />
                            Add Skill
                          </button>
                        </div>
                      </div>

                      {/* Individual Save Button */}
                      <div className="mt-6">
                        <button
                          onClick={() => handleSaveCategory(category)}
                          disabled={savingCategory[category._id]}
                          className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                          <span className="relative flex items-center justify-center gap-2">
                            {savingCategory[category._id] ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <FiSave className="w-4 h-4" />
                                Save Category
                              </>
                            )}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {skills.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
                  <FiAward className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-400 mb-4">No skill categories added yet</p>
                  <button
                    onClick={addNewCategory}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 flex items-center gap-2 mx-auto group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative flex items-center gap-2">
                      <FiPlus className="w-4 h-4" />
                      Add Your First Category
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Preview (unchanged) */}
          <div className="bg-gray-900/10 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 border border-white/10 self-start overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FiEye className="w-5 h-5" />
              Skills Preview
            </h2>

            <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl shadow-2xl overflow-hidden border border-white/10 backdrop-blur-xl">
              {/* Preview Header */}
              <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 p-4 text-white border-b border-white/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="relative">
                    <h2 className="text-2xl font-bold">
                      My Skills
                    </h2>
                    <p className="text-white/60 text-sm mt-2">
                      Professional competencies and expertise
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <FiTrendingUp className="w-5 h-5" />
                    <span className="text-sm">{skills.length} Categor{skills.length !== 1 ? 'ies' : 'y'}</span>
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-6 space-y-8">
                {skills.map((category, index) => (
                  <div
                    key={category._id || index}
                    className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <FiAward className="w-4 h-4 text-purple-400" />
                      {category.category || "Category Name"}
                    </h3>
                    <div className="space-y-4">
                      {category.items && category.items.map((skill, skillIndex) => (
                        <div key={skillIndex} className="group">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-medium text-sm">
                              {skill.name || "Skill Name"}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-white/60 text-xs">
                                {getSkillLevelLabel(skill.level || 0)}
                              </span>
                              <span className="text-white font-bold text-sm w-10 text-right">
                                {skill.level || 0}%
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-black/30 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${getSkillColor(
                                skill.level || 0
                              )} transition-all duration-1000 ease-out group-hover:brightness-110 relative`}
                              style={{ width: `${skill.level || 0}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!category.items || category.items.length === 0) && (
                        <p className="text-gray-400 text-sm italic">No skills added to this category</p>
                      )}
                    </div>
                  </div>
                ))}

                {skills.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>No skills to display</p>
                    <p className="text-sm">Add some skill categories to see the preview</p>
                  </div>
                )}
              </div>

              {/* Preview Footer */}
              <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4 border-t border-white/10">
                <div className="flex items-center justify-center gap-2 text-white/50 text-sm">
                  <FiStar className="w-4 h-4" />
                  <span>Continuously evolving and learning</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySkills;