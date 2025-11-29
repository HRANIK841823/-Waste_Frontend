import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await fetch("https://your-backend/api/profile/", {
        headers: {
          Authorization: `Bearer YOUR_TOKEN_HERE`,
        },
      });

      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.log("Profile error:", error);
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
        source={{ uri: profile?.avatar || "https://i.pravatar.cc/200" }}
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

      <TouchableOpacity onPress={() => router.push("/login")}>
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
    backgroundColor: "#E8F5E9",
  },
  container: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: 20,
    borderWidth: 4,
    borderColor: "#10b981",
  },
  name: {
    fontSize: 26,
    fontWeight: "800",
    color: "#065f46",
  },
  email: {
    fontSize: 16,
    color: "#14532d",
    marginBottom: 5,
  },
  phone: {
    fontSize: 16,
    color: "#166534",
    marginBottom: 5,
  },
  balance: {
    fontSize: 18,
    fontWeight: "700",
    color: "#047857",
    marginBottom: 30,
  },
  button: {
    width: "80%",
    backgroundColor: "#10b981",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginVertical: 10,
    elevation: 5,
  },
  buttonPurchase: {
    width: "80%",
    backgroundColor: "#b97810ff",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginVertical: 10,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  logout: {
    color: "#EF4444",
    marginTop: 20,
    fontWeight: "600",
    fontSize: 16,
  },
});
