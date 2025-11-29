import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useQuery } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
  const listingDate = product.created_at ? new Date(product.created_at).toDateString() : "Date Unavailable";

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
            
            <View style={styles.statusBadge}>
                <FontAwesome name={icon as any} size={16} color={color} style={{ marginRight: 5 }} />
                <Text style={[styles.statusText, { color }]}>{product.status.toUpperCase()}</Text>
            </View>

            <Text style={styles.totalText}>${product.price.toFixed(2)}</Text>
            
            {/* Date Display (shows "Date Unavailable" if missing) */}
            <Text style={styles.orderDate}>
                Listed: {listingDate}
            </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <Text style={styles.itemCount}>
          Buyer: {product.buyer_name ? product.buyer_name : "Waiting for buyer"}
        </Text>

        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => router.push(`/marketplace/marketplace/${product.id}`)}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
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
          <Text style={styles.emptyText}>You haven't sold anything yet.</Text>
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
  card: { backgroundColor: "#fff", padding: 16, marginBottom: 14, borderRadius: 10, elevation: 2 },
  
  // New Styles for Product Row and Image
  productRow: { flexDirection: 'row', marginBottom: 10, alignItems: 'center' },
  imageWrapper: { width: 80, height: 80, borderRadius: 8, overflow: 'hidden', marginRight: 15 },
  productImage: { width: '100%', height: '100%' },
  noImage: { backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  detailsColumn: { flex: 1, justifyContent: 'space-between', height: 80 },

  orderId: { fontSize: 16, fontWeight: "bold" },
  orderDate: { color: "#777", fontSize: 12 }, // Adjusted style for date
  divider: { height: 1, backgroundColor: "#ddd", marginVertical: 10 },
  detailRow: { flexDirection: "row", justifyContent: "space-between" },
  statusBadge: { flexDirection: "row", alignItems: "center" },
  statusText: { fontWeight: "bold", fontSize: 12 }, // Adjusted font size
  totalText: { fontSize: 16, fontWeight: "600", color: '#000' },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: 'center', marginTop: 10 },
  itemCount: { fontSize: 14, color: "#555" },
  detailsButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "#047857", borderRadius: 6 },
  detailsButtonText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  scrollContent: { paddingBottom: 100 },
});