import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation"; // ← ADDED IMPORT
import React from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-gray-200 p-4 md:p-8">
      {/* Contact Section */}
      <section id="contact" className="mt-16">
        <div className="container mx-auto px-4">
          {/* Navigation Component - ADDED */}
          <div className="relative mb-16">
            <Navigation />
          </div>
          <div className="bg-white rounded-xl shadow">
            {/* Contact Content */}
            <div className="p-8">
              {/* Title - Same style as About */}
              <div className="pb-6 mb-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <h2 className="text-3xl font-bold relative pl-6 before:content-[''] before:absolute before:left-0 before:top-1/2 before:transform before:-translate-y-1/2 before:w-1 before:h-8 before:bg-indigo-600">
                    Contact Me
                  </h2>
                  <p className="text-gray-600 max-w-xl text-left">
                    Get in touch with me for any inquiries or projects. I'm
                    always available to discuss new opportunities and
                    collaborations.
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mb-10">
                <div className="flex flex-wrap -mx-3">
                  <div className="w-full md:w-1/3 lg:w-1/3 px-3 mb-6">
                    <div className="flex flex-col lg:flex-row items-center text-center lg:text-left mb-6 transition-all duration-300">
                      <div className="inline-block text-center bg-gray-100 rounded-full p-3 mr-0 lg:mr-6 mb-3 lg:mb-0">
                        <span className="text-indigo-600 inline-block text-xl">
                          <i className="fas fa-map-marker-alt"></i>
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold mb-2">Address</h4>
                        <p className="text-gray-600">
                          Awesome Road, New York, Us
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-1/3 lg:w-1/3 px-3 mb-6">
                    <div className="flex flex-col lg:flex-row items-center text-center lg:text-left mb-6 transition-all duration-300">
                      <div className="inline-block text-center bg-gray-100 rounded-full p-3 mr-0 lg:mr-6 mb-3 lg:mb-0">
                        <span className="text-indigo-600 inline-block text-xl">
                          <i className="fas fa-phone"></i>
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold mb-2">Phone</h4>
                        <p className="mb-0">
                          <Link
                            to="tel:+1234567890"
                            className="text-gray-700 hover:text-indigo-600 transition-colors block"
                          >
                            +123 456 7890
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-1/3 lg:w-1/3 px-3 mb-6">
                    <div className="flex flex-col lg:flex-row items-center text-center lg:text-left mb-6 transition-all duration-300">
                      <div className="inline-block text-center bg-gray-100 rounded-full p-3 mr-0 lg:mr-6 mb-3 lg:mb-0">
                        <span className="text-indigo-600 inline-block text-xl">
                          <i className="fas fa-envelope"></i>
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold mb-2">Email</h4>
                        <p className="mb-0">
                          <Link
                            to="mailto:Hello@persia.com"
                            className="text-gray-700 hover:text-indigo-600 transition-colors block"
                          >
                            Hello@persia.com
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="flex justify-center">
                <div className="w-full lg:w-2/3 xl:w-2/3">
                  <div className="text-center mt-6 lg:mt-10 mb-4 lg:mb-5">
                    <h3 className="mb-8 text-2xl font-bold">
                      Send me a message
                    </h3>
                    <form onSubmit={handleSubmit} id="contact-form">
                      <div className="flex flex-wrap -mx-3">
                        <div className="w-full md:w-1/2 lg:w-1/2 px-3 mb-4">
                          <input
                            className="name w-full border border-gray-300 pl-5 py-4 pr-3 bg-white rounded-lg focus:outline-none focus:border-indigo-600 transition-colors"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your Name"
                            required
                          />
                        </div>
                        <div className="w-full md:w-1/2 lg:w-1/2 px-3 mb-4">
                          <input
                            className="email w-full border border-gray-300 pl-5 py-4 pr-3 bg-white rounded-lg focus:outline-none focus:border-indigo-600 transition-colors"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Your Email"
                            required
                          />
                        </div>
                        <div className="w-full md:w-1/2 lg:w-1/2 px-3 mb-4">
                          <input
                            className="phone w-full border border-gray-300 pl-5 py-4 pr-3 bg-white rounded-lg focus:outline-none focus:border-indigo-600 transition-colors"
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Your Phone"
                            required
                          />
                        </div>
                        <div className="w-full md:w-1/2 lg:w-1/2 px-3 mb-4">
                          <input
                            className="subject w-full border border-gray-300 pl-5 py-4 pr-3 bg-white rounded-lg focus:outline-none focus:border-indigo-600 transition-colors"
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Your Subject"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap -mx-3">
                        <div className="w-full px-3 mb-4">
                          <textarea
                            className="message w-full border border-gray-300 pl-5 py-4 pr-3 bg-white rounded-lg h-32 focus:outline-none focus:border-indigo-600 transition-colors"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Write your message here"
                            required
                          ></textarea>
                        </div>
                      </div>
                      <div className="my-btn">
                        <button
                          className="btn w-full inline-block bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 shadow-md hover:shadow-lg"
                          type="submit"
                        >
                          Send Message
                        </button>
                      </div>
                    </form>
                    <p className="form-message mt-3"></p>
                  </div>
                </div>
              </div>

              {/* Map Section */}
              <div className="mt-10">
                <div className="bg-gray-100 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">Find me here</h3>
                  <div className="map-wrapper rounded-xl h-64 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">
                      Map will be displayed here
                    </span>
                    {/* You can integrate Google Maps or any other map service here */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
