import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from './api'; // Import the robust API module you just provided

// --- Type Definitions (Must match the Django Product Serializer) ---
export interface SellHistoryProduct {
  id: string; // The primary key (PK) of the product
  seller_name: string; // Displayed on the card
  name: string; // Assuming this is the item name (optional, title is usually enough)
  title: string;
  price: number;
  status: 'available' | 'sold';
  category: string;
  image: string; // Imgbb link (URL)
  created_at: string; 
  buyer?: string; // Optional field, only present if status is 'sold'
}

// --- Data Fetching Hook using @tanstack/react-query ---
const useSellHistory = () => {
  return useQuery<SellHistoryProduct[], Error>({
    queryKey: ['sellHistory'],
    queryFn: async () => {
      // Calls the correct, authenticated API endpoint: GET /marketplace/my_sell_history/
      const response = await api.getMySellHistory(); 
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Data is considered fresh for 5 minutes
  });
};


// --- Status Icon and Color Helper ---
const getStatusDetails = (status: SellHistoryProduct['status']): { iconName: keyof typeof FontAwesome.glyphMap, color: string } => {
  switch (status) {
    case 'available':
      return { iconName: 'leaf', color: '#10b981' }; // Green for Available
    case 'sold':
      return { iconName: 'shopping-cart', color: '#047857' }; // Darker green for Sold
    default:
      return { iconName: 'question-circle', color: '#9CA3AF' };
  }
};

// --- Product Card Component ---
const ProductCard = ({ product }: { product: SellHistoryProduct }) => {
  const { iconName, color: statusColor } = getStatusDetails(product.status);
  
  const dateText = `Posted: ${new Date(product.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.orderId}>{product.title}</Text>
        <Text style={styles.orderDate}>{dateText}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.detailRow}>
        <View style={styles.statusBadge}>
          <FontAwesome name={iconName} size={16} color={statusColor} style={{ marginRight: 5 }} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {product.status === 'sold' ? 'SOLD' : 'AVAILABLE'}
          </Text>
        </View>
        <Text style={styles.totalText}>${product.price.toFixed(2)}</Text>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.itemCount}>Category: {product.category}</Text>
        
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => Alert.alert('Item Action', `Title: ${product.title}\nStatus: ${product.status}\n\nThis button should navigate to the Edit/Detail screen.`)}
        >
          <Text style={styles.detailsButtonText}>
            {product.status === 'available' ? 'Manage Listing' : 'View Details'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


// --- Main Component ---
export default function SellHistory() {
  const { data: products, isLoading, isError, error, refetch } = useSellHistory();

  useEffect(() => {
    if (isError) {
      console.error("Failed to fetch sell history:", error);
      Alert.alert("Error", "Could not load your listings. Please ensure you are logged in.");
    }
  }, [isError, error]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#047857" />
          <Text style={styles.loadingText}>Loading your listings...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>An error occurred while loading your listings.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
             <Text style={styles.detailsButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!products || products.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <FontAwesome name="leaf" size={60} color="#047857" />
          <Text style={styles.emptyText}>You haven't listed any items yet.</Text>
          <Text style={styles.emptySubText}>Post your first item to start selling!</Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Selling History' }} />
      <Text style={styles.pageTitle}>Your Listings</Text>
      
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

// --- Stylesheet ---
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
  // --- Card Styles ---
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
  // --- Loading/Error/Empty States ---
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