// api.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// YOUR BACKEND URL
const BASE_URL = "http://127.0.0.1:8000/api"; 
// Example: "http://192.168.0.108:8000/api"

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
});

// 🔥 Attach Access Token Before All Requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔄 Auto Refresh Token If Expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired (401) → try refreshing
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = await AsyncStorage.getItem("refresh");
        if (!refresh) throw new Error("No refresh token");

        const res = await axios.post(`${BASE_URL}/token/refresh/`, {
          refresh,
        });

        const newAccess = res.data.access;

        await AsyncStorage.setItem("access", newAccess);

        // retry original request
        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (err) {
        console.log("Token refresh failed:", err);
        await AsyncStorage.clear();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default {
  // 🔹 Register User
  register: (data) => api.post("/register/", data),

  // 🔹 Login and get access + refresh token
  login: (email, password) =>
    api.post("/token/", { email, password }),

  // 🔹 Get Profile
  getProfile: () => api.get("/profile/"),

  // 🔹 Update Profile
  updateProfile: (data) => api.patch("/profile/", data),

  // 🔹 Change Password
  changePassword: (old_password, new_password) =>
    api.post("/change-password/", { old_password, new_password }),

  // 🔹 Logout (Blacklists refresh token)
  logout: (refresh) => api.post("/logout/", { refresh }),

  // 🔹 Get Marketplace Cars
  getMarketplace: () => api.get("/marketplace/"),

  // 🔹 Buy Car
  buyCar: (carId) => api.post(`/buy/${carId}/`),

  // 🔹 Order History
  getOrders: () => api.get("/orders/"),
};
