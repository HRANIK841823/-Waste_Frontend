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
    await AsyncStorage.clear();
    router.replace("/login");
  };

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("access");
      if (!token) throw new Error("No token");

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

      <Text style={styles.name}>{profile?.first_name} {profile?.last_name}</Text>
      <Text style={styles.email}>{profile?.email}</Text>
      <View style={styles.balanceContainer}>
        <Text style={styles.balance}>💰 Balance: {profile?.balance} BDT</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/marketplace")}>
        <Text style={styles.buttonText}>Go to Marketplace</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonPurchase} onPress={() => router.push("/purchase")}>
        <Text style={styles.buttonText}>Order History</Text>
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
  balance: {
    fontSize: 18,
    marginVertical: 10,
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
