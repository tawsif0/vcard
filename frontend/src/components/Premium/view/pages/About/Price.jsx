import React from "react";
import { Link } from "react-router-dom";

const Price = () => {
  const plans = [
    {
      name: "Hourly",
      price: "$129",
      period: "Per Hour",
      features: [
        { text: "Ancididunt ut labore et dolore", included: true },
        { text: "Magna aliqua. Ut enim ad", included: true },
        { text: "Dinim veniam, quis nostrud", included: true },
        { text: "Exercitation ullamco laboris", included: false },
        { text: "Nisi ut aliquip ex ea commodo", included: false },
      ],
    },
    {
      name: "Project Base",
      price: "$499",
      period: "Per Project",
      features: [
        { text: "Ancididunt ut labore et dolore", included: true },
        { text: "Magna aliqua. Ut enim ad", included: true },
        { text: "Dinim veniam, quis nostrud", included: true },
        { text: "Exercitation ullamco laboris", included: true },
        { text: "Nisi ut aliquip ex ea commodo", included: false },
      ],
    },
    {
      name: "Full Time",
      price: "$2999",
      period: "Per Month",
      features: [
        { text: "Ancididunt ut labore et dolore", included: true },
        { text: "Magna aliqua. Ut enim ad", included: true },
        { text: "Dinim veniam, quis nostrud", included: true },
        { text: "Exercitation ullamco laboris", included: true },
        { text: "Nisi ut aliquip ex ea commodo", included: true },
      ],
    },
  ];

  return (
    <div className="py-8">
      {/* Title Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
        <div className="relative">
          <h2 className="text-3xl font-bold pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-8 before:bg-indigo-600">
            Pricing Plans
          </h2>
        </div>
        <div className="lg:text-right max-w-xl">
          <p className="text-gray-600">
            Eva cididunt ut labore et dolor magna antiqua. Ut ad enum ad dolor
            sit amet consectetur adipisicing elit.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border"
          >
            <div className="border-b pb-6 mb-6">
              <h4 className="text-xl font-bold mb-4">{plan.name}</h4>
              <h5 className="text-indigo-600 font-semibold">
                <span className="text-2xl">{plan.price}</span> / {plan.period}
              </h5>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <span
                    className={`inline-block mr-3 mt-1 ${
                      feature.included ? "text-green-500" : "text-gray-300"
                    }`}
                  >
                    {feature.included ? "✓" : "✗"}
                  </span>
                  <span
                    className={
                      feature.included ? "text-gray-700" : "text-gray-400"
                    }
                  >
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              to="#contact"
              className="w-full inline-block text-center bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300"
            >
              Sign Up
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Price;
