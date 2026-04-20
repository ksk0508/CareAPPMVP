import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as authApi from "../api/authApi";

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    restoreUser();
  }, []);

  const restoreUser = async () => {
    try {
      console.log("🔍 AppContext: Attempting to restore user...");
      const token = await AsyncStorage.getItem("token");
      const userData = await AsyncStorage.getItem("user");

      console.log("🔑 Token exists:", !!token);
      console.log("👤 User data exists:", !!userData);

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        console.log("✅ AppContext: User restored -", parsedUser.email);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } else {
        console.log("❌ AppContext: No token/user found - user not logged in");
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.log("❌ AppContext Error restoring user:", error);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    console.log("🔐 AppContext: Login called for", userData.email);
    console.log("🔐 AppContext: User role from token:", userData.role || userData.roles);

    const fallbackRole = userData.practitionerId
      ? "Doctor"
      : userData.patientId
      ? "Patient"
      : "Patient";

    // Ensure role is properly set and preserve any known claims.
    const userWithRole = {
      ...userData,
      role: userData.role || userData.roles || userData["role"] || fallbackRole,
    };

    console.log("🔐 AppContext: Setting user with role:", userWithRole.role);
    setUser(userWithRole);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    console.log("🚪 AppContext: Logout initiated");
    try {
      // Call backend logout endpoint first
      try {
        await authApi.logout();
        console.log("📡 AppContext: Backend logout successful");
      } catch (error) {
        console.log("⚠️ AppContext: Backend logout failed (continuing with client-side logout)", error.message);
      }

      // Clear client-side storage
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      console.log("🗑️ AppContext: Storage cleared");
      setUser(null);
      setIsLoggedIn(false);
      console.log("✅ AppContext: Logout complete - isLoggedIn:", false);
    } catch (error) {
      console.log("❌ AppContext Logout error:", error);
      throw error;
    }
  };

  // Helper functions to check role
  const isDoctor = () => {
    const role = user?.role?.toString()?.toLowerCase();
    const isDoc =
      role === "doctor" ||
      role === "practitioner" ||
      role?.includes("doctor") ||
      role?.includes("practitioner") ||
      Boolean(user?.practitionerId);
    console.log("🔍 AppContext.isDoctor():", isDoc, "- user role:", role);
    return isDoc;
  };
  const isPatient = () => {
    const role = user?.role?.toString()?.toLowerCase();
    const isPat =
      role === "patient" ||
      role?.includes("patient") ||
      Boolean(user?.patientId);
    console.log("🔍 AppContext.isPatient():", isPat, "- user role:", role);
    return isPat;
  };
  const isDoctorOrAdmin = () => user?.role === "Doctor" || user?.role === "Admin";

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        isLoggedIn,
        login,
        logout,
        isDoctor,
        isPatient,
        isDoctorOrAdmin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

