import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; // Import useSafeAreaInsets
import API from "../api";

// --- Color Palette (Professional) ---
const PRIMARY_BLUE = '#007BFF';    
const SUCCESS_GREEN = '#28A745'; 
const WARNING_YELLOW = '#FFC107'; 
const TEXT_DARK = '#343A40';
const TEXT_MUTED = '#6C757D';
const BACKGROUND_LIGHT = '#F8F9FA';
const CARD_BG = '#FFFFFF';
const BORDER_LIGHT = '#E9ECEF'; 

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
  name: string; 
}

interface User {
  id: string;
  email: string;
  name: string;
  contact_number?: string; 
}

// Interface for Seller Contact Information
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
  const [sellerContact, setSellerContact] = useState<SellerContact | null>(null);

  // Get insets for correct padding in the fixed bottom bar
  const insets = useSafeAreaInsets();


  const fetchCurrentUserProfile = async () => {
    try {
      const res = await API.getProfile();
      setCurrentUser(res.data);
    } catch (err) {
      setCurrentUser(null);
    }
  };

  const fetchSellerContact = async (sellerId: string) => {
    try {
      // If the current user is the seller, use their profile data
      if (currentUser?.id === sellerId) {
          setSellerContact({
            contact_number: currentUser.contact_number || 'N/A',
            email: currentUser.email,
          });
          return;
      }

      // Otherwise, fetch seller's public contact info
      const res = await API.getSellerContact(sellerId);
      setSellerContact(res.data as SellerContact);
    } catch (e) {
      console.log("Failed to fetch seller contact:", e);
      setSellerContact(null);
    }
  };


  const fetchProductAndCurrentUser = async (productId: string) => {
    setLoading(true);

    const [productRes] = await Promise.all([
      API.getItemDetail(productId).catch(e => null),
      fetchCurrentUserProfile(), 
    ]);

    if (productRes?.data) {
      const loadedProduct = productRes.data as Product;
      setProduct(loadedProduct);
        
      if (loadedProduct.status !== 'available' || loadedProduct.seller_id === currentUser?.id) {
        fetchSellerContact(loadedProduct.seller_id);
      }
      
    } else {
      Alert.alert("Error", "Failed to load product details.");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (id) {
      const productId = Array.isArray(id) ? id[0] : id;
      fetchProductAndCurrentUser(productId);
    } else {
      setLoading(false);
    }
  }, [id]); 

  useEffect(() => {
    if (product && (product.status !== 'available' || product.seller_id === currentUser?.id)) {
      fetchSellerContact(product.seller_id);
    }
  }, [currentUser, product]); 


  const handleBuy = async () => {
    if (!product || !id) return;
    
    if (!currentUser) {
        Alert.alert("Login Required", "You must be logged in to purchase an item.");
        router.push('/login'); 
        return;
    }

    try {
      await API.buyItem(id as string);
      
      Alert.alert("Success! 🎉", `Your request to buy "${product.title}" has been sent. The seller's contact information will now be displayed.`);
      
      setProduct((prev) => (prev ? { ...prev, status: 'pending' } : null));
      
      fetchSellerContact(product.seller_id); 
      
    } catch (err) {
      const specificError = err.response?.data?.error || err.response?.data?.detail || err.message;
      Alert.alert("Purchase Failed", specificError); 
    }
  };
  
  const handleEdit = () => {
      if (id) {
          router.push(`/(tabs)/edit/${id}`);
      }
  };

  // --- Ownership and Status Checks ---
  const loggedInUserId = safeToString(currentUser?.id);
  const productSellerId = safeToString(product?.seller_id);
  const isProductOwner = useMemo(() => loggedInUserId !== '' && productSellerId !== '' && productSellerId === loggedInUserId, [loggedInUserId, productSellerId]);

  const isSold = product?.status === 'sold';
  const isPending = product?.status === 'pending';
  const showContactInfo = sellerContact; // sellerContact state is now the source of truth


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
        <TouchableOpacity 
            onPress={() => contact.contact_number && contact.contact_number !== 'N/A' && Linking.openURL(`tel:${contact.contact_number}`)}
            disabled={contact.contact_number === 'N/A'}
        >
          <Text style={[styles.contactValue, contact.contact_number !== 'N/A' && styles.contactValueLink]} numberOfLines={1}>
            {contact.contact_number || 'N/A'}
          </Text>
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
    // Main container now uses flex: 1 for correct fixed positioning
    <SafeAreaView style={styles.safeAreaContainer} edges={['top']}>
      
      {/* --- Scrollable Content --- */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
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
          
          {/* --- Seller Contact Card (Shown if contact is available) --- */}
          {showContactInfo && sellerContact && (
            <SellerContactCard contact={sellerContact} />
          )}
          
          <View style={styles.divider} />
          
          {/* --- Description --- */}
          <Text style={styles.sectionHeader}>Product Description</Text>
          <Text style={styles.descriptionText}>
            {product.description || "No detailed description was provided for this item."}
          </Text>

          {/* The divider below the description ensures content doesn't butt against the fixed bar */}
          <View style={[styles.divider, { marginBottom: 15 }]} /> 
          
        </View>
      </ScrollView>
      
      {/* --- FIXED BOTTOM ACTION BAR (CORRECTED MOBILE STRUCTURE) --- */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom || 15 }]}>
        {!isProductOwner ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleBuy}
            disabled={isSold || isPending || showContactInfo} 
            style={styles.actionButtonContainer}
          >
            <LinearGradient
              colors={(isSold || isPending || showContactInfo) ? ["#aaa", "#888"] : [SUCCESS_GREEN, "#00BFA5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buyButton}
            >
              <Text style={styles.buyButtonText}>
                {isSold ? 'Item Sold' : isPending ? 'Pending: Contact Seller' : showContactInfo ? 'Contact Info Revealed' : 'Request to Buy'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.ownerActionBar}>
            <Text style={styles.ownerActionText}>Manage your listing.</Text>
            <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit/Update Item</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

// --- Professional Stylesheet ---
const styles = StyleSheet.create({
  safeAreaContainer: { 
    flex: 1, // Crucial for fixing the bottom bar
    backgroundColor: BACKGROUND_LIGHT 
},
  scrollContent: { 
    // No need for explicit bottom padding here, the fixed bar is outside the ScrollView
},
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: BACKGROUND_LIGHT },
  
  // --- Image & Header ---
  header: { position: 'relative', marginBottom: 0 },
  backButton: { 
    position: 'absolute', top: 30, left: 15, zIndex: 10, 
    backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 20, 
    padding: 8,
  },
  image: { width: "100%", height: 300, marginBottom: 0 },
  
  // --- Details Section (Overlapping the image) ---
  detailsSection: {
    paddingHorizontal: 15, // Keep padding inside the section
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    paddingTop: 15,
  },
  
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  name: { fontSize: 28, fontWeight: "800", color: TEXT_DARK, flex: 1, paddingRight: 10 },
  price: { fontSize: 24, fontWeight: "700", color: SUCCESS_GREEN },
  
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  location: { fontSize: 16, color: TEXT_MUTED },
  
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 5,
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  soldBadge: {
    backgroundColor: '#dc3545', 
    color: CARD_BG,
  },
  pendingBadge: {
    backgroundColor: WARNING_YELLOW,
    color: TEXT_DARK,
  },
  
  divider: {
    height: 1,
    backgroundColor: BORDER_LIGHT,
    marginVertical: 15,
  },
  
  // --- Seller Profile ---
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  sellerTitle: { fontSize: 14, color: TEXT_MUTED },
  sellerName: { fontSize: 18, fontWeight: '700', color: TEXT_DARK },
  ownerText: { fontSize: 12, color: PRIMARY_BLUE, fontWeight: '600' },

  // --- Seller Contact Card ---
  contactCard: {
    padding: 15,
    backgroundColor: BACKGROUND_LIGHT,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },
  contactHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_LIGHT,
    paddingBottom: 5,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactLabel: {
    marginLeft: 8,
    marginRight: 5,
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  contactValue: {
    fontSize: 15,
    color: TEXT_DARK,
  },
  contactValueLink: {
    color: PRIMARY_BLUE,
    textDecorationLine: 'underline',
    flexShrink: 1,
    fontSize: 15,
  },
  contactNote: {
    marginTop: 10,
    fontSize: 12,
    color: TEXT_MUTED,
    borderTopWidth: 1,
    borderTopColor: BORDER_LIGHT,
    paddingTop: 10,
    fontStyle: 'italic',
  },

  // --- Description ---
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 8,
  },
  descriptionText: { fontSize: 16, color: TEXT_MUTED, lineHeight: 24, marginBottom: 10 },
  
  // --- FIXED BOTTOM ACTION BAR (CORRECTED) ---
  actionBar: {
    // Remove position: 'absolute' and let flex handle it
    width: '100%',
    backgroundColor: CARD_BG,
    borderTopWidth: 1,
    borderTopColor: BORDER_LIGHT,
    paddingHorizontal: 15,
    paddingTop: 15,
    // Add margin for the bottom Safe Area using insets in the component, not here.
  },
  actionButtonContainer: { 
    width: '100%',
},
  buyButton: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: SUCCESS_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  buyButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },

  // --- Owner Actions (in action bar) ---
  ownerActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    paddingHorizontal: 0,
  },
  ownerActionText: {
    color: TEXT_DARK,
    fontWeight: '500',
    marginRight: 15,
    flexShrink: 1,
  },
  editButton: {
    backgroundColor: PRIMARY_BLUE,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: PRIMARY_BLUE,
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});