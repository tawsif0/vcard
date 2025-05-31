import React, { useState, useEffect } from "react";
import QRGenerator from "./QRGenerator";
import "./ProfileCard.css";

const ProfileCard = ({ user }) => {
  const [profile, setProfile] = useState({
    fullName: "",
    jobTitle: "",
    department: "",
    company: "",
    phone: "",
    email: "",
    website: "",
    linkedin: "",
    facebook: "",
    bio: "",
    avatar: ""
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");

  // Fetch profile data from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/profile/${user.id}`,
          {
            headers: {
              "x-auth-token": token
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.msg || "Failed to fetch profile");
        }
      } catch (err) {
        setMessage(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/profile/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token
          },
          body: JSON.stringify(profile)
        }
      );

      if (response.ok) {
        setMessage("Profile saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to save profile");
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const qrValue = `${window.location.origin}/profile/${user.id}`;

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-card-editor">
      <div className="editor-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "edit" ? "active" : ""}`}
            onClick={() => setActiveTab("edit")}
          >
            <i className="bi bi-pencil-square"></i> Edit Card
          </button>
          <button
            className={`tab ${activeTab === "preview" ? "active" : ""}`}
            onClick={() => setActiveTab("preview")}
          >
            <i className="bi bi-eye"></i> Preview
          </button>
          <button
            className={`tab ${activeTab === "share" ? "active" : ""}`}
            onClick={() => setActiveTab("share")}
          >
            <i className="bi bi-share"></i> Share
          </button>
        </div>

        {message && (
          <div
            className={`message ${
              message.includes("successfully") ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}

        {activeTab === "edit" && (
          <div className="edit-section">
            <div className="form-grid">
              <div className="form-column">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    className="form-control"
                    value={profile.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Job Title</label>
                  <input
                    type="text"
                    name="jobTitle"
                    className="form-control"
                    value={profile.jobTitle}
                    onChange={handleChange}
                    placeholder="Jr. Frontend Developer"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    name="department"
                    className="form-control"
                    value={profile.department}
                    onChange={handleChange}
                    placeholder="Website Development"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input
                    type="text"
                    name="company"
                    className="form-control"
                    value={profile.company}
                    onChange={handleChange}
                    placeholder="Arbeit Technology"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    value={profile.phone}
                    onChange={handleChange}
                    placeholder="0164696231"
                  />
                </div>
              </div>

              <div className="form-column">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={profile.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input
                    type="text"
                    name="website"
                    className="form-control"
                    value={profile.website}
                    onChange={handleChange}
                    placeholder="yourwebsite.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">LinkedIn</label>
                  <input
                    type="text"
                    name="linkedin"
                    className="form-control"
                    value={profile.linkedin}
                    onChange={handleChange}
                    placeholder="linkedin.com/in/username"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Facebook</label>
                  <input
                    type="text"
                    name="facebook"
                    className="form-control"
                    value={profile.facebook}
                    onChange={handleChange}
                    placeholder="facebook.com/username"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea
                    name="bio"
                    className="form-control"
                    value={profile.bio}
                    onChange={handleChange}
                    placeholder="Something about yourself..."
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Avatar URL</label>
                  <input
                    type="text"
                    name="avatar"
                    className="form-control"
                    value={profile.avatar}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button
                onClick={handleSave}
                className="save-btn"
                disabled={isSaving}
              >
                <i className="bi bi-save"></i>
                {isSaving ? (
                  <>
                    <span className="spinner"></span> Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </button>

              <button
                onClick={() => setActiveTab("preview")}
                className="preview-btn"
              >
                <i className="bi bi-eye"></i> Preview Card
              </button>
            </div>
          </div>
        )}

        {activeTab === "preview" && (
          <div className="preview-section">
            <div className="card-preview">
              <div className="card-header">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Profile" className="avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    <i className="bi bi-person-circle"></i>
                  </div>
                )}
                <div>
                  <h2 className="full-name">
                    {profile.fullName || "Your Name"}
                  </h2>
                  <p className="job-title">{profile.jobTitle || "Job Title"}</p>
                </div>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <i className="bi bi-building"></i>
                  <div>
                    <p className="label">Department</p>
                    <p className="value">
                      {profile.department || "Department"}
                    </p>
                  </div>
                </div>

                <div className="info-row">
                  <i className="bi bi-briefcase"></i>
                  <div>
                    <p className="label">Company</p>
                    <p className="value">{profile.company || "Company"}</p>
                  </div>
                </div>

                {profile.bio && (
                  <div className="bio-section">
                    <p className="bio">{profile.bio}</p>
                  </div>
                )}

                <div className="contact-section">
                  <div className="contact-row">
                    <i className="bi bi-telephone"></i>
                    <span>{profile.phone || "Phone"}</span>
                  </div>
                  <div className="contact-row">
                    <i className="bi bi-envelope"></i>
                    <span>{profile.email || "Email"}</span>
                  </div>
                  <div className="contact-row">
                    <i className="bi bi-globe"></i>
                    <span>{profile.website || "Website"}</span>
                  </div>
                  <div className="contact-row">
                    <i className="bi bi-linkedin"></i>
                    <span>{profile.linkedin || "LinkedIn"}</span>
                  </div>
                  <div className="contact-row">
                    <i className="bi bi-facebook"></i>
                    <span>{profile.facebook || "Facebook"}</span>
                  </div>
                </div>

                <div className="social-links">
                  {profile.linkedin && (
                    <a
                      href={`https://${profile.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link linkedin"
                    >
                      <i className="bi bi-linkedin"></i>
                    </a>
                  )}
                  {profile.facebook && (
                    <a
                      href={`https://${profile.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link facebook"
                    >
                      <i className="bi bi-facebook"></i>
                    </a>
                  )}
                  {profile.website && (
                    <a
                      href={`https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link facebook"
                    >
                      <i className="bi bi-globe"></i>
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="preview-actions">
              <button className="edit-btn" onClick={() => setActiveTab("edit")}>
                <i className="bi bi-pencil"></i> Edit Card
              </button>
              <button
                className="share-btn"
                onClick={() => setActiveTab("share")}
              >
                <i className="bi bi-qr-code"></i> Share Profile
              </button>
            </div>
          </div>
        )}

        {activeTab === "share" && (
          <div className="share-section">
            <div className="qr-container">
              <QRGenerator value={qrValue} profile={profile} />

              <div className="share-options">
                <h3>Share Your Profile</h3>
                <p>Scan the QR code or share via:</p>

                <div className="share-buttons">
                  <button
                    className="share-option"
                    onClick={() => {
                      navigator.clipboard.writeText(qrValue);
                      setMessage("Link copied to clipboard!");
                      setTimeout(() => setMessage(""), 2000);
                    }}
                  >
                    <i className="bi bi-link-45deg"></i> Copy Link
                  </button>
                  <button
                    className="share-option"
                    onClick={() =>
                      (window.location.href = `mailto:?body=${encodeURIComponent(
                        qrValue
                      )}`)
                    }
                  >
                    <i className="bi bi-envelope"></i> Email
                  </button>
                  <button
                    className="share-option"
                    onClick={() =>
                      window.open(
                        `https://wa.me/?text=${encodeURIComponent(qrValue)}`,
                        "_blank"
                      )
                    }
                  >
                    <i className="bi bi-whatsapp"></i> WhatsApp
                  </button>
                </div>
              </div>
            </div>

            <div className="share-actions">
              <button
                className="back-btn"
                onClick={() => setActiveTab("preview")}
              >
                <i className="bi bi-arrow-left"></i> Back to Preview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
