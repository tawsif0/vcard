import React, { useState, useEffect, useRef, useContext } from "react";
import {
  FiEdit,
  FiEye,
  FiSave,
  FiPlus,
  FiTrash2,
  FiUpload,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import AuthContext from "../../../../../context/AuthContext"; // Adjust import path as needed

const BrandAndClient = () => {
  const { checkAuth } = useContext(AuthContext);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingImages, setUploadingImages] = useState({});
  const [savingBrand, setSavingBrand] = useState({});
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

  // Fetch brands data from backend
  useEffect(() => {
    const fetchBrandsData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoading(false);
        toast.error("Please log in to access this page");
        return;
      }

      // Prevent multiple fetches
      if (hasFetchedRef.current) {
        return;
      }

      try {
        setIsLoading(true);
        hasFetchedRef.current = true;

        const response = await fetch("http://localhost:5000/api/about", {
          headers: {
            "x-auth-token": token,
          },
        });

        if (response.status === 401) {
          // Token expired or invalid
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
        if (data.success) {
          // Handle both possible data structures
          const brandsData = data.data.brands || [];
          setBrands(brandsData);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        if (err.message.includes("401")) {
          toast.error("Authentication failed. Please log in again.");
        } else {
          toast.error(err.message);
        }
        setBrands([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrandsData();

    // Cleanup function to reset fetch flag when component unmounts
    return () => {
      hasFetchedRef.current = false;
    };
  }, []);

  const handleBrandChange = (id, field, value) => {
    setBrands((prev) =>
      prev.map((brand) =>
        brand.id === id ? { ...brand, [field]: value } : brand
      )
    );
  };

  const handleImageUpload = async (id, file) => {
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

    // Check file size (max 5MB) - FRONTEND VALIDATION
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Additional check for very small files (might be corrupt)
    if (file.size < 100) {
      toast.error("File appears to be too small or corrupt");
      return;
    }

    setUploadingImages((prev) => ({ ...prev, [id]: true }));

    try {
      const formData = new FormData();
      formData.append("image", file);

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/about/upload", {
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

      // Update brand with FULL image URL
      const fullImageUrl = `http://localhost:5000${data.imageUrl}`;
      handleBrandChange(id, "src", fullImageUrl);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploadingImages((prev) => ({ ...prev, [id]: false }));
    }
  };

  const addNewBrand = () => {
    const newId =
      brands.length > 0 ? Math.max(...brands.map((b) => b.id)) + 1 : 1;
    const newBrand = {
      id: newId,
      src: "",
      alt: "",
    };
    setBrands((prev) => [newBrand, ...prev]);
  };

  const removeBrand = (id) => {
    setBrands((prev) => prev.filter((brand) => brand.id !== id));
  };

  const handleSaveBrand = async (brand) => {
    // Check authentication before saving
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      toast.error("Please log in to save changes");
      return;
    }

    setSavingBrand((prev) => ({ ...prev, [brand.id]: true }));

    try {
      const token = localStorage.getItem("token");

      // Send ALL brands to the backend, not just the current one
      const response = await fetch("http://localhost:5000/api/about/brands", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(brands), // Send the entire brands array
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please log in again.");
        return;
      }

      if (response.ok) {
        toast.success("Brands saved successfully!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save brands");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingBrand((prev) => ({ ...prev, [brand.id]: false }));
    }
  };

  // New function to save all brands at once
  const saveAllBrands = async () => {
    // Check authentication before saving
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      toast.error("Please log in to save changes");
      return;
    }

    if (brands.length === 0) {
      toast.error("No brands to save");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/about/brands", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(brands),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please log in again.");
        return;
      }

      if (response.ok) {
        toast.success("All brands saved successfully!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save brands");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center relative z-10">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-400 font-medium">Loading brands...</p>
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
    <div className="w-full py-6 px-4 relative overflow-visible">
      <div className="mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Brands
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-6 lg:col-span-2 border border-gray-700/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiEdit className="w-5 h-5" />
                Edit Brands & Clients
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={saveAllBrands}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transform hover:-translate-y-0.5 border border-purple-500/30"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center gap-2">
                    <FiSave className="w-4 h-4" />
                    Save All
                  </span>
                </button>
                <button
                  onClick={addNewBrand}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 flex items-center gap-2 group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center gap-2">
                    <FiPlus className="w-4 h-4" />
                    Add Brand
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Brand #{brand.id}
                    </h3>
                    <button
                      onClick={() => removeBrand(brand.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition"
                      title="Remove Brand"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Image Source - First Row */}
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Image Source
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 relative group">
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition pr-10 group-hover:pr-10"
                            value={brand.src}
                            onChange={(e) =>
                              handleBrandChange(brand.id, "src", e.target.value)
                            }
                            placeholder="Image URL or upload using button →"
                          />
                          {/* Cross button to clear image URL */}
                          {brand.src && (
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100"
                              onClick={() =>
                                handleBrandChange(brand.id, "src", "")
                              }
                              title="Remove image URL"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="file"
                            id={`image-upload-${brand.id}`}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleImageUpload(brand.id, file);
                              }
                              e.target.value = "";
                            }}
                            disabled={uploadingImages[brand.id]}
                          />
                          <label
                            htmlFor={`image-upload-${brand.id}`}
                            className={`px-4 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-medium 
              hover:from-cyan-700 hover:to-teal-700 transition flex items-center gap-2 cursor-pointer ${
                uploadingImages[brand.id] ? "opacity-50 cursor-not-allowed" : ""
              }`}
                            title="Upload Image"
                          >
                            {uploadingImages[brand.id] ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <FiUpload className="w-4 h-4" />
                            )}
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Alt Text - Second Row */}
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Alt Text
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                        value={brand.alt}
                        onChange={(e) =>
                          handleBrandChange(brand.id, "alt", e.target.value)
                        }
                        placeholder="Brand Name"
                      />
                    </div>
                  </div>

                  {/* Individual Save Button for each brand */}
                  <div className="mt-6">
                    <button
                      onClick={() => handleSaveBrand(brand)}
                      disabled={savingBrand[brand.id]}
                      className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="relative flex items-center justify-center gap-2">
                        {savingBrand[brand.id] ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <FiSave className="w-4 h-4" />
                            Save Brand
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              ))}

              {brands.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
                  <p className="text-gray-400 mb-4">No brands added yet</p>
                  <button
                    onClick={addNewBrand}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 flex items-center gap-2 mx-auto group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative flex items-center gap-2">
                      <FiPlus className="w-4 h-4" />
                      Add Your First Brand
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Updated Live Preview Section - Images fill the entire card */}
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
                      <FiEye className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        Brands & Clients
                      </h2>
                      <p className="text-cyan-200 text-sm opacity-80">
                        Trusted by amazing companies
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {brands.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {brands.map((brand) => (
                      <div
                        key={brand.id}
                        className="group relative bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5 overflow-hidden aspect-square"
                      >
                        {brand.src ? (
                          <img
                            src={
                              brand.src.startsWith("/uploads")
                                ? `http://localhost:5000${brand.src}`
                                : brand.src
                            }
                            alt={brand.alt}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = "none";
                              const fallback = e.target.nextSibling;
                              if (fallback && fallback.style) {
                                fallback.style.display = "flex";
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                              <span className="text-xs font-medium text-white">
                                Logo
                              </span>
                            </div>
                            <p className="text-xs text-gray-300 text-center">
                              {brand.alt || "Brand Name"}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4 border-2 border-dashed border-gray-600/50 rounded-xl bg-gray-800/30">
                    <FiEye className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 italic">No brands to display</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Add brands to see them here
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

export default BrandAndClient;
