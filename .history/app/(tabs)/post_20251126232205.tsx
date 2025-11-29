import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import API from "../api";

export default function Post() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // simple text URL
  const [loading, setLoading] = useState(false);

  const submitPost = async () => {
    if (!title || !description || !category || !price || !imageUrl || !location) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        description,
        category,
        price: parseFloat(price),
        image_url: imageUrl, // simple text
        location,
      };

      const res = await API.createItem(payload);

      if (res.status === 201 || res.status === 200) {
        Alert.alert("Success", "Item posted successfully!");
        router.push("/marketplace"); // navigate to marketplace
      } else {
        console.log("Unexpected response:", res.data);
        Alert.alert("Error", "Failed to post item.");
      }
    } catch (err) {
      console.log(err.response?.data || err.message || err);
      Alert.alert("Error", "Failed to post item. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.header}>Post Waste Item ♻️</Text>

      <Text style={styles.label}>Title *</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Item title" />

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Item description"
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Category *</Text>
      <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="Category" />

      <Text style={styles.label}>Price *</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="Price"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Location *</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Location" />

      <Text style={styles.label}>Image URL *</Text>
      <TextInput
        style={styles.input}
        value={imageUrl}
        onChangeText={setImageUrl}
        placeholder="Paste your IMGBB image URL here"
      />

      <TouchableOpacity style={styles.submitButton} onPress={submitPost} disabled={loading}>
        <Text style={styles.submitButtonText}>{loading ? "Posting..." : "Post Item"}</Text>
      </TouchableOpacity>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}
// --- Stylesheet ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#125e17',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  imageButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  imageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  submitButton: {
    backgroundColor: '#125e17',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 5,
    marginBottom: 5,
  },
});