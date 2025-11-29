import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "./api";

export default function Register() {
  const router = useRouter();

  // --- UPDATED STATE VARIABLES TO MATCH DJANGO BACKEND ---
  // username is REQUIRED
  const [username, setUsername] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  // phone_number is REQUIRED in Django model
  const [phoneNumber, setPhoneNumber] = useState(""); 
  const [avatar, setAvatar] = useState("");     // URL string (optional on model but good to have)
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const handleRegister = async () => {
    setFeedbackMessage("");

    // Ensure required fields are checked
    if (!email || !password || !password2 || !username || !phoneNumber) {
      setFeedbackMessage("Please fill all required fields (Email, Username, Password, Phone Number).");
      return;
    }
    if (password !== password2) {
      setFeedbackMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // --- UPDATED PAYLOAD TO MATCH DJANGO MODEL ---
      const payload = {
        email,
        password,
        password2, // The serializer expects this for confirmation
        username: username,
        phone_number: phoneNumber,
        avatar: avatar,
      };

      await api.register(payload); // Response will contain user data on success

      setFeedbackMessage("Registration successful! Redirecting to login...");
      setTimeout(() => router.replace("/login"), 800);
    } catch (err) {
      console.log("Register error:", err.response?.data || err.message);

      let msg = "Registration failed.";
      const backend = err.response?.data;

      if (backend && typeof backend === "object") {
        // Better error mapping for Django DRF errors
        msg = Object.entries(backend)
          .map(([field, errors]) => {
            const fieldName = field.replace('_', ' ').replace('password2', 'confirm password');
            const text = Array.isArray(errors) ? errors.join(", ") : errors;
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}: ${text}`;
          })
          .join("\n");
      }

      setFeedbackMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      {/* Username Input (Replaced First/Last Name) */}
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
placeholderTextColor="#aaa"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* Phone Number Input */}
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
placeholderTextColor="#aaa"
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      {/* Avatar URL Input */}
      <TextInput
        style={styles.input}
        placeholder="Avatar URL (ImgBB Direct Link, optional)"
        value={avatar}
placeholderTextColor="#aaa"
        onChangeText={setAvatar}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
placeholderTextColor="#aaa"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password2}
        onChangeText={setPassword2}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Register</Text>}
      </TouchableOpacity>

      {feedbackMessage ? <Text style={styles.feedback}>{feedbackMessage}</Text> : null}

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.feedback}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { textAlign: "center", fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#10b981",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  feedback: { textAlign: "center", color: "red", marginTop: 12 },
});