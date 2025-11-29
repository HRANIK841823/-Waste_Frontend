import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000//api"; // replace with your backend URL

const getToken = async () => {
  const token = await AsyncStorage.getItem("access");
  return token;
};

const api = {
  // --------------- Auth ----------------
  login: (username, password) =>
    axios.post(`${API_URL}/login/`, { username, password }),

  register: (data) => axios.post(`${API_URL}/register/`, data),

  // --------------- Protected ----------------
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
