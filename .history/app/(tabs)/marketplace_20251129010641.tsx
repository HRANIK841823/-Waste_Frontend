import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../api';

// --- Color Palette and Constants ---
const PRIMARY_COLOR = '#007BFF';    // Clean, professional blue
const ACCENT_GREEN = '#28A745';    // Vibrant green for success/action
const BACKGROUND_LIGHT = '#F4F7F9'; // Light grey background
const TEXT_DARK = '#343A40';
const BORDER_LIGHT = '#DEE2E6';

// Define the product type
interface Product {
    id: string | number;
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
    
    // Animated scroll for collapsing header/categories (Good UX)
    const scrollY = useRef(new Animated.Value(0)).current;

    const categories = [
        { name: "All", icon: "apps-outline" },
        { name: "Furniture", icon: "chair-outline" }, // Updated icon
        { name: "Electronics", icon: "laptop-outline" }, // Updated icon
        { name: "Clothing", icon: "shirt-outline" },
        { name: "Books", icon: "book-outline" },
        { name: "Home Decor", icon: "sparkles-outline" }, // Updated icon
        { name: "Toys", icon: "happy-outline" }, // Updated icon
        { name: "Appliances", icon: "cube-outline" }, // Updated icon
    ];

    // --- Data Fetching Logic (Now correctly optimized to run on category change) ---
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            // Include category filtering for the API call
            const params = selectedCategory === "All" ? {} : { category: selectedCategory };
            
            // NOTE: If your Django API supports search filtering on the backend, 
            // you should include the searchQuery here:
            // if (searchQuery) { params.search = searchQuery; }
            
            const res = await API.getMarketplace(params);
            
            let productsArray: Product[] = []; 
            if (Array.isArray(res.data)) {
                productsArray = res.data;
            } else if (res.data && Array.isArray(res.data.results)) {
                productsArray = res.data.results;
            } 

            setProducts(productsArray);
            
        } catch (err) {
            console.error("Failed to fetch marketplace items:", err.response?.data || err.message);
            Alert.alert("Failed to Load Items", "Could not connect to the server or load data.");
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCategory]); // Dependency: Re-fetch when category changes

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Local filtering is now only needed for the search bar (as category is API-filtered)
    const filteredProducts = products.filter((p) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return p.title.toLowerCase().includes(query) || 
               p.description.toLowerCase().includes(query) ||
               p.location.toLowerCase().includes(query);
    });
    
    // --- Render Functions ---

    const renderProduct = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => {
                if (item.id) {
                    router.push(`/marketplace/${item.id}`);
                } else {
                    Alert.alert("Error", "Item details are unavailable.");
                }
            }} 
            activeOpacity={0.8}
        >
            <Image 
                source={{ uri: item.image }} 
                style={styles.image} 
                // Fallback image source (ensure you have one in your assets)
                // defaultSource={require('../../assets/images/placeholder.png')} 
            /> 
            
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.cardSeller}>Posted by: {item.seller_name || 'Anonymous'}</Text>
                
                <View style={styles.priceLocationRow}>
                    <Text
                        style={[
                            styles.cardPrice,
                            (item.price === 0 || item.price === '0') && styles.freePriceText,
                        ]}
                    >
                        {item.price === 0 || item.price === '0' || item.price === "Free" 
                            ? 'FREE' 
                            : `$${Number(item.price).toFixed(2)}`}
                    </Text>
                    <Text style={styles.cardLocation} numberOfLines={1}>
                        <Ionicons name="location-outline" size={12} color="#888" /> {item.location}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    // --- Loading and Empty States ---

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={ACCENT_GREEN} />
                <Text style={styles.loadingText}>Loading marketplace items...</Text>
            </SafeAreaView>
        );
    }
    
    const isListEmpty = filteredProducts.length === 0;

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="filter-outline" size={50} color={PRIMARY_COLOR} style={{ marginBottom: 10 }} />
            <Text style={styles.emptyTitle}>
                {searchQuery ? 'No Results Found' : `No items in ${selectedCategory}`}
            </Text>
            <Text style={styles.emptySubtitle}>
                {searchQuery 
                    ? `Try a different search term or check spelling.`
                    : `There are currently no listings in the "${selectedCategory}" category.`
                }
            </Text>
            {!searchQuery && selectedCategory !== "All" && (
                <TouchableOpacity 
                    onPress={() => setSelectedCategory("All")} 
                    style={styles.browseAllButton}
                >
                    <Text style={styles.browseAllButtonText}>Browse All Categories</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            {/* --- Fixed Header Area --- */}
            <View style={styles.fixedHeader}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back-outline" size={24} color={TEXT_DARK} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Reusable Marketplace</Text>
                    <TouchableOpacity onPress={() => router.push('/post')} style={styles.postButton}>
                        <Ionicons name="add-circle-outline" size={24} color={PRIMARY_COLOR} />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={TEXT_MUTED} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search by title, description, or location..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={styles.searchInput}
                        placeholderTextColor={TEXT_MUTED}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearSearchButton}>
                            <Ionicons name="close-circle" size={20} color={TEXT_MUTED} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* --- Scrollable Content (Categories & Products) --- */}
            
            {/* Categories List (Fixed or slightly sticky for better navigation) */}
            <View style={styles.categoriesWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScrollContent}
                >
                    {categories.map((cat) => {
                        const isActive = selectedCategory === cat.name;
                        return (
                            <TouchableOpacity
                                key={cat.name}
                                style={[styles.categoryButton, isActive && styles.activeCategory]}
                                onPress={() => {
                                    // Set category, which triggers the API fetch via useEffect
                                    setSelectedCategory(cat.name);
                                    // Optional: Clear search when changing category
                                    setSearchQuery(""); 
                                }}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={cat.icon as any} 
                                    size={18}
                                    color={isActive ? CARD_BG : ACCENT_GREEN}
                                    style={{ marginRight: 6 }}
                                />
                                <Text style={[styles.categoryText, isActive && styles.activeCategoryText]}>
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>


            <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id.toString()} 
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.listContentContainer}
                ListEmptyComponent={renderEmptyState}
            />

        </SafeAreaView>
    );
}

