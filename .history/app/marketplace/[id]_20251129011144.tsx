import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { 
    ActivityIndicator, 
    Image, 
    ScrollView, 
    StyleSheet, 
    Text, 
    TouchableOpacity, 
    View,
    Alert,
    Linking // Import Linking for contact actions
} from "react-native";
import API from "../api"; 

// --- Color Palette (Professional) ---
const PRIMARY_BLUE = '#007BFF';    // Main action color
const SUCCESS_GREEN = '#28A745'; // Buy button success color
const WARNING_YELLOW = '#FFC107'; // Owner action note
const TEXT_DARK = '#343A40';
const TEXT_MUTED = '#6C757D';
const BACKGROUND_LIGHT = '#F8F9FA';
const CARD_BG = '#FFFFFF';

// Interfaces for better type safety
interface Product {
  _id: string;
  title: string;
  price: number | string;
  location: string;
  description: string;
  image: string;
  status: 'available' | 'pending' | 'sold';
  seller_id: string; 
  name: string; // The seller's name provided in the item data
}

interface User {
  id: string;
  email: string;
  name: string;
}

// NEW: Interface for Seller Contact Information
interface SellerContact {
    contact_number: string;
    email: string;
}

// Helper function to safely convert values to string for comparison
const safeToString = (val: any) => (val === null || val === undefined ? '' : String(val));


