import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/myapp";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Add tokens automatically
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refresh = await AsyncStorage.getItem("refresh");
      if (!refresh) return Promise.reject(error);

      try {
        const res = await axios.post(`${BASE_URL}/token/refresh/`, { refresh });
        await AsyncStorage.setItem("access", res.data.access);

        original.headers.Authorization = `Bearer ${res.data.access}`;
        return api(original);
      } catch (err) {
        await AsyncStorage.clear();
      }
    }
    return Promise.reject(error);
  }
);

// All API calls
export default {
  // Auth
  login: (username, password) => api.post("/login/", { username, password }),

  register: (formData) =>
    api.post("/register/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Profile
  getProfile: () => api.get("/profile/"),

  // Marketplace
  getProducts: () => api.get("/products/"),
  getProduct: (id) => api.get(`/product/${id}/`),

  // Post waste
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

  // History
  getOrders: () => api.get("/orders/"),
  getMyPosts: () => api.get("/my-posts/"),
};
