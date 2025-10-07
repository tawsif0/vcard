import React from "react";
import Experience from "./Experience";
import Skills from "./Skills";
import Award from "./Award";
import MoreAbout from "./MoreAbout";
import Reference from "./Reference";
import Navigation from "../../components/Navigation"; // ← ADDED IMPORT

const Resume = () => {
  return (
    <div className="min-h-screen bg-gray-200 p-4 md:p-8">
      <section id="resume" className="mt-16">
        <div className="container mx-auto px-4">
          {/* Navigation Component - ADDED */}
          <div className="relative mb-16">
            <Navigation />
          </div>
          <div className="bg-white rounded-xl shadow">
            <div className="p-8">
              <Experience />
            </div>

            <div className="border-t border-gray-200">
              <div className="p-8">
                <Skills />
              </div>
            </div>

            <div className="border-t border-gray-200">
              <div className="p-8">
                <Award />
              </div>
            </div>

            <div className="border-t border-gray-200">
              <div className="p-8">
                <MoreAbout />
              </div>
            </div>

            <div className="border-t border-gray-200">
              <div className="p-8">
                <Reference />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Resume;
