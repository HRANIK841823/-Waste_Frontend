import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.0.105:8000/api", // ⬅️ keep or change to your server URL
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
    // Check for originalRequest existence before accessing properties
    if (!originalRequest || typeof originalRequest._retry === 'undefined') {
        originalRequest._retry = false; // Initialize retry flag safely
    }

    // If token expired (401) and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = await AsyncStorage.getItem("refresh");
        if (!refresh) throw new Error("No refresh token");

        // The refresh endpoint path
        const res = await API.post("/auth/refresh/", {
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
        console.log("Token refresh failed:", err.response?.data || err.message);
        // Clear auth storage on refresh failure
        await AsyncStorage.removeItem("access");
        await AsyncStorage.removeItem("refresh");
        // Re-throw to propagate the authentication error
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// ---------------- API ENDPOINTS ----------------

// Auth
const login = (email, password) => API.post("/auth/login/", { email, password });
const register = (data) => API.post("/auth/register/", data);
const getProfile = () => API.get("/auth/me/");
const getUsers = () => API.get("/auth/users/");
const changePassword = (data) => API.post("/auth/change-password/", data);

// Items (Using the router-generated paths from Django: /marketplace/)
const createItem = (payload) => API.post("/marketplace/marketplace/", payload);
const getMarketplace = (params = {}) => API.get("/marketplace/marketplace/", { params });
const getItemDetail = (id) => API.get(`/marketplace/marketplace/${id}/`);
const updateItem = (id, payload) => API.put(`/marketplace/marketplace/${id}/`, payload);
const deleteItem = (id) => API.delete(`/marketplace/marketplace/${id}/`);

// Custom actions mapped to the ViewSet
const getMySellHistory = () => API.get("my_sell_history/");
const getMyPurchaseHistory = () => API.get("/my_purchase_history/");
// This is the endpoint called by handleBuy()
const buyItem = (item_id) => API.post(`/marketplace/marketplace/${item_id}/buy/`);

// Export all
export default {
  // auth
  login,
  register,
  getProfile,
  changePassword,

  // items
  createItem,
  getMarketplace,
  getMySellHistory,
  getMyPurchaseHistory,
  getItemDetail,
  updateItem,
  deleteItem,
  buyItem,
};