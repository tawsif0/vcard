import React from "react";
import { Link } from "react-router-dom";

const Reference = () => {
  const references = [
    {
      id: 1,
      name: "Sarah Jeferssion",
      company: "eThemeStudio",
      image: "images/resume/client-img1.jpg",
      socialLinks: [
        { icon: "fab fa-facebook-f", href: "#" },
        { icon: "fab fa-linkedin-in", href: "#" },
        { icon: "fab fa-instagram", href: "#" },
      ],
    },
    {
      id: 2,
      name: "Peter Parker",
      company: "Computers",
      image: "images/resume/client-img2.jpg",
      socialLinks: [
        { icon: "fab fa-facebook-f", href: "#" },
        { icon: "fab fa-linkedin-in", href: "#" },
        { icon: "fab fa-instagram", href: "#" },
      ],
    },
    {
      id: 3,
      name: "Tom Moody",
      company: "YourHive",
      image: "images/resume/client-img3.jpg",
      socialLinks: [
        { icon: "fab fa-facebook-f", href: "#" },
        { icon: "fab fa-linkedin-in", href: "#" },
        { icon: "fab fa-instagram", href: "#" },
      ],
    },
    {
      id: 4,
      name: "Anatolia Eva",
      company: "Dhaka University",
      image: "images/resume/client-img4.jpg",
      socialLinks: [
        { icon: "fab fa-facebook-f", href: "#" },
        { icon: "fab fa-linkedin-in", href: "#" },
        { icon: "fab fa-instagram", href: "#" },
      ],
    },
  ];

  return (
    <div className="references-area">
      <div className="flex flex-col lg:flex-row justify-between items-center mb-12">
        <div className="lg:w-6/12 w-full flex items-center mb-4 lg:mb-0">
          <div className="title">
            <h2 className="relative pl-6 text-2xl font-bold before:absolute before:left-0 before:top-1/2 before:transform before:-translate-y-1/2 before:w-1 before:h-8 before:bg-blue-500">
              References & Recognition
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

      <div className="references-wrapper">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {references.map((reference) => (
            <div key={reference.id} className="single-reference group">
              <div className="reference-img overflow-hidden rounded-xl transition-all duration-500 relative">
                <img
                  className="w-full z-10 group-hover:scale-110 transition-transform duration-500"
                  src={reference.image}
                  alt={reference.name}
                />
                <ul className="social-link text-center absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {reference.socialLinks.map((social, index) => (
                    <li key={index} className="inline-block">
                      <Link
                        className="text-center px-3 py-2 inline-block bg-white text-gray-700 rounded-full mx-1 transition-all duration-300 hover:bg-blue-500 hover:text-white"
                        to={social.href}
                      >
                        <i className={social.icon}></i>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="reference-content text-center mt-5">
                <h4 className="font-semibold text-lg mb-1">{reference.name}</h4>
                <span className="text-gray-600">{reference.company}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reference;
