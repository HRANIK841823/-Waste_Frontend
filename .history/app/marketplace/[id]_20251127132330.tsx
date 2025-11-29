import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import API from "../api"; // Import your configured API module

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // In ProductDetails.tsx

// ...
useEffect(() => {
    if (id) {
        // Safely convert id to a single string (handles string array or single string)
        const productId = Array.isArray(id) ? id[0] : id; 
        fetchProduct(productId); 
    } else {
        setLoading(false);
    }
}, [id]);
// ...

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      // Use the exported function
      const res = await API.getItemDetail(productId); 
      setProduct(res.data);
    } catch (err) {
      console.log("Fetch product error:", err.response?.data || err.message || err);
      alert("Failed to load product.");
    } finally {
        setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!product || !id) return;

    try {
      // Use the exported function
      await API.buyItem(id as string); 
      alert(`You successfully requested to buy ${product.title}!`);
      // Optimistically update the status
      setProduct((prev) => ({ ...prev, status: 'pending' })); 
    } catch (err) {
      console.log("Buy error:", err.response?.data || err.message || err);
      alert("Failed to initiate purchase. " + (err.response?.data?.detail || err.message));
    }
  };

  if (loading) {
    return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#00C853" />
        </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Product not found!</Text>
        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => router.back()}>
            <Text style={{ color: '#00C853', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Determine if the Buy button should be disabled
  const isSold = product.status === 'sold';


  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Image source={{ uri: product.image }} style={styles.image} />
      </View>
      
      <Text style={styles.name}>{product.title}</Text>
      <Text style={styles.price}>
        {typeof product.price === "number" ? `$${product.price.toFixed(2)}` : product.price}
      </Text>
      <Text style={styles.location}>Location: {product.location}</Text>
      
      {isSold && (
        <Text style={styles.soldBadge}>SOLD OUT</Text>
      )}

      <Text style={styles.description}>
        {product.description || "No description available."}
      </Text>

      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={handleBuy} 
        style={styles.buyButtonWrapper}
        disabled={isSold}
      >
        <LinearGradient
          colors={isSold ? ["#ccc", "#aaa"] : ["#00E676", "#00BFA5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buyButton}
        >
          <Text style={styles.buyButtonText}>
            {isSold ? 'Item Sold' : 'Buy Now'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

// (Styles remain UNCHANGED)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8", padding: 15 },
  header: { position: 'relative', marginBottom: 15 },
  backButton: { position: 'absolute', top: 10, left: 10, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 20, padding: 5 },
  image: { width: "100%", height: 250, borderRadius: 15, marginBottom: 0 },
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
  soldBadge: {
    backgroundColor: 'red',
    color: 'white',
    padding: 8,
    borderRadius: 8,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
  }
});