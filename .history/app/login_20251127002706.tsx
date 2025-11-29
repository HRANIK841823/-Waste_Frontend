import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import api from './api';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { width } = Dimensions.get('window');

  const handleLogin = async () => {
    Keyboard.dismiss(); // hide keyboard
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      alert("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.login(trimmedEmail, trimmedPassword);

      // Save tokens
      await AsyncStorage.setItem("access", res.data.access);
      await AsyncStorage.setItem("refresh", res.data.refresh);

      router.replace("/profile");
    } catch (err) {
      console.log("Login error:", err.response?.data || err.message);
      alert(err.response?.data?.detail || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Curved background */}
      <View style={styles.headerBackground}>
        <Svg height="160" width={width}>
          <Path d={`M0,80 Q${width / 2},160 ${width},80 L${width},0 L0,0 Z`} fill="#26A65B" />
        </Svg>
      </View>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
      </View>

      {/* Login Form */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Good to see you back!</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
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
          style={[styles.button, (!email || !password || loading) && { backgroundColor: '#999' }]}
          onPress={handleLogin}
          disabled={!email || !password || loading}
        >
          <Text style={styles.buttonText}>{loading ? "Logging in..." : "Next"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.createAccount}>
            Don’t have an account? <Text style={styles.link}>Create one</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/start')}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBackground: { position: 'absolute', top: 0, left: 0 },
  logoContainer: { alignItems: 'center', marginTop: 80 },
  logo: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#fff' },
  formContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 30,
    marginHorizontal: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  title: { fontSize: 28, fontWeight: '700', color: '#111' },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 30 },
  input: {
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
  },
  button: {
    backgroundColor: '#26A65B',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  createAccount: { marginTop: 20, textAlign: 'center', color: '#555', fontSize: 14 },
  link: { color: '#26A65B', fontWeight: '600' },
  cancel: { marginTop: 10, textAlign: 'center', color: '#999' },
});
