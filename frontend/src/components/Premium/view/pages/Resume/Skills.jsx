import { useEffect } from "react";
import React from "react";
const Skills = () => {
  useEffect(() => {
    const initializeKnobs = () => {
      console.log("Initialize knobs here with a library like jQuery Knob");
    };

    initializeKnobs();
  }, []);

  const skillCategories = [
    {
      title: "AI Tools",
      skills: [
        { name: "ChatGPT", percentage: 80 },
        { name: "Midjourney", percentage: 90 },
        { name: "Jasper", percentage: 60 },
        { name: "Google Gemini", percentage: 70 },
      ],
    },
    {
      title: "Business Skills",
      skills: [
        { name: "Critical Analysis", percentage: 80 },
        { name: "Management", percentage: 70 },
        { name: "Hard Work", percentage: 80 },
        { name: "Public Speaking", percentage: 85 },
      ],
    },
  ];

  const circularSkills = [
    {
      category: "Language Skills",
      skills: [
        { name: "Bangla", percentage: 80 },
        { name: "English", percentage: 90 },
        { name: "Spanish", percentage: 65 },
      ],
    },
    {
      category: "Work Skills",
      skills: [
        { name: "Image", percentage: 70 },
        { name: "Video", percentage: 80 },
        { name: "Content", percentage: 65 },
      ],
    },
  ];

  const ProgressBar = ({ skill }) => (
    <div className="single-skill mb-6">
      <div className="bar-title">
        <h4 className="mb-3 font-medium">{skill.name}</h4>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${skill.percentage}%` }}
        >
          <span className="sr-only">{skill.percentage}%</span>
        </div>
      </div>
      <span className="text-sm text-gray-600 mt-1 block">
        {skill.percentage}%
      </span>
    </div>
  );

  const CircularSkill = ({ skill }) => (
    <div className="single-skill mb-8 text-center">
      <div className="relative inline-block">
        <div className="relative w-40 h-40">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e2e2e2"
              strokeWidth="10"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#83e421"
              strokeWidth="10"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * skill.percentage) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-800">
              {skill.percentage}%
            </span>
          </div>
        </div>
        <h4 className="mt-4 text-center font-medium">{skill.name}</h4>
      </div>
    </div>
  );

  return (
    <div className="skill-content-area">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
        <div className="lg:w-1/2 w-full flex items-center mb-4 lg:mb-0">
          <div className="title">
            <h2 className="relative pl-6 text-2xl font-bold before:absolute before:left-0 before:top-1/2 before:transform before:-translate-y-1/2 before:w-1 before:h-8 before:bg-green-500">
              My Skills
            </h2>
          </div>
        </div>
        <div className="lg:w-1/2 w-full">
          <div className="title-content text-justify lg:text-right">
            <p className="text-gray-600">
              Eva cididunt ut labore et dolor magna antiqua. Ut ad enum ad dolor
              sit amet consectetur adipisicing elit.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column */}
        <div className="lg:w-1/2 w-full">
          {/* AI Tools */}
          <div className="skill-bar-area pb-8">
            <h3 className="mb-6 text-xl font-semibold">AI Tools</h3>
            <div className="progess-wrapper">
              {skillCategories[0].skills.map((skill, index) => (
                <ProgressBar key={index} skill={skill} />
              ))}
            </div>
          </div>

          {/* Language Skills */}
          <div className="skill-round-bar-area">
            <h3 className="mb-6 text-xl font-semibold">Language Skills</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {circularSkills[0].skills.map((skill, index) => (
                <div key={index} className="flex justify-center">
                  <CircularSkill skill={skill} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:w-1/2 w-full">
          {/* Work Skills */}
          <div className="skill-round-bar-area mb-8">
            <h3 className="mb-6 text-xl font-semibold">Work Skills</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {circularSkills[1].skills.map((skill, index) => (
                <div key={index} className="flex justify-center">
                  <CircularSkill skill={skill} />
                </div>
              ))}
            </div>
          </div>

          {/* Business Skills */}
          <div className="skill-bar-area">
            <h3 className="mb-6 text-xl font-semibold">Business Skills</h3>
            <div className="progess-wrapper">
              {skillCategories[1].skills.map((skill, index) => (
                <ProgressBar key={index} skill={skill} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skills;
