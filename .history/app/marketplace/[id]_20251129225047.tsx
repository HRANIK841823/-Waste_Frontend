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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
  name: string; // Seller's name is already included here from the backend
}

interface User {
  id: string;
  email: string;
  username: string; // Using 'username' as per your backend model
  phone_number?: string;
  balance?: number;
  avatar?: string;
}

// Interface for Seller Contact Information
interface SellerContact {
  phone_number: string;
  email: string;
  // Add seller username/name here if fetching from the user list
  username: string; 
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
  // NEW STATE: Store all users for lookup
  const [allUsers, setAllUsers] = useState<User[]>([]); 

  // Get insets for correct padding in the fixed bottom bar
  const insets = useSafeAreaInsets();


  const fetchCurrentUserProfile = async () => {
    try {
      const res = await API.getProfile();
      setCurrentUser(res.data);
      return res.data; // Return data for immediate use
    } catch (err) {
      setCurrentUser(null);
      return null;
    }
  };

  // NEW FUNCTION: Fetch all users
  const fetchAllUsers = async () => {
    try {
      const res = await API.getUsers(); // API.get("/auth/users/")
      setAllUsers(res.data);
      return res.data;
    } catch (e) {
      console.error("Failed to fetch all users:", e);
      setAllUsers([]);
      return [];
    }
  };

  const fetchSellerContact = async (sellerId: string, users: User[] = allUsers) => {
    // 1. Try to find the seller in the pre-fetched user list
    const seller = users.find(u => safeToString(u.id) === safeToString(sellerId));

    if (seller) {
      setSellerContact({
        phone_number: seller.phone_number || 'N/A',
        email: seller.email,
        username: seller.username,
      });
      return;
    }
    
    // 2. Fallback to specific seller contact API (if available and needed)
    // NOTE: Based on your backend structure, the list of users should be sufficient 
    // to get public contact info (email, phone_number).
    // If API.getSellerContact is for private contact data, keep this block:
    /*
    try {
      const res = await API.getSellerContact(sellerId);
      setSellerContact(res.data as SellerContact);
    } catch (e) {
      console.log("Failed to fetch seller contact:", e);
      setSellerContact(null);
    }
    */
  };


  const fetchProductAndCurrentUser = async (productId: string) => {
    setLoading(true);

    // Fetch product, current user, AND all users in parallel
    const [productRes, currentUserData, allUsersData] = await Promise.all([
      API.getItemDetail(productId).catch(e => null),
      fetchCurrentUserProfile(), // Fetches and sets currentUser
      fetchAllUsers(), // Fetches and sets allUsers
    ]);

    if (productRes?.data) {
      const loadedProduct = productRes.data as Product;
      setProduct(loadedProduct);

      const currentUserId = safeToString(currentUserData?.id);
      const isOwner = currentUserId === safeToString(loadedProduct.seller_id);
      
      // Fetch seller contact if status is not available OR if the current user is the owner
      if (loadedProduct.status !== 'available' || isOwner) {
         // Pass the newly fetched users list directly to ensure we have the latest data
        fetchSellerContact(loadedProduct.seller_id, allUsersData); 
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
    // Re-fetch seller contact if product state changes and allUsers is ready
    if (product && allUsers.length > 0) {
      const isOwner = safeToString(currentUser?.id) === safeToString(product.seller_id);
      if (product.status !== 'available' || isOwner) {
        fetchSellerContact(product.seller_id, allUsers);
      }
    }
  }, [currentUser, product?.status, product?.seller_id, allUsers]);


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

      // Update local state
      setProduct((prev) => (prev ? { ...prev, status: 'pending' } : null));

      // Fetch/display seller contact info now that status has changed
      fetchSellerContact(product.seller_id);

    } catch (err: any) {
      const specificError = err.response?.data?.error || err.response?.data?.detail || err.message;
      Alert.alert("Purchase Failed", specificError);
    }
  };

  const handleEdit = () => {
      if (id) {
          router.push(`/edit-product/${id}`);
      }
  };

  // --- Ownership and Status Checks ---
  const loggedInUserId = safeToString(currentUser?.id);
  const productSellerId = safeToString(product?.seller_id);
  const isProductOwner = useMemo(() => loggedInUserId !== '' && productSellerId !== '' && productSellerId === loggedInUserId, [loggedInUserId, productSellerId]);

  const isSold = product?.status === 'sold';
  const isPending = product?.status === 'pending';
  const isAvailable = product?.status === 'available';
  const showContactInfo = sellerContact && (!isAvailable || isProductOwner); 


  if (loading) {
    return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={PRIMARY_BLUE} />
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
            onPress={() => contact.phone_number && contact.contact_number !== 'N/A' && Linking.openURL(`tel:${contact.contact_number}`)}
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
    // Main container uses flex: 1 for correct fixed positioning
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
            {isAvailable && !isProductOwner && <Text style={[styles.statusBadge, styles.availableBadge]}>AVAILABLE</Text>}
          </View>

          <View style={styles.divider} />

          {/* --- Seller Profile Section --- */}
          <View style={styles.sellerContainer}>
            <Ionicons name="person-circle-outline" size={30} color={TEXT_DARK} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.sellerTitle}>Listed by</Text>
              {/* Use sellerContact.username if available, otherwise fallback to product.name */}
              <Text style={styles.sellerName}>{sellerContact?.username || product.name || 'Anonymous User'}</Text>
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

          {/* Placeholder for content separation from the fixed bottom bar */}
          <View style={{ height: 100 }} />

        </View>
      </ScrollView>

      {/* --- FIXED BOTTOM ACTION BAR --- */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom || 15 }]}>
        {!isProductOwner ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleBuy}
            disabled={isSold || isPending || showContactInfo}
            style={styles.actionButtonContainer}
          >
            <LinearGradient
              // Use muted colors when disabled
              colors={(isSold || isPending || showContactInfo) ? ["#ADB5BD", "#6C757D"] : [SUCCESS_GREEN, "#00BFA5"]}
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
          // Owner's Action Bar
          <View style={styles.ownerActionBar}>
            <Text style={styles.ownerActionText}>Manage your listing.</Text>
            <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit Item</Text>
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
    // Allows content to fill space and scroll naturally
},
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: BACKGROUND_LIGHT },

  // --- Image & Header ---
  header: { position: 'relative', marginBottom: 0 },
  backButton: {
    position: 'absolute', top: 30, left: 15, zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  image: { width: "100%", height: 300, marginBottom: 0 },

  // --- Details Section (Overlapping the image) ---
  detailsSection: {
    paddingHorizontal: 15, // Keep padding inside the section
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -20, // Create the overlap effect
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
  price: { fontSize: 24, fontWeight: "700", color: PRIMARY_BLUE }, // Using primary blue for price
  location: { fontSize: 16, color: TEXT_MUTED },

  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'space-between',
  },

  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 15, // More pill-like
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  soldBadge: {
    backgroundColor: '#DC3545', // Danger Red
    color: CARD_BG,
  },
  pendingBadge: {
    backgroundColor: WARNING_YELLOW,
    color: TEXT_DARK,
  },
  availableBadge: {
    backgroundColor: SUCCESS_GREEN,
    color: CARD_BG,
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
    marginVertical: 15,
    borderLeftWidth: 5, // Highlight bar
    borderLeftColor: PRIMARY_BLUE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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

  // --- FIXED BOTTOM ACTION BAR ---
  actionBar: {
    width: '100%',
    backgroundColor: CARD_BG,
    borderTopWidth: 1,
    borderTopColor: BORDER_LIGHT,
    paddingHorizontal: 15,
    paddingTop: 15,
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