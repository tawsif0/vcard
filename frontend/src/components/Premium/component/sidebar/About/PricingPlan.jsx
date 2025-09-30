import React, { useState, useEffect, useRef } from "react";
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

const PricingPlan = ({ user }) => {
  const [pricingPlans, setPricingPlans] = useState([]);
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

  // Fetch pricing data from backend
  useEffect(() => {
    const fetchPricingData = async () => {
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
          const pricingData = data.data.pricing || [];
          setPricingPlans(pricingData);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error(err.message);
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
  }, []); // Remove user dependency

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
    setPricingPlans((prev) => [
      ...prev,
      {
        id: newId,
        name: "",
        price: "",
        period: "month",
        features: [
          { id: 1, text: "", included: true },
          { id: 2, text: "", included: true },
          { id: 3, text: "", included: true },
        ],
      },
    ]);
  };

  const removePlan = (id) => {
    if (pricingPlans.length <= 1) {
      toast.error("At least one pricing plan is required");
      return;
    }
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

  const handleSave = async () => {
    setIsSaving(true);

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

      if (response.ok) {
        toast.success("Pricing plans saved successfully!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save pricing plans");
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
                Edit Pricing Plans
              </h2>
              <button
                onClick={addNewPlan}
                className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Add Plan
              </button>
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
                        onChange={(e) =>
                          handlePlanChange(plan.id, "price", e.target.value)
                        }
                        placeholder="$99"
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
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-1"
                      >
                        <FiPlus className="w-3 h-3" />
                        Add Feature
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
                </div>
              ))}

              {pricingPlans.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
                  <p className="text-gray-400 mb-4">
                    No pricing plans added yet
                  </p>
                  <button
                    onClick={addNewPlan}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition flex items-center gap-2 mx-auto"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Your First Pricing Plan
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
                      Save Pricing Plans
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

            <div className="space-y-6">
              {pricingPlans.length > 0 ? (
                pricingPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
                  >
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-center">
                      <h3 className="text-xl font-bold mb-2">
                        {plan.name || "Plan Name"}
                      </h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-bold">
                          {plan.price || "$0"}
                        </span>
                        <span className="text-indigo-100 text-sm">
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

                    <div className="p-6">
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature) => (
                          <li
                            key={feature.id}
                            className={`flex items-center gap-3 ${
                              feature.included
                                ? "text-gray-700"
                                : "text-gray-400 line-through"
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
                          </li>
                        ))}
                      </ul>

                      <button className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 text-sm">
                        Get Started
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-center">
                    <h3 className="text-xl font-bold mb-2">No Plans Yet</h3>
                  </div>
                  <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiEye className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500">
                      Add pricing plans to see them here
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPlan;
