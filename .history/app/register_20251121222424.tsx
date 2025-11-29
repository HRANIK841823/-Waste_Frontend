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

    // IMPORTANT: match backend
    formData.append("phoneNumber", phoneNumber);

    if (avatar) {
      const ext = avatar.uri.split(".").pop();
      const mime = ext === "png" ? "image/png" : "image/jpeg";

      formData.append("avatar", {
        uri: avatar.uri,
        name: `avatar.${ext}`,
        type: mime,
      });
    }

    try {
      await api.register(formData);

      setFeedbackMessage("Registration successful!");
      setTimeout(() => router.push("/login"), 1000);
    } catch (err) {
      console.log("Register error:", err.response?.data);

      const backend = err.response?.data;
      let msg = "Registration failed.";

      if (backend && typeof backend === "object") {
        msg = Object.entries(backend)
          .map(([field, error]) => `${field}: ${error}`)
          .join("\n");
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
            <Text>Pick Avatar</Tex
