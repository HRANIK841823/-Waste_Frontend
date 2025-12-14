import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Background Decorative Circle */}
      <View style={styles.bgCircle}></View>

      <Image source={require("../../assets/images/logo.png")} style={styles.logo} />

      <Text style={styles.title}>!Waste</Text>
      <Text style={styles.subtitle}>Transform Trash into Treasure</Text>

      {/* Gradient Button */}
      <TouchableOpacity onPress={() => router.push("/login")} activeOpacity={0.8}>
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>Let’s get started</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginLinkContainer}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.linkText}>I already have an account</Text>
        <View style={styles.arrowCircle}>
          <Text style={styles.arrowText}>→</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  bgCircle: {
    position: "absolute",
    top: -150,
    right: -100,
    width: 300,
    height: 300,
    backgroundColor: "#A5D6A7",
    borderRadius: 150,
    opacity: 0.2,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 40,
    fontWeight: "800",
    color: "#1B5E20",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: "#4B5563",
    marginVertical: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 80,
    borderRadius: 35,
    marginTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  loginLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 28,
  },
  linkText: {
    color: "#059669",
    fontSize: 16,
    fontWeight: "500",
  },
  arrowCircle: {
    backgroundColor: "#10B981",
    borderRadius: 50,
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  arrowText: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
  },
});