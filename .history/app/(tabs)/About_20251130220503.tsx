import { useRouter } from "expo-router";
import React from "react";
// 🚨 CHANGE 1: Import TouchableOpacity from 'react-native', not 'react-native-gesture-handler'
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// --- THEME COLORS ---
const PRIMARY_GREEN = "#388E3C"; // Professional Dark Green (e.g., Pine, Forest)
const LIGHT_GREEN_ACCENT = "#C8E6C9"; // Very light green for section background
const ACCENT_TEXT = "#1B5E20"; // Darker green for titles/links
const NEUTRAL_GRAY = "#616161"; // Darker gray for primary body text
// --------------------

// --- PROFESSIONAL PLACEHOLDERS ---
const COMPANY_NAME = "Not.Waste";
const WEBSITE_URL = "https://www.notwaste.com";  // **[REPLACE WITH YOUR WEBSITE LINK]**
const SUPPORT_EMAIL = "anik841823@gmail.com";    // **[REPLACE WITH YOUR SUPPORT EMAIL]**
const SUPPORT_PHONE = "01883096058";            // 🚨 CHANGE 2: Added Support Phone Number
const DEVELOPER_NAME = "Habibur Rahman Anik";             // **[REPLACE WITH YOUR NAME]**
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

  // 🚨 CHANGE 3: Function to open phone dialer
  const handleOpenPhone = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`);
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

      {/* Website Link - Now styled as a Button */}
      <TouchableOpacity onPress={handleOpenWebsite} style={styles.websiteButton}>
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
        <TouchableOpacity onPress={handleOpenEmail} style={styles.contactButton}>
          <Text style={styles.contactLink}>{SUPPORT_EMAIL}</Text>
        </TouchableOpacity>
        
        {/* 🚨 CHANGE 4: Phone Link */}
        <TouchableOpacity onPress={handleOpenPhone} style={styles.contactButton}>
          <Text style={styles.contactLink}>Call us at: {SUPPORT_PHONE}</Text>
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
    fontSize: 26, // Slightly larger
    fontWeight: "800",
    color: PRIMARY_GREEN, // Green title
    marginBottom: 15,
  },
  text: {
    fontSize: 15,
    color: NEUTRAL_GRAY, // Professional dark gray text
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
    fontWeight: "500",
  },
  // New style for the Website Button
  websiteButton: {
    backgroundColor: PRIMARY_GREEN, // Green background for the button
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25, // Rounded corners for a modern look
    marginTop: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  websiteLink: {
    fontSize: 16,
    color: "#FFFFFF", // White text on green background
    fontWeight: "700",
    // textDecorationLine: "underline", // Removed underline for button look
  },
  separator: {
    width: "80%",
    height: 1,
    backgroundColor: LIGHT_GREEN_ACCENT, // Light green separator
    marginVertical: 20,
  },
  contactSection: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: LIGHT_GREEN_ACCENT, // Light green background
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PRIMARY_GREEN, // Dark green border
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: ACCENT_TEXT, // Darker green title
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: NEUTRAL_GRAY,
    textAlign: "center",
    lineHeight: 20,
  },
  contactButton: {
    marginTop: 8,
    marginBottom: 4, // Add a slight space between contact buttons
  },
  contactLink: {
    fontSize: 15,
    color: PRIMARY_GREEN, // Primary green for the email/phone link
    fontWeight: "700", // Bolder link
    textDecorationLine: "underline",
  },
  developerInfo: {
    fontSize: 13,
    color: NEUTRAL_GRAY,
    marginTop: 15,
    fontStyle: "italic",
  },
});