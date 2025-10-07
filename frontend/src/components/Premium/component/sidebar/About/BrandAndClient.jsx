import React, { useState, useEffect, useRef, useContext } from "react";
import {
  FiEdit,
  FiEye,
  FiSave,
  FiPlus,
  FiTrash2,
  FiUpload,
  FiChevronDown,
  FiChevronUp,
  FiAlertTriangle,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import AuthContext from "../../../../../context/AuthContext"; // Adjust import path as needed

// Custom Confirmation Modal Component
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  brandId,
  isDeleting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl max-w-md w-full mx-auto transform animate-scaleIn">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
              <FiAlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Delete Brand</h3>
              <p className="text-gray-400 text-sm mt-1">
                This action cannot be undone
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-300">
            Are you sure you want to delete{" "}
            <span className="text-white font-semibold">Brand #{brandId}</span>?
            This will permanently remove the brand from the system.
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700/50 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300 disabled:opacity-50 border border-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 border border-red-500/30"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Deleting...
              </>
            ) : (
              <>
                <FiTrash2 className="w-4 h-4" />
                Delete Brand
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const BrandAndClient = () => {
  const { checkAuth } = useContext(AuthContext);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingImages, setUploadingImages] = useState({});
  const [savingBrand, setSavingBrand] = useState({});
  const [deletingBrand, setDeletingBrand] = useState({});
  const [expandedBrandId, setExpandedBrandId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    brandId: null,
  });
  const hasFetchedRef = useRef(false);

  // Function to extract filename from URL
  const getFileNameFromUrl = (url) => {
    if (!url) return "";
    const parts = url.split("/");
    return parts[parts.length - 1];
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
    setExpandedBrandId(newId);
  };

  // Open delete confirmation modal
  const openDeleteModal = (brandId) => {
    setDeleteModal({ isOpen: true, brandId });
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, brandId: null });
  };

  // Permanently delete brand from backend
  const removeBrand = async (brandId) => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      toast.error("Please log in to delete brands");
      closeDeleteModal();
      return;
    }

    setDeletingBrand((prev) => ({ ...prev, [brandId]: true }));

    try {
      const token = localStorage.getItem("token");

      // First, get the current brands from the backend
      const getResponse = await fetch("http://localhost:5000/api/about", {
        headers: {
          "x-auth-token": token,
        },
      });

      if (getResponse.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please log in again.");
        return;
      }

      if (!getResponse.ok) {
        throw new Error("Failed to fetch current brands");
      }

      const getData = await getResponse.json();
      let currentBrands = [];

      if (getData.success && getData.data.brands) {
        currentBrands = getData.data.brands;
      }

      // Filter out the brand to be deleted
      const updatedBrands = currentBrands.filter(
        (brand) => brand.id !== brandId
      );

      // Send updated brands to backend
      const response = await fetch("http://localhost:5000/api/about/brands", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(updatedBrands),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please log in again.");
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        // Remove from local state only after successful backend deletion
        setBrands((prev) => prev.filter((brand) => brand.id !== brandId));
        if (expandedBrandId === brandId) setExpandedBrandId(null);
        toast.success("Brand deleted successfully!");
      } else {
        throw new Error(data.message || "Failed to delete brand");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete brand");
    } finally {
      setDeletingBrand((prev) => ({ ...prev, [brandId]: false }));
      closeDeleteModal();
    }
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

      // First, get the current brands from the backend
      const getResponse = await fetch("http://localhost:5000/api/about", {
        headers: {
          "x-auth-token": token,
        },
      });

      if (getResponse.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please log in again.");
        return;
      }

      if (!getResponse.ok) {
        throw new Error("Failed to fetch current brands");
      }

      const getData = await getResponse.json();
      let currentBrands = [];

      if (getData.success && getData.data.brands) {
        currentBrands = getData.data.brands;
      }

      // Find if the brand already exists
      const existingBrandIndex = currentBrands.findIndex(
        (b) => b.id === brand.id
      );

      let updatedBrands;
      if (existingBrandIndex !== -1) {
        // Update existing brand
        updatedBrands = currentBrands.map((b) =>
          b.id === brand.id ? brand : b
        );
      } else {
        // Add new brand
        updatedBrands = [brand, ...currentBrands];
      }

      // Send all brands to the backend
      const response = await fetch("http://localhost:5000/api/about/brands", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(updatedBrands),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please log in again.");
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Brand saved successfully!");
        // Update local state with the confirmed brands from backend
        setBrands(updatedBrands);
      } else {
        throw new Error(data.message || "Failed to save brand");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.message);
    } finally {
      setSavingBrand((prev) => ({ ...prev, [brand.id]: false }));
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
    <div className="w-full py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-8 relative overflow-visible">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => removeBrand(deleteModal.brandId)}
        brandId={deleteModal.brandId}
        isDeleting={deletingBrand[deleteModal.brandId]}
      />

      <div className="mx-auto relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">
            Brands
          </h1>
        </div>

        {/* Mobile-first responsive grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start">
          {/* Edit Brands Section - Full width on mobile, 2/3 on desktop */}
          <div className="bg-gray-900/20 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 w-full lg:col-span-2 border border-gray-700/30 order-2 lg:order-1">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <FiEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                Edit Brands & Clients
              </h2>
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                <button
                  onClick={addNewBrand}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg sm:rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30 text-sm sm:text-base"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center gap-2">
                    <FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                    Add Brand
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="w-full bg-gray-800/50 rounded-lg sm:rounded-xl border border-gray-700/50"
                >
                  {/* Clickable Header Section */}
                  <div
                    className="flex flex-row justify-between items-center px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 cursor-pointer select-none"
                    onClick={() =>
                      setExpandedBrandId(
                        expandedBrandId === brand.id ? null : brand.id
                      )
                    }
                    title={`Show/Hide Brand #${brand.id}`}
                  >
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-white flex items-center">
                      {expandedBrandId === brand.id ? (
                        <FiChevronUp className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <FiChevronDown className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                      Brand #{brand.id}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(brand.id);
                      }}
                      disabled={deletingBrand[brand.id]}
                      className="p-1 sm:p-2 text-red-400 hover:text-red-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete Brand Permanently"
                    >
                      {deletingBrand[brand.id] ? (
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </button>
                  </div>

                  {/* Brand Details (Conditional Render) */}
                  {expandedBrandId === brand.id && (
                    <div className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6 pt-1 sm:pt-2">
                      <div className="space-y-3 sm:space-y-4">
                        {/* Image Source */}
                        <div className="form-group">
                          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                            Image Source
                          </label>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <div className="flex-1 relative group">
                              <input
                                type="text"
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-lg sm:rounded-xl text-white focus:border-gray-500 transition text-sm sm:text-base pr-8 sm:pr-10 group-hover:pr-8 sm:group-hover:pr-10"
                                value={getFileNameFromUrl(brand.src)}
                                onChange={(e) =>
                                  handleBrandChange(
                                    brand.id,
                                    "src",
                                    e.target.value
                                  )
                                }
                                placeholder="Image URL or upload using button →"
                              />
                              {/* Cross button to clear image URL */}
                              {brand.src && (
                                <button
                                  type="button"
                                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100"
                                  onClick={() =>
                                    handleBrandChange(brand.id, "src", "")
                                  }
                                  title="Remove image URL"
                                >
                                  <svg
                                    className="w-3 h-3 sm:w-4 sm:h-4"
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
                                className={`w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg sm:rounded-xl font-medium hover:from-cyan-700 hover:to-teal-700 transition flex items-center justify-center gap-1 sm:gap-2 cursor-pointer text-xs sm:text-sm ${
                                  uploadingImages[brand.id]
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                                title="Upload Image"
                              >
                                {uploadingImages[brand.id] ? (
                                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <>
                                    <FiUpload className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden xs:inline">
                                      Upload
                                    </span>
                                  </>
                                )}
                              </label>
                            </div>
                          </div>
                          {/* Show full URL as helper text */}
                          {brand.src && (
                            <p className="text-xs text-gray-400 mt-1 truncate">
                              Full URL: {brand.src}
                            </p>
                          )}
                        </div>

                        {/* Alt Text */}
                        <div className="form-group">
                          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                            Alt Text
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-lg sm:rounded-xl text-white focus:border-gray-500 transition text-sm sm:text-base"
                            value={brand.alt}
                            onChange={(e) =>
                              handleBrandChange(brand.id, "alt", e.target.value)
                            }
                            placeholder="Brand Name"
                          />
                        </div>
                      </div>

                      {/* Individual Save Button for each brand */}
                      <div className="mt-4 sm:mt-6">
                        <button
                          onClick={() => handleSaveBrand(brand)}
                          disabled={savingBrand[brand.id]}
                          className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg sm:rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30 text-sm sm:text-base"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                          <span className="relative flex items-center justify-center gap-2">
                            {savingBrand[brand.id] ? (
                              <>
                                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <FiSave className="w-3 h-3 sm:w-4 sm:h-4" />
                                Save Brand
                              </>
                            )}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {brands.length === 0 && (
                <div className="text-center py-8 sm:py-12 border-2 border-dashed border-gray-700 rounded-lg sm:rounded-xl">
                  <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
                    No brands added yet
                  </p>
                  <button
                    onClick={addNewBrand}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg sm:rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 flex items-center gap-2 mx-auto group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30 text-sm sm:text-base"
                  >
                    <FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                    Add Your First Brand
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Live Preview Section - Full width on mobile, 1/3 on desktop */}
          <div className="bg-gray-900/20 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 w-full border border-gray-700/30 lg:sticky lg:top-4 lg:top-8 self-start overflow-y-auto order-1 lg:order-2 lg:max-h-[80vh]">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
              <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />
              Live Preview
            </h2>

            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-all duration-500 border border-gray-600/30 hover:border-cyan-500/30">
              {/* Sophisticated Header */}
              <div className="relative bg-gradient-to-r from-slate-800 via-gray-800 to-slate-900 p-4 sm:p-6 overflow-hidden border-b border-gray-700/50">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/5"></div>
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 w-12 h-12 sm:w-20 sm:h-20 bg-cyan-500/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 w-10 h-10 sm:w-16 sm:h-16 bg-purple-500/10 rounded-full blur-lg"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg border border-cyan-400/30">
                      <FiEye className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                        Brands & Clients
                      </h2>
                      <p className="text-cyan-200 text-xs sm:text-sm opacity-80">
                        Trusted by amazing companies
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {brands.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {brands.map((brand) => (
                      <div
                        key={brand.id}
                        className="group relative bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg sm:rounded-xl border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5 overflow-hidden aspect-square"
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
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-3 sm:p-4">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
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
                  <div className="text-center py-6 sm:py-8 px-3 sm:px-4 border-2 border-dashed border-gray-600/50 rounded-lg sm:rounded-xl bg-gray-800/30">
                    <FiEye className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 mx-auto mb-2 sm:mb-3" />
                    <p className="text-gray-400 italic text-sm sm:text-base">
                      No brands to display
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">
                      Add brands to see them here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom styles for modal animation */}
      <style>{`
        /* Animation for modal */
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }

        /* Responsive breakpoints */
        @media (max-width: 480px) {
          .xs\\:flex-row {
            flex-direction: row;
          }
          .xs\\:inline {
            display: inline;
          }
        }
      `}</style>
    </div>
  );
};

export default BrandAndClient;
