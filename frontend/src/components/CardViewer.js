import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const CardViewer = () => {
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { userId } = useParams();

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/profile/public/${userId}`
        );
        if (!response.ok) throw new Error("Card not found");
        const data = await response.json();
        setCardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCardData();
  }, [userId]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  const websiteLink = cardData.website?.startsWith("http")
    ? cardData.website
    : `https://${cardData.website}`;

  const linkedinLink = cardData.linkedin?.startsWith("http")
    ? cardData.linkedin
    : `https://${cardData.linkedin}`;

  const facebookLink = cardData.facebook?.startsWith("http")
    ? cardData.facebook
    : `https://${cardData.facebook}`;

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="mt-4">
          <div className="card">
            <div className="card-body text-start">
              <h5 className="card-title">{cardData.fullName || "Your Name"}</h5>
              <p className="mb-1">{cardData.jobTitle || "Job Title"}</p>
              <p className="mb-1">{cardData.department || "Department"}</p>
              <p className="mb-1">{cardData.company || "Company"}</p>
              <p className="mb-1 text-muted">{cardData.bio || "Bio"}</p>
              <hr />
              <p className="mb-1">
                <i className="bi bi-telephone me-2"></i>
                {cardData.phone || "Phone"}
              </p>
              <p className="mb-1">
                <i className="bi bi-envelope me-2"></i>
                <a href={`mailto:${cardData.email}`}>
                  {cardData.email || "Email"}
                </a>
              </p>
              <p className="mb-1">
                <i className="bi bi-globe me-2"></i>
                <a href={websiteLink} target="_blank" rel="noopener noreferrer">
                  {cardData.website || "Website"}
                </a>
              </p>
              <p className="mb-1">
                <i className="bi bi-linkedin me-2"></i>
                <a
                  href={linkedinLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {cardData.linkedin || "LinkedIn"}
                </a>
              </p>
              <p className="mb-0">
                <i className="bi bi-facebook me-2"></i>
                <a
                  href={facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {cardData.facebook || "Facebook"}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardViewer;
