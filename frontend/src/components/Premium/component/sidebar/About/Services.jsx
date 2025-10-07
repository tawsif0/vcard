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
import AuthContext from "../../../../../context/AuthContext";
import { Editor } from "@tinymce/tinymce-react";

// Custom Confirmation Modal Component
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  serviceId,
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
              <h3 className="text-xl font-bold text-white">Delete Service</h3>
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
            <span className="text-white font-semibold">
              Service #{serviceId}
            </span>
            ? This will permanently remove the service from the system.
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
                Delete Service
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const Services = () => {
  const { checkAuth } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState({});
  const [savingService, setSavingService] = useState({});
  const [deletingService, setDeletingService] = useState({});
  const [expandedServiceId, setExpandedServiceId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    serviceId: null,
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

  // Fetch services data from backend
  useEffect(() => {
    const fetchServicesData = async () => {
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

        const response = await fetch("http://localhost:5000/api/about", {
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

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        if (data.success) {
          const servicesData = data.data.services || [];
          setServices(servicesData);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        if (err.message.includes("401")) {
          toast.error("Authentication failed. Please log in again.");
        } else {
          toast.error(err.message);
        }
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServicesData();

    return () => {
      hasFetchedRef.current = false;
    };
  }, []);

  const handleServiceChange = (id, field, value) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === id ? { ...service, [field]: value } : service
      )
    );
  };

  const handleEditorChange = (id, content) => {
    handleServiceChange(id, "desc", content);
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

      // Update service with FULL image URL
      const fullImageUrl = `http://localhost:5000${data.imageUrl}`;
      handleServiceChange(id, "image", fullImageUrl);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploadingImages((prev) => ({ ...prev, [id]: false }));
    }
  };

  const addNewService = () => {
    const newId =
      services.length > 0 ? Math.max(...services.map((s) => s.id)) + 1 : 1;
    const newService = {
      id: newId,
      title: "",
      image: "",
      desc: "",
    };
    setServices((prev) => [newService, ...prev]);
    setExpandedServiceId(newId);
  };

  // Open delete confirmation modal
  const openDeleteModal = (serviceId) => {
    setDeleteModal({ isOpen: true, serviceId });
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, serviceId: null });
  };

  // Permanently delete service from backend
  const removeService = async (serviceId) => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      toast.error("Please log in to delete services");
      closeDeleteModal();
      return;
    }

    setDeletingService((prev) => ({ ...prev, [serviceId]: true }));

    try {
      const token = localStorage.getItem("token");

      // First, get the current services from the backend
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
        throw new Error("Failed to fetch current services");
      }

      const getData = await getResponse.json();
      let currentServices = [];

      if (getData.success && getData.data.services) {
        currentServices = getData.data.services;
      }

      // Filter out the service to be deleted
      const updatedServices = currentServices.filter(
        (service) => service.id !== serviceId
      );

      // Send updated services to backend
      const response = await fetch("http://localhost:5000/api/about/services", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(updatedServices),
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
        setServices((prev) =>
          prev.filter((service) => service.id !== serviceId)
        );
        if (expandedServiceId === serviceId) setExpandedServiceId(null);
        toast.success("Service deleted successfully!");
      } else {
        throw new Error(data.message || "Failed to delete service");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete service");
    } finally {
      setDeletingService((prev) => ({ ...prev, [serviceId]: false }));
      closeDeleteModal();
    }
  };

  const handleSaveService = async (service) => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      toast.error("Please log in to save changes");
      return;
    }

    setSavingService((prev) => ({ ...prev, [service.id]: true }));

    try {
      const token = localStorage.getItem("token");

      // First, get the current services from the backend
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
        throw new Error("Failed to fetch current services");
      }

      const getData = await getResponse.json();
      let currentServices = [];

      if (getData.success && getData.data.services) {
        currentServices = getData.data.services;
      }

      // Find if the service already exists
      const existingServiceIndex = currentServices.findIndex(
        (s) => s.id === service.id
      );

      let updatedServices;
      if (existingServiceIndex !== -1) {
        // Update existing service
        updatedServices = currentServices.map((s) =>
          s.id === service.id ? service : s
        );
      } else {
        // Add new service
        updatedServices = [service, ...currentServices];
      }

      // Send all services to the backend
      const response = await fetch("http://localhost:5000/api/about/services", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(updatedServices),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please log in again.");
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Service saved successfully!");
        // Update local state with the confirmed services from backend
        setServices(updatedServices);
      } else {
        throw new Error(data.message || "Failed to save service");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.message);
    } finally {
      setSavingService((prev) => ({ ...prev, [service.id]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center relative z-10">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-400 font-medium">Loading services...</p>
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
        onConfirm={() => removeService(deleteModal.serviceId)}
        serviceId={deleteModal.serviceId}
        isDeleting={deletingService[deleteModal.serviceId]}
      />

      <div className="mx-auto relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">
            Services
          </h1>
        </div>

        {/* Mobile-first responsive grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start">
          {/* Edit Services Section - Full width on mobile, 2/3 on desktop */}
          <div className="bg-gray-900/20 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 w-full lg:col-span-2 border border-gray-700/30 order-2 lg:order-1">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <FiEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                Edit Services
              </h2>
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                <button
                  onClick={addNewService}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg sm:rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30 text-sm sm:text-base"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center gap-2">
                    <FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                    Add Service
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="w-full bg-gray-800/50 rounded-lg sm:rounded-xl border border-gray-700/50"
                >
                  {/* Clickable Header Section */}
                  <div
                    className="flex flex-row justify-between items-center px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 cursor-pointer select-none"
                    onClick={() =>
                      setExpandedServiceId(
                        expandedServiceId === service.id ? null : service.id
                      )
                    }
                    title={`Show/Hide Service #${service.id}`}
                  >
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-white flex items-center">
                      {expandedServiceId === service.id ? (
                        <FiChevronUp className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <FiChevronDown className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                      Service #{service.id}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(service.id);
                      }}
                      disabled={deletingService[service.id]}
                      className="p-1 sm:p-2 text-red-400 hover:text-red-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete Service Permanently"
                    >
                      {deletingService[service.id] ? (
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </button>
                  </div>

                  {/* Service Details (Conditional Render) */}
                  {expandedServiceId === service.id && (
                    <div className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6 pt-1 sm:pt-2">
                      <div className="space-y-3 sm:space-y-4 mb-3 sm:mb-4">
                        <div className="form-group">
                          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                            Service Title
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-lg sm:rounded-xl text-white focus:border-gray-500 transition text-sm sm:text-base"
                            value={service.title}
                            onChange={(e) =>
                              handleServiceChange(
                                service.id,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder="Web Development"
                          />
                        </div>

                        <div className="form-group">
                          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                            Service Image
                          </label>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <div className="flex-1 relative group">
                              <input
                                type="text"
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-lg sm:rounded-xl text-white focus:border-gray-500 transition text-sm sm:text-base pr-8 sm:pr-10 group-hover:pr-8 sm:group-hover:pr-10"
                                value={getFileNameFromUrl(service.image)}
                                onChange={(e) =>
                                  handleServiceChange(
                                    service.id,
                                    "image",
                                    e.target.value
                                  )
                                }
                                placeholder="Image URL or upload using button →"
                              />
                              {/* Cross button to clear image URL */}
                              {service.image && (
                                <button
                                  type="button"
                                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100"
                                  onClick={() =>
                                    handleServiceChange(service.id, "image", "")
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
                                id={`image-upload-${service.id}`}
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    handleImageUpload(service.id, file);
                                  }
                                  e.target.value = "";
                                }}
                                disabled={uploadingImages[service.id]}
                              />
                              <label
                                htmlFor={`image-upload-${service.id}`}
                                className={`w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg sm:rounded-xl font-medium hover:from-cyan-700 hover:to-teal-700 transition flex items-center justify-center gap-1 sm:gap-2 cursor-pointer text-xs sm:text-sm ${
                                  uploadingImages[service.id]
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                                title="Upload Image"
                              >
                                {uploadingImages[service.id] ? (
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
                          {service.image && (
                            <p className="text-xs text-gray-400 mt-1 truncate">
                              Full URL: {service.image}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                          Description
                        </label>
                        <div className="bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-lg sm:rounded-xl focus-within:border-gray-500 transition">
                          <Editor
                            apiKey="h2ar80nttlx4hli43ugzp4wvv9ej7q3feifsu8mqssyfga6s"
                            value={service.desc}
                            onEditorChange={(content) =>
                              handleEditorChange(service.id, content)
                            }
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
                              images_upload_url:
                                "http://localhost:5000/api/upload",
                              relative_urls: false,
                              remove_script_host: false,
                              convert_urls: true,
                              mobile: {
                                theme: "mobile",
                                toolbar: [
                                  "undo redo",
                                  "bold italic",
                                  "blocks",
                                  "link",
                                ],
                              },
                            }}
                          />
                        </div>
                      </div>

                      {/* Individual Save Button for each service */}
                      <div className="mt-4 sm:mt-6">
                        <button
                          onClick={() => handleSaveService(service)}
                          disabled={savingService[service.id]}
                          className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg sm:rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30 text-sm sm:text-base"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                          <span className="relative flex items-center justify-center gap-2">
                            {savingService[service.id] ? (
                              <>
                                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <FiSave className="w-3 h-3 sm:w-4 sm:h-4" />
                                Save Service
                              </>
                            )}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {services.length === 0 && (
                <div className="text-center py-8 sm:py-12 border-2 border-dashed border-gray-700 rounded-lg sm:rounded-xl">
                  <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
                    No services added yet
                  </p>
                  <button
                    onClick={addNewService}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg sm:rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 flex items-center gap-2 mx-auto group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30 text-sm sm:text-base"
                  >
                    <FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                    Add Your First Service
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
                        Our Services
                      </h2>
                      <p className="text-cyan-200 text-xs sm:text-sm opacity-80">
                        Professional services to grow your business
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {services.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="group relative p-4 sm:p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg sm:rounded-xl border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5"
                      >
                        {/* Image at top */}
                        <div className="flex justify-center mb-3 sm:mb-4">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden shadow-lg">
                            {service.image ? (
                              <img
                                src={
                                  service.image.startsWith("/uploads")
                                    ? `http://localhost:5000${service.image}`
                                    : service.image
                                }
                                alt={service.title || "Service"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error(
                                    "Image failed to load:",
                                    service.image
                                  );
                                  e.target.style.display = "none";
                                  const fallback = e.target.nextSibling;
                                  if (fallback && fallback.style) {
                                    fallback.style.display = "flex";
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-cyan-600 to-teal-600 rounded flex items-center justify-center text-white text-xs font-bold">
                                Icon
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Title below image */}
                        <div className="text-center mb-2 sm:mb-3">
                          <h3 className="text-base sm:text-lg font-semibold text-white">
                            {service.title || "Service Title"}
                          </h3>
                        </div>

                        {/* Description below title */}
                        <div className="text-center">
                          <div className="text-gray-300 text-xs sm:text-sm leading-relaxed preview-content">
                            {service.desc ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: service.desc,
                                }}
                                className="preview-html-content text-left"
                              />
                            ) : (
                              "Service description will appear here..."
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 px-3 sm:px-4 border-2 border-dashed border-gray-600/50 rounded-lg sm:rounded-xl bg-gray-800/30">
                    <FiEye className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 mx-auto mb-2 sm:mb-3" />
                    <p className="text-gray-400 italic text-sm sm:text-base">
                      No services to display
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">
                      Add services to see them here
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
          .preview-content strong { font-weight: bold; }
          .preview-content em { font-style: italic; }
          .preview-content u { text-decoration: underline; }
          .preview-content a { color: #60a5fa; text-decoration: underline; }
          .preview-content a:hover { color: #93c5fd; }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
        `}</style>
    </div>
  );
};

export default Services;
