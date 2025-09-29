import React from "react";

const Contact = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Contact</h1>
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/30 backdrop-blur-md">
        <p className="text-gray-300 text-lg mb-4">
          Hello! I am from Contact component.
        </p>
        <p className="text-gray-400">
          This is the contact page within your premium dashboard. You can add
          contact forms, information, or any other contact-related content here.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-700/30 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-2">Email</h3>
            <p className="text-gray-300">contact@example.com</p>
          </div>

          <div className="bg-gray-700/30 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-2">Phone</h3>
            <p className="text-gray-300">+1 (555) 123-4567</p>
          </div>

          <div className="bg-gray-700/30 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-2">Address</h3>
            <p className="text-gray-300">123 Premium Street, Suite 100</p>
          </div>

          <div className="bg-gray-700/30 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-2">Social</h3>
            <p className="text-gray-300">LinkedIn, Twitter, GitHub</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
