/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBook,
  FiMessageSquare,
  FiFlag,
  FiAward,
  FiStar,
  FiCheck,
  FiX,
  FiGlobe,
  FiArrowRight,
} from "react-icons/fi";

const AboutPage = () => {
  const [aboutData, setAboutData] = useState({
    personal: {},
    services: [],
    pricing: [],
    testimonials: [],
    brands: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Fetch all about data from backend
  useEffect(() => {
    const fetchAboutData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:5000/api/about", {
          headers: {
            "x-auth-token": token,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAboutData({
              personal: data.data.personal || data.data || {},
              services: data.data.services || [],
              pricing: data.data.pricing || [],
              testimonials: data.data.testimonials || [],
              brands: data.data.brands || [],
            });
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  const handleTestimonialChange = (index) => {
    setActiveTestimonial(index);
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-cyan-200 font-medium text-lg">
            Loading your stunning portfolio...
          </p>
        </div>
      </div>
    );
  }

  const hasContent =
    Object.keys(aboutData.personal).length > 0 ||
    aboutData.services.length > 0 ||
    aboutData.pricing.length > 0 ||
    aboutData.testimonials.length > 0 ||
    aboutData.brands.length > 0;

  if (!hasContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiUser className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            No Content Available
          </h2>
          <p className="text-gray-300 text-lg">
            Add some content to your portfolio to make it shine!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 left-1/3 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 pt-20 pb-16">
        {/* Hero Section with Name */}
        {aboutData.personal.name && (
          <div className="text-center mb-16 px-4">
            <div className="inline-block">
              <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-violet-400 bg-clip-text text-transparent mb-4 animate-pulse">
                {aboutData.personal.name}
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto rounded-full"></div>
            </div>
          </div>
        )}

        {/* About Me Section */}
        {Object.keys(aboutData.personal).length > 0 && (
          <section className="max-w-7xl mx-auto px-4 mb-20">
            <div className="glass-card rounded-3xl p-8 md:p-12 backdrop-blur-xl border border-white/10 shadow-2xl">
              <div className="flex items-center mb-12">
                <div className="w-2 h-12 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full mr-4"></div>
                <h2 className="text-4xl font-bold text-white">About Me</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Personal Info - Glass Cards */}
                <div className="space-y-4">
                  {aboutData.personal.name && (
                    <div className="glass-card rounded-2xl p-6 border border-white/5 hover:border-cyan-500/30 transition-all duration-300 hover:scale-105">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-cyan-400 rounded-xl flex items-center justify-center">
                          <FiUser className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-cyan-300 text-sm font-semibold">
                            Name
                          </p>
                          <p className="text-white font-bold text-lg">
                            {aboutData.personal.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {aboutData.personal.email && (
                    <div className="glass-card rounded-2xl p-6 border border-white/5 hover:border-purple-500/30 transition-all duration-300 hover:scale-105">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-400 rounded-xl flex items-center justify-center">
                          <FiMail className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-purple-300 text-sm font-semibold">
                            Email
                          </p>
                          <p className="text-white font-medium break-all">
                            {aboutData.personal.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {aboutData.personal.phone && (
                    <div className="glass-card rounded-2xl p-6 border border-white/5 hover:border-green-500/30 transition-all duration-300 hover:scale-105">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-400 rounded-xl flex items-center justify-center">
                          <FiPhone className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-green-300 text-sm font-semibold">
                            Phone
                          </p>
                          <p className="text-white font-medium">
                            {aboutData.personal.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {aboutData.personal.freelance && (
                    <div className="glass-card rounded-2xl p-6 border border-white/5 hover:border-yellow-500/30 transition-all duration-300 hover:scale-105">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            aboutData.personal.freelance === "Available"
                              ? "bg-gradient-to-br from-green-600 to-green-400"
                              : "bg-gradient-to-br from-red-600 to-red-400"
                          }`}
                        >
                          <FiAward className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-gray-300 text-sm font-semibold">
                            Freelance
                          </p>
                          <p
                            className={`font-bold text-lg ${
                              aboutData.personal.freelance === "Available"
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {aboutData.personal.freelance}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                  {aboutData.personal.address && (
                    <div className="glass-card rounded-2xl p-6 border border-white/5 hover:border-orange-500/30 transition-all duration-300 hover:scale-105">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-400 rounded-xl flex items-center justify-center">
                          <FiMapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-orange-300 text-sm font-semibold">
                            Address
                          </p>
                          <p className="text-white">
                            {aboutData.personal.address}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {aboutData.personal.education && (
                    <div className="glass-card rounded-2xl p-6 border border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:scale-105">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center">
                          <FiBook className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-blue-300 text-sm font-semibold">
                            Education
                          </p>
                          <p className="text-white">
                            {aboutData.personal.education}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {aboutData.personal.languages && (
                    <div className="glass-card rounded-2xl p-6 border border-white/5 hover:border-pink-500/30 transition-all duration-300 hover:scale-105">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-pink-400 rounded-xl flex items-center justify-center">
                          <FiMessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-pink-300 text-sm font-semibold">
                            Languages
                          </p>
                          <p className="text-white">
                            {aboutData.personal.languages}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {aboutData.personal.nationality && (
                    <div className="glass-card rounded-2xl p-6 border border-white/5 hover:border-red-500/30 transition-all duration-300 hover:scale-105">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-400 rounded-xl flex items-center justify-center">
                          <FiFlag className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-red-300 text-sm font-semibold">
                            Nationality
                          </p>
                          <p className="text-white">
                            {aboutData.personal.nationality}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="glass-card rounded-2xl p-8 border border-white/5 lg:col-span-1">
                  <div className="flex items-center mb-6">
                    <div className="w-2 h-8 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full mr-3"></div>
                    <h3 className="text-xl font-bold text-white">Bio</h3>
                  </div>
                  {aboutData.personal.description ? (
                    <div
                      className="text-gray-300 leading-relaxed space-y-4 text-lg"
                      dangerouslySetInnerHTML={{
                        __html: aboutData.personal.description,
                      }}
                    />
                  ) : (
                    <p className="text-gray-400 italic">
                      No bio available yet. Add your description to showcase
                      your story!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Services Section */}
        {aboutData.services.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 mb-20">
            <div className="glass-card rounded-3xl p-8 md:p-12 backdrop-blur-xl border border-white/10 shadow-2xl">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
                  Services
                </h2>
                <p className="text-gray-300 text-xl max-w-2xl mx-auto">
                  Cutting-edge solutions to elevate your digital presence
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {aboutData.services.map((service, index) => (
                  <div key={service.id} className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-75 transition duration-300"></div>
                    <div className="relative glass-card rounded-2xl p-8 border border-white/10 backdrop-blur-xl hover:border-cyan-500/50 transition-all duration-500 group-hover:scale-105 h-full">
                      <div className="mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          {service.image ? (
                            <img
                              src={
                                service.image.startsWith("/uploads")
                                  ? `http://localhost:5000${service.image}`
                                  : service.image
                              }
                              alt={service.title}
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <FiStar className="w-8 h-8 text-white" />
                          )}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors">
                        {service.title || "Professional Service"}
                      </h3>
                      <div className="text-gray-300 leading-relaxed">
                        {service.desc ? (
                          <div
                            dangerouslySetInnerHTML={{ __html: service.desc }}
                          />
                        ) : (
                          "Premium service tailored to your needs with exceptional quality and attention to detail."
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials Section */}
        {aboutData.testimonials.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 mb-20">
            <div className="glass-card rounded-3xl p-8 md:p-12 backdrop-blur-xl border border-white/10 shadow-2xl">
              <div className="text-center mb-12">
                <h2 className="text-5xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                  Testimonials
                </h2>
                <p className="text-gray-300 text-xl">
                  What clients say about my work
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="relative">
                  {aboutData.testimonials.map((testimonial, index) => (
                    <div
                      key={testimonial.id}
                      className={`transition-all duration-500 ${
                        index === activeTestimonial
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 absolute translate-y-8"
                      }`}
                    >
                      <div className="text-center">
                        <div className="mb-8">
                          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 p-1">
                            <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                              {testimonial.avatar ? (
                                <img
                                  src={
                                    testimonial.avatar.startsWith("/uploads")
                                      ? `http://localhost:5000${testimonial.avatar}`
                                      : testimonial.avatar
                                  }
                                  alt={testimonial.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-2xl font-bold text-white">
                                  {testimonial.name
                                    ? testimonial.name.charAt(0).toUpperCase()
                                    : "?"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <blockquote className="text-2xl md:text-3xl font-light text-white leading-relaxed mb-8 italic">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: testimonial.text,
                            }}
                          />
                        </blockquote>

                        <div>
                          <h4 className="text-xl font-bold text-white mb-2">
                            {testimonial.name || "Happy Client"}
                          </h4>
                          <p className="text-cyan-300">
                            {testimonial.position || "Position"}
                            {testimonial.company &&
                              ` at ${testimonial.company}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation Dots */}
                <div className="flex justify-center space-x-3 mt-12">
                  {aboutData.testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === activeTestimonial
                          ? "bg-gradient-to-r from-cyan-500 to-purple-500 w-8"
                          : "bg-gray-600 hover:bg-gray-500"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Pricing Section */}
        {aboutData.pricing.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 mb-20">
            <div className="glass-card rounded-3xl p-8 md:p-12 backdrop-blur-xl border border-white/10 shadow-2xl">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
                  Pricing Plans
                </h2>
                <p className="text-gray-300 text-xl">
                  Choose the perfect plan for your project
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {aboutData.pricing.map((plan, index) => (
                  <div
                    key={plan.id}
                    className={`group relative ${
                      index === 1 ? "lg:scale-110 z-10" : ""
                    }`}
                  >
                    <div className="glass-card rounded-2xl p-8 border border-white/10 backdrop-blur-xl hover:border-cyan-500/50 transition-all duration-500 group-hover:scale-105 h-full flex flex-col">
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-white mb-4">
                          {plan.name || "Premium Plan"}
                        </h3>
                        <div className="flex items-baseline justify-center mb-2">
                          <span className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                            {plan.price || "$99"}
                          </span>
                          <span className="text-gray-400 ml-2">
                            /
                            {plan.period === "month"
                              ? "mo"
                              : plan.period === "year"
                              ? "yr"
                              : plan.period === "hour"
                              ? "hr"
                              : plan.period === "one-time"
                              ? "one-time"
                              : "project"}
                          </span>
                        </div>
                      </div>

                      <ul className="space-y-4 mb-8 flex-grow">
                        {plan.features.map((feature) => (
                          <li key={feature.id} className="flex items-center">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                                feature.included
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {feature.included ? (
                                <FiCheck className="w-4 h-4" />
                              ) : (
                                <FiX className="w-4 h-4" />
                              )}
                            </div>
                            <span
                              className={`${
                                feature.included
                                  ? "text-gray-300"
                                  : "text-gray-500 line-through"
                              }`}
                            >
                              {feature.text || "Feature description"}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-4 rounded-xl font-bold hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105">
                        Get Started
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Brands Section */}
        {aboutData.brands.length > 0 && (
          <section className="max-w-7xl mx-auto px-4">
            <div className="glass-card rounded-3xl p-8 md:p-12 backdrop-blur-xl border border-white/10 shadow-2xl">
              <div className="text-center mb-12">
                <h2 className="text-5xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                  Brands & Clients
                </h2>
                <p className="text-gray-300 text-xl">
                  Trusted by amazing companies worldwide
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                {aboutData.brands.map((brand) => (
                  <div key={brand.id} className="group relative">
                    <div className="glass-card rounded-2xl p-6 border border-white/10 backdrop-blur-xl hover:border-cyan-500/30 transition-all duration-500 group-hover:scale-110 h-32 flex items-center justify-center">
                      {brand.src ? (
                        <img
                          src={
                            brand.src.startsWith("/uploads")
                              ? `http://localhost:5000${brand.src}`
                              : brand.src
                          }
                          alt={brand.alt}
                          className="max-w-full max-h-16 object-contain filter brightness-0 invert opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <span className="text-white font-bold text-sm">
                              Logo
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm">
                            {brand.alt || "Brand"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AboutPage;
