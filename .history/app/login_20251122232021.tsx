import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import api from "../app/api";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { width } = Dimensions.get("window");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) return;
    setLoading(true);
    try {
      const res = await api.login(username, password);

      await AsyncStorage.setItem("access", res.data.access);
      await AsyncStorage.setItem("refresh", res.data.refresh);

      router.replace("/profile");
    } catch (err) {
      console.log("Login error:", err.response?.data || err.message);
      alert("Login failed! Check credentials or backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Curved green background */}
      <View style={styles.headerBackground}>
        <Svg height="160" width={width}>
          <Path d={`M0,80 Q${width / 2},160 ${width},80 L${width},0 L0,0 Z`} fill="#26A65B" />
        </Svg>
      </View>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={require("../assets/images/logo.png")} style={styles.logo} />
      </View>

      {/* Form Card */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Welcome back!</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#aaa"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.button, (!username || !password) && { backgroundColor: "#999" }]}
          onPress={handleLogin}
          disabled={!username || !password || loading}
        >
          <Text style={styles.buttonText}>{loading ? "Logging in..." : "Login"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={styles.createAccount}>
            Don’t have an account? <Text style={styles.link}>Register</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/start")}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBackground: { position: "absolute", top: 0, left: 0 },
  logoContainer: { alignItems: "center", marginTop: 80 },
  logo: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#fff" },
  formContainer: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 30,
    marginHorizontal: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  title: { fontSize: 28, fontWeight: "700", color: "#111" },
  subtitle: { fontSize: 15, color: "#666", marginBottom: 30 },
  input: {
    backgroundColor: "#F3F3F3",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 15,
    color: "#333",
  },
  button: { backgroundColor: "#26A65B", paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  createAccount: { marginTop: 20, textAlign: "center", color: "#555", fontSize: 14 },
  link: { color: "#26A65B", fontWeight: "600" },
  cancel: { marginTop: 10, textAlign: "center", color: "#999" },
});
