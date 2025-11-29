import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "./api";

// --- Professional Color Palette ---
const PRIMARY_BRAND = '#1E88E5'; // A strong, reliable blue
const ACTION_GREEN = '#28A745'; // Green for the main action (Register)
const BACKGROUND_LIGHT = '#F4F7F9'; // Very light grey background
const CARD_BG = '#FFFFFF'; // Pure white for card/input background
const TEXT_DARK = '#333333';
const TEXT_MUTED = '#888888';
const ERROR_RED = '#DC3545';
const BORDER_LIGHT = '#E0E0E0';

export default function Register() {
  const router = useRouter();

  // --- STATE VARIABLES ---
  const [username, setUsername] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(""); 
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const handleRegister = async () => {
    setFeedbackMessage("");

    if (!email || !password || !password2 || !username || !phoneNumber) {
      setFeedbackMessage("Please fill all required fields.");
      return;
    }
    if (password !== password2) {
      setFeedbackMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email,
        password,
        password2,
        username: username,
        phone_number: phoneNumber,
        avatar: avatar,
      };

      await api.register(payload); 

      setFeedbackMessage("Registration successful! Redirecting to login...");
      setTimeout(() => router.replace("/login"), 800);
    } catch (err) {
      console.log("Register error:", err.response?.data || err.message);

      let msg = "Registration failed. Please check your details.";
      const backend = err.response?.data;

      if (backend && typeof backend === "object") {
        msg = Object.entries(backend)
          .map(([field, errors]) => {
            const fieldName = field.replace('_', ' ').replace('password2', 'confirm password');
            const text = Array.isArray(errors) ? errors.join(", ") : errors;
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}: ${text}`;
          })
          .join("\n");
      }

      setFeedbackMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>Join our community today.</Text>

          <View style={styles.formCard}>
            
            {/* Username Input */}
            <TextInput
              style={styles.input}
              placeholder="Username *"
              placeholderTextColor={TEXT_MUTED}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            {/* Email Input */}
            <TextInput
              style={styles.input}
              placeholder="Email Address *"
              placeholderTextColor={TEXT_MUTED}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {/* Phone Number Input */}
            <TextInput
              style={styles.input}
              placeholder="Phone Number *"
              value={phoneNumber}
              placeholderTextColor={TEXT_MUTED}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />

            {/* Avatar URL Input */}
            <TextInput
              style={styles.input}
              placeholder="Avatar URL (Optional)"
              value={avatar}
              placeholderTextColor={TEXT_MUTED}
              onChangeText={setAvatar}
            />
            
            {/* Password Input */}
            <TextInput
              style={styles.input}
              placeholder="Password *"
              placeholderTextColor={TEXT_MUTED}
              value={password}
              secureTextEntry
              onChangeText={setPassword}
            />
            
            {/* Confirm Password Input */}
            <TextInput
              style={styles.input}
              placeholder="Confirm Password *"
              placeholderTextColor={TEXT_MUTED}
              secureTextEntry
              value={password2}
              onChangeText={setPassword2}
            />
          </View>

          {/* Registration Button */}
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleRegister} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Register Now</Text>
            )}
          </TouchableOpacity>

          {/* Feedback Message */}
          {feedbackMessage ? (
            <Text style={[styles.feedback, feedbackMessage.includes('successful') ? styles.successFeedback : styles.errorFeedback]}>
              {feedbackMessage}
            </Text>
          ) : null}

          {/* Login Link */}
          <View style={styles.loginLinkContainer}>
            <Text style={styles.linkPrompt}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.loginLink}> Log In</Text>
            </TouchableOpacity>
          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- Professional Stylesheet ---
const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: BACKGROUND_LIGHT 
  },
  container: { 
    flex: 1, 
    paddingHorizontal: 20, 
    backgroundColor: BACKGROUND_LIGHT,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  title: { 
    fontSize: 32, 
    fontWeight: "800", 
    color: PRIMARY_BRAND, 
    textAlign: "center", 
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginBottom: 30,
  },
  formCard: {
    backgroundColor: CARD_BG,
    borderRadius: 10,
    padding: 20,
    marginBottom: 25,
    // Professional subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  input: {
    backgroundColor: BACKGROUND_LIGHT, // Use background light for input fill
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    color: TEXT_DARK,
  },
  button: {
    backgroundColor: ACTION_GREEN,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    // Strong shadow for call-to-action
    shadowColor: ACTION_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: TEXT_MUTED,
    shadowOpacity: 0.1,
    elevation: 1,
  },
  btnText: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "700",
    textTransform: 'uppercase',
  },
  feedback: { 
    textAlign: "center", 
    marginTop: 15, 
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 10,
    fontWeight: '600',
    lineHeight: 20,
  },
  errorFeedback: {
    color: ERROR_RED,
    backgroundColor: '#F8D7DA', // Light background for error
    borderColor: ERROR_RED,
    borderWidth: 1,
  },
  successFeedback: {
    color: ACTION_GREEN,
    backgroundColor: '#D4EDDA', // Light background for success
    borderColor: ACTION_GREEN,
    borderWidth: 1,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  linkPrompt: {
    fontSize: 15,
    color: TEXT_DARK,
  },
  loginLink: {
    fontSize: 15,
    color: PRIMARY_BRAND,
    fontWeight: '600',
    textDecorationLine: 'underline',
  }
});