import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useQuery } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import api from "./api";

export interface PurchasedProduct {
  id: string;
  seller_name: string;
  title: string;
  price: number;
  status: "sold";
  category: string;
  image: string;
  created_at: string;
}

const usePurchaseHistory = () => {
  return useQuery({
    queryKey: ["purchaseHistory"],
    queryFn: async () => {
      const response = await api.getMyPurchaseHistory();
      return response.data as PurchasedProduct[];
    },
  });
};

const PurchasedCard = ({ product }: { product: PurchasedProduct }) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.orderId}>{product.title}</Text>
        <Text style={styles.orderDate}>{new Date(product.created_at).toDateString()}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailRow}>
        <View style={styles.statusBadge}>
          <FontAwesome name="check-circle" size={16} color="#047857" style={{ marginRight: 5 }} />
          <Text style={[styles.statusText, { color: "#047857" }]}>PURCHASED</Text>
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
              `Title: ${product.title}\nPrice: $${product.price}\nCategory: ${product.category}`
            )
          }
        >
          <Text style={styles.detailsButtonText}>View Receipt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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

      {data?.length === 0 && (
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

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
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
  detailsButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "#047857", borderRadius: 6 },
  detailsButtonText: { color: "#fff", fontWeight: "600" },
  scrollContent: { paddingBottom: 100 },
});
