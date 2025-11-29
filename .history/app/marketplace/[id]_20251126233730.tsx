import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import API from "../api";

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const res = await API.getItemDetail(id);
      setProduct(res.data);
    } catch (err) {
      console.log("Fetch product error:", err.response?.data || err.message || err);
      alert("Failed to load product.");
    }
  };

  const handleBuy = async () => {
    try {
      await API.buyItem(id);
      alert(`You bought ${product.title}!`);
    } catch (err) {
      console.log("Buy error:", err.response?.data || err.message || err);
      alert("Failed to buy item.");
    }
  };

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Product not found!</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: product.image_url }} style={styles.image} />
      <Text style={styles.name}>{product.title}</Text>
      <Text style={styles.price}>{typeof product.price === "number" ? product.price.toFixed(2) : product.price}</Text>
      <Text style={styles.location}>Location: {product.location}</Text>
      <Text style={styles.description}>{product.description || "No description available."}</Text>

      <TouchableOpacity activeOpacity={0.8} onPress={handleBuy} style={styles.buyButtonWrapper}>
        <LinearGradient
          colors={["#00E676", "#00BFA5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buyButton}
        >
          <Text style={styles.buyButtonText}>Buy Now</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Keep all your original styles exactly the same
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8", padding: 15 },
  image: { width: "100%", height: 250, borderRadius: 15, marginBottom: 15 },
  name: { fontSize: 24, fontWeight: "700", marginBottom: 8, color: "#333" },
  price: { fontSize: 20, fontWeight: "600", color: "#00C853", marginBottom: 8 },
  location: { fontSize: 14, color: "#777", marginBottom: 15 },
  description: { fontSize: 16, color: "#555", lineHeight: 22, marginBottom: 25 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  buyButtonWrapper: { marginBottom: 30 },
  buyButton: {
    paddingVertical: 16,
    borderRadius: 35,
    alignItems: "center",
    shadowColor: "#00E676",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  buyButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
