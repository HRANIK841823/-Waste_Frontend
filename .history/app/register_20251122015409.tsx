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
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // -----------------------------
  // FIXED AVATAR TYPE 👇
  // -----------------------------
  const [avatar, setAvatar] = useState<{
    uri: string;
    width?: number;
    height?: number;
    fileName?: string;
    type?: string;
  } | null>(null);

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
      const img = result.assets[0];

      setAvatar({
        uri: img.uri,
        width: img.width,
        height: img.height,
        fileName: img.fileName,
        type: img.type || "image/jpeg",
      });
    }
  };

  const handleRegister = async () => {
    setFeedbackMessage("");

    if (!username || !email || !password || !phoneNumber) {
      setFeedbackMessage("Please fill all required fields.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("phoneNumber", phoneNumber);

    if (avatar) {
      let uri = avatar.uri;

      // Fix Android path
      if (!uri.startsWith("file://")) {
        uri = "file://" + uri;
      }

      formData.append("avatar", {
        uri: uri,
        name: avatar.fileName || "avatar.jpg",
        type: avatar.type || "image/jpeg",
      } as any);
    }

    try {
      await api.register(formData);

      setFeedbackMessage("Registration successful!");
      setTimeout(() => router.push("/login"), 1000);
    } catch (err: any) {
      console.log("Register error:", err.response?.data);

      const backend = err.response?.data;
      let msg = "Registration failed.";

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

      {/* Avatar Picker */}
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
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        keyboardType="phone-pad"
        onChangeText={setPhoneNumber}
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
          Already have an account?{" "}
          <Text style={{ color: "#10b981" }}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// -----------------------------
// STYLES
// -----------------------------
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
