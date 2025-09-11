/* eslint-disable no-unused-vars */
import React, { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { FiDownload, FiShare2, FiCopy, FiCheck, FiUser } from "react-icons/fi";
import { motion } from "framer-motion";

const QRGenerator = ({ value, profile }) => {
  const [showAvatar, setShowAvatar] = useState(true);
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef(null); // 🔒 scope queries to this component

  if (!value) return null;

  const handleDownload = () => {
    const canvas = wrapRef.current?.querySelector("canvas"); // ✅ gets THIS QR's canvas only
    if (canvas) {
      // toBlob is preferred; falls back to toDataURL if needed
      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${profile?.fullName || "profile"}_qrcode.png`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        });
      } else {
        const pngUrl = canvas
          .toDataURL("image/png")
          .replace("image/png", "image/octet-stream");
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `${profile?.fullName || "profile"}_qrcode.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-w-full text-center" ref={wrapRef}>
      <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-gray-700/30 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <FiShare2 className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">
            Your Digital Business Card
          </h3>
          <p className="text-gray-400">
            Scan to view {profile?.fullName || "your"} profile
          </p>
        </div>

        {/* QR Code */}
        <div className="relative inline-block mb-6">
          <div className="relative bg-gray-800 p-4 rounded-xl border border-gray-700/30">
            <QRCodeCanvas
              value={value}
              size={180}
              level="H"
              includeMargin
              fgColor="#ffffff"
              bgColor="transparent"
              imageSettings={
                showAvatar && profile?.avatar
                  ? {
                      src: profile.avatar,
                      height: 30,
                      width: 30,
                      excavate: true,
                      crossOrigin: "anonymous",
                    }
                  : undefined
              }
            />
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-purple-500" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-purple-500" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-purple-500" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-purple-500" />
          </div>
        </div>

        {/* Avatar Toggle */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-gray-300 text-sm">Show Avatar</span>

          <div className="relative inline-block w-12 h-6">
            <input
              type="checkbox"
              checked={showAvatar}
              onChange={() => setShowAvatar(!showAvatar)}
              className="sr-only peer"
              id="avatar-toggle"
            />
            {/* Track */}
            <label
              htmlFor="avatar-toggle"
              className={`block w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${
                showAvatar ? "bg-purple-600" : "bg-gray-700"
              }`}
            >
              {/* Thumb with spring animation */}
              <motion.div
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                animate={{
                  x: showAvatar ? 29 : 4, // slide left ↔ right
                  transition: {
                    type: "spring",
                    stiffness: 700,
                    damping: 30,
                  },
                }}
              />
            </label>
          </div>
        </div>

        {/* Profile Preview */}
        {profile?.fullName && (
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700/30">
            <div className="flex items-center justify-center gap-3">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.fullName}
                  crossOrigin="anonymous" // 👈 helps the browser request it with CORS too
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full flex items-center justify-center border-2 border-gray-600">
                  <FiUser className="w-5 h-5 text-gray-300" />
                </div>
              )}
              <div className="text-left">
                <p className="font-medium text-white">{profile.fullName}</p>
                <p className="text-sm text-gray-400">
                  {profile.jobTitle || profile.position || "Professional"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700/30 rounded-xl text-white hover:bg-gray-700/50 hover:border-gray-600/50 transition-all duration-300 group"
          >
            <FiDownload className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-sm">Download</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700/30 rounded-xl text-white hover:bg-gray-700/50 hover:border-gray-600/50 transition-all duration-300 group"
          >
            {copied ? (
              <FiCheck className="w-4 h-4 text-green-400" />
            ) : (
              <FiCopy className="w-4 h-4 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-sm">{copied ? "Copied!" : "Copy Link"}</span>
          </button>
        </div>

        <p className="text-sm text-gray-500">
          Share this QR code to connect professionally
        </p>
      </div>
    </div>
  );
};

export default QRGenerator;
