// Frontend/src/services/api.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://localhost:5000";

const buildHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log("🔑 Token added to headers");
  } else {
    console.log("⚠️ No token found in AsyncStorage");
  }

  return headers;
};

const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return {};
  }
};

export const apiGet = async (path) => {
  const headers = await buildHeaders();
  console.log("📤 GET", path);

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, { method: "GET", headers });
  } catch (e) {
    throw new Error("Network error: cannot reach backend (check IP/WiFi/firewall).");
  }

  const data = await safeJson(res);

  if (!res.ok) {
    console.log("❌ GET failed:", data);
    throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
  }

  console.log("✅ GET", path, "success:", data);
  return data;
};

export const apiPost = async (path, body) => {
  const headers = await buildHeaders();
  console.log("📤 POST", path);

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new Error("Network error: cannot reach backend (check IP/WiFi/firewall).");
  }

  const data = await safeJson(res);

  if (!res.ok) {
    console.log("❌ POST failed:", data);
    throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
  }

  console.log("✅ POST", path, "success:", data);
  return data;
};

export const apiPut = async (path, body) => {
  const headers = await buildHeaders();
  console.log("📤 PUT", path);

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new Error("Network error: cannot reach backend (check IP/WiFi/firewall).");
  }

  const data = await safeJson(res);

  if (!res.ok) {
    console.log("❌ PUT failed:", data);
    throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
  }

  console.log("✅ PUT", path, "success:", data);
  return data;
};
