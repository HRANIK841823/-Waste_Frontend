import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import api from './api';
// --- All external dependencies (axios, Firebase auth mocks) have been removed ---

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(""); 
  const [avatar, setAvatar] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  // State to display feedback messages on the screen (replacing alert())
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Pick avatar from gallery
  const pickAvatar = async () => {
    // Request permissions first (best practice)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setFeedbackMessage('Permission to access media library is required for photo upload.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true, 
      aspect: [1, 1], 
    });

    if (!result.canceled) {
      setAvatar(result.assets[0]);
    }
  };

  const handleRegister = async () => {
    // Clear previous feedback message
    setFeedbackMessage(""); 

    // Basic client-side validation (optional but recommended)
    if (!username || !email || !password) {
      setFeedbackMessage("Please fill in all required fields (Username, Email, Password).");
      return;
    }

    setLoading(true);
    let formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("phoneNumber", phoneNumber);

    if (avatar) {
      // Ensure the file type is handled correctly for the backend
      const fileExtension = avatar.uri.split(".").pop();
      const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
      
      formData.append("avatar", {
        uri: avatar.uri,
        // Use the actual file extension if possible, or stick to .jpg/jpeg for simplicity
        name: `avatar.${fileExtension || 'jpg'}`, 
        type: mimeType,
      } as any);
    }

    try {
      await api.register(formData);
      // ✅ Success: Set success feedback and navigate
      setFeedbackMessage("Registration successful! Redirecting to login...");
      // Use setTimeout to allow the user to see the success message briefly
      setTimeout(() => {
        router.push("/login");
      }, 1000); 
      
    } catch (err: any) {
      console.log("Register error:", err.response?.data || err.message);
      
      // ❌ Error Handling Improvement: Extract specific error from the backend
      const backendErrors = err.response?.data;
      let errorMessage = "Registration failed! Please try again.";

      if (backendErrors) {
        // Attempt to extract common error fields (e.g., from Django REST Framework)
        if (backendErrors.email) {
          errorMessage = `Email: ${backendErrors.email[0]}`;
        } else if (backendErrors.username) {
          errorMessage = `Username: ${backendErrors.username[0]}`;
        } else if (backendErrors.password) {
          errorMessage = `Password: ${backendErrors.password[0]}`;
        } else if (backendErrors.detail) { // For generic API errors
          errorMessage = backendErrors.detail;
        }
        // Fallback for non-field errors or other structure
        else if (typeof backendErrors === 'object') {
             errorMessage = Object.values(backendErrors).flat().join(" ");
        }
      } else if (err.message) {
        // Handle network/timeout errors
        errorMessage = `Network Error: ${err.message}`;
      }
      
      // Set the specific error message to display on the screen
      setFeedbackMessage(errorMessage);

    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      {/* Avatar Picker */}
      <TouchableOpacity onPress={pickAvatar} style={{ marginBottom: 20 }}>
        {avatar ? (
          <Image source={{ uri: avatar.uri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text>Pick Avatar</Text>
          </View>
        )}
      </TouchableOpacity>
      
      {/* Feedback Message Display (Replaces alert()) */}
      {feedbackMessage ? (
        <Text style={styles.feedbackText}>{feedbackMessage}</Text>
      ) : null}

      {/* Form Inputs */}
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#555"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#555"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      {/* Phone Number Field */}
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor="#555"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#555"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Register Button */}
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Register</Text>}
      </TouchableOpacity>

      {/* Login Link */}
      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.loginText}>
          Already have an account? <Text style={{ color: "#10b981" }}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
  },
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
    marginBottom: 10,
  },
  btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginText: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
  },
  feedbackText: { // New style for feedback
    textAlign: 'center',
    color: '#EF4444', // Red for errors/feedback
    fontWeight: '600',
    marginBottom: 10,
  }
});