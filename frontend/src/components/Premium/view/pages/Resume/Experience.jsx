import React from "react";

const Experience = () => {
  const workExperience = [
    {
      id: 1,
      title: "Senior AI Researcher",
      company: "eThemeStudio",
      period: "Jan, 2020 - Running",
      logo: "images/resume/google.png",
      alt: "google",
      description:
        "Hoinim veniam, quis nostrud exercitation ullamco labo sorini hoeye conse kobita ei nishachor amay unoe quat.",
    },
    {
      id: 2,
      title: "AI Bot Developer",
      company: "Creative Designer",
      period: "Jan, 2020 - Feb, 2021",
      logo: "images/resume/linkedin.png",
      alt: "linkedin",
      description:
        "Hoinim veniam, quis nostrud exercitation ullamco labo sorini hoeye conse kobita ei nishachor amay unoe quat.",
    },
    {
      id: 3,
      title: "Image generator",
      company: "Easy Computers",
      period: "Jan, 2010 - March, 2015",
      logo: "images/resume/envato.png",
      alt: "envato",
      description:
        "Hoinim veniam, quis nostrud exercitation ullamco labo sorini hoeye conse kobita ei nishachor amay unoe quat.",
    },
  ];

  const education = [
    {
      id: 1,
      degree: "Masters in Artificial Intelligence",
      institution: "Dhaka University",
      period: "Jan, 2020 - May, 2021",
      logo: "images/resume/education-logo1.png",
      alt: "education logo 1",
      description:
        "Hoinim veniam, quis nostrud exercitation ullamco labo sorini hoeye conse kobita ei nishachor amay unoe quat.",
    },
    {
      id: 2,
      degree: "Master in Computer Science",
      institution: "New York University",
      period: "Jul, 2010 - Dec, 2012",
      logo: "images/resume/education-logo2.png",
      alt: "education logo2",
      description:
        "Hoinim veniam, quis nostrud exercitation ullamco labo sorini hoeye conse kobita ei nishachor amay unoe quat.",
    },
    {
      id: 3,
      degree: "Bachelor in Computer Engineering",
      institution: "Bangla College",
      period: "Oct, 2005 - Nov, 2010",
      logo: "images/resume/education-logo3.png",
      alt: "education logo3",
      description:
        "Hoinim veniam, quis nostrud exercitation ullamco labo sorini hoeye conse kobita ei nishachor amay unoe quat.",
    },
  ];

  const ExperienceItem = ({ item, isLast }) => (
    <li className={`relative pl-8 ${isLast ? "" : "mb-8"}`}>
      <div className="flex flex-col md:flex-row justify-between items-start mb-4">
        <div className="experience-info mb-4 md:mb-0">
          <h4 className="mb-2 text-lg font-semibold">
            {item.title || item.degree}
          </h4>
          <span className="text-gray-600">
            <span className="text-blue-500 pr-1 inline-block">
              {item.company || item.institution}
            </span>{" "}
            ({item.period})
          </span>
        </div>
        <img
          src={item.logo}
          alt={item.alt}
          className="inline-block w-12 h-12"
        />
      </div>
      <p className="text-gray-600">{item.description}</p>
    </li>
  );

  const EducationItem = ({ item, isLast }) => (
    <li className={`relative pl-8 ${isLast ? "" : "mb-8"}`}>
      <div className="flex flex-col md:flex-row justify-between items-start mb-4">
        <div className="experience-info mb-4 md:mb-0">
          <h4 className="mb-2 text-lg font-semibold">{item.degree}</h4>
          <span className="text-blue-500">
            <span className="inline-block pr-1">{item.institution}</span> (
            {item.period})
          </span>
        </div>
        <img
          src={item.logo}
          alt={item.alt}
          className="inline-block w-12 h-12"
        />
      </div>
      <p className="text-gray-600">{item.description}</p>
    </li>
  );

  return (
    <div className="experience-education-content-area">
      <div className="flex flex-col lg:flex-row justify-between items-start mb-12">
        <div className="lg:w-6/12 w-full flex items-center mb-4 lg:mb-0">
          <div className="title">
            <h2 className="relative pl-6 text-2xl font-bold before:absolute before:left-0 before:top-1/2 before:transform before:-translate-y-1/2 before:w-1 before:h-8 before:bg-blue-500">
              Resume
            </h2>
          </div>
        </div>
        <div className="lg:w-6/12 w-full">
          <div className="title-content text-justify lg:text-right">
            <p className="text-gray-600">
              Eva cididunt ut labor et dolor magna antiqua.Ut ad enum ad dolor
              sit education amat consenter adipisicing eliot antiqua.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Work Experience Section */}
        <div className="lg:w-6/12 w-full">
          <div className="experience-wrapper">
            <h3 className="mb-8 text-xl font-semibold">Work Experience</h3>
            <ul>
              {workExperience.map((item, index) => (
                <ExperienceItem
                  key={item.id}
                  item={item}
                  isLast={index === workExperience.length - 1}
                />
              ))}
            </ul>
          </div>
        </div>

        {/* Education Section */}
        <div className="lg:w-6/12 w-full">
          <div className="education-wrapper">
            <h3 className="mb-8 text-xl font-semibold">Education</h3>
            <ul>
              {education.map((item, index) => (
                <EducationItem
                  key={item.id}
                  item={item}
                  isLast={index === education.length - 1}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Experience;
