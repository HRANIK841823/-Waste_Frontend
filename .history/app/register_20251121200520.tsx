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
    setFeedbackMessage(""); // 1. Clear previous feedback

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
    // Your serializer expects 'phoneNumber' to be camelCase based on your client code
    formData.append("phoneNumber", phoneNumber); 

    if (avatar) {
      // Robust file type handling
      const fileExtension = avatar.uri.split(".").pop();
      const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
      
      formData.append("avatar", {
        uri: avatar.uri,
        name: `avatar.${fileExtension || 'jpg'}`, 
        type: mimeType,
      } as any);
    }

    try {
      // 2. Attempt registration
      await api.register(formData);
      
      // ✅ Success 
      setFeedbackMessage("Registration successful! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1000); 
      
    } catch (err: any) {
      // 3. Robust Error Handling Block
      console.log("Register error:", err.response?.data || err.message);
      
      const backendErrors = err.response?.data;
      let errorMessage = "Registration failed! A network or server error occurred.";

      if (backendErrors && typeof backendErrors === 'object') {
        // Try to join all error messages into one string
        const allErrors = Object.values(backendErrors)
          .flat() // Flatten any arrays of errors (e.g., ["This user already exists."])
          .map(e => {
              // Capitalize the error if it's a string, or just use the value
              return typeof e === 'string' ? e.charAt(0).toUpperCase() + e.slice(1) : String(e);
          });
          
        if (allErrors.length > 0) {
            // Display the first few unique errors or a summary
            errorMessage = allErrors.join(" ");
            
            // For better UX, you might want to prepend the field name
            // Example: "Username: This field is required. Email: Invalid email format."
            const detailedErrors = [];
            for (const key in backendErrors) {
                const errors = Array.isArray(backendErrors[key]) ? backendErrors[key] : [backendErrors[key]];
                // Use a user-friendly field name
                const fieldName = key === 'non_field_errors' ? '' : key.charAt(0).toUpperCase() + key.slice(1) + ': ';
                detailedErrors.push(fieldName + errors.join(" "));
            }
            errorMessage = detailedErrors.join(" | ");

        } else if (backendErrors.detail) { // For generic errors like 401 Unauthorized
            errorMessage = backendErrors.detail;
        }

      } else if (err.message && !err.response) {
        // Handle network/timeout errors (when err.response is undefined)
        errorMessage = `Network Error: ${err.message}`;
      }
      
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