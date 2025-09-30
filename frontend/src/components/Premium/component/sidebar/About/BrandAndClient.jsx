import React, { useState, useEffect, useRef, useContext } from "react";
import { FiEdit, FiEye, FiSave, FiPlus, FiTrash2 } from "react-icons/fi";
import { toast } from "react-hot-toast";
import AuthContext from "../../../../../context/AuthContext"; // Adjust import path as needed

const BrandAndClient = () => {
  const { checkAuth } = useContext(AuthContext);
  const [brands, setBrands] = useState([]);
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

  const addNewBrand = () => {
    const newId =
      brands.length > 0 ? Math.max(...brands.map((b) => b.id)) + 1 : 1;
    setBrands((prev) => [
      ...prev,
      {
        id: newId,
        src: "",
        alt: "",
      },
    ]);
  };

  const removeBrand = (id) => {
    if (brands.length <= 1) {
      toast.error("At least one brand is required");
      return;
    }
    setBrands((prev) => prev.filter((brand) => brand.id !== id));
  };

  const handleSave = async () => {
    // Check authentication before saving
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      toast.error("Please log in to save changes");
      return;
    }

    setIsSaving(true);

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
        toast.success("Brands saved successfully!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save brands");
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-6 lg:col-span-2 border border-gray-700/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiEdit className="w-5 h-5" />
                Edit Brands & Clients
              </h2>
              <button
                onClick={addNewBrand}
                className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Add Brand
              </button>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Image Source
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                        value={brand.src}
                        onChange={(e) =>
                          handleBrandChange(brand.id, "src", e.target.value)
                        }
                        placeholder="images/about/brand-img.png"
                      />
                    </div>

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
                </div>
              ))}

              {brands.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
                  <p className="text-gray-400 mb-4">No brands added yet</p>
                  <button
                    onClick={addNewBrand}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition flex items-center gap-2 mx-auto"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Your First Brand
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
                      Save Brands
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
                <h2 className="text-2xl font-bold mb-2">Brands & Clients</h2>
                <p className="text-indigo-100">Trusted by amazing companies</p>
              </div>

              <div className="p-6">
                {brands.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {brands.map((brand) => (
                      <div
                        key={brand.id}
                        className="flex items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg group"
                      >
                        {brand.src ? (
                          <img
                            src={brand.src}
                            alt={brand.alt}
                            className="h-12 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                          />
                        ) : (
                          <div className="text-center text-gray-400">
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center mb-2">
                              <span className="text-xs font-medium">Logo</span>
                            </div>
                            <p className="text-xs">
                              {brand.alt || "Brand Name"}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiEye className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No brands to display</p>
                    <p className="text-sm text-gray-400 mt-1">
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
