 
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useState } from "react";
import { getMyProfile } from "../services/user";

export const VendorProfileContext = createContext();

export const VendorProfileProvider = ({ children }) => {
  const [vendorProfile, setVendorProfile] = useState({
    name: "",
    email: "",
    district: "",
    shopName: "",
    profileImage: null,
    role: "",
  });

  const refreshVendorProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return null;

      const res = await getMyProfile();

       
      // { user: {...} }  OR  { ...userFields }
      const u = res?.user || res || {};

      const next = {
        name: u?.name || "",
        email: u?.email || "",
        district: u?.district || "",
        shopName: u?.shopName || "",
        profileImage: u?.profileImage || null,
        role: u?.role || "vendor",
      };

      setVendorProfile(next);

       
      await AsyncStorage.setItem("vendorProfile", JSON.stringify(next));

      return next;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    (async () => {
      try {
         
        const saved = await AsyncStorage.getItem("vendorProfile");
        if (saved) setVendorProfile(JSON.parse(saved));
      } catch {}

       
      await refreshVendorProfile();
    })();
  }, []);

  return (
    <VendorProfileContext.Provider
      value={{ vendorProfile, setVendorProfile, refreshVendorProfile }}
    >
      {children}
    </VendorProfileContext.Provider>
  );
};
