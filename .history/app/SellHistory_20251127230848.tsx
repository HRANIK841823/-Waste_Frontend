import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from './api';

// --- Type Definitions (Reusing SellHistoryProduct but renaming for context) ---
// The data structure returned by the backend for /my_purchase_history/ is the same 
// as the ProductSerializer, which is what SellHistoryProduct is based on.
export interface PurchasedProduct {
  id: string; // The ObjectId as a string
  seller_name: string; // The seller's name
  name: string;
  title: string;
  price: number;
  status: 'available' | 'sold'; // Should always be 'sold' for purchase history
  category: string;
  image: string; // Imgbb link
  created_at: string; 
  buyer?: string; // Should be the current user's ID
}

// --- Data Fetching Hook ---
const usePurchaseHistory = () => {
  return useQuery({
    queryKey: ['purchaseHistory'],
    queryFn: async () => {
      // ⭐ The key change: call the purchase history endpoint
      const response = await api.getMyPurchaseHistory();
      return response.data as PurchasedProduct[];
    },
    staleTime: 1000 * 60 * 5, 
  });
};


// --- Status Icon and Color Helper (Adapted for Purchased Status) ---
const getStatusDetails = (status: PurchasedProduct['status']): { iconName: string, color: string } => {
  // For purchase history, the status is generally 'sold', but we can make it more explicit.
  return { iconName: 'check-circle', color: '#047857' }; // Dark Green for Purchased
};

// --- Product Card Component (Reused and slightly adapted) ---
const PurchaseProductCard = ({ product }: { product: PurchasedProduct }) => {
  const { iconName, color: statusColor } = getStatusDetails(product.status);
  
  const dateText = `Purchased: ${new Date(product.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.orderId}>{product.title}</Text>
        <Text style={styles.orderDate}>{dateText}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.detailRow}>
        <View style={styles.statusBadge}>
          <FontAwesome name={iconName as any} size={16} color={statusColor} style={{ marginRight: 5 }} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            PURCHASED
          </Text>
        </View>
        <Text style={styles.totalText}>${product.price.toFixed(2)}</Text>
      </View>

      <View style={styles.footerRow}>
        {/* Changed 'Item Count' to display the Seller */}
        <Text style={styles.itemCount}>Seller: {product.seller_name}</Text>
        
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => Alert.alert('Item Details', `Title: ${product.title}\nSold by: ${product.seller_name}\nCategory: ${product.category}`)}
        >
          <Text style={styles.detailsButtonText}>
            View Receipt
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


// --- Main Component ---
export default function PurchaseHistory() {
  // ⭐ The key change: use the purchase history hook
  const { data: products, isLoading, isError, error, refetch } = usePurchaseHistory();

  useEffect(() => {
    if (isError) {
      console.error("Failed to fetch purchase history:", error);
      Alert.alert("Error", "Could not load your purchase history. Please try again.");
    }
  }, [isError, error]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#047857" />
          <Text style={styles.loadingText}>Loading your purchases...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>An error occurred.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
             <Text style={styles.detailsButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!products || products.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <FontAwesome name="shopping-bag" size={60} color="#047857" />
          <Text style={styles.emptyText}>You haven't bought any items yet.</Text>
          <Text style={styles.emptySubText}>Explore the marketplace!</Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ⭐ The key change: use the PurchaseProductCard */}
        {products.map((product) => (
          <PurchaseProductCard key={product.id} product={product} />
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* ⭐ The key change: updated Stack title and page title */}
      <Stack.Screen options={{ title: 'Purchase History' }} />
      <Text style={styles.pageTitle}>Your Purchases</Text>
      
      {renderContent()}

      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={refetch}
      >
        <FontAwesome name="refresh" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

// --- Stylesheet (Directly copied from SellHistory for consistency) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FFF4',
    paddingTop: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#047857',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: { 
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981', 
    flexShrink: 1,
    marginRight: 10,
  },
  orderDate: { 
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#F0FFF4', 
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalText: { 
    fontSize: 22,
    fontWeight: '800',
    color: '#047857', 
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  itemCount: { 
    fontSize: 14,
    color: '#6B7280',
  },
  detailsButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#D1FAE5', 
    borderRadius: 20,
  },
  detailsButtonText: {
    color: '#047857',
    fontWeight: '700',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#047857',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginBottom: 15,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#D1FAE5',
    borderRadius: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#047857',
    marginTop: 15,
  },
  emptySubText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#047857',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  }
});