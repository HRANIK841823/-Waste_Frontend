import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import api from "../api";

// --- Custom Component for Action Buttons ---
interface ActionButtonProps {
    icon: keyof typeof FontAwesome.glyphMap;
    label: string;
    onPress: () => void;
    color?: string;
}

const ProfileActionButton = ({ icon, label, onPress, color = '#333' }: ActionButtonProps) => (
    <TouchableOpacity style={actionStyles.button} onPress={onPress}>
        <View style={actionStyles.leftContent}>
            <FontAwesome name={icon} size={20} color={color} style={actionStyles.icon} />
            <Text style={actionStyles.label}>{label}</Text>
        </View>
        <FontAwesome name="chevron-right" size={16} color="#ccc" />
    </TouchableOpacity>
);

const actionStyles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 14,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: 30,
        textAlign: 'center',
        marginRight: 15,
    },
    label: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
});

// --- Main Profile Component ---

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    // Clear client-side tokens.
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
  <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={{
            uri: profile?.avatar
              ? profile.avatar 
              : "https://i.pravatar.cc/200" 
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{profile?.username || 'User Profile'}</Text> 
        <Text style={styles.email}>{profile?.email}</Text>
        
        <View style={styles.balanceContainer}>
          <FontAwesome name="money" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.balance}>Current Balance: {profile?.balance || 0} BDT</Text> 
        </View>
      </View>
      
      <View style={styles.body}>
        
        {/* Account Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Details</Text>
          <View style={styles.infoRow}>
            <FontAwesome name="phone" size={16} color="#666" style={styles.infoIcon} />
            <Text style={styles.infoText}>Phone: {profile?.phone_number || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <FontAwesome name="user-circle" size={16} color="#666" style={styles.infoIcon} />
            <Text style={styles.infoText}>User ID: {profile?.id ? profile.id.substring(0, 8) + '...' : 'N/A'}</Text>
          </View>
        </View>


        {/* Action List */}
        <View style={styles.actionList}>
          <Text style={styles.cardTitle}>Marketplace & History</Text>
          <ProfileActionButton 
            icon="shopping-cart" 
            label="Go to Marketplace" 
            onPress={() => router.push("/marketplace")}
            color="#10b981"
          />
          <ProfileActionButton 
            icon="history" 
            label="Purchase History" 
            onPress={() => router.push("/PurchaseHistory")}
            color="#0ea5e9"
          />
          <ProfileActionButton 
            icon="exchange" 
            label="Sell History" 
            onPress={() => router.push("/SellHistory")}
            color="#ca8a04"
          />
        </View>

        <View style={styles.actionList}>
          <Text style={styles.cardTitle}>Security</Text>
          <ProfileActionButton 
            icon="lock" 
            label="Change Password" 
            onPress={() => router.push("/ChangePassword")}
            color="#6366f1"
          />
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5", // Light gray background for the whole screen
  },
  scrollContent: {
    paddingBottom: 30, // Space at the bottom
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  // --- Header/Profile Info Styles ---
  header: {
    backgroundColor: "#F0FDF4", // Light green background for the header area
    alignItems: "center",
    padding: 24,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "#fff",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: '#10b981',
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#10b981", 
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 10,
  },
  balance: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  // --- Body/Action Styles ---
  body: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999',
    paddingLeft: 10,
    marginBottom: 8,
    marginTop: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoIcon: {
    marginRight: 10,
    width: 20,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
  },
  actionList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: 'hidden', // Ensures border radius clips buttons
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  // --- Logout Styles ---
  logoutButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: {
    color: "#ef4444", // Tailwind red-500
    fontSize: 16,
    fontWeight: "600",
  },
});