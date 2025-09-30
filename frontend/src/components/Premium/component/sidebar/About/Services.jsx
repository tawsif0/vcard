import React, { useState, useEffect, useRef } from "react";
import { FiEdit, FiEye, FiSave, FiPlus, FiTrash2 } from "react-icons/fi";
import { toast } from "react-hot-toast";

const Services = ({ user }) => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  // Fetch services data from backend
  useEffect(() => {
    const fetchServicesData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoading(false);
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

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        if (data.success) {
          // Handle both possible data structures
          const servicesData = data.data.services || [];
          setServices(servicesData);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error(err.message);
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServicesData();

    // Cleanup function to reset fetch flag when component unmounts
    return () => {
      hasFetchedRef.current = false;
    };
  }, []); // Remove user dependency

  const handleServiceChange = (id, field, value) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === id ? { ...service, [field]: value } : service
      )
    );
  };

  const addNewService = () => {
    const newId =
      services.length > 0 ? Math.max(...services.map((s) => s.id)) + 1 : 1;
    setServices((prev) => [
      ...prev,
      {
        id: newId,
        title: "",
        icon: "FiCode",
        desc: "",
      },
    ]);
  };

  const removeService = (id) => {
    if (services.length <= 1) {
      toast.error("At least one service is required");
      return;
    }
    setServices((prev) => prev.filter((service) => service.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/about/services", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(services),
      });

      if (response.ok) {
        toast.success("Services saved successfully!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save services");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
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
    <div className="w-full py-6 px-4 relative overflow-visible">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle 500px at 50% 100px, rgba(192,92,246,0.4), transparent)`,
        }}
      />

      <div className="mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-6 lg:col-span-2 border border-gray-700/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiEdit className="w-5 h-5" />
                Edit Services
              </h2>
              <button
                onClick={addNewService}
                className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Add Service
              </button>
            </div>

            <div className="space-y-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Service #{service.id}
                    </h3>
                    <button
                      onClick={() => removeService(service.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition"
                      title="Remove Service"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Service Title
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
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
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Icon Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                        value={service.icon}
                        onChange={(e) =>
                          handleServiceChange(
                            service.id,
                            "icon",
                            e.target.value
                          )
                        }
                        placeholder="FiCode"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition resize-none"
                      rows="3"
                      value={service.desc}
                      onChange={(e) =>
                        handleServiceChange(service.id, "desc", e.target.value)
                      }
                      placeholder="Describe your service in detail..."
                    />
                  </div>
                </div>
              ))}

              {services.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
                  <p className="text-gray-400 mb-4">No services added yet</p>
                  <button
                    onClick={addNewService}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition flex items-center gap-2 mx-auto"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Your First Service
                  </button>
                </div>
              )}
            </div>

            <div className="mt-8">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group relative overflow-hidden"
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
                      Save Services
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

            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Our Services</h2>
                <p className="text-indigo-100">
                  Professional services to grow your business
                </p>
              </div>

              <div className="p-6">
                {services.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-200 transition-colors">
                            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white text-xs font-bold">
                              {service.icon || "Icon"}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                              {service.title || "Service Title"}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {service.desc ||
                                "Service description will appear here..."}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiEye className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No services to display</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Add services to see them here
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

export default Services;
