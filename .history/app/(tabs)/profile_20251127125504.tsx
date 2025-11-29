import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import api from "../api";
export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    // Note: We don't have a backend logout endpoint that revokes the JWT,
    // so we only clear the client-side tokens.
    await AsyncStorage.clear();
    router.replace("/login");
  };

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("access");
      if (!token) throw new Error("No token");

      // Use the updated api.getProfile() which hits /auth/me/
      const res = await api.getProfile(); 
      setProfile(res.data);
    } catch (error) {
      console.log("Profile error:", error.response?.data || error.message);
      alert("Failed to load profile. Please login again.");
      await AsyncStorage.clear();
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: profile?.avatar
            ? profile.avatar // If avatar exists, use it
            : "https://i.pravatar.cc/200" // fallback avatar
        }}
        style={styles.avatar}
      />

      {/* Displaying username instead of first/last name */}
      <Text style={styles.name}>{profile?.username}</Text> 
      <Text style={styles.email}>{profile?.email}</Text>
      <Text style={styles.email}>{profile?.phone_number}</Text>
      <View style={styles.balanceContainer}>
        {/* Assuming BDT as currency based on previous context, adjust if needed */}
        <Text style={styles.balance}>💰 Balance: {profile?.balance} BDT</Text> 
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/marketplace")}>
        <Text style={styles.buttonText}>Go to Marketplace</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonPurchase} onPress={() => router.push("/start")}>
        <Text style={styles.buttonText}>Purchase History</Text>
      </TouchableOpacity>
      {/* Renamed "Order History" to "Sell History" for clarity */}
      <TouchableOpacity style={styles.buttonPurchase} onPress={() => router.push("/start")}> 
        <Text style={styles.buttonText}>Sell History</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonPurchase} onPress={() => router.push("/ChangePassword")}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout}>
        <Text style={styles.logout}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
  },
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    padding: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 999,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
  },
  email: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
  },
  balanceContainer: {
    backgroundColor: "#10b981", // nice green
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginVertical: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4, // for Android shadow
  },
  balance: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },

  button: {
    backgroundColor: "#10b981",
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
    width: "90%",
    alignItems: "center",
  },
  buttonPurchase: {
    backgroundColor: "#0ea5e9",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    width: "90%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  logout: {
    marginTop: 20,
    color: "red",
    fontSize: 16,
    fontWeight: "600",
  },
});