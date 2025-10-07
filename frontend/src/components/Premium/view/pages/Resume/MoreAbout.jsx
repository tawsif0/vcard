import React from "react";

const MoreAbout = () => {
  return (
    <div className="more-about-area">
      <div className="flex flex-col lg:flex-row justify-between items-center mb-12">
        <div className="lg:w-6/12 w-full flex items-center mb-4 lg:mb-0">
          <div className="title">
            <h2 className="relative pl-6 text-2xl font-bold before:absolute before:left-0 before:top-1/2 before:transform before:-translate-y-1/2 before:w-1 before:h-8 before:bg-blue-500">
              More About Me
            </h2>
          </div>
        </div>
        <div className="lg:w-6/12 w-full">
          <div className="title-content text-justify lg:text-right">
            <p className="text-gray-600">
              Eva cididunt ut labore et dolor magna antiqua.Ut ad enum ad dolor
              sit amet consectetur adipisicing elit.
            </p>
          </div>
        </div>
      </div>

      <div className="more-about-wrapper">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Knowledge Section */}
          <div className="lg:w-4/12 w-full">
            <h3 className="mb-6 text-xl font-semibold">Knowledge</h3>
            <ul className="single-more-about">
              {[
                "Domain Registration",
                "Search Engine Optimization",
                "Keyword Research",
                "Email Collection",
                "Lead Generation",
                "Article Writing",
                "Data Entry",
                "Architectural Drawing",
              ].map((item, index) => (
                <li key={index} className="mb-4 font-medium text-gray-800">
                  <span className="text-blue-500 pr-2">
                    <i className="far fa-check"></i>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Tools & Software Section */}
          <div className="lg:w-4/12 w-full">
            <h3 className="mb-6 text-xl font-semibold">Tools & Software</h3>
            <ul className="single-more-about">
              {[
                "ChatGPT",
                "Midjourney",
                "Jasper",
                "Google Gemini",
                "Microsoft Office",
                "Google Business Suites",
                "AWS Clouds",
                "Slack",
              ].map((item, index) => (
                <li key={index} className="mb-4 font-medium text-gray-800">
                  <span className="text-blue-500 pr-2">
                    <i className="far fa-long-arrow-right"></i>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Hobby & Interests Section */}
          <div className="lg:w-4/12 w-full">
            <h3 className="mb-6 text-xl font-semibold">Hobby & Interests</h3>
            <ul className="single-more-about">
              {[
                "Musics",
                "Travelling",
                "Watching Movies",
                "Reading Books",
                "Skill Development",
                "Scuba Diving",
                "Trekking & Hiking",
                "Teaching",
              ].map((item, index) => (
                <li key={index} className="mb-4 font-medium text-gray-800">
                  <span className="text-blue-500 pr-2">
                    <i className="fas fa-heart"></i>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreAbout;
