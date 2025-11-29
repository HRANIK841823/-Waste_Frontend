import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
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
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setFeedbackMessage("Permission required to pick image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0]);
    }
  };

  const handleRegister = async () => {
  setFeedbackMessage("");

  if (!username || !email || !password) {
    setFeedbackMessage("Please fill all required fields.");
    return;
  }

  setLoading(true);

  const formData = new FormData();
  formData.append("username", username);
  formData.append("email", email);
  formData.append("password", password);
  formData.append("phoneNumber", phoneNumber); // backend expects camelCase

  if (avatar) {
    const ext = avatar.uri.split(".").pop();
    const mime = ext === "png" ? "image/png" : "image/jpeg";

    formData.append("avatar", {
      uri: avatar.uri,
      name: `avatar.${ext}`,
      type: mime,
    } as any);
  }

  try {
    await api.register(formData, {
      headers: { "Content-Type": "multipart/form-data" }, // 🔥 MUST
    });

    setFeedbackMessage("Registration successful!");
    setTimeout(() => router.push("/login"), 1000);
  } catch (err: any) {
    console.log("Register error:", err.response?.data);

    const backend = err.response?.data;
    let msg = "Registration failed.";

    if (backend && typeof backend === "object") {
      // Flatten all errors into readable string
      msg = Object.entries(backend)
        .map(([field, errors]) => {
          const text = Array.isArray(errors) ? errors.join(", ") : errors;
          return `${field}: ${text}`;
        })
        .join("\n");
    } else if (err.message) {
      msg = err.message;
    }

    setFeedbackMessage(msg);
  }

  setLoading(false);
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TouchableOpacity onPress={pickAvatar}>
        {avatar ? (
          <Image source={{ uri: avatar.uri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text>Pick Avatar</Text>
          </View>
        )}
      </TouchableOpacity>

      {feedbackMessage ? (
        <Text style={styles.feedback}>{feedbackMessage}</Text>
      ) : null}

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
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Register</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.loginText}>
          Already have an account? <Text style={{ color: "#10b981" }}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { textAlign: "center", fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, alignSelf: "center" },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: "#ddd",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
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
  feedback: { textAlign: "center", color: "red", marginBottom: 10 },
  loginText: { textAlign: "center", marginTop: 15, fontSize: 16 },
});
