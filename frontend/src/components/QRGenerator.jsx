import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { FiDownload, FiShare2, FiCopy, FiCheck } from "react-icons/fi";

const QRGenerator = ({ value, profile }) => {
  const [showAvatar, setShowAvatar] = useState(true); // Default avatar visibility is true

  if (!value) return null;

  return (
    <div className="min-w-full text-center">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="p-6">
          {/* Header */}
          <div className="mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FiShare2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">
              Your Digital Business Card
            </h3>
            <p className="text-slate-600">
              Scan to view {profile?.fullName || "your"} profile
            </p>
          </div>

          {/* QR Code with decorative elements */}
          <div className="relative inline-block mb-4">
            <div className="relative bg-white p-4 rounded-xl border border-slate-100">
              <QRCodeCanvas
                value={value}
                size={180}
                level="H"
                includeMargin={true}
                fgColor="#4F46E5"
                bgColor="#ffffff"
                imageSettings={
                  showAvatar && profile?.avatar
                    ? {
                        src: profile.avatar,
                        height: 30,
                        width: 30,
                        excavate: true,
                      }
                    : undefined
                }
              />
            </div>
          </div>

          {/* Avatar Toggle */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <label className="text-slate-600 text-sm">Show Avatar</label>
            <input
              type="checkbox"
              checked={showAvatar}
              onChange={() => setShowAvatar(!showAvatar)}
              className="toggle-input"
            />
          </div>

          {/* Profile Preview (if available) */}
          {profile?.fullName && (
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-center gap-3">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {profile.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="text-left">
                  <p className="font-medium text-slate-800">
                    {profile.fullName}
                  </p>
                  <p className="text-sm text-slate-600">
                    {profile.jobTitle || "Professional"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Share Hint */}
          <p className="text-sm text-slate-500 mt-4">
            Share this QR code to connect professionally
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
