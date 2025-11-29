import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

import API from '../api'; // Import your configured API module

// Define the product type (adjust based on your actual Django response)
interface Product {
    id: string | number ; 
    title: string;
    description: string;
    price: string | number;
    location: string;
    image: string; 
    category: string;
    seller_name: string;
}


export default function Marketplace() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    const scrollY = useRef(new Animated.Value(0)).current;

    const categoryTranslate = scrollY.interpolate({
        inputRange: [0, 50],
        outputRange: [0, -70],
        extrapolate: "clamp",
    });

    const categories = [
        { name: "All", icon: "apps-outline" },
        { name: "Furniture", icon: "bed-outline" },
        { name: "Electronics", icon: "tv-outline" },
        { name: "Clothing", icon: "shirt-outline" },
        { name: "Books", icon: "book-outline" },
        { name: "Home Decor", icon: "home-outline" },
        { name: "Toys", icon: "game-controller-outline" },
        { name: "Appliances", icon: "calculator-outline" },
    ];

    // 💡 FIX 1: Use useCallback to correctly define the fetching function
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            // 💡 Get params based on selected category (and search query, if needed later)
            const params = selectedCategory === "All" ? {} : { category: selectedCategory };

            // Note: If you want to integrate search here: 
            // if (searchQuery.length > 0) { params.search = searchQuery; }
            
            const res = await API.getMarketplace(params);
            
            let productsArray: Product[] = []; 

            // 🎯 NEW DEBUG STEP 🎯: Log the raw response data to confirm what the backend sent (e.g., if it's an empty array or an error)
            console.log("--- RAW API Response Data (for 72 bytes) ---", res.data);

            // 💡 FIX 2: Robustly extract data to prevent .filter crash
            if (Array.isArray(res.data)) {
                productsArray = res.data; // Direct array (ideal scenario)
            } else if (res.data && Array.isArray(res.data.results)) {
                productsArray = res.data.results; // Nested under 'results' (common DRF style)
            } else {
                console.warn("Marketplace API did not return an expected array format.", res.data);
                // If it's an object, it's safer to treat it as an empty array
                productsArray = [];
            }

            setProducts(productsArray);
            
            // 🎯 CRITICAL DEBUG STEP 🎯
            console.log("--- Marketplace Data Received ---");
            console.log(`Fetched ${productsArray.length} items for category: ${selectedCategory}`);
            productsArray.slice(0, 5).forEach((p, index) => {
                console.log(`Product ${index + 1} ID: ${p.id}, Type: ${typeof p.id}, Title: ${p.title}`);
            });
            console.log("---------------------------------");
            
        } catch (err) {
            console.error("Failed to fetch marketplace items:", err.response?.data || err.message);
            
            // ⚠️ "failed to load api" check: If the error object has no response, it's a network issue.
            const errorDetail = err.response?.data?.detail || err.message;
            if (!err.response) {
                 Alert.alert(
                    "Connection Error", 
                    "Failed to connect to the server. Check your device's network connection and verify the IP address (192.168.0.111) in the api.js file."
                 );
            } else {
                Alert.alert("Failed to Load Items", `Error: ${errorDetail}`);
            }
            setProducts([]); // Clear products on failure
        } finally {
            setIsLoading(false);
        }
    }, [selectedCategory]); // 💡 Dependency: Recalculate fetchProducts when category changes

    // 💡 FIX 3: Run fetchProducts when the component mounts AND when the category changes
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]); // Depend on fetchProducts (which depends on selectedCategory)


    // Local filter for search (Category filtering is now done on the backend via fetchProducts)
    const filteredProducts = products.filter((p) => {
        // Only filter by search query, as category is handled by the useEffect/fetchProducts
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });
    
    // Empty state handling
    const isSearchEmpty = searchQuery.length > 0 && filteredProducts.length === 0;
    const isCategoryEmpty = searchQuery.length === 0 && filteredProducts.length === 0 && !isLoading;


    const renderProduct = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => {
                if (item.id) {
                    router.push(`/marketplace/${item.id}`);
                } else {
                    console.warn(`Attempted navigation failed: Item ID is missing for product: ${item.title}`);
                }
            }} 
        >
            <Image 
                source={{ uri: item.image }} 
                style={styles.image} 
                defaultSource={require('../../assets/placeholder.png')} // Add a local placeholder image 
            /> 
            {(item.price === "Free" || item.price === 0 || item.price === '0') && ( 
                <View style={styles.freeTag}>
                    <Text style={styles.freeText}>Free</Text>
                </View>
            )}
            <Text style={styles.name}>{item.title}</Text>
            <Text style={styles.sellerName}>Seller: {item.seller_name || 'N/A'}</Text>
            
            <Text
                style={[
                    styles.price,
                    (item.price === "Free" || item.price === 0 || item.price === '0') && { color: "#F6A700", fontWeight: "700" },
                ]}
            >
                {/* Format price display */}
                {typeof item.price === 'number' && item.price > 0 ? `$${item.price.toFixed(2)}` : (item.price && item.price !== '0' ? item.price : 'Price Hidden')}
            </Text>
            <Text style={styles.location}>{item.location}</Text>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#00C853" />
            </View>
        );
    }
    
    // Display Empty State if no products found after loading (either by category or search)
    if (isCategoryEmpty || isSearchEmpty) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                <View style={[styles.container, { alignItems: 'center', paddingTop: 50 }]}>
                    <Ionicons name="sad-outline" size={60} color="#999" />
                    <Text style={{ marginTop: 15, fontSize: 18, color: '#555', textAlign: 'center', paddingHorizontal: 30 }}>
                        {isSearchEmpty 
                            ? `No results found for "${searchQuery}".`
                            : `No items found in the ${selectedCategory} category.`
                        }
                    </Text>
                    {isCategoryEmpty && (
                         <TouchableOpacity 
                            onPress={() => setSelectedCategory("All")} 
                            style={{ marginTop: 20, padding: 10, backgroundColor: '#00C853', borderRadius: 8 }}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Browse All</Text>
                        </TouchableOpacity>
                    )}
                   
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace("/start")}>
                    <Ionicons name="arrow-back-outline" size={26} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Marketplace</Text>
            </View>

            {/* Search */}
            <View style={{ paddingHorizontal: 15 }}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#999" style={{ marginHorizontal: 8 }} />
                    <TextInput
                        placeholder="Search products..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={styles.searchInput}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <Ionicons
                                name="close-circle"
                                size={20}
                                color="#999"
                                style={{ marginHorizontal: 8 }}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Animated Categories */}
            <Animated.View
                style={{
                    transform: [{ translateY: categoryTranslate }],
                    zIndex: 10,
                    backgroundColor: "#fff",
                }}
            >
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 15, paddingVertical: 10 }}
                >
                    {categories.map((cat) => {
                        const isActive = selectedCategory === cat.name;
                        return (
                            <TouchableOpacity
                                key={cat.name}
                                style={[styles.categoryButton, isActive && styles.activeCategory]}
                                onPress={() => setSelectedCategory(cat.name)}
                                activeOpacity={0.8}
                            >
                                <Ionicons
                                    name={cat.icon as any} 
                                    size={18}
                                    color={isActive ? "#fff" : "#00C853"}
                                    style={{ marginRight: 6 }}
                                />
                                <Text style={[styles.categoryText, isActive && styles.activeCategoryText]}>
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </Animated.View>

            {/* Product Grid */}
            <Animated.FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()} 
                numColumns={2}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 15, paddingTop: 5 }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
            />
            </View>

        </SafeAreaView>
        
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", paddingTop: 10 },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginBottom: 10 },
    title: { fontSize: 20, fontWeight: "700", marginLeft: 10 },
    searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#f5f5f5", borderRadius: 25, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 10 },
    searchInput: { flex: 1, height: 40, fontSize: 14, color: "#333" },
    categoryButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5", borderRadius: 25, paddingVertical: 12, paddingHorizontal: 14, marginRight: 10, borderWidth: 1, borderColor: "#e0e0e0" },
    activeCategory: { backgroundColor: "#00E676", borderColor: "#00E676" },
    categoryText: { color: "#333", fontWeight: "500", fontSize: 14 },
    activeCategoryText: { color: "#fff" },
    card: { width: "48%", backgroundColor: "#fff", borderRadius: 16, marginBottom: 20, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 3 }, shadowRadius: 5, elevation: 3, marginHorizontal: "1%" },
    image: { width: "100%", height: 160 },
    freeTag: { position: "absolute", top: 10, left: 10, backgroundColor: "#F6C700", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
    freeText: { color: "#000", fontSize: 12, fontWeight: "600" },
    name: { fontWeight: "600", fontSize: 16, marginTop: 8, marginLeft: 10 },
    sellerName: { color: "gray", marginLeft: 10, fontSize: 12, marginTop: 2 },
    price: { color: "#000", marginLeft: 10, fontWeight: "700", fontSize: 15, marginTop: 4 },
    location: { color: "gray", marginLeft: 10, marginBottom: 10, fontSize: 12 },
    bottomNav: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#eee",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
    navItem: { alignItems: "center" },
    navText: { fontSize: 12, marginTop: 3, color: "#555" },
});