import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useQuery } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import api from "./api";

// Define the API object if it's not globally available in this file's context
// NOTE: Assuming 'api' is correctly configured elsewhere.

export interface SellProduct {
  id: string;
  buyer_name: string | null;
  name: string;
  title: string; // Use 'title' for display consistency
  price: number;
  status: "available" | "sold";
  category: string;
  image: string; // Added image field
  created_at: string;
}

const useSellHistory = () => {
  return useQuery<SellProduct[]>({
    queryKey: ["sellHistory"],
    queryFn: async () => {
      try {
        const response = await api.getMySellHistory();
        
        // Ensure data is returned as an array of SellProduct
        if (Array.isArray(response.data)) {
            return response.data;
        } else if (response.data?.results && Array.isArray(response.data.results)) {
            return response.data.results;
        }
        return [];
      } catch (error) {
        console.error("Error fetching sell history:", error);
        throw error; // Re-throw the error so React Query handles it
      }
    },
  });
};

const SellCard = ({ product }: { product: SellProduct }) => {
  const router = useRouter();
  const color = product.status === "sold" ? "#047857" : "#ca8a04";
  const icon = product.status === "sold" ? "check-circle" : "clock-o";
  const hasImage = !!product.image;
  // 1. Removed "Listed: " from the date string
  const listingDate = product.created_at ? new Date(product.created_at).toLocaleDateString() : "Date Unavailable"; 

  // New Handlers
  const handleDelete = () => {
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to delete the listing: ${product.title}? This action is permanent.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deleteItem(product.id);
              Alert.alert("Success", "Listing deleted successfully.");
              // NOTE: For real-time update, you should ideally trigger a refetch here.
              // Since refetch is not available in SellCard props, the user would need to
              // navigate back or implement context/state management for instant refresh.
            } catch (error) {
              Alert.alert("Error", "Failed to delete the listing.");
              console.error("Delete failed:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleUpdate = () => {
    // Redirect to an edit form, passing the product ID
    // Assumes an edit screen is available at /marketplace/edit/[id]
    router.push(`/marketplace/edit/${product.id}`);
  };

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
            <Text style={styles.orderId} numberOfLines={2}>{product.title}</Text>
            
            <View style={styles.detailRow}>
                {/* Grouping status and price */}
                <View>
                    <View style={styles.statusBadge}>
                        <FontAwesome name={icon as any} size={14} color={color} style={{ marginRight: 5 }} />
                        <Text style={[styles.statusText, { color }]}>{product.status.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.totalText}>${product.price.toFixed(2)}</Text>
                </View>

                {/* Date on the right, better placement */}
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.dateLabel}>Listed On:</Text>
                    <Text style={styles.orderDate}>
                        {listingDate}
                    </Text>
                </View>

            </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <Text style={styles.itemCount} numberOfLines={1} ellipsizeMode="tail">
        Buyer Id: 69280e73...
        </Text>

        {/* Action Buttons Container */}
        <View style={styles.actionButtonsContainer}>
            {/* View Details Button (Existing) */}
            <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => router.push(`/marketplace/${product.id}`)}
            >
                <Text style={styles.detailsButtonText}>Details</Text>
            </TouchableOpacity>

            {/* Update Button (New) */}
            <TouchableOpacity
                style={styles.updateButton}
                onPress={handleUpdate}
            >
                <Text style={styles.detailsButtonText}>Edit</Text>
            </TouchableOpacity>

            {/* Delete Button (New) */}
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
            >
                <Text style={styles.detailsButtonText}>Delete</Text>
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function SellHistory() {
  const { data, isLoading, isError, refetch } = useSellHistory();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Sell History" }} />
      <Text style={styles.pageTitle}>Items You Sold</Text>

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

      {data?.length === 0 && !isLoading && (
        <View style={styles.emptyContainer}>
          <FontAwesome name="shopping-basket" size={60} color="#047857" />
          <Text style={styles.emptyText}>You havent sold anything yet.</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {data?.map((product) => (
          <SellCard key={product.id} product={product} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  pageTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorContainer: { padding: 20, alignItems: "center" },
  errorText: { color: "red" },
  emptyContainer: { alignItems: "center", marginTop: 50 },
  emptyText: { marginTop: 10, fontSize: 16 },
  card: { backgroundColor: "#fff", padding: 16, marginBottom: 14, borderRadius: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  
  // New Styles for Product Row and Image
  productRow: { flexDirection: 'row', alignItems: 'center' },
  imageWrapper: { width: 80, height: 80, borderRadius: 8, overflow: 'hidden', marginRight: 15 },
  productImage: { width: '100%', height: '100%' },
  noImage: { backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  detailsColumn: { flex: 1, justifyContent: 'space-between' },

  orderId: { fontSize: 16, fontWeight: "bold", marginBottom: 4 }, // Added margin for spacing
  dateLabel: { color: "#999", fontSize: 10, fontWeight: '500' }, // New label for date
  orderDate: { color: "#555", fontSize: 11, fontWeight: '600' }, // Adjusted style for date
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 10 }, // Lighter divider
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: 'flex-start' }, // Changed to flex-start for alignment
  statusBadge: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  statusText: { fontWeight: "bold", fontSize: 11, letterSpacing: 0.5 }, // Adjusted font size, added letter spacing
  totalText: { fontSize: 18, fontWeight: "700", color: '#047857' }, // Larger, green price
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: 'center', marginTop: 5 },
  itemCount: { fontSize: 12, color: "#999" }, // Smaller, gray for less importance

  // New action buttons container style
  actionButtonsContainer: { flexDirection: 'row', gap: 8 }, 

  detailsButton: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "#047857", borderRadius: 6 },
  
  // New button styles
  updateButton: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "#3b82f6", borderRadius: 6 }, // Blue for Update
  deleteButton: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "#dc2626", borderRadius: 6 }, // Red for Delete
  
  detailsButtonText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  scrollContent: { paddingBottom: 100 },
});