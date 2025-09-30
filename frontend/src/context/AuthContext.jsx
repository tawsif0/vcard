import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to verify token with backend
  const verifyToken = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/verify", {
        headers: {
          "x-auth-token": token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return {
            isValid: true,
            user: data.user,
          };
        }
      }
      return { isValid: false };
    } catch (error) {
      console.error("Token verification failed:", error);
      return { isValid: false };
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!storedToken || !storedUser) {
        setLoading(false);
        return;
      }

      try {
        // Verify token with backend
        const verification = await verifyToken(storedToken);

        if (verification.isValid) {
          // Use fresh user data from backend
          const userWithPremium = {
            ...verification.user,
            isPremium: verification.user.isPremium || false,
          };
          setUser(userWithPremium);
          // Update localStorage with fresh data
          localStorage.setItem("user", JSON.stringify(userWithPremium));
        } else {
          // Token is invalid, clear storage
          console.warn("Token verification failed, logging out...");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear corrupted data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (userData, token) => {
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

  // Verify current token (useful for checking if token is still valid)
  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      logout();
      return false;
    }

    const verification = await verifyToken(token);
    if (!verification.isValid) {
      logout();
      return false;
    }

    // Update user data if needed
    if (verification.user && verification.user.id !== user?.id) {
      const userWithPremium = {
        ...verification.user,
        isPremium: verification.user.isPremium || false,
      };
      setUser(userWithPremium);
      localStorage.setItem("user", JSON.stringify(userWithPremium));
    }

    return true;
  };

  // Optional: Function to update premium status
  const updatePremiumStatus = (isPremium) => {
    if (user) {
      const updatedUser = { ...user, isPremium };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  // Optional: Refresh user data from backend
  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const verification = await verifyToken(token);
    if (verification.isValid && verification.user) {
      const userWithPremium = {
        ...verification.user,
        isPremium: verification.user.isPremium || false,
      };
      setUser(userWithPremium);
      localStorage.setItem("user", JSON.stringify(userWithPremium));
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
        checkAuth,
        updatePremiumStatus,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
