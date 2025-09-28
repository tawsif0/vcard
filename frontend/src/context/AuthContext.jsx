import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    // Only set user if both token and user data exist
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Ensure isPremium field exists with default value if missing
        if (userData && typeof userData.isPremium === "undefined") {
          userData.isPremium = false;
        }
        setUser(userData);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        // Clear corrupted data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    // Ensure isPremium field exists
    const userWithPremium = {
      ...userData,
      isPremium: userData.isPremium || false,
    };

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userWithPremium));
    setUser(userWithPremium);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Optional: Function to update premium status
  const updatePremiumStatus = (isPremium) => {
    if (user) {
      const updatedUser = { ...user, isPremium };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        updatePremiumStatus, // Optional: if you want to update premium status dynamically
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
