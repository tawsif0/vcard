import React, { useContext } from "react";
import { useParams, Routes, Route, Navigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import CardViewer from "../Basic/Component/View/CardViewer";
import Home from "../Premium/view/pages/Home";
import About from "../Premium/view/pages/About/About";
import Resume from "../Premium/view/pages/Resume/Resume";
import Contact from "../Premium/view/pages/Contact";
import Portfolio from "../Premium/view/pages/Portfolio";
import Blog from "../Premium/view/pages/Blog";
function ProfileRouteHandler() {
  const { userId } = useParams();
  const { user } = useContext(AuthContext);

  // Get user ID - handle both _id and id fields from different MongoDB formats
  const currentUserId = user?.id || user?._id;

  // Check if current user is premium AND owns this profile
  const isPremiumProfileOwner =
    user && user.isPremium && currentUserId === userId;

  // If user is premium and owns this profile, show premium routes
  if (isPremiumProfileOwner) {
    return (
      <Routes>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<Home userId={userId} />} />
        <Route path="about" element={<About userId={userId} />} />
        <Route path="resume" element={<Resume userId={userId} />} />
        <Route path="contact" element={<Contact userId={userId} />} />
        <Route path="portfolio" element={<Portfolio userId={userId} />} />
        <Route path="blog" element={<Blog userId={userId} />} />
      </Routes>
    );
  }

  // For all other cases (non-premium users, viewing other profiles), show CardViewer
  return <CardViewer />;
}

export default ProfileRouteHandler;
