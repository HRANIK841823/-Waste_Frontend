import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.0.104:8000/api", // ⬅️ keep or change to your server URL
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

        // NOTE: The refresh endpoint is NOT inside the 'auth/' prefix
        // We use /auth/refresh/ in Django but the URL for JWT refresh is /api/auth/refresh/
        // We must use the full path relative to baseURL: /auth/refresh/
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
// NOTE: Login uses TokenObtainPairView and expects username/password (which we use email for)
const login = (email, password) => API.post("/auth/login/", { email, password });
const register = (data) => API.post("/auth/register/", data);
const getProfile = () => API.get("/auth/me/");
const changePassword = (data) => API.post("/auth/change-password/", data);
// We don't need a logout endpoint since SimpleJWT doesn't manage token revocation by default

// Items (Using the router-generated paths from Django: /marketplace/)
const createItem = (payload) => API.post("/marketplace/", payload);
const getMarketplace = (params = {}) => API.get("/marketplace/", { params });
const getItemDetail = (id) => API.get(`/marketplace/${id}/`);
const updateItem = (id, payload) => API.put(`/marketplace/${id}/`, payload);
const deleteItem = (id) => API.delete(`/marketplace/${id}/`);

// Custom actions mapped to the ViewSet
const getMySellHistory = () => API.get("/marketplace/my_sell_history/");
const getMyPurchaseHistory = () => API.get("/marketplace/my_purchase_history/");
const buyItem = (item_id) => API.post(`/marketplace/${item_id}/buy/`); // Corrected path to match Django action

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