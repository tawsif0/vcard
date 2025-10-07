import React, { useRef, useEffect, useState } from "react";
import QRCodeStyling from "qr-code-styling";

const ProfileShare = () => {
  const qrRef = useRef(null);
  const [qrCodeInstance, setQrCodeInstance] = useState(null);

  // Profile Data
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    title: "Software Developer",
    bio: "Passionate about building amazing web experiences with React and Tailwind CSS",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    website: "https://johndoe.dev",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  });

  // QR Code Settings
  const [qrSettings, setQrSettings] = useState({
    dotColor: "#06b6d4", // cyan-500
    bgColor: "transparent",
    pattern: "square",
  });

  // Share URL
  const profileUrl = `https://example.com/profile/${profileData.name
    .toLowerCase()
    .replace(/\s+/g, "-")}`;

  // Initialize QR Code
  useEffect(() => {
    const qr = new QRCodeStyling({
      width: 200,
      height: 200,
      data: profileUrl,
      dotsOptions: {
        color: qrSettings.dotColor,
        type: qrSettings.pattern,
      },
      backgroundOptions: {
        color: qrSettings.bgColor,
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 5,
        imageSize: 0.3,
      },
    });

    if (qrRef.current) {
      qrRef.current.innerHTML = "";
      qr.append(qrRef.current);
    }

    setQrCodeInstance(qr);

    return () => {
      if (qrRef.current) qrRef.current.innerHTML = "";
    };
  }, []);

  // Update QR Code when settings change
  useEffect(() => {
    if (!qrCodeInstance) return;

    qrCodeInstance.update({
      data: profileUrl,
      dotsOptions: {
        color: qrSettings.dotColor,
        type: qrSettings.pattern,
      },
      backgroundOptions: {
        color: qrSettings.bgColor,
      },
    });
  }, [qrSettings, profileUrl, qrCodeInstance]);

  // Copy profile link to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      alert("Profile link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  // Share on social media
  const shareOnSocial = (platform) => {
    const text = `Check out ${profileData.name}'s profile`;
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(profileUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        profileUrl
      )}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        profileUrl
      )}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(
        text + " " + profileUrl
      )}`,
    };

    window.open(urls[platform], "_blank", "width=600,height=400");
  };

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8 relative overflow-visible min-h-screen">
      <div className="mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Share Your Profile
          </h1>
          <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto">
            Generate a QR code and share your professional profile across
            platforms
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Profile Info */}
          <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-700/30">
            <div className="text-center mb-8">
              <img
                src={profileData.avatar}
                alt={profileData.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-cyan-500/30"
              />
              <h2 className="text-2xl font-bold text-white mb-2">
                {profileData.name}
              </h2>
              <p className="text-lg text-cyan-400 font-semibold mb-3">
                {profileData.title}
              </p>
              <p className="text-gray-300 mb-6">{profileData.bio}</p>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <span className="text-cyan-400">📧</span>
                <span className="text-gray-300">{profileData.email}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <span className="text-emerald-400">📱</span>
                <span className="text-gray-300">{profileData.phone}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <span className="text-purple-400">🌐</span>
                <a
                  href={profileData.website}
                  className="text-gray-300 hover:text-cyan-400 transition-colors"
                >
                  {profileData.website}
                </a>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                Share Profile
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => shareOnSocial("twitter")}
                  className="flex items-center justify-center gap-2 p-3 bg-blue-500/90 text-white rounded-xl hover:bg-blue-600 transition-all border border-blue-500/30 hover:border-blue-400/50"
                >
                  <span>🐦</span> Twitter
                </button>
                <button
                  onClick={() => shareOnSocial("linkedin")}
                  className="flex items-center justify-center gap-2 p-3 bg-blue-700/90 text-white rounded-xl hover:bg-blue-800 transition-all border border-blue-600/30 hover:border-blue-500/50"
                >
                  <span>💼</span> LinkedIn
                </button>
                <button
                  onClick={() => shareOnSocial("facebook")}
                  className="flex items-center justify-center gap-2 p-3 bg-blue-600/90 text-white rounded-xl hover:bg-blue-700 transition-all border border-blue-500/30 hover:border-blue-400/50"
                >
                  <span>👥</span> Facebook
                </button>
                <button
                  onClick={() => shareOnSocial("whatsapp")}
                  className="flex items-center justify-center gap-2 p-3 bg-green-500/90 text-white rounded-xl hover:bg-green-600 transition-all border border-green-500/30 hover:border-green-400/50"
                >
                  <span>💬</span> WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - QR Code & Sharing */}
          <div className="space-y-8">
            {/* QR Code Card */}
            <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-700/30 text-center">
              <h3 className="text-2xl font-bold text-white mb-6">
                Scan QR Code
              </h3>

              <div className="flex justify-center mb-6">
                <div
                  ref={qrRef}
                  className="rounded-2xl bg-gray-800/50 p-4 border-2 border-gray-600/30"
                />
              </div>

              {/* QR Customization */}
              <div className="space-y-4 mb-6">
                <div className="flex gap-4 justify-center">
                  <label className="flex flex-col items-center gap-2">
                    <span className="text-sm font-medium text-gray-300">
                      Dot Color
                    </span>
                    <input
                      type="color"
                      value={qrSettings.dotColor}
                      onChange={(e) =>
                        setQrSettings((prev) => ({
                          ...prev,
                          dotColor: e.target.value,
                        }))
                      }
                      className="w-10 h-10 rounded-lg border-2 border-gray-600 cursor-pointer bg-gray-700"
                    />
                  </label>
                  <label className="flex flex-col items-center gap-2">
                    <span className="text-sm font-medium text-gray-300">
                      Background
                    </span>
                    <input
                      type="color"
                      value={qrSettings.bgColor}
                      onChange={(e) =>
                        setQrSettings((prev) => ({
                          ...prev,
                          bgColor: e.target.value,
                        }))
                      }
                      className="w-10 h-10 rounded-lg border-2 border-gray-600 cursor-pointer bg-gray-700"
                    />
                  </label>
                </div>

                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pattern Style
                  </label>
                  <select
                    value={qrSettings.pattern}
                    onChange={(e) =>
                      setQrSettings((prev) => ({
                        ...prev,
                        pattern: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-600 bg-gray-800 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  >
                    <option value="square">Square</option>
                    <option value="dots">Dots</option>
                    <option value="rounded">Rounded</option>
                    <option value="classy">Classy</option>
                    <option value="classy-rounded">Classy Rounded</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() =>
                  qrCodeInstance?.download({
                    extension: "png",
                    name: `${profileData.name}-profile`,
                  })
                }
                className="w-full group relative bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-0.5 overflow-hidden border border-cyan-500/30"
              >
                <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <span className="relative">Download QR Code</span>
              </button>
            </div>

            {/* Link Sharing Card */}
            <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-700/30">
              <h3 className="text-2xl font-bold text-white mb-4 text-center">
                Share Profile Link
              </h3>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={profileUrl}
                  readOnly
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-600 bg-gray-800 text-gray-300 font-mono text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all font-semibold whitespace-nowrap border border-emerald-500/30 hover:border-emerald-400/50"
                >
                  Copy
                </button>
              </div>

              <p className="text-sm text-gray-400 text-center">
                Share this link directly or let people scan your QR code to view
                your profile
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileShare;
