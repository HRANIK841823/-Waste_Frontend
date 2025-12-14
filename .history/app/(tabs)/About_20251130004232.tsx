import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function About() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require("../assets/logo.png")} style={styles.logo} />

      {/* Title */}
      <Text style={styles.title}>About !Waste</Text>

      {/* Description */}
      <Text style={styles.text}>
        Welcome to Not.Waste — a smart and sustainable platform designed to give waste a second life.
        Our mission is simple: turn waste into worth by connecting people who want to sell, donate, or
        recycle unused materials with those who can make use of them.
      </Text>

      <Text style={[styles.text, { marginTop: 20 }]}>
        If you need help or you have any questions, feel free to contact me by email.
      </Text>

      {/* Email */}
      <Text style={styles.email}>hello@mydomain.com</Text>

      {/* Bottom Navigation */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.push("/profile")}>
          <Ionicons name="person-outline" size={24} color="#26A65B" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/")}>
          <Ionicons name="home-outline" size={24} color="#26A65B" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/marketplace")}>
          <Ionicons name="cart-outline" size={24} color="#26A65B" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/about")}>
          <Ionicons name="information-circle-outline" size={24} color="#26A65B" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
  },
  email: {
    color: "#26A65B",
    fontWeight: "600",
    marginTop: 10,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#eee",
    position: "absolute",
    bottom: 0,
    backgroundColor: "#fff",
  },
});