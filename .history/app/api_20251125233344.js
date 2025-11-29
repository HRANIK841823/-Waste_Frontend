import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Use the server address that the device/emulator can reach.
// For Expo on the same machine use LAN IP (e.g., "http://192.168.1.5:8000/myapp/").
// For Android emulator (classic) use "http://10.0.2.2:8000/myapp/".
// For iOS simulator "http://127.0.0.1:8000/myapp/" may work.
const BASE_URL = "http://127.0.0.1:8000/api/"; // keep without trailing slash for convenience

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
    if (!original) return Promise.reject(error);

    // If 401 and we didn't already retry, attempt refresh
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refresh = await AsyncStorage.getItem("refresh");
      if (!refresh) return Promise.reject(error);

      try {
        // Try refresh token endpoint (adjust path on backend if different)
        const response = await axios.post(`${BASE_URL}/token/refresh/`, {
          refresh,
        });

        if (response?.data?.access) {
          await AsyncStorage.setItem("access", response.data.access);
          original.headers.Authorization = `Bearer ${response.data.access}`;
          return api(original);
        }
        return Promise.reject(error);
      } catch (e) {
        // refresh failed — clear tokens & reject
        await AsyncStorage.clear();
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

// ---------- All API Calls ----------
export default {
  // Auth
  // Note: backend expects email, not username
  login: (email, password) => api.post("/login/", { email, password }),

  register: (formData) => api.post("/register/", formData),

  // Profile
  getProfile: () => api.get("/profile/"),

  updateProfile: (formData) => api.put("/profile/update/", formData),

  // Password change
  changePassword: (old_password, new_password) =>
    api.post("/password/change/", { old_password, new_password }),

  // Convenience: logout -> clear storage locally
  logoutLocal: async () => {
    await AsyncStorage.removeItem("access");
    await AsyncStorage.removeItem("refresh");
  },
};
