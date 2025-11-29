// api.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API = axios.create({
  baseURL: "http://YOUR_DOMAIN/api", // ⬅️ CHANGE THIS TO YOUR SERVER URL
  timeout: 10000,
});

// Automatically attach token to each request
API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto refresh token if access token expires
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = await AsyncStorage.getItem("refresh");
        if (!refresh) throw new Error("No refresh token");

        const res = await axios.post("http://YOUR_DOMAIN/api/token/refresh/", {
          refresh,
        });

        const newAccess = res.data.access;
        await AsyncStorage.setItem("access", newAccess);

        // Retry API call with new access token
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return API(originalRequest);
      } catch (err) {
        console.log("Token refresh failed:", err);
        await AsyncStorage.clear();
      }
    }

    return Promise.reject(error);
  }
);

// ---------------- API ENDPOINTS ----------------

// Login using email + password
const login = (email, password) =>
  API.post("/login/", { email, password });

// Register user
const register = (data) =>
  API.post("/register/", data);

// Get logged-in user profile
const getProfile = () =>
  API.get("/profile/");

// Update password
const changePassword = (data) =>
  API.post("/change-password/", data);

// Logout
const logout = () => API.post("/logout/");

// Export all
export default {
  login,
  register,
  getProfile,
  changePassword,
  logout,
};
