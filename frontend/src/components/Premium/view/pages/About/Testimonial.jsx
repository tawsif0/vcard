import { useState } from "react";
import React from "react";

const testimonials = [
  {
    text: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
    name: "James Parker",
    role: "Web Developer",
    avatar: "/images/about/author.jpg",
  },
  {
    text: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium. Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.",
    name: "Sarah Johnson",
    role: "UI/UX Designer",
    avatar: "/images/about/author.jpg",
  },
  {
    text: "Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis iste natus error sit voluptatem accusantium doloremque laudantium.",
    name: "Michael Smith",
    role: "Project Manager",
    avatar: "/images/about/author.jpg",
  },
];

const Testimonial = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const prevSlide = () =>
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  const nextSlide = () =>
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));

  return (
    <section id="testimonials" className="pb-8">
      <div className="container mx-auto px-4">
        {/* Title row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="relative">
            <h2 className="text-3xl font-bold pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-8 before:bg-indigo-600">
              Testimonials
            </h2>
          </div>
          <div className="md:text-right max-w-xl">
            <p className="text-gray-600">
              What people say about me. Eva cididunt ut labore et dolor magna
              antiqua. Ut ad enum ad dolor sit amet consectetur adipisicing
              elit.
            </p>
          </div>
        </div>

        {/* Testimonial card */}
        <div className="relative max-w-3xl mx-auto bg-gray-50 rounded-xl shadow-sm p-8">
          <p className="italic text-gray-700 mb-6">
            {testimonials[activeIndex].text}
          </p>
          <div className="flex items-center gap-4">
            <img
              src={testimonials[activeIndex].avatar}
              alt={testimonials[activeIndex].name}
              className="w-14 h-14 rounded-full"
            />
            <div>
              <h6 className="font-semibold text-gray-900">
                {testimonials[activeIndex].name}
              </h6>
              <p className="text-sm text-gray-500">
                {testimonials[activeIndex].role}
              </p>
            </div>
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-3 h-3 rounded-full ${
                  idx === activeIndex ? "bg-indigo-600" : "bg-gray-300"
                }`}
              ></button>
            ))}
          </div>

          {/* Prev/Next buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between">
            <button
              onClick={prevSlide}
              className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full shadow"
            >
              ◀
            </button>
            <button
              onClick={nextSlide}
              className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full shadow"
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
