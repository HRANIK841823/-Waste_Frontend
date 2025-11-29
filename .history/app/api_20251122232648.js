import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/myapp/";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Default JSON
api.defaults.headers.common["Content-Type"] = "application/json";

// Add Authorization Token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle Token Refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refresh = await AsyncStorage.getItem("refresh");
      if (!refresh) return Promise.reject(error);

      try {
        const response = await axios.post(`${BASE_URL}/token/refresh/`, {
          refresh,
        });

        await AsyncStorage.setItem("access", response.data.access);
        original.headers.Authorization = `Bearer ${response.data.access}`;

        return api(original);
      } catch (e) {
        await AsyncStorage.clear();
      }
    }
    return Promise.reject(error);
  }
);

// ---------- All API Calls ----------
export default {
  // Auth
  login: (username, password) =>
    api.post("/login/", { username, password }),

  register: (formData) =>
    api.post("/register/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Profile
  getProfile: () => api.get("/profile/"),

  // Products
  getProducts: () => api.get("/products/"),
  getProduct: (id) => api.get(`/product/${id}/`),

  // Posts
  postWaste: (formData) =>
    api.post("/post/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updatePost: (id, formData) =>
    api.put(`/post/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deletePost: (id) => api.delete(`/post/${id}/`),

  // Buy
  buyProduct: (id) => api.post(`/buy/${id}/`),

  // Orders
  getOrders: () => api.get("/orders/"),
  getMyPosts: () => api.get("/my-posts/"),
};