// --- Professional Stylesheet ---
const styles = StyleSheet.create({
    safeArea: { 
        flex: 1, 
        backgroundColor: BACKGROUND_LIGHT 
    },
    container: { 
        flex: 1, 
        backgroundColor: BACKGROUND_LIGHT 
    },
    center: {
        justifyContent: 'center', 
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: TEXT_DARK,
        fontSize: 16,
    },

    // --- Header & Search ---
    fixedHeader: {
        backgroundColor: CARD_BG,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: BORDER_LIGHT,
    },
    header: { 
        flexDirection: "row", 
        alignItems: "center", 
        justifyContent: 'space-between',
        paddingHorizontal: 15, 
        paddingVertical: 10 
    },
    backButton: {
        paddingRight: 10,
    },
    title: { 
        fontSize: 22, 
        fontWeight: "700", 
        color: PRIMARY_COLOR, 
        flex: 1,
        textAlign: 'center', // Center title text between icons
        marginLeft: -24, // Pull title back to the center visually
    },
    postButton: {
        paddingLeft: 10,
    },
    searchBar: { 
        flexDirection: "row", 
        alignItems: "center", 
        backgroundColor: BORDER_LIGHT, 
        borderRadius: 10, 
        paddingHorizontal: 15,
        marginHorizontal: 15,
        marginBottom: 5,
        height: 44,
    },
    searchIcon: { 
        marginRight: 8 
    },
    searchInput: { 
        flex: 1, 
        fontSize: 15, 
        color: TEXT_DARK 
    },
    clearSearchButton: {
        marginLeft: 8,
    },
    
    // --- Categories ---
    categoriesWrapper: {
        backgroundColor: CARD_BG,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: BACKGROUND_LIGHT,
    },
    categoryScrollContent: { 
        paddingHorizontal: 15,
    },
    categoryButton: { 
        flexDirection: "row", 
        alignItems: "center", 
        justifyContent: "center", 
        backgroundColor: BACKGROUND_LIGHT, 
        borderRadius: 20, 
        paddingVertical: 8, 
        paddingHorizontal: 12, 
        marginRight: 10, 
        borderWidth: 1, 
        borderColor: BORDER_LIGHT 
    },
    activeCategory: { 
        backgroundColor: ACCENT_GREEN, 
        borderColor: ACCENT_GREEN 
    },
    categoryText: { 
        color: TEXT_DARK, 
        fontWeight: "600", 
        fontSize: 13 
    },
    activeCategoryText: { 
        color: CARD_BG 
    },

    // --- Product Grid ---
    listContentContainer: { 
        paddingVertical: 15, 
        paddingHorizontal: 10, 
    },
    columnWrapper: { 
        justifyContent: "space-between" 
    },
    card: { 
        width: "48%", 
        backgroundColor: CARD_BG, 
        borderRadius: 12, 
        marginBottom: 15, 
        overflow: "hidden", 
        // Modern professional shadow
        shadowColor: "#000", 
        shadowOpacity: 0.08, 
        shadowOffset: { width: 0, height: 2 }, 
        shadowRadius: 4, 
        elevation: 3, 
    },
    image: { 
        width: "100%", 
        height: 140, 
        backgroundColor: BORDER_LIGHT,
    },
    cardContent: {
        padding: 10,
    },
    cardTitle: { 
        fontWeight: "700", 
        fontSize: 16, 
        color: TEXT_DARK,
        marginBottom: 5,
    },
    cardSeller: { 
        color: TEXT_MUTED, 
        fontSize: 11, 
        marginBottom: 8,
    },
    priceLocationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardPrice: { 
        color: ACCENT_GREEN, // Green for positive/price
        fontWeight: "800", 
        fontSize: 16, 
    },
    freePriceText: {
        color: PRIMARY_COLOR,
        fontSize: 14,
        fontWeight: 'bold',
    },
    cardLocation: { 
        color: TEXT_MUTED, 
        fontSize: 12,
        flexShrink: 1,
        marginLeft: 5,
    },

    // --- Empty State ---
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        padding: 40,
        backgroundColor: CARD_BG,
        margin: 20,
        borderRadius: 12,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: TEXT_DARK,
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 15,
        color: TEXT_MUTED,
        textAlign: 'center',
        marginBottom: 20,
    },
    browseAllButton: {
        backgroundColor: PRIMARY_COLOR,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    browseAllButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    }
});