import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiMail, FiUser, FiPhone, FiMessageSquare, FiSend, FiMapPin } from "react-icons/fi";
import { toast } from "react-hot-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aboutData, setAboutData] = useState({
    phone: "",
    address: ""
  });

  // Fetch user data and about data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        // Set user data from localStorage
        if (userData) {
          setUser(JSON.parse(userData));
        } else if (token) {
          setUser({
            name: "User Name",
            email: "user@example.com"
          });
        } else {
          setUser({
            name: "Guest User",
            email: "guest@example.com"
          });
        }

        // Fetch about data from API if token exists
        if (token) {
          const response = await fetch("http://localhost:5000/api/about", {
            headers: {
              "x-auth-token": token,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              const personalData = data.data.personal || data.data || {};
              setAboutData({
                phone: personalData.phone || "",
                address: personalData.address || ""
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setUser({
          name: "User Name",
          email: "user@example.com"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Failed to send message");
      }

      toast.success(data.msg || "Message sent successfully!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#020617] py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen py-4 px-2 sm:px-4 lg:px-8 relative overflow-visible">
      <div className="w-full mx-auto relative z-10">
       <div className="text-center mb-5 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">
            Contact
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start w-full">
          {/* Left Column - Contact Form */}
          <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-6 lg:col-span-2 border border-gray-700/30">
            {/* User Info Header */}
            <div className="flex items-center justify-between mb-8 p-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl border border-purple-500/20">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-[700] text-white truncate">
                      {user?.name || "User Name"}
                    </p>
                    <p className="text-xs text-gray-400 font-[600] truncate mt-0.5">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                </motion.div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Contact</p>
                <p className="text-white font-semibold">Information</p>
              </div>
            </div>

            {/* Send Message Header */}
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-3 flex items-center justify-center gap-2">
                <FiMail className="w-8 h-8 text-purple-400" />
                Send me a message
              </h2>
              <p className="text-gray-400 text-lg">
                Get in touch and let me know how I can help
              </p>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                    <FiUser className="w-4 h-4" />
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-purple-500 transition placeholder-gray-500"
                    required
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                    <FiMail className="w-4 h-4" />
                    Your Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-purple-500 transition placeholder-gray-500"
                    required
                  />
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                    <FiPhone className="w-4 h-4" />
                    Your Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-purple-500 transition placeholder-gray-500"
                  />
                </div>

                {/* Subject Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                    <FiMessageSquare className="w-4 h-4" />
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Enter message subject"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-purple-500 transition placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Message Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                  <FiMessageSquare className="w-4 h-4" />
                  Write a message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Type your message here..."
                  rows="6"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-purple-500 transition placeholder-gray-500 resize-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <span className="relative flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <FiSend className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>

          {/* Right Column - Contact Info Only */}
          <div className="bg-transparent rounded-2xl p-6 border border-purple-500/30 self-start overflow-y-auto backdrop-blur-lg space-y-8">
            {/* Contact Information */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FiMail className="w-4 h-4" />
                Contact Information
              </h3>
              
              <div className="space-y-4">
                {/* Email - Always shown */}
                <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <FiMail className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white font-medium">{user?.email || "contact@example.com"}</p>
                  </div>
                </div>

                {/* Phone - Only shown if exists */}
                {aboutData.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      <FiPhone className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Phone</p>
                      <p className="text-white font-medium">{aboutData.phone}</p>
                    </div>
                  </div>
                )}

                {/* Address - Only shown if exists */}
                {aboutData.address && (
                  <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                      <FiMapPin className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Address</p>
                      <p className="text-white font-medium">{aboutData.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Response Time Info */}
            <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl p-6 border border-purple-500/20">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <FiSend className="w-4 h-4" />
                Quick Response
              </h4>
              <p className="text-gray-400 text-sm">
                I typically respond to messages within 24 hours. For urgent matters, 
                please use the contact methods provided above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;