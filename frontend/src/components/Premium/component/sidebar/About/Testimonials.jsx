import React, { useState, useEffect, useRef } from "react";
import {
  FiEdit,
  FiEye,
  FiSave,
  FiPlus,
  FiTrash2,
  FiStar,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const Testimonials = ({ user }) => {
  const [testimonials, setTestimonials] = useState([]);
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

  // Fetch testimonials data from backend
  useEffect(() => {
    const fetchTestimonialsData = async () => {
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
          const testimonialsData = data.data.testimonials || [];
          setTestimonials(testimonialsData);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error(err.message);
        setTestimonials([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonialsData();

    // Cleanup function to reset fetch flag when component unmounts
    return () => {
      hasFetchedRef.current = false;
    };
  }, []); // Remove user dependency

  const handleTestimonialChange = (id, field, value) => {
    setTestimonials((prev) =>
      prev.map((testimonial) =>
        testimonial.id === id ? { ...testimonial, [field]: value } : testimonial
      )
    );
  };

  const handleRatingChange = (id, rating) => {
    setTestimonials((prev) =>
      prev.map((testimonial) =>
        testimonial.id === id ? { ...testimonial, rating } : testimonial
      )
    );
  };

  const addNewTestimonial = () => {
    const newId =
      testimonials.length > 0
        ? Math.max(...testimonials.map((t) => t.id)) + 1
        : 1;
    setTestimonials((prev) => [
      ...prev,
      {
        id: newId,
        name: "",
        position: "",
        company: "",
        rating: 5,
        text: "",
        avatar: "",
      },
    ]);
  };

  const removeTestimonial = (id) => {
    if (testimonials.length <= 1) {
      toast.error("At least one testimonial is required");
      return;
    }
    setTestimonials((prev) =>
      prev.filter((testimonial) => testimonial.id !== id)
    );
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/about/testimonials",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify(testimonials),
        }
      );

      if (response.ok) {
        toast.success("Testimonials saved successfully!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save testimonials");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FiStar
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center relative z-10">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-400 font-medium">
            Loading testimonials...
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
                Edit Testimonials
              </h2>
              <button
                onClick={addNewTestimonial}
                className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Add Testimonial
              </button>
            </div>

            <div className="space-y-6">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-semibold text-white">
                      Testimonial #{testimonial.id}
                    </h3>
                    <button
                      onClick={() => removeTestimonial(testimonial.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition"
                      title="Remove Testimonial"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Client Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                        value={testimonial.name}
                        onChange={(e) =>
                          handleTestimonialChange(
                            testimonial.id,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Position
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                        value={testimonial.position}
                        onChange={(e) =>
                          handleTestimonialChange(
                            testimonial.id,
                            "position",
                            e.target.value
                          )
                        }
                        placeholder="CEO"
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                        value={testimonial.company}
                        onChange={(e) =>
                          handleTestimonialChange(
                            testimonial.id,
                            "company",
                            e.target.value
                          )
                        }
                        placeholder="Tech Corp"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Avatar URL
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition"
                        value={testimonial.avatar}
                        onChange={(e) =>
                          handleTestimonialChange(
                            testimonial.id,
                            "avatar",
                            e.target.value
                          )
                        }
                        placeholder="images/testimonials/avatar.jpg"
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Rating
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() =>
                              handleRatingChange(testimonial.id, star)
                            }
                            className={`p-1 rounded transition ${
                              star <= testimonial.rating
                                ? "text-yellow-400 hover:text-yellow-300"
                                : "text-gray-400 hover:text-gray-300"
                            }`}
                          >
                            <FiStar
                              className={`w-5 h-5 ${
                                star <= testimonial.rating
                                  ? "fill-yellow-400"
                                  : ""
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-gray-300 ml-2">
                          {testimonial.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Testimonial Text
                    </label>
                    <textarea
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-gray-500 transition resize-none"
                      rows="4"
                      value={testimonial.text}
                      onChange={(e) =>
                        handleTestimonialChange(
                          testimonial.id,
                          "text",
                          e.target.value
                        )
                      }
                      placeholder="What did the client say about your service?"
                    />
                  </div>
                </div>
              ))}

              {testimonials.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
                  <p className="text-gray-400 mb-4">
                    No testimonials added yet
                  </p>
                  <button
                    onClick={addNewTestimonial}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition flex items-center gap-2 mx-auto"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Your First Testimonial
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
                      Save Testimonials
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
                <h2 className="text-2xl font-bold mb-2">Testimonials</h2>
                <p className="text-indigo-100">What our clients say about us</p>
              </div>

              <div className="p-6">
                {testimonials.length > 0 ? (
                  <div className="space-y-6">
                    {testimonials.map((testimonial) => (
                      <div
                        key={testimonial.id}
                        className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          {testimonial.avatar ? (
                            <img
                              src={testimonial.avatar}
                              alt={testimonial.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
                              {testimonial.name
                                ? testimonial.name.charAt(0).toUpperCase()
                                : "U"}
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">
                              {testimonial.name || "Client Name"}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {testimonial.position || "Position"}
                              {testimonial.company && " at "}
                              {testimonial.company}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 mb-3">
                          {renderStars(testimonial.rating)}
                        </div>

                        <p className="text-gray-700 text-sm leading-relaxed italic">
                          "
                          {testimonial.text ||
                            "Testimonial text will appear here..."}
                          "
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiEye className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No testimonials to display</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Add testimonials to see them here
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

export default Testimonials;
