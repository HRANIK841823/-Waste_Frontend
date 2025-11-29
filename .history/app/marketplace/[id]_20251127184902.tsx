import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import API from "../api";

// Interfaces for better type safety
interface Product {
  _id: string;
  title: string;
  price: number | string;
  location: string;
  description: string;
  image: string;
  status: 'available' | 'pending' | 'sold';
  seller_id: string; // Renamed from owner_id to seller_id to match your data
  name: string; // The seller name provided in the item data
}

interface User {
  id: string;
  email: string;
  name: string;
  // Add other profile fields you get from the API
}

interface SellerInfo {
  name: string;
  email: string;
  // Add other seller-specific details you want to show
}

export default function ProductDetails() {
  const params = useLocalSearchParams();
  const id = params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  // State to hold the logged-in user's data
  const [currentUser, setCurrentUser] = useState<User | null>(null); 
  // State to hold the full seller's info fetched via API
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null); 


  useEffect(() => {
    if (id) {
      const productId = Array.isArray(id) ? id[0] : id; 
      fetchProductAndUserDetails(productId); 
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchCurrentUserProfile = async () => {
    try {
      // 1. FETCH LOGGED-IN USER PROFILE (using /auth/me/)
      const res = await API.getProfile(); 
      // Assuming your /auth/me/ endpoint returns { id, email, name, ... }
      setCurrentUser(res.data);
      return res.data.id; // Return the ID for the main function
    } catch (err) {
      console.log("Fetch current user error:", err.response?.data || err.message);
      // If fetch fails (e.g., token expired), assume no logged-in user
      return null; 
    }
  };
  
  const fetchSellerDetails = async (sellerId: string) => {
    try {
      // 2. FETCH SELLER PROFILE (using the new /users/{id}/ endpoint)
      const res = await API.getUserProfile(sellerId);
      setSellerInfo(res.data);
    } catch (err) {
      console.log("Fetch seller error:", err.response?.data || err.message);
      // Fallback to basic info if API call fails
      setSellerInfo({ name: 'Unknown Seller', email: 'N/A' });
    }
  };

  const fetchProductAndUserDetails = async (productId: string) => {
    setLoading(true);
    
    // Fetch product details and current user profile in parallel
    const [productRes, currentUserId] = await Promise.all([
      API.getItemDetail(productId).catch(e => { console.log("Product error:", e); return null; }),
      fetchCurrentUserProfile(),
    ]);
    
    if (productRes?.data) {
      const productData = productRes.data as Product;
      setProduct(productData);
      
      // Fetch seller details only if product data is available
      if (productData.seller_id) {
        await fetchSellerDetails(productData.seller_id);
      }
    } else {
      alert("Failed to load product.");
    }
    
    setLoading(false);
  };

  const handleBuy = async () => {
    if (!product || !id) return;

    try {
      await API.buyItem(id as string); 
      alert(`You successfully requested to buy ${product.title}!`);
      setProduct((prev) => (prev ? { ...prev, status: 'pending' } : null)); 
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
  
  // 3. ROBUST OWNERSHIP CHECK: Convert IDs to strings for reliable comparison
  const safeToString = (val: any) => (val === null || val === undefined ? '' : String(val));
  
  const loggedInUserId = safeToString(currentUser?.id);
  const productSellerId = safeToString(product.seller_id);
  
  const isProductOwner = loggedInUserId !== '' && productSellerId !== '' && productSellerId === loggedInUserId;
  
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
      
      {/* 4. Display Seller Information */}
      <View style={styles.sellerContainer}>
        <Ionicons name="person-circle" size={24} color="#333" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.sellerTitle}>Seller</Text>
          <Text style={styles.sellerName}>{sellerInfo?.name || product.name}</Text>
          {sellerInfo?.email && <Text style={styles.sellerDetail}>{sellerInfo.email}</Text>}
          {isProductOwner && <Text style={{ color: '#00C853', fontWeight: 'bold' }}> (You)</Text>}
        </View>
      </View>

      <Text style={styles.description}>
        {product.description || "No description available."}
      </Text>

      {/* CONDITIONAL RENDERING: Only show Buy button if NOT the product owner */}
      {!isProductOwner && (
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
      )}
      
      {isProductOwner && (
        <View style={styles.ownerActionNote}>
          <Text style={styles.ownerActionText}>This is your listing. You cannot buy your own item.</Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/edit-product', params: { id: product._id } })} style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit/Manage Listing</Text>
          </TouchableOpacity>
        </View>
      )}

    </ScrollView>
  );
}

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
  },
  // NEW Styles for Seller Info and Owner Action
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sellerTitle: { fontSize: 12, color: '#777' },
  sellerName: { fontSize: 16, fontWeight: '600', color: '#333' },
  sellerDetail: { fontSize: 14, color: '#555' },
  ownerActionNote: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFBEA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFC107',
    marginVertical: 15,
  },
  ownerActionText: {
    color: '#856404',
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: '#3F51B5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});