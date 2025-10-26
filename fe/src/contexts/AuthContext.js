import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { Navigate, Outlet } from "react-router-dom";


const AuthContext = createContext();

export function RequireAuth({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>; 
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing saved user data:", error);
        logout();
      }
    }

    setLoading(false);
  }, []);

  const login = useCallback((userData, token) => {
    const userInfo = {
      ...userData,
      token,
    };

    setUser(userInfo);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userInfo));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const updateUser = useCallback((userData) => {
    setUser((prevUser) => {
      if (!prevUser) return userData;

      const updatedUser = { ...prevUser, ...userData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const value = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user?.token,
    isInstructor: user?.role === "instructor",
    isLearner: user?.role === "learner",
    isParent: user?.role === "parent",
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
