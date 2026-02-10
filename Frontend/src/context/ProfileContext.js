 import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useState } from "react";
import { getMyProfile } from "../services/user";

export const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    profileImage: null,
    role: "",
    district: "",
    shopName: "",
  });

   
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("profile");
        if (stored) setProfile(JSON.parse(stored));
      } catch {}
    })();
  }, []);

   
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem("profile", JSON.stringify(profile));
        await AsyncStorage.setItem("user", JSON.stringify(profile));  
      } catch {}
    })();
  }, [profile]);

  const refreshProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return null;

      const res = await getMyProfile(); // GET /api/users/me
      const u = res?.user || res;

      const next = {
        id: u?.id || u?._id || "",
        name: u?.name || "",
        email: u?.email || "",
        profileImage: u?.profileImage || null,
        role: u?.role || "",
        district: u?.district || "",
        shopName: u?.shopName || "",
      };

      setProfile(next);
      await AsyncStorage.setItem("profile", JSON.stringify(next));
      await AsyncStorage.setItem("user", JSON.stringify(next));  
      return next;
    } catch {
      return null;
    }
  };

  
  useEffect(() => {
    refreshProfile().catch(() => {});
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}
