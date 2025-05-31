import React, { useContext } from "react";
import AuthContext from "../context/AuthContext";
import ProfileCard from "./ProfileCard";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Welcome, {user?.name}</h2>
      </div>
      <ProfileCard user={user} />
    </div>
  );
};

export default Dashboard;
