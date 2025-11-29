import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useQuery } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import api from "./api";

// --- Type for purchased product ---
export interface PurchasedProduct {
  id: string;
  seller_name: string;
  title: string;
  price: number;
  status: "sold" | "available";
  category: string;
  image: string; // Image URL field
  created_at: string;
}

// --- Custom Hook to fetch purchase history ---
const usePurchaseHistory = () => {
  return useQuery<PurchasedProduct[]>({
    queryKey: ["purchaseHistory"],
    queryFn: async () => {
      try {
        const response = await api.getMyPurchaseHistory();

        // 💡 ADDED CONFIRMATION LOG
        console.log('API Response Data Type:', typeof response.data);
        console.log('Is API Data an Array?', Array.isArray(response.data));

        // If API returns array (the direct response)
        if (Array.isArray(response.data)) return response.data;

        // If the API somehow wrapped the array (less likely now, but safe fallback)
        if (response.data.products && Array.isArray(response.data.products)) return response.data.products;

        // Default fallback
        return [];
      } catch (error) {
        // If the API call fails, return an empty array so the component can render the error state gracefully
        console.error("Error fetching purchase history:", error);
        throw error; // Re-throw the error so React Query marks the state as 'isError'
      }
    },
  });
};


// --- Individual Product Card ---
const PurchasedCard = ({ product }: { product: PurchasedProduct }) => {
  // Use a more localized date format for professional look
  const purchaseDate = product.created_at 
    ? new Date(product.created_at).toLocaleDateString() 
    : "Date Unavailable";
  const hasImage = !!product.image;

  return (
    <View style={styles.card}>
      <View style={styles.productRow}>
        {/* Product Image (Left) */}
        <View style={styles.imageWrapper}>
          {hasImage ? (
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
              defaultSource={require('../assets/images/logo.png')} // Placeholder image fallback
            />
          ) : (
            <View style={[styles.productImage, styles.noImage]}>
              <FontAwesome name="image" size={30} color="#ccc" />
            </View>
          )}
        </View>

        {/* Product Details (Right) */}
        <View style={styles.detailsColumn}>
          <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>

          <View style={styles.detailRow}>
            {/* Status and Price Group */}
            <View>
              <View style={styles.statusBadge}>
                <FontAwesome name="check-circle" size={14} color="#047857" style={{ marginRight: 5 }} />
                <Text style={[styles.statusText, { color: "#047857" }]}>
                  {product.status === "sold" ? "PURCHASED" : product.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.totalText}>${product.price.toFixed(2)}</Text>
            </View>
            
            {/* Date Display */}
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.dateLabel}>Order Date:</Text>
              <Text style={styles.orderDate}>{purchaseDate}</Text>
            </View>
          </View>
        
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <View style={styles.sellerInfoContainer}>
          <FontAwesome name="user-o" size={14} color="#555" style={{ marginRight: 5 }} />
          <Text style={styles.sellerText}>Sold by: {product.seller_name}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.detailsButton} 
          onPress={() => console.log('Navigate to seller details or review')} // Placeholder action
        >
          <Text style={styles.detailsButtonText}>Review Seller</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- Main Screen Component ---
export default function PurchaseHistory() {
  const { data, isLoading, isError, refetch } = usePurchaseHistory();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Purchase History" }} />
      <Text style={styles.pageTitle}>Your Purchases</Text>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#047857" />
        </View>
      )}

      {isError && (
        <TouchableOpacity onPress={refetch} style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load data. Tap to retry.</Text>
        </TouchableOpacity>
      )}

      {data && data.length === 0 && !isLoading && (
        <View style={styles.emptyContainer}>
          <FontAwesome name="shopping-bag" size={60} color="#047857" />
          <Text style={styles.emptyText}>You haven't bought anything yet.</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {data?.map((product) => (
          <PurchasedCard key={product.id} product={product} />
        ))}
      </ScrollView>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  pageTitle: { fontSize: 24, fontWeight: "700", marginBottom: 20, color: '#333' }, // Larger title
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorContainer: { padding: 20, alignItems: "center" },
  errorText: { color: "red" },
  emptyContainer: { alignItems: "center", marginTop: 50 },
  emptyText: { marginTop: 10, fontSize: 16, color: '#555' },
  card: { 
    backgroundColor: "#fff", 
    padding: 16, 
    marginBottom: 14, 
    borderRadius: 10, 
    // Professional Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3 
  },

  // Product Row and Image
  productRow: { flexDirection: 'row', alignItems: 'center' },
  imageWrapper: { width: 80, height: 80, borderRadius: 8, overflow: 'hidden', marginRight: 15 },
  productImage: { width: '100%', height: '100%' },
  noImage: { backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  detailsColumn: { flex: 1, justifyContent: 'space-between' },

  productTitle: { fontSize: 16, fontWeight: "600", color: '#333', marginBottom: 4 }, // Renamed from orderId
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 10 }, 
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: 'flex-start', marginTop: 5 }, 

  // Status and Price
  statusBadge: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  statusText: { fontWeight: "bold", fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }, 
  totalText: { fontSize: 18, fontWeight: "700", color: '#047857' }, // Price stands out

  // Date Styles
  dateLabel: { color: "#999", fontSize: 10, fontWeight: '500' },
  orderDate: { color: "#555", fontSize: 11, fontWeight: '600' }, 

  // Footer Row (Seller and Action)
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: 'center' },
  sellerInfoContainer: { flexDirection: 'row', alignItems: 'center' },
  sellerText: { fontSize: 13, color: "#555" }, 

  // Action Button
  detailsButton: { 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    backgroundColor: "#0ea5e9", // A clean blue for the action button
    borderRadius: 6 
  },
  detailsButtonText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  scrollContent: { paddingBottom: 100 },
});