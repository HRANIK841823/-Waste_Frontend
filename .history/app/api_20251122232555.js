// api.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const instance = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// Automatically attach token
instance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default {
  login: (username, password) =>
    instance.post("/login/", { username, password }),

  register: (data) =>
    instance.post("/register/", data),

  getProfile: () =>
    instance.get("/profile/"),   // token automatically added
};
