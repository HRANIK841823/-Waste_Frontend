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

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatar, setAvatar] = useState("");     // <--- URL String only
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const handleRegister = async () => {
    setFeedbackMessage("");

    if (!username || !email || !password || !phoneNumber) {
      setFeedbackMessage("Please fill all required fields.");
      return;
    }

    setLoading(true);

    try {
      await api.register({
        username,
        email,
        password,
        phoneNumber,
        avatar,  // <--- STRING URL
      });

      setFeedbackMessage("Registration successful!");
      setTimeout(() => router.push("/login"), 1000);
    } catch (err) {
      console.log("Register error:", err.response?.data);

      let msg = "Registration failed.";
      const backend = err.response?.data;

      if (backend && typeof backend === "object") {
        msg = Object.entries(backend)
          .map(([field, errors]) => {
            const text = Array.isArray(errors) ? errors.join(", ") : errors;
            return `${field}: ${text}`;
          })
          .join("\n");
      }

      setFeedbackMessage(msg);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Avatar URL (optional)"
        value={avatar}
        onChangeText={setAvatar}
      />

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Register</Text>}
      </TouchableOpacity>

      {feedbackMessage ? <Text style={styles.feedback}>{feedbackMessage}</Text> : null}
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
