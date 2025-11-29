import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Replace with your backend URL accessible from device/emulator
// For Android emulator: 10.0.2.2
// For real device: use your PC LAN IP e.g., 192.168.x.x
const API_URL = "http://127.0.0.1:8000/api"; 

const getToken = async () => {
  return await AsyncStorage.getItem("access");
};

const api = {
  // ---------------- Auth ----------------
  login: (username, password) =>
    axios.post(`${API_URL}/token/`, { username, password }),

  register: (data) => axios.post(`${API_URL}/register/`, data),

  // ---------------- Protected ----------------
  getProfile: async () => {
    const token = await getToken();
    return axios.get(`${API_URL}/profile/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getMarketplace: async (category = "All") => {
    const token = await getToken();
    return axios.get(`${API_URL}/marketplace/`, {
      headers: { Authorization: token ? `Bearer ${token}` : undefined },
      params: { category },
    });
  },

  postProduct: async (data) => {
    const token = await getToken();
    return axios.post(`${API_URL}/post/`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  buyProduct: async (productId) => {
    const token = await getToken();
    return axios.post(`${API_URL}/buy/${productId}/`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getOrders: async () => {
    const token = await getToken();
    return axios.get(`${API_URL}/orders/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getUserPosts: async () => {
    const token = await getToken();
    return axios.get(`${API_URL}/my-posts/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

export default api;
