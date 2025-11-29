// ChangePassword.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import api from "./api";

export default function ChangePassword() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert("Error", "Please fill in both fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.changePassword({ old_password: oldPassword, new_password: newPassword });
      Alert.alert("Success", res.data.detail || "Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      router.back(); // go back to profile
    } catch (err: any) {
      console.log("Change password error:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.old_password || err.response?.data?.detail || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Old Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={oldPassword}
        onChangeText={setOldPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="New Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <TouchableOpacity
        style={[styles.button, (loading || !oldPassword || !newPassword) && { backgroundColor: "#999" }]}
        onPress={handleChangePassword}
        disabled={loading || !oldPassword || !newPassword}
      >
        <Text style={styles.buttonText}>{loading ? "Saving..." : "Change Password"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.cancel}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 15,
    color: "#333",
    borderWidth: 1,
    borderColor: "#26A65B",
  },
  button: {
    backgroundColor: "#26A65B",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancel: {
    marginTop: 20,
    textAlign: "center",
    color: "#999",
    fontSize: 16,
  },
});
