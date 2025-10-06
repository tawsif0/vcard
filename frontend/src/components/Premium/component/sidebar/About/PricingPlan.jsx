import React, { useState, useEffect, useRef, useContext } from "react";
import {
  FiEdit,
  FiEye,
  FiSave,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import AuthContext from "../../../../../context/AuthContext"; // Adjust import path as needed

const PricingPlan = () => {
  const { checkAuth } = useContext(AuthContext);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingPlan, setSavingPlan] = useState({});
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

  // Fetch pricing data from backend
  useEffect(() => {
    const fetchPricingData = async () => {
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
          const pricingData = data.data.pricing || [];
          setPricingPlans(pricingData);
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

    // Cleanup function to reset fetch flag when component unmounts
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
      features: [
        { id: 1, text: "", included: true },
        { id: 2, text: "", included: true },
        { id: 3, text: "", included: true },
      ],
    };
    setPricingPlans((prev) => [newPlan, ...prev]);
  };

  const removePlan = (id) => {
    setPricingPlans((prev) => prev.filter((plan) => plan.id !== id));
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
    // Check authentication before saving
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      toast.error("Please log in to save changes");
      return;
    }

    setSavingPlan((prev) => ({ ...prev, [plan.id]: true }));

    try {
      const token = localStorage.getItem("token");

      // Create updated plans array - either update existing or add new
      const updatedPlans = pricingPlans.map((p) =>
        p.id === plan.id ? plan : p
      );

      const response = await fetch("http://localhost:5000/api/about/pricing", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(updatedPlans), // Send ALL plans, not just the current one
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please log in again.");
        return;
      }

      if (response.ok) {
        toast.success("Pricing plan saved successfully!");
        // Update local state with the saved data
        setPricingPlans(updatedPlans);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save pricing plan");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingPlan((prev) => ({ ...prev, [plan.id]: false }));
    }
  };

  // New function to save all plans at once
  const handleSaveAllPlans = async () => {
    // Check authentication before saving
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      toast.error("Please log in to save changes");
      return;
    }

    if (pricingPlans.length === 0) {
      toast.error("No pricing plans to save");
      return;
    }

    setSavingPlan((prev) => ({ ...prev, all: true }));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/about/pricing", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(pricingPlans),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please log in again.");
        return;
      }

      if (response.ok) {
        toast.success("All pricing plans saved successfully!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save pricing plans");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingPlan((prev) => ({ ...prev, all: false }));
    }
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
    <div className="w-full py-6 px-4 relative overflow-visible">
      <div className="mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Pricing
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-6 lg:col-span-2 border border-gray-700/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiEdit className="w-5 h-5" />
                Edit Pricing Plans
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={addNewPlan}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 flex items-center gap-2 group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center gap-2">
                    <FiPlus className="w-4 h-4" />
                    Add Plan
                  </span>
                </button>
                {pricingPlans.length > 0 && (
                  <button
                    onClick={handleSaveAllPlans}
                    disabled={savingPlan.all}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 flex items-center gap-2 group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transform hover:-translate-y-0.5 border border-purple-500/30"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative flex items-center gap-2">
                      {savingPlan.all ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving All...
                        </>
                      ) : (
                        <>
                          <FiSave className="w-4 h-4" />
                          Save All Plans
                        </>
                      )}
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-semibold text-white">
                      Plan #{plan.id}
                    </h3>
                    <button
                      onClick={() => removePlan(plan.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition"
                      title="Remove Plan"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Plan Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                        value={plan.name}
                        onChange={(e) =>
                          handlePlanChange(plan.id, "name", e.target.value)
                        }
                        placeholder="Basic Plan"
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Price
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                        value={plan.price}
                        onChange={(e) => {
                          // Only allow numbers and decimal point
                          const value = e.target.value;
                          // Regex to allow numbers and optional decimal point
                          if (value === "" || /^\d*\.?\d*$/.test(value)) {
                            handlePlanChange(plan.id, "price", value);
                          }
                        }}
                        onBlur={(e) => {
                          // Format the price on blur - ensure it's a proper number
                          const value = e.target.value;
                          if (value && !isNaN(parseFloat(value))) {
                            // Remove leading zeros and format to 2 decimal places if needed
                            const formattedValue = parseFloat(value).toString();
                            handlePlanChange(plan.id, "price", formattedValue);
                          } else if (value === "") {
                            handlePlanChange(plan.id, "price", "");
                          } else {
                            // If invalid, clear the field
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
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Period
                      </label>
                      <select
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                        value={plan.period}
                        onChange={(e) =>
                          handlePlanChange(plan.id, "period", e.target.value)
                        }
                      >
                        <option value="month">Per Month</option>
                        <option value="year">Per Year</option>
                        <option value="one-time">One Time</option>
                        <option value="hour">Per Hour</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-gray-300">
                        Features
                      </label>
                      <button
                        onClick={() => addFeature(plan.id)}
                        className="px-3 py-1 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg text-sm hover:from-cyan-700 hover:to-teal-700 transition flex items-center gap-1 group relative overflow-hidden"
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
                        className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700"
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
                          title={feature.included ? "Included" : "Not Included"}
                        >
                          {feature.included ? (
                            <FiCheck className="w-3 h-3" />
                          ) : (
                            <FiX className="w-3 h-3" />
                          )}
                        </button>

                        <input
                          type="text"
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-gray-500 transition"
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

                  {/* Individual Save Button for each plan */}
                  <div className="mt-6">
                    <button
                      onClick={() => handleSavePlan(plan)}
                      disabled={savingPlan[plan.id]}
                      className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="relative flex items-center justify-center gap-2">
                        {savingPlan[plan.id] ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <FiSave className="w-4 h-4" />
                            Save Plan
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              ))}

              {pricingPlans.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
                  <p className="text-gray-400 mb-4">
                    No pricing plans added yet
                  </p>
                  <button
                    onClick={addNewPlan}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 flex items-center gap-2 mx-auto group relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative flex items-center gap-2">
                      <FiPlus className="w-4 h-4" />
                      Add Your First Pricing Plan
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Updated Live Preview Section with Services-like styling */}
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
                        Pricing Plans
                      </h2>
                      <p className="text-cyan-200 text-sm opacity-80">
                        Choose the perfect plan for your needs
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {pricingPlans.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {pricingPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="group relative p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5"
                      >
                        {/* Plan Header */}
                        <div className="text-center mb-4">
                          <h3 className="text-xl font-bold text-white mb-2">
                            {plan.name || "Plan Name"}
                          </h3>
                          <div className="flex items-baseline justify-center gap-1 mb-3">
                            <span className="text-3xl font-bold text-cyan-400">
                              {plan.price || "$0"}
                            </span>
                            <span className="text-cyan-200 text-sm">
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
                        </div>

                        {/* Features List */}
                        <div className="space-y-3 mb-6">
                          {plan.features.map((feature) => (
                            <div
                              key={feature.id}
                              className={`flex items-center gap-3 ${
                                feature.included
                                  ? "text-gray-300"
                                  : "text-gray-500 line-through"
                              }`}
                            >
                              {feature.included ? (
                                <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                              ) : (
                                <FiX className="w-4 h-4 text-red-500 flex-shrink-0" />
                              )}
                              <span className="text-sm">
                                {feature.text || "Feature description"}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Get Started Button */}
                        <button className="w-full group relative bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30">
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            Get Started
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4 border-2 border-dashed border-gray-600/50 rounded-xl bg-gray-800/30">
                    <FiEye className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 italic">
                      No pricing plans to display
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
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
