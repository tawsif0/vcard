// Brand.jsx
import React from "react";

const Brand = () => {
  const brands = [
    { id: 1, src: "images/about/brand-img1.png", alt: "brand image 1" },
    { id: 2, src: "images/about/brand-img2.png", alt: "brand image 2" },
    { id: 3, src: "images/about/brand-img3.png", alt: "brand image 3" },
    { id: 4, src: "images/about/brand-img4.png", alt: "brand image 4" },
    { id: 5, src: "images/about/brand-img5.png", alt: "brand image 5" },
    { id: 6, src: "images/about/brand-img6.png", alt: "brand image 6" },
    { id: 7, src: "images/about/brand-img7.png", alt: "brand image 7" },
    { id: 8, src: "images/about/brand-img8.png", alt: "brand image 8" },
    { id: 9, src: "images/about/brand-img9.png", alt: "brand image 9" },
    { id: 10, src: "images/about/brand-img10.png", alt: "brand image 10" },
  ];

  return (
    <div className="py-8">
      {/* Title Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
        <div className="relative">
          <h2 className="text-3xl font-bold pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-8 before:bg-indigo-600">
            Brands & Clients
          </h2>
        </div>
        <div className="lg:text-right max-w-xl">
          <p className="text-gray-600">
            Eva cididunt ut labore et dolor magna antiqua. Ut ad enum ad dolor
            sit amet consectetur adipisicing elit.
          </p>
        </div>
      </div>

      {/* Brands Grid */}
      <div className="flex flex-wrap justify-center gap-8">
        {brands.map((brand) => (
          <div key={brand.id} className="flex justify-center items-center p-4">
            <img
              src={brand.src}
              alt={brand.alt}
              className="max-w-[120px] max-h-[60px] object-contain grayscale hover:grayscale-0 transition-all duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Brand;
