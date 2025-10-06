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

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-300 font-medium">
            Loading about page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <section
        className="relative py-16 text-white overflow-hidden"
        style={{
          background: `radial-gradient(circle at center, #0f4c5c, #042a38 80%)`,
        }}
      >
        {/* Noise Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-noise-pattern"></div>

        {/* Background Decorative Glow */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Background animated blobs */}
          <div className="w-96 h-96 bg-cyan-500 rounded-full blur-3xl absolute -top-24 -left-24 animate-pulse-slow"></div>
          <div className="w-96 h-96 bg-teal-600 rounded-full blur-3xl absolute bottom-16 right-16 animate-pulse-slow delay-500"></div>

          {/* Animated Gradient Name */}
          <h1 className="text-7xl sm:text-8xl font-extrabold mb-4 bg-gradient-to-r from-white via-cyan-300 to-teal-300 bg-clip-text text-transparent animate-text-shine leading-snug relative z-10">
            {aboutData.personal.name || "Your Name"}
          </h1>
        </div>

        <style jsx>{`
          @keyframes text-shine {
            0%,
            100% {
              background-position: 200% center;
            }
            50% {
              background-position: -200% center;
            }
          }
          .animate-text-shine {
            background-size: 200% auto;
            animation: text-shine 4s linear infinite;
          }
          @keyframes pulse-slow {
            0%,
            100% {
              opacity: 0.4;
            }
            50% {
              opacity: 0.8;
            }
          }
          .animate-pulse-slow {
            animation: pulse-slow 8s ease-in-out infinite;
          }
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 0.9;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 2s ease forwards;
          }
          /* Noise pattern for subtle texture */
          .bg-noise-pattern {
            background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSJ3aGl0ZSIgLz48Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0iI2IwYjBiMCIgLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjMyIiByPSIyIiBmaWxsPSIjYzRjNGM0IiAvPjwvc3ZnPg==");
            opacity: 0.15;
            pointer-events: none;
          }
        `}</style>
      </section>

      {/* About Me Section - ROW WISE Personal Information */}
      <section id="about" className="py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              About Me
            </h2>

            {/* Personal Information Card - ROW WISE LAYOUT */}
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-700/30 mx-auto">
              <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-3">
                <FiUser className="w-6 h-6 text-cyan-400" />
                Personal Information
              </h3>
              <div className="flex flex-col gap-4">
                {aboutData.personal.name && (
                  <div className="w-full group flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-cyan-500/20">
                    <div className="bg-gradient-to-br from-cyan-600 to-teal-600 p-3 rounded-xl">
                      <FiUser className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-cyan-300 font-medium mb-1">
                        Full Name
                      </p>
                      <p className="text-white font-semibold">
                        {aboutData.personal.name}
                      </p>
                    </div>
                  </div>
                )}

                {aboutData.personal.email && (
                  <div className="w-full group flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/20">
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-3 rounded-xl">
                      <FiMail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-300 font-medium mb-1">
                        Email
                      </p>
                      <p className="text-white break-all">
                        {aboutData.personal.email}
                      </p>
                    </div>
                  </div>
                )}

                {aboutData.personal.phone && (
                  <div className="w-full group flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-500/20">
                    <div className="bg-gradient-to-br from-emerald-600 to-green-600 p-3 rounded-xl">
                      <FiPhone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-emerald-300 font-medium mb-1">
                        Phone
                      </p>
                      <p className="text-white font-semibold">
                        {aboutData.personal.phone}
                      </p>
                    </div>
                  </div>
                )}

                {aboutData.personal.address && (
                  <div className="w-full group flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-orange-500/20">
                    <div className="bg-gradient-to-br from-orange-600 to-red-600 p-3 rounded-xl">
                      <FiMapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-orange-300 font-medium mb-1">
                        Location
                      </p>
                      <p className="text-white">{aboutData.personal.address}</p>
                    </div>
                  </div>
                )}

                {aboutData.personal.education && (
                  <div className="w-full group flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-pink-500/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-pink-500/20">
                    <div className="bg-gradient-to-br from-pink-600 to-rose-600 p-3 rounded-xl">
                      <FiBook className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-pink-300 font-medium mb-1">
                        Education
                      </p>
                      <p className="text-white">
                        {aboutData.personal.education}
                      </p>
                    </div>
                  </div>
                )}

                {aboutData.personal.languages && (
                  <div className="w-full group flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-teal-500/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-teal-500/20">
                    <div className="bg-gradient-to-br from-teal-600 to-cyan-600 p-3 rounded-xl">
                      <FiMessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-teal-300 font-medium mb-1">
                        Languages
                      </p>
                      <p className="text-white">
                        {aboutData.personal.languages}
                      </p>
                    </div>
                  </div>
                )}

                {aboutData.personal.nationality && (
                  <div className="w-full group flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-amber-500/20">
                    <div className="bg-gradient-to-br from-amber-600 to-yellow-600 p-3 rounded-xl">
                      <FiFlag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-amber-300 font-medium mb-1">
                        Nationality
                      </p>
                      <p className="text-white">
                        {aboutData.personal.nationality}
                      </p>
                    </div>
                  </div>
                )}

                {aboutData.personal.freelance && (
                  <div className="w-full group flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-green-500/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-500/20">
                    <div
                      className={`p-3 rounded-xl ${
                        aboutData.personal.freelance === "Available"
                          ? "bg-gradient-to-br from-green-600 to-emerald-600"
                          : "bg-gradient-to-br from-red-600 to-rose-600"
                      }`}
                    >
                      <FiAward className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300 font-medium mb-1">
                        Availability
                      </p>
                      <p
                        className={`font-semibold ${
                          aboutData.personal.freelance === "Available"
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {aboutData.personal.freelance}
                        {aboutData.personal.freelance === "Available" && (
                          <span className="ml-3 text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
                            Open for projects
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Description Section - Show at the top */}
                {aboutData.personal.description && (
                  <div
                    className="w-full group bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/30 
                p-8 mx-auto mb-8 transition-all duration-300 
                hover:-translate-y-2 hover:shadow-xl hover:shadow-cyan-500/20"
                  >
                    <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-3">
                      <FiGlobe className="w-6 h-6 text-cyan-400" />
                      More About Me
                    </h3>
                    <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-600/30">
                      <div
                        className="text-gray-300 leading-relaxed text-base space-y-4 preview-content"
                        dangerouslySetInnerHTML={{
                          __html: aboutData.personal.description,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - CENTERED CARD ARRANGEMENT */}
      {aboutData.services.length > 0 && (
        <section id="services" className="py-16 bg-gray-800/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Our Services
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Professional services to grow your business
              </p>
            </div>

            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl mx-auto justify-items-center">
                {aboutData.services.map((service) => (
                  <div
                    key={service.id}
                    className="w-full max-w-xs bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-700/30 hover:border-cyan-500/30 group hover:-translate-y-3 hover:shadow-cyan-500/20"
                  >
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden shadow-lg">
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
                              e.target.style.display = "none";
                              const fallback = e.target.nextSibling;
                              if (fallback && fallback.style) {
                                fallback.style.display = "flex";
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-cyan-600 to-teal-600 rounded flex items-center justify-center text-white text-sm font-bold">
                            Icon
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3 text-center">
                      {service.title || "Service Title"}
                    </h3>
                    <div className="text-gray-300 leading-relaxed text-center preview-content">
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
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pricing Section - CENTERED CARD ARRANGEMENT */}
      {aboutData.pricing.length > 0 && (
        <section id="pricing" className="py-16 bg-gray-900/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Pricing Plans
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Choose the perfect plan for your needs
              </p>
            </div>

            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl mx-auto justify-items-center">
                {aboutData.pricing.map((plan) => (
                  <div
                    key={plan.id}
                    className="w-full max-w-xs bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-gray-700/30 hover:shadow-2xl transition-all duration-300 group hover:-translate-y-3 hover:shadow-cyan-500/20"
                  >
                    <div className="bg-gradient-to-r from-cyan-600 to-teal-600 p-6 text-white text-center">
                      <h3 className="text-xl font-bold mb-2">
                        {plan.name || "Plan Name"}
                      </h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-bold">
                          {plan.price || "$0"}
                        </span>
                        <span className="text-cyan-100 text-sm">
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
                          </li>
                        ))}
                      </ul>

                      <button className="w-full group relative bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 border border-cyan-500/30">
                        <span className="relative z-10">Get Started</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section - CENTERED CARD ARRANGEMENT */}
      {aboutData.testimonials.length > 0 && (
        <section id="testimonials" className="py-16 bg-gray-800/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Client Testimonials
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                What our clients say about us
              </p>
            </div>

            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl mx-auto justify-items-center">
                {aboutData.testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="w-full max-w-xs bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-700/30 hover:border-cyan-500/30 group hover:-translate-y-3 hover:shadow-cyan-500/20"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
                          {testimonial.avatar ? (
                            <img
                              src={
                                testimonial.avatar.startsWith("/uploads")
                                  ? `http://localhost:5000${testimonial.avatar}`
                                  : testimonial.avatar
                              }
                              alt={testimonial.name}
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                const fallback = e.target.nextSibling;
                                if (fallback && fallback.style) {
                                  fallback.style.display = "flex";
                                }
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {testimonial.name
                                ? testimonial.name.charAt(0).toUpperCase()
                                : "?"}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">
                          {testimonial.name || "Client Name"}
                        </h3>
                        <p className="text-cyan-200 text-sm">
                          {testimonial.position || "Position"}
                          {testimonial.company && " at "}
                          {testimonial.company}
                        </p>
                      </div>
                    </div>

                    <div className="text-gray-300 text-sm leading-relaxed italic preview-content">
                      {testimonial.text ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: testimonial.text,
                          }}
                          className="preview-html-content"
                        />
                      ) : (
                        "Testimonial text will appear here..."
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Brands & Clients Section - CENTERED CARD ARRANGEMENT */}
      {aboutData.brands.length > 0 && (
        <section id="brands" className="py-16 bg-gray-900/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Brands & Clients
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Trusted by amazing companies
              </p>
            </div>

            <div className="flex justify-center">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full max-w-7xl mx-auto justify-items-center">
                {aboutData.brands.map((brand) => (
                  <div
                    key={brand.id}
                    className="w-32 h-32 group relative bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg overflow-hidden"
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
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform duration-300">
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
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 border-t border-gray-700/30">
        <div className="container mx-auto px-4 text-center">
          <p>
            &copy; 2024 {aboutData.personal.name || "Your Name"}. All rights
            reserved.
          </p>
        </div>
      </footer>

      {/* Add custom styles for the preview content */}
      <style jsx>{`
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
        .preview-content strong {
          font-weight: bold;
        }
        .preview-content em {
          font-style: italic;
        }
        .preview-content u {
          text-decoration: underline;
        }
        .preview-content a {
          color: #60a5fa;
          text-decoration: underline;
        }
        .preview-content a:hover {
          color: #93c5fd;
        }

        /* Additional styles for better HTML content display */
        .preview-html-content h1,
        .preview-html-content h2,
        .preview-html-content h3,
        .preview-html-content h4,
        .preview-html-content h5,
        .preview-html-content h6 {
          color: white;
          margin: 1rem 0 0.5rem 0;
          font-weight: bold;
        }

        .preview-html-content h1 {
          font-size: 1.5rem;
        }
        .preview-html-content h2 {
          font-size: 1.3rem;
        }
        .preview-html-content h3 {
          font-size: 1.1rem;
        }

        .preview-html-content blockquote {
          border-left: 3px solid #60a5fa;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #cbd5e1;
        }

        .preview-html-content code {
          background: #374151;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
          color: #fbbf24;
        }

        .preview-html-content pre {
          background: #1f2937;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .preview-html-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }

        .preview-html-content th,
        .preview-html-content td {
          border: 1px solid #4b5563;
          padding: 0.5rem;
          text-align: left;
        }

        .preview-html-content th {
          background: #374151;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
