import React from "react";
import { Link } from "react-router-dom";
import Service from "./Service";
import Testimonial from "./Testimonial";
import Price from "./Price";
import Brand from "./Brand";
import Navigation from "../../components/Navigation"; // ← ADDED IMPORT

const About = () => {
  return (
    <div className="min-h-screen bg-gray-200 p-4 md:p-8">
      {/* About Section */}
      <section id="about" className="mt-16">
        <div className="container mx-auto px-4">
          {/* Navigation Component - ADDED */}
          <div className="relative mb-16">
            <Navigation />
          </div>
          <div className="bg-white rounded-xl shadow">
            {/* About Content */}
            <div className="p-8">
              {/* Title - Removed border-bottom */}
              <div className="pb-6 mb-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <h2 className="text-3xl font-bold relative pl-6 before:content-[''] before:absolute before:left-0 before:top-1/2 before:transform before:-translate-y-1/2 before:w-1 before:h-8 before:bg-indigo-600">
                    About Me
                  </h2>
                  <p className="text-gray-600 max-w-xl text-left">
                    Eva cididunt ut labor et dolor magna antiqua. Ut ad enum ad
                    dolor sit amat consenter adipisicing eliot antiqua.
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Image */}
                <div className="flex justify-center">
                  <img
                    src="images/about/personal-img.jpg"
                    alt="About"
                    className="rounded-xl shadow-lg w-80 h-96 object-cover"
                  />
                </div>

                {/* About Details & Text */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit,
                      sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua veniam, quis nostrud exercitation ullamco laboris
                      nisi ut aliquip.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Duis aute irure dolor in reprehenderit in voluptate velit
                      esse cillum dolore eu fugiat nulla pariatur. Excepteur
                      sint occaecat cupidatat non proident, sunt in culpa qui
                      officia deserunt mollit anim id est laborum. Sed ut
                      perspiciatis unde omnis iste natus error sit voluptatem
                      accusantium.
                    </p>
                  </div>

                  {/* Info Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    {/* Left Info Column */}
                    <div className="space-y-4">
                      <div className="flex justify-between border-b pb-3">
                        <span className="font-semibold text-gray-800">
                          Name
                        </span>
                        <span className="text-gray-600">James Anderson</span>
                      </div>
                      <div className="flex justify-between border-b pb-3">
                        <span className="font-semibold text-gray-800">
                          Email
                        </span>
                        <span className="text-gray-600">
                          hellojames@gmail.com
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-3">
                        <span className="font-semibold text-gray-800">
                          Phone
                        </span>
                        <span className="text-gray-600">+123 456 7890</span>
                      </div>
                      <div className="flex justify-between border-b pb-3">
                        <span className="font-semibold text-gray-800">
                          Address
                        </span>
                        <span className="text-gray-600">
                          20, Bordeshi, Amin Bazar
                        </span>
                      </div>
                    </div>

                    {/* Right Info Column */}
                    <div className="space-y-4">
                      <div className="flex justify-between border-b pb-3">
                        <span className="font-semibold text-gray-800">
                          Education
                        </span>
                        <span className="text-gray-600">B.Sc in Physics</span>
                      </div>
                      <div className="flex justify-between border-b pb-3">
                        <span className="font-semibold text-gray-800">
                          Languages
                        </span>
                        <span className="text-gray-600">English, Bangla</span>
                      </div>
                      <div className="flex justify-between border-b pb-3">
                        <span className="font-semibold text-gray-800">
                          Nationality
                        </span>
                        <span className="text-gray-600">Bangladeshi</span>
                      </div>
                      <div className="flex justify-between border-b pb-3">
                        <span className="font-semibold text-gray-800">
                          Freelance
                        </span>
                        <span className="text-green-600 font-medium">
                          Available
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Button */}
                  <div className="mt-8">
                    <Link
                      to="/contact"
                      className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 shadow-md hover:shadow-lg"
                    >
                      Contact Me
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Components with consistent spacing and separators */}
            <div className="border-t border-gray-200">
              <div className="p-8">
                <Service />
              </div>
            </div>

            <div className="border-t border-gray-200">
              <div className="p-8">
                <Testimonial />
              </div>
            </div>

            <div className="border-t border-gray-200">
              <div className="p-8">
                <Price />
              </div>
            </div>

            <div className="border-t border-gray-200">
              <div className="p-8">
                <Brand />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
