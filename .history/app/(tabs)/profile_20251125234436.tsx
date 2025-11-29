import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import api from "../api"; // Make sure correct path

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
const handleLogout = async () => {
  await AsyncStorage.clear();
  router.replace("/login");
};

  const fetchProfile = async () => {
  try {
    const token = await AsyncStorage.getItem("access");

    if (!token) {
      throw new Error("TOKEN_MISSING");
    }

    const res = await api.getProfile();
    setProfile(res.data);

  } catch (error) {
    console.log("Profile error:", error);

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
      {/* Avatar */}
      <Image
        source={{
          uri: profile?.avatar?.startsWith("http")
            ? profile.avatar
            : "https://i.pravatar.cc/200"
        }}
        style={styles.avatar}
      />

      {/* User Info */}
      <Text style={styles.name}>{profile?.username}</Text>
      <Text style={styles.email}>{profile?.email}</Text>
      <Text style={styles.phone}>📞 {profile?.phone_number}</Text>
      <Text style={styles.balance}>💰 Balance: {profile?.balance} BDT</Text>

      {/* Buttons */}
      <TouchableOpacity style={styles.button} onPress={() => router.push("/marketplace")}>
        <Text style={styles.buttonText}>Go to Marketplace</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonPurchase} onPress={() => router.push("/purchase")}>
        <Text style={styles.buttonText}>Order History</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonPurchase} onPress={() => router.push("/change-password")}>
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
    backgroundColor: "#F0FDF4", // Soft green background
  },
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4", 
    alignItems: "center",
    padding: 24,
    paddingTop: 60,
  },

  // Avatar
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 20,
    borderWidth: 5,
    borderColor: "#16A34A", // emerald-600 border
    shadowColor: "#16A34A",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },

  // Texts
  name: {
    fontSize: 28,
    fontWeight: "800",
    color: "#065F46",  // deep green
  },
  email: {
    fontSize: 17,
    color: "#0F5132",
    marginBottom: 5,
  },
  phone: {
    fontSize: 17,
    color: "#0F5132",
    marginBottom: 5,
  },
  balance: {
    fontSize: 20,
    fontWeight: "700",
    color: "#059669",
    marginBottom: 30,
    marginTop: 5,
  },

  // Primary button (Green)
  button: {
    width: "85%",
    backgroundColor: "#16A34A", // emerald-600
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    marginVertical: 8,
    shadowColor: "#16A34A",
    shadowOpacity: 0.3,
    shadowRadius: 7,
    elevation: 5,
  },

  // Secondary button (Gold/Bronze)
  buttonPurchase: {
    width: "85%",
    backgroundColor: "#CA8A04", // amber-600
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    marginVertical: 8,
    shadowColor: "#CA8A04",
    shadowOpacity: 0.3,
    shadowRadius: 7,
    elevation: 5,
  },

  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 17,
    letterSpacing: 0.5,
  },

  // Logout text
  logout: {
    color: "#DC2626",
    marginTop: 25,
    fontWeight: "700",
    fontSize: 17,
  },
});
