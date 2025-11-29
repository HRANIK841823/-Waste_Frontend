// api.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API = axios.create({
  baseURL: "http://0.0.0.0:8000//api", // ⬅️ keep or change to your server URL
  timeout: 10000,
});

// Automatically attach token to each request
API.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.log("Request interceptor error:", err);
  }
  return config;
});

// Auto refresh token if access token expires
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // If token expired and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = await AsyncStorage.getItem("refresh");
        if (!refresh) throw new Error("No refresh token");

        // Use API (which has baseURL) to call token refresh endpoint
        const res = await API.post("/token/refresh/", {
          refresh,
        });

        const newAccess = res.data.access;
        if (newAccess) {
          await AsyncStorage.setItem("access", newAccess);
          // update Authorization header for the failed request and retry
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return API(originalRequest);
        }
      } catch (err) {
        console.log("Token refresh failed:", err);
        // Clear auth storage on refresh failure
        await AsyncStorage.removeItem("access");
        await AsyncStorage.removeItem("refresh");
      }
    }
    return Promise.reject(error);
  }
);

// ---------------- API ENDPOINTS ----------------

// Auth
const login = (email, password) => API.post("/login/", { email, password });
const register = (data) => API.post("/register/", data);
const getProfile = () => API.get("/profile/");
const changePassword = (data) => API.post("/change-password/", data);
const logout = (refresh) => API.post("/logout/", { refresh });

// Items
const createItem = (payload) => API.post("/items/create/", payload); // payload: { title, description, category, price, image_url, location, ... }
const getMarketplace = (params = {}) => API.get("/marketplace/", { params }); // params: { category, status, search, page, ... }
const getUserItems = () => API.get("/items/my/");
const getItemDetail = (_id) => API.get(`/items/${_id}/`);
const updateItem = (_id, payload) => API.put(`/items/${_id}/`, payload);
const deleteItem = (_id) => API.delete(`/items/${_id}/`);
const buyItem = (item_id) => API.post(`/items/buy/${item_id}/`);

// Export all
export default {
  // auth
  login,
  register,
  getProfile,
  changePassword,
  logout,

  // items
  createItem,
  getMarketplace,
  getUserItems,
  getItemDetail,
  updateItem,
  deleteItem,
  buyItem,
};
