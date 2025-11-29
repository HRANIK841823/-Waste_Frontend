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

  // keep UI names if you want, but map to backend fields
  const [firstName, setFirstName] = useState("");   // maps to first_name
  const [lastName, setLastName] = useState("");     // maps to last_name
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(""); // optional, backend ignores if not in model
  const [avatar, setAvatar] = useState("");     // URL string
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const handleRegister = async () => {
    setFeedbackMessage("");

    if (!email || !password) {
      setFeedbackMessage("Please fill required fields.");
      return;
    }

    setLoading(true);

    try {
      // backend expects JSON with keys email, password, first_name, last_name, avatar
      const payload = {
        email,
        password,
        password2,
        first_name: firstName,
        last_name: lastName,
        avatar,
      };

      const res = await api.register(payload);

      setFeedbackMessage("Registration successful!");
      setTimeout(() => router.push("/login"), 800);
    } catch (err) {
      console.log("Register error:", err.response?.data || err.message);

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
    } finally {
      setLoading(false);
    }
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
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />

      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number (optional)"
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
    </View>
  );
}

// keep your original styles unchanged (copy from your file)

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
