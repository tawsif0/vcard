// src/pages/Service.jsx
import React from "react";

const services = [
  {
    title: "AI Research",
    icon: "images/about/service-icon1.png",
    desc: "Collit anim id est laborum. Sed ut per spiciatis und dunt ut labore eto dolore magna aliqu ation ullamcko laboris nisi ut aliquip.",
  },
  {
    title: "AI Bot Development",
    icon: "images/about/service-icon2.png",
    desc: "Collit anim id est laborum. Sed ut per spiciatis und dunt ut labore eto dolore magna aliqu ation ullamcko laboris nisi ut aliquip.",
  },
  {
    title: "Image Generation",
    icon: "images/about/service-icon3.png",
    desc: "Collit anim id est laborum. Sed ut per spiciatis und dunt ut labore eto dolore magna aliqu ation ullamcko laboris nisi ut aliquip.",
  },
  {
    title: "Video Generation",
    icon: "images/about/service-icon4.png",
    desc: "Collit anim id est laborum. Sed ut per spiciatis und dunt ut labore eto dolore magna aliqu ation ullamcko laboris nisi ut aliquip.",
  },
  {
    title: "Content Creation",
    icon: "images/about/service-icon5.png",
    desc: "Collit anim id est laborum. Sed ut per spiciatis und dunt ut labore eto dolore magna aliqu ation ullamcko laboris nisi ut aliquip.",
  },
  {
    title: "Web Development",
    icon: "images/about/service-icon6.png",
    desc: "Collit anim id est laborum. Sed ut per spiciatis und dunt ut labore eto dolore magna aliqu ation ullamcko laboris nisi ut aliquip.",
  },
];

const Service = () => {
  return (
    <section id="services" className="pb-8">
      <div className="container mx-auto px-4">
        {/* Title row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="relative">
            <h2 className="text-3xl font-bold pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-8 before:bg-indigo-600">
              Service
            </h2>
          </div>
          <div className="md:text-right max-w-xl">
            <p className="text-gray-600">
              Eva cididunt ut labore et dolor magna antiqua. Ut ad enum ad dolor
              sit amet consectetur adipisicing elit.
            </p>
          </div>
        </div>

        {/* Service cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl px-8 py-12 shadow-sm hover:shadow-lg transition"
            >
              <div className="mb-8">
                <img
                  src={service.icon}
                  alt={service.title}
                  className="w-14 h-14 relative z-10"
                />
              </div>
              <h4 className="text-xl font-semibold mb-4">{service.title}</h4>
              <p className="text-gray-600">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Service;
