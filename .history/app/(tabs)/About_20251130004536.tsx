import { useRouter } from "expo-router";
import React from "react";
import { Image, Linking, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

// --- PROFESSIONAL PLACEHOLDERS ---
const COMPANY_NAME = "Not.Waste";
const WEBSITE_URL = "https://www.notwaste.com"; // **[REPLACE WITH YOUR WEBSITE LINK]**
const SUPPORT_EMAIL = "anik841823@gmail.com";    // **[REPLACE WITH YOUR SUPPORT EMAIL]**
const DEVELOPER_NAME = "Habibur Rahman Anik";             // **[REPLACE WITH YOUR NAME]**
// ----------------------------------

export default function About() {
  const router = useRouter();

  // Function to open the website in a browser
  const handleOpenWebsite = () => {
    Linking.openURL(WEBSITE_URL);
  };

  // Function to open email client
  const handleOpenEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require("../../assets/images/logo.png")} style={styles.logo} />

      {/* Title */}
      <Text style={styles.title}>About {COMPANY_NAME}</Text>

      {/* Mission/Description */}
      <Text style={styles.text}>
        Welcome to **{COMPANY_NAME}**, a dedicated and sustainable platform committed to maximizing resource utilization.
        Our core mission is to transform unused materials—whether for sale, donation, or recycling—into valuable resources by seamlessly connecting sellers and contributors with relevant consumers and recyclers.
      </Text>

      {/* Website Link */}
      <TouchableOpacity onPress={handleOpenWebsite} style={styles.linkContainer}>
        <Text style={styles.websiteLink}>Visit Our Official Website</Text>
      </TouchableOpacity>

      {/* Horizontal Rule/Separator */}
      <View style={styles.separator} />

      {/* Contact & Support Section */}
      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Contact & Support</Text>
        <Text style={styles.contactText}>
          For inquiries, technical support, or partnership opportunities, please contact our team directly.
        </Text>
        
        {/* Email Link */}
        <TouchableOpacity onPress={handleOpenEmail} style={{ marginTop: 8 }}>
          <Text style={styles.emailLink}>{SUPPORT_EMAIL}</Text>
        </TouchableOpacity>
        
        {/* Developer Info */}
        <Text style={styles.developerInfo}>
          Application developed and maintained by {DEVELOPER_NAME}.
        </Text>
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
    fontSize: 24, // Slightly larger
    fontWeight: "800", // Bolder
    color: "#333", // Darker text for professionalism
    marginBottom: 15,
  },
  text: {
    fontSize: 15, // Slightly larger for readability
    color: "#555",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
    fontWeight: "500", // Medium weight
  },
  linkContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  websiteLink: {
    fontSize: 16,
    color: "#007AFF", // Standard professional blue link color
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  separator: {
    width: "80%",
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 20,
  },
  contactSection: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9", // Light background for contrast
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  emailLink: {
    fontSize: 15,
    color: "#26A65B", // Your original green, slightly emphasized
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  developerInfo: {
    fontSize: 13,
    color: "#999",
    marginTop: 15,
    fontStyle: "italic",
  },
  // Removed unused 'email' and 'navbar' styles for cleaner code.
});