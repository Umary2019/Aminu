import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("pqf_token");

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/profile");
        setUser(data.user);
      } catch (error) {
        localStorage.removeItem("pqf_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("pqf_token", data.token);
    setUser(data.user);
    return data;
  };

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    localStorage.setItem("pqf_token", data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("pqf_token");
    setUser(null);
  };

  const contextValue = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      register,
      login,
      logout,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
