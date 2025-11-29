import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Replaced lucide-react-native with FontAwesome from @expo/vector-icons
import FontAwesome from '@expo/vector-icons/FontAwesome';

// --- Mock Data ---
interface Order {
  id: string;
  date: string;
  total: number;
  status: 'Delivered' | 'Shipped' | 'Cancelled';
  items: number;
}

const mockOrders: Order[] = [
  { id: 'ORD-8942', date: 'Oct 25, 2024', total: 49.99, status: 'Delivered', items: 3 },
  { id: 'ORD-1205', date: 'Oct 18, 2029', total: 125.50, status: 'Shipped', items: 1 },
  { id: 'ORD-5481', date: 'Oct 01, 2029', total: 7.99, status: 'Cancelled', items: 1 },
  { id: 'ORD-3011', date: 'Sep 15, 2029', total: 240.00, status: 'Delivered', items: 5 },
  { id: 'ORD-6799', date: 'Aug 29, 2029', total: 33.30, status: 'Delivered', items: 2 },
];

// --- Status Icon and Color Helper ---
// Updated to return iconName string for FontAwesome
const getStatusDetails = (status: Order['status']): { iconName: string, color: string } => {
  switch (status) {
    case 'Delivered':
      return { iconName: 'check-circle', color: '#10b981' }; // Success green
    case 'Shipped':
      return { iconName: 'truck', color: '#F59E0B' }; // Package equivalent
    case 'Cancelled':
      return { iconName: 'times-circle', color: '#EF4444' }; // Cancelled/Error red
    default:
      return { iconName: 'question-circle', color: '#9CA3AF' };
  }
};

// --- Order Card Component ---
const OrderCard = ({ order }: { order: Order }) => {
  // Destructure iconName instead of icon component
  const { iconName, color: statusColor } = getStatusDetails(order.status);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.orderId}>Order #{order.id}</Text>
        <Text style={styles.orderDate}>{order.date}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.detailRow}>
        <View style={styles.statusBadge}>
          {/* Use FontAwesome component with iconName prop */}
          <FontAwesome name={iconName as any} size={16} color={statusColor} style={{ marginRight: 5 }} />
          <Text style={[styles.statusText, { color: statusColor }]}>{order.status}</Text>
        </View>
        <Text style={styles.totalText}>${order.total.toFixed(2)}</Text>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.itemCount}>{order.items} items</Text>
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


// --- Main Component ---
export default function Purchase() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Purchase History' }} />
      <Text style={styles.pageTitle}>Your Orders</Text>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {mockOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </ScrollView>
    </View>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FFF4', // Matches your registration background
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
    borderRadius: 12, // Slightly rounded corners
    padding: 16,
    marginBottom: 16,
    // Applying shadow styles similar to your input fields
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
    color: '#10b981', // Highlighted ID
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
    backgroundColor: '#F0FFF4', // Subtle background
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
    color: '#047857', // Stronger green for total
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
    backgroundColor: '#D1FAE5', // Very light green background
    borderRadius: 20,
  },
  detailsButtonText: {
    color: '#047857',
    fontWeight: '700',
    fontSize: 14,
  }
});