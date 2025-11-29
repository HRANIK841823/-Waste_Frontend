// PurchaseHistory.js

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useQuery } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import api from "./api";

// --- Type for purchased product ---
export interface PurchasedProduct {
  id: string;
  seller_name: string;
  title: string;
  price: number;
  status: "sold" | "available";
  category: string;
  image: string;
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
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.orderId}>{product.title}</Text>
        <Text style={styles.orderDate}>
          {product.created_at ? new Date(product.created_at).toDateString() : "Unknown Date"}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailRow}>
        <View style={styles.statusBadge}>
          <FontAwesome name="check-circle" size={16} color="#047857" style={{ marginRight: 5 }} />
          <Text style={[styles.statusText, { color: "#047857" }]}>
            {product.status === "sold" ? "PURCHASED" : product.status.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.totalText}>${product.price.toFixed(2)}</Text>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.itemCount}>Seller: {product.seller_name}</Text>

        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() =>
            Alert.alert(
              "Receipt",
              `Title: ${product.title}\nPrice: $${product.price}\nCategory: ${product.category}\nBuyer ID: ${product.id}`
            )
          }
        >
          <Text style={styles.detailsButtonText}>View Receipt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- Main Screen Component ---
export default function PurchaseHistory() {
  const { data, isLoading, isError, refetch } = usePurchaseHistory();

  // Debug: log buyer IDs and user IDs
  if (data) {
    data.forEach((product) => {
      console.log(`Product: ${product.title}, buyer_id: ${product.id}`);
    });
  }

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

      {data && data.length === 0 && (
        <View style={styles.emptyContainer}>
          <FontAwesome name="shopping-bag" size={60} color="#047857" />
          <Text style={styles.emptyText}>You haven't bought anything yet.</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* The 'data?' optional chaining here is already correct and safe */}
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
  pageTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorContainer: { padding: 20, alignItems: "center" },
  errorText: { color: "red" },
  emptyContainer: { alignItems: "center", marginTop: 50 },
  emptyText: { marginTop: 10, fontSize: 16 },
  card: { backgroundColor: "#fff", padding: 16, marginBottom: 14, borderRadius: 10, elevation: 2 },
  headerRow: { flexDirection: "row", justifyContent: "space-between" },
  orderId: { fontSize: 16, fontWeight: "bold" },
  orderDate: { color: "#555" },
  divider: { height: 1, backgroundColor: "#ddd", marginVertical: 10 },
  detailRow: { flexDirection: "row", justifyContent: "space-between" },
  statusBadge: { flexDirection: "row", alignItems: "center" },
  statusText: { fontWeight: "bold" },
  totalText: { fontSize: 16, fontWeight: "600" },
  footerRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  itemCount: { fontSize: 14 },
  detailsButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "#047857", borderRadius: 6 },
  detailsButtonText: { color: "#fff", fontWeight: "600" },
  scrollContent: { paddingBottom: 100 },
});