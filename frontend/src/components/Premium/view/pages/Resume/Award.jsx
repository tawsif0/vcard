import React from "react";
import { Link } from "react-router-dom";

const Award = () => {
  const awards = [
    {
      id: 1,
      logo: "images/resume/awards-logo1.png",
      awardName: "Best Developer Award",
      year: "2022",
      organization: "Developer Association",
      location: "New York, USA",
      description:
        "Hoinim veniam, quis nostrud exerciation ullam co labo sorini hoeye conse",
    },
    {
      id: 2,
      logo: "images/resume/awards-logo2.png",
      awardName: "Business Man of The Year",
      year: "2021",
      organization: "Business Networking Hub",
      location: "London, England",
      description:
        "Decidid unt ut labore et dolore magna aliqu nim veniam quis",
    },
    {
      id: 3,
      logo: "images/resume/awards-logo3.png",
      awardName: "Gold Program Architect",
      year: "2020",
      organization: "Software Architech LTD",
      location: "Berlin, Germany",
      description: "Eerciation ullam co labo sorini hoey urui sob ksiue conse",
    },
    {
      id: 4,
      logo: "images/resume/awards-logo4.png",
      awardName: "World Class Programmer",
      year: "2019",
      organization: "International Code Camp",
      location: "Dublin, Ireland",
      description:
        "Shes kore niam, quis nostrud exerciation ullam co labo sorini",
    },
  ];

  return (
    <div className="awards-area">
      <div className="flex flex-col lg:flex-row justify-between mb-12">
        <div className="lg:w-6/12 w-full flex items-center mb-4 lg:mb-0">
          <div className="title">
            <h2 className="relative pl-6 text-2xl font-bold before:absolute before:left-0 before:top-1/2 before:transform before:-translate-y-1/2 before:w-1 before:h-8 before:bg-blue-500">
              Awards & Achievements
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

      <div className="award-wrapper">
        {awards.map((award, index) => (
          <div
            key={award.id}
            className={`flex flex-col lg:flex-row items-start pt-8 pb-8 ${
              index < awards.length - 1 ? "border-b border-gray-200" : ""
            }`}
          >
            {/* Award Logo */}
            <div className="lg:w-2/12 w-full pr-2 mb-5 lg:mb-0">
              <div className="award-logo mt-1 mb-5">
                <Link to="#" className="block">
                  <img
                    src={award.logo}
                    alt={`award logo ${award.id}`}
                    className="max-w-full h-auto"
                  />
                </Link>
              </div>
            </div>

            {/* Award Name and Year */}
            <div className="lg:w-3/12 w-full pr-0 mb-4 lg:mb-0">
              <div className="award-content">
                <h4 className="mb-2 font-semibold">{award.awardName}</h4>
                <span className="text-gray-600">{award.year}</span>
              </div>
            </div>

            {/* Organization and Location */}
            <div className="lg:w-3/12 w-full pr-0 mb-4 lg:mb-0">
              <div className="award-content">
                <h4 className="mb-2 font-semibold">{award.organization}</h4>
                <span className="text-gray-600">{award.location}</span>
              </div>
            </div>

            {/* Description */}
            <div className="lg:w-4/12 w-full">
              <div className="award-content">
                <p className="text-gray-600">{award.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Award;
