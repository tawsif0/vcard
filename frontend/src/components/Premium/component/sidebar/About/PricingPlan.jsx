import React, { useState, useEffect, useRef, useContext } from "react";
import {
  FiEdit,
  FiEye,
  FiSave,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiDollarSign,
  FiAlertTriangle,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import AuthContext from "../../../../../context/AuthContext"; // Adjust path as needed

// Custom Confirmation Modal Component
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  planId,
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
              <h3 className="text-xl font-bold text-white">
                Delete Pricing Plan
              </h3>
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
            <span className="text-white font-semibold">Plan #{planId}</span>?
            This will permanently remove the pricing plan from the system.
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
                Delete Plan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const PricingPlan = () => {
  const { checkAuth } = useContext(AuthContext);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingPlan, setSavingPlan] = useState({});
  const [deletingPlan, setDeletingPlan] = useState({});
  const [expandedPlanId, setExpandedPlanId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    planId: null,
  });
  const hasFetchedRef = useRef(false);

  // Currency options
  const currencyOptions = [
    { value: "dollar", label: "Dollar", symbol: "$", icon: "💵" },
    { value: "euro", label: "Euro", symbol: "€", icon: "💶" },
    { value: "taka", label: "Taka", symbol: "৳", icon: "🇧🇩" },
  ];

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

  // Fetch pricing data from backend
  useEffect(() => {
    const fetchPricingData = async () => {
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
          const pricingData = data.data.pricing || [];
          // Add currency field if not present
          const pricingWithCurrency = pricingData.map((plan) => ({
            ...plan,
            currency: plan.currency || "dollar",
          }));
          setPricingPlans(pricingWithCurrency);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        if (err.message.includes("401")) {
          toast.error("Authentication failed. Please log in again.");
        } else {
          toast.error(err.message);
        }
        setPricingPlans([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPricingData();
    return () => {
      hasFetchedRef.current = false;
    };
  }, []);

  const handlePlanChange = (id, field, value) => {
    setPricingPlans((prev) =>
      prev.map((plan) => (plan.id === id ? { ...plan, [field]: value } : plan))
    );
  };

  const handleFeatureChange = (planId, featureId, field, value) => {
    setPricingPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              features: plan.features.map((feature) =>
                feature.id === featureId
                  ? { ...feature, [field]: value }
                  : feature
              ),
            }
          : plan
      )
    );
  };

  const addNewPlan = () => {
    const newId =
      pricingPlans.length > 0
        ? Math.max(...pricingPlans.map((p) => p.id)) + 1
        : 1;
    const newPlan = {
      id: newId,
      name: "",
      price: "",
      period: "month",
      currency: "dollar",
      features: [
        { id: 1, text: "", included: true },
        { id: 2, text: "", included: true },
        { id: 3, text: "", included: true },
      ],
    };
    setPricingPlans((prev) => [newPlan, ...prev]);
    setExpandedPlanId(newId); // Auto-expand when new is added
  };

  // Open delete confirmation modal
  const openDeleteModal = (planId) => {
    setDeleteModal({ isOpen: true, planId });
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, planId: null });
  };

  // Permanently delete plan from backend
  const removePlan = async (planId) => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      toast.error("Please log in to delete pricing plans");
      closeDeleteModal();
      return;
    }

    setDeletingPlan((prev) => ({ ...prev, [planId]: true }));

    try {
      const token = localStorage.getItem("token");

      // First, get the current pricing plans from the backend
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
        throw new Error("Failed to fetch current pricing plans");
      }

      const getData = await getResponse.json();
      let currentPlans = [];

      if (getData.success && getData.data.pricing) {
        currentPlans = getData.data.pricing;
      }

      // Filter out the plan to be deleted
      const updatedPlans = currentPlans.filter((plan) => plan.id !== planId);

      // Send updated plans to backend
      const response = await fetch("http://localhost:5000/api/about/pricing", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(updatedPlans),
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
        setPricingPlans((prev) => prev.filter((plan) => plan.id !== planId));
        if (expandedPlanId === planId) setExpandedPlanId(null);
        toast.success("Pricing plan deleted successfully!");
      } else {
        throw new Error(data.message || "Failed to delete pricing plan");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete pricing plan");
    } finally {
      setDeletingPlan((prev) => ({ ...prev, [planId]: false }));
      closeDeleteModal();
    }
  };

  const addFeature = (planId) => {
    setPricingPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              features: [
                ...plan.features,
                {
                  id:
                    plan.features.length > 0
                      ? Math.max(...plan.features.map((f) => f.id)) + 1
                      : 1,
                  text: "",
                  included: true,
                },
              ],
            }
          : plan
      )
    );
  };

  const removeFeature = (planId, featureId) => {
    setPricingPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              features: plan.features.filter(
                (feature) => feature.id !== featureId
              ),
            }
          : plan
      )
    );
  };

  const toggleFeatureIncluded = (planId, featureId) => {
    setPricingPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              features: plan.features.map((feature) =>
                feature.id === featureId
                  ? { ...feature, included: !feature.included }
                  : feature
              ),
            }
          : plan
      )
    );
  };

  const handleSavePlan = async (plan) => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      toast.error("Please log in to save changes");
      return;
    }
    setSavingPlan((prev) => ({ ...prev, [plan.id]: true }));
    try {
      const token = localStorage.getItem("token");

      // First, get the current pricing plans from the backend
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
        throw new Error("Failed to fetch current pricing plans");
      }

      const getData = await getResponse.json();
      let currentPlans = [];

      if (getData.success && getData.data.pricing) {
        currentPlans = getData.data.pricing;
      }

      // Find if the plan already exists
      const existingPlanIndex = currentPlans.findIndex((p) => p.id === plan.id);

      let updatedPlans;
      if (existingPlanIndex !== -1) {
        // Update existing plan
        updatedPlans = currentPlans.map((p) => (p.id === plan.id ? plan : p));
      } else {
        // Add new plan
        updatedPlans = [plan, ...currentPlans];
      }

      // Send all plans to the backend
      const response = await fetch("http://localhost:5000/api/about/pricing", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(updatedPlans),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please log in again.");
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Pricing plan saved successfully!");
        // Update local state with the confirmed plans from backend
        setPricingPlans(updatedPlans);
      } else {
        throw new Error(data.message || "Failed to save pricing plan");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingPlan((prev) => ({ ...prev, [plan.id]: false }));
    }
  };

  // Get currency symbol and icon
  const getCurrencyInfo = (currency) => {
    return (
      currencyOptions.find((opt) => opt.value === currency) ||
      currencyOptions[0]
    );
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center relative z-10">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-400 font-medium">
            Loading pricing plans...
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
    <div className="w-full py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-8 relative overflow-visible">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => removePlan(deleteModal.planId)}
        planId={deleteModal.planId}
        isDeleting={deletingPlan[deleteModal.planId]}
      />

      <div className="w-full relative z-10">
        <div className="text-center mb-5 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">
            Pricing
          </h1>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start w-full">
          <div className="w-full bg-gray-900/20 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 md:p-6 lg:col-span-2 border border-gray-700/30 order-2 lg:order-1">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6 px-1 sm:px-0">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <FiEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                Edit Pricing Plans
              </h2>
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={addNewPlan}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg sm:rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 flex items-center gap-2 group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30 text-sm sm:text-base"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center gap-2">
                    <FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                    Add Plan
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="w-full bg-gray-800/50 rounded-lg sm:rounded-xl border border-gray-700/50"
                >
                  <div
                    className="flex flex-row justify-between items-center px-3 sm:px-4 py-2 sm:py-3 cursor-pointer select-none"
                    onClick={() =>
                      setExpandedPlanId(
                        expandedPlanId === plan.id ? null : plan.id
                      )
                    }
                    title={`Show/Hide Plan #${plan.id}`}
                  >
                    <h3 className="text-sm sm:text-base font-semibold text-white flex items-center">
                      {expandedPlanId === plan.id ? (
                        <FiChevronUp className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <FiChevronDown className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                      Plan #{plan.id}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(plan.id);
                      }}
                      disabled={deletingPlan[plan.id]}
                      className="p-1 sm:p-2 text-red-400 hover:text-red-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete Plan Permanently"
                    >
                      {deletingPlan[plan.id] ? (
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </button>
                  </div>
                  {expandedPlanId === plan.id && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 sm:pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-5">
                        <div className="form-group">
                          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                            Plan Name
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-lg sm:rounded-xl text-white focus:border-gray-500 transition text-sm sm:text-base"
                            value={plan.name}
                            onChange={(e) =>
                              handlePlanChange(plan.id, "name", e.target.value)
                            }
                            placeholder="Basic Plan"
                          />
                        </div>
                        <div className="form-group">
                          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                            Price
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-lg sm:rounded-xl text-white focus:border-gray-500 transition text-sm sm:text-base"
                            value={plan.price}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "" || /^\d*\.?\d*$/.test(value)) {
                                handlePlanChange(plan.id, "price", value);
                              }
                            }}
                            onBlur={(e) => {
                              const value = e.target.value;
                              if (value && !isNaN(parseFloat(value))) {
                                const formattedValue =
                                  parseFloat(value).toString();
                                handlePlanChange(
                                  plan.id,
                                  "price",
                                  formattedValue
                                );
                              } else if (value === "") {
                                handlePlanChange(plan.id, "price", "");
                              } else {
                                handlePlanChange(plan.id, "price", "");
                                toast.error(
                                  "Please enter a valid number for price"
                                );
                              }
                            }}
                            placeholder="99.99"
                          />
                        </div>
                        <div className="form-group">
                          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                            Currency
                          </label>
                          <select
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-lg sm:rounded-xl text-white focus:border-gray-500 transition text-sm sm:text-base"
                            value={plan.currency}
                            onChange={(e) =>
                              handlePlanChange(
                                plan.id,
                                "currency",
                                e.target.value
                              )
                            }
                          >
                            {currencyOptions.map((currency) => (
                              <option
                                key={currency.value}
                                value={currency.value}
                              >
                                {currency.icon} {currency.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                            Period
                          </label>
                          <select
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-lg sm:rounded-xl text-white focus:border-gray-500 transition text-sm sm:text-base"
                            value={plan.period}
                            onChange={(e) =>
                              handlePlanChange(
                                plan.id,
                                "period",
                                e.target.value
                              )
                            }
                          >
                            <option value="month">Per Month</option>
                            <option value="year">Per Year</option>
                            <option value="one-time">One Time</option>
                            <option value="hour">Per Hour</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="block text-xs sm:text-sm font-medium text-gray-300">
                            Features
                          </label>
                          <button
                            onClick={() => addFeature(plan.id)}
                            className="px-2 sm:px-3 py-1 sm:py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg text-xs sm:text-sm hover:from-cyan-700 hover:to-teal-700 transition flex items-center gap-1 group relative overflow-hidden"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            <span className="relative flex items-center gap-1">
                              <FiPlus className="w-3 h-3" />
                              Add Feature
                            </span>
                          </button>
                        </div>
                        {plan.features.map((feature) => (
                          <div
                            key={feature.id}
                            className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-800 rounded-lg border border-gray-700"
                          >
                            <button
                              onClick={() =>
                                toggleFeatureIncluded(plan.id, feature.id)
                              }
                              className={`p-1 rounded ${
                                feature.included
                                  ? "bg-green-600 text-white"
                                  : "bg-red-600 text-white"
                              }`}
                              title={
                                feature.included ? "Included" : "Not Included"
                              }
                            >
                              {feature.included ? (
                                <FiCheck className="w-3 h-3" />
                              ) : (
                                <FiX className="w-3 h-3" />
                              )}
                            </button>
                            <input
                              type="text"
                              className="flex-1 px-2 sm:px-3 py-1 sm:py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-gray-500 transition text-sm sm:text-base"
                              value={feature.text}
                              onChange={(e) =>
                                handleFeatureChange(
                                  plan.id,
                                  feature.id,
                                  "text",
                                  e.target.value
                                )
                              }
                              placeholder="Feature description"
                            />
                            <button
                              onClick={() => removeFeature(plan.id, feature.id)}
                              className="p-1 text-red-400 hover:text-red-300 transition"
                              title="Remove Feature"
                            >
                              <FiTrash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 sm:mt-6">
                        <button
                          onClick={() => handleSavePlan(plan)}
                          disabled={savingPlan[plan.id]}
                          className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg sm:rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30 text-sm sm:text-base"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                          <span className="relative flex items-center justify-center gap-2">
                            {savingPlan[plan.id] ? (
                              <>
                                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <FiSave className="w-3 h-3 sm:w-4 sm:h-4" />
                                Save Plan
                              </>
                            )}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {pricingPlans.length === 0 && (
                <div className="text-center py-8 sm:py-12 border-2 border-dashed border-gray-700 rounded-lg sm:rounded-xl">
                  <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
                    No pricing plans added yet
                  </p>
                  <button
                    onClick={addNewPlan}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg sm:rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 flex items-center gap-2 mx-auto group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30 text-sm sm:text-base"
                  >
                    <FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                    Add Your First Pricing Plan
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Live Preview Section */}
          <div className="w-fullbg-gray-900/20 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 w-full border border-gray-700/30 lg:sticky lg:top-4 lg:top-8 self-start overflow-y-auto order-1 lg:order-2 lg:max-h-[80vh]">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
              <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />
              Live Preview
            </h2>

            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-all duration-500 border border-gray-600/30 hover:border-cyan-500/30">
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
                        Pricing Plans
                      </h2>
                      <p className="text-cyan-200 text-xs sm:text-sm opacity-80">
                        Choose the perfect plan for your needs
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {pricingPlans.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    {pricingPlans.map((plan) => {
                      const currencyInfo = getCurrencyInfo(plan.currency);
                      return (
                        <div
                          key={plan.id}
                          className="group relative p-4 sm:p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg sm:rounded-xl border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5"
                        >
                          <div className="text-center mb-3 sm:mb-4">
                            <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                              {plan.name || "Plan Name"}
                            </h3>
                            <div className="flex items-baseline justify-center gap-1 mb-2 sm:mb-3">
                              <span className="text-2xl sm:text-3xl font-bold text-cyan-400 flex items-center">
                                {currencyInfo.symbol}
                                {plan.price || "0"}
                              </span>
                              <span className="text-cyan-200 text-xs sm:text-sm">
                                /
                                {plan.period === "month"
                                  ? "mo"
                                  : plan.period === "year"
                                  ? "yr"
                                  : plan.period === "hour"
                                  ? "hr"
                                  : "one-time"}
                              </span>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-400">
                              <span className="bg-gray-700 px-2 py-1 rounded-md">
                                {currencyInfo.label}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                            {plan.features.map((feature) => (
                              <div
                                key={feature.id}
                                className={`flex items-center gap-2 sm:gap-3 ${
                                  feature.included
                                    ? "text-gray-300"
                                    : "text-gray-500 line-through"
                                }`}
                              >
                                {feature.included ? (
                                  <FiCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                                ) : (
                                  <FiX className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
                                )}
                                <span className="text-xs sm:text-sm">
                                  {feature.text || "Feature description"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 px-3 sm:px-4 border-2 border-dashed border-gray-600/50 rounded-lg sm:rounded-xl bg-gray-800/30">
                    <FiEye className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 mx-auto mb-2 sm:mb-3" />
                    <p className="text-gray-400 italic text-sm sm:text-base">
                      No pricing plans to display
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">
                      Add pricing plans to see them here
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

export default PricingPlan;