export default function ProductDetails() {
  const params = useLocalSearchParams();
  const id = params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // NEW STATE: To hold seller's contact info
  const [sellerContact, setSellerContact] = useState<SellerContact | null>(null);


  useEffect(() => {
    if (id) {
      const productId = Array.isArray(id) ? id[0] : id;
      fetchProductAndCurrentUser(productId);
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchCurrentUserProfile = async () => {
    try {
      const res = await API.getProfile();
      setCurrentUser(res.data);
    } catch (err) {
      setCurrentUser(null);
    }
  };

  // NEW: Function to fetch the seller's public contact info
  const fetchSellerContact = async (sellerId: string) => {
    try {
      // Assuming you have an API endpoint like /api/seller/profile/:id that returns { contact_number, email }
      const res = await API.getSellerContact(sellerId);
      setSellerContact(res.data as SellerContact);
    } catch (e) {
      console.log("Failed to fetch seller contact:", e);
      setSellerContact(null);
    }
  };


  const fetchProductAndCurrentUser = async (productId: string) => {
    setLoading(true);

    // Fetch product details and current user profile in parallel
    const [productRes] = await Promise.all([
      API.getItemDetail(productId).catch(e => { console.log("Product error:", e); return null; }),
      fetchCurrentUserProfile(), // This sets currentUser state
    ]);

    if (productRes?.data) {
      const loadedProduct = productRes.data as Product;
      setProduct(loadedProduct);
        
      // If the product is already pending/sold, fetch seller contact immediately 
      // (assuming contact is available upon transaction initiation or completion)
      if (loadedProduct.status !== 'available') {
        fetchSellerContact(loadedProduct.seller_id);
      }
      
    } else {
      Alert.alert("Error", "Failed to load product details.");
    }

    setLoading(false);
  };

  const handleBuy = async () => {
    if (!product || !id) return;
    
    // Quick check to prevent buying if not logged in (assuming API handles this too)
    if (!currentUser) {
        Alert.alert("Login Required", "You must be logged in to purchase an item.");
        router.push('/login'); // Navigate to login route
        return;
    }

    try {
      await API.buyItem(id as string);
      
      Alert.alert("Success! 🎉", `Your request to buy "${product.title}" has been sent. The seller's contact information will now be displayed.`);
      
      // 1. Update status in local state
      setProduct((prev) => (prev ? { ...prev, status: 'pending' } : null));
      
      // 2. Fetch the seller's contact information immediately after successful purchase request
      fetchSellerContact(product.seller_id);
      
    } catch (err) {
      const specificError = err.response?.data?.error || err.response?.data?.detail || err.message;

      console.log("Buy error:", err.response?.data || err.message);
      Alert.alert("Purchase Failed", specificError); 
    }
  };
  
  const handleEdit = () => {
      if (id) {
          router.push(`/(tabs)/edit/${id}`);
      }
  };

  // --- Ownership Check ---
  const loggedInUserId = safeToString(currentUser?.id);
  const productSellerId = safeToString(product?.seller_id);
  const isProductOwner = loggedInUserId !== '' && productSellerId !== '' && productSellerId === loggedInUserId;

  // --- Status Checks ---
  const isSold = product?.status === 'sold';
  const isPending = product?.status === 'pending';
  // Contact should be shown if product is pending, sold, OR if current user is the owner
  const showContactInfo = sellerContact || isProductOwner;

  if (loading) {
    return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={SUCCESS_GREEN} />
            <Text style={{ color: TEXT_MUTED, marginTop: 10 }}>Loading details...</Text>
        </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 18, color: TEXT_DARK, marginBottom: 10 }}>Product not found!</Text>
        <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: PRIMARY_BLUE, fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }


  // --- Seller Contact Card Component ---
  const SellerContactCard = ({ contact }: { contact: SellerContact }) => (
    <View style={styles.contactCard}>
      <Text style={styles.contactHeader}>Seller Contact Information</Text>
      <View style={styles.contactRow}>
        <Ionicons name="call-outline" size={20} color={SUCCESS_GREEN} />
        <Text style={styles.contactLabel}>Phone:</Text>
        <TouchableOpacity onPress={() => contact.contact_number && Linking.openURL(`tel:${contact.contact_number}`)}>
          <Text style={styles.contactValueLink} numberOfLines={1}>{contact.contact_number || 'N/A'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.contactRow}>
        <Ionicons name="mail-outline" size={20} color={PRIMARY_BLUE} />
        <Text style={styles.contactLabel}>Email:</Text>
        <TouchableOpacity onPress={() => contact.email && Linking.openURL(`mailto:${contact.email}`)}>
          <Text style={styles.contactValueLink} numberOfLines={1}>{contact.email || 'N/A'}</Text>
        </TouchableOpacity>
      </View>
      {!isProductOwner && <Text style={styles.contactNote}>Use this information to arrange pickup/payment.</Text>}
    </View>
  );
  
  
  return (
    <ScrollView style={styles.container}>
      
      {/* --- Header & Image --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={TEXT_DARK} />
        </TouchableOpacity>
        <Image source={{ uri: product.image }} style={styles.image} />
      </View>
      
      <View style={styles.detailsSection}>
        {/* --- Title and Price Row --- */}
        <View style={styles.titleRow}>
          <Text style={styles.name}>{product.title}</Text>
          <Text style={styles.price}>
            {typeof product.price === "number" && product.price > 0 ? `$${product.price.toFixed(2)}` : 'FREE'}
          </Text>
        </View>
        
        {/* --- Location and Status Badges --- */}
        <View style={styles.metadataRow}>
          <Text style={styles.location}>
            <Ionicons name="location-outline" size={14} color={TEXT_MUTED} /> {product.location}
          </Text>
          {isSold && <Text style={[styles.statusBadge, styles.soldBadge]}>SOLD</Text>}
          {isPending && !isSold && <Text style={[styles.statusBadge, styles.pendingBadge]}>PENDING</Text>}
        </View>
        
        <View style={styles.divider} />

        {/* --- Seller Profile Section --- */}
        <View style={styles.sellerContainer}>
          <Ionicons name="person-circle-outline" size={30} color={TEXT_DARK} />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.sellerTitle}>Listed by</Text>
            <Text style={styles.sellerName}>{product.name || 'Anonymous User'}</Text>
            {isProductOwner && <Text style={styles.ownerText}> (This is your listing)</Text>}
          </View>
        </View>
        
        {/* --- Seller Contact Card (Shown only if contact is fetched or if current user is owner) --- */}
        {showContactInfo && sellerContact && (
          <SellerContactCard contact={sellerContact} />
        )}
        
        <View style={styles.divider} />
        
        {/* --- Description --- */}
        <Text style={styles.sectionHeader}>Product Description</Text>
        <Text style={styles.descriptionText}>
          {product.description || "No detailed description was provided for this item."}
        </Text>

        <View style={styles.divider} />
        
        {/* --- Action Buttons --- */}
        {!isProductOwner ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleBuy}
            style={styles.buyButtonWrapper}
            disabled