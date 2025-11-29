import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "https://wbackend-vvb5.onrender.com/myapp";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Attach JWT only if exists
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("access");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = await AsyncStorage.getItem("refresh");

      if (!refresh) return Promise.reject(error);

      try {
        const res = await axios.post(`${BASE_URL}/token/refresh/`, { refresh });
        await AsyncStorage.setItem("access", res.data.access);
        originalRequest.headers["Authorization"] = `Bearer ${res.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        await AsyncStorage.clear();
      }
    }
    return Promise.reject(error);
  }
);

export default {
  // AUTH
  login: (username, password) => api.post("/login/", { username, password }),
  register: (formData) =>
    api.post("/register/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // PROFILE
  getProfile: () => api.get("/profile/"),

  // MARKETPLACE
  getProducts: () => api.get("/products/"),
  getProduct: (id) => api.get(`/product/${id}/`),

  // POST WASTE
  postWaste: (formData) =>
    api.post("/post/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updatePost: (id, formData) =>
    api.put(`/post/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deletePost: (id) => api.delete(`/post/${id}/`),

  // BUY
  buyProduct: (id) => api.post(`/buy/${id}/`),

  // HISTORY
  getOrders: () => api.get("/orders/"),
  getMyPosts: () => api.get("/my-posts/"),
};
