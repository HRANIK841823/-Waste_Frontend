import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../api';

// --- Utility Hook: Debounce for better performance ---
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    
    return debouncedValue;
};

// --- Color Palette and Constants ---
const PRIMARY_COLOR = '#007BFF';    
const ACCENT_GREEN = '#28A745';    
const BACKGROUND_LIGHT = '#F4F7F9'; 
const CARD_BG = '#FFFFFF';
const TEXT_DARK = '#343A40';
const TEXT_MUTED = '#888888';
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

// Get screen height for dynamic empty component sizing
const { height: screenHeight } = Dimensions.get('window');

export default function Marketplace() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchQuery = useDebounce(searchTerm, 300); 
    
    const categories = [
        { name: "All", icon: "apps-outline" },
        { name: "Furniture", icon: "chair-outline" },
        { name: "Electronics", icon: "laptop-outline" },
        { name: "Clothing", icon: "shirt-outline" },
        { name: "Books", icon: "book-outline" },
        { name: "Home Decor", icon: "sparkles-outline" },
        { name: "Toys", icon: "happy-outline" },
        { name: "Appliances", icon: "cube-outline" },
    ];

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = selectedCategory === "All" ? {} : { category: selectedCategory };
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
            Alert.alert("Connection Error", "Could not connect to the server or load data. Please check your network.");
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCategory]); 

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const filteredProducts = useMemo(() => {
        if (!debouncedSearchQuery) return products;
        
        const query = debouncedSearchQuery.toLowerCase();
        
        return products.filter((p) => {
            return p.title.toLowerCase().includes(query) || 
                   p.description.toLowerCase().includes(query) ||
                   p.location.toLowerCase().includes(query);
        });
    }, [products, debouncedSearchQuery]);

    // --- Render Functions ---

    const renderProduct = ({ item }: { item: Product }) => (
        // (Product rendering logic remains the same)
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
                // defaultSource={require('../../assets/images/placeholder.png')} 
            /> 
            
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.cardSeller}>Posted by: {item.seller_name || 'Anonymous'}</Text>
                
                <View style={styles.priceLocationRow}>
                    <Text
                        style={[
                            styles.cardPrice,
                            (item.price === 0 || item.price === '0' || item.price === "Free") && styles.freePriceText,
                        ]}
                    >
                        {item.price === 0 || item.price === '0' || item.price === "Free" 
                            ? 'FREE' 
                            : `$${Number(item.price).toFixed(2)}`}
                    </Text>
                    <Text style={styles.cardLocation} numberOfLines={1}>
                        <Ionicons name="location-outline" size={12} color={TEXT_MUTED} /> {item.location}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
   
    // --- Empty State Component (Renders *inside* FlatList) ---
    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="funnel-outline" size={50} color={PRIMARY_COLOR} style={{ marginBottom: 10 }} />
            <Text style={styles.emptyTitle}>
                {debouncedSearchQuery ? 'No Matching Listings' : `No Items in ${selectedCategory}`}
            </Text>
            <Text style={styles.emptySubtitle}>
                {debouncedSearchQuery 
                    ? `We couldn't find anything matching "${searchTerm}". Try a broader term.`
                    : `There are currently no listings in the "${selectedCategory}" category.`
                }
            </Text>
            {selectedCategory !== "All" && (
                <TouchableOpacity 
                    onPress={() => setSelectedCategory("All")} 
                    style={styles.browseAllButton}
                >
                    <Text style={styles.browseAllButtonText}>Show All Categories</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    // --- Loading State (Full Screen - ONLY when fetching data) ---
    if (isLoading && products.length === 0) { // Only show full-screen loader if initial load
        return (
            <SafeAreaView style={[styles.safeArea, styles.center]}>
                <ActivityIndicator size="large" color={ACCENT_GREEN} />
                <Text style={styles.loadingText}>Loading marketplace items...</Text>
            </SafeAreaView>
        );
    }
    
    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.container}>
                {/* --- Fixed Header Area (ALWAYS VISIBLE) --- */}
                <View style={styles.fixedHeader}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back-outline" size={24} color={TEXT_DARK} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Reusable Marketplace</Text>
                        <TouchableOpacity onPress={() => router.push('/post')} style={styles.postButton}>
                            <Ionicons name="add-circle-outline" size={26} color={PRIMARY_COLOR} />
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar (ALWAYS VISIBLE) */}
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color={TEXT_MUTED} style={styles.searchIcon} />
                        <TextInput
                            placeholder="Search by title, description, or location..."
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                            style={styles.searchInput}
                            placeholderTextColor={TEXT_MUTED}
                        />
                        {searchTerm.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchTerm("")} style={styles.clearSearchButton}>
                                <Ionicons name="close-circle" size={20} color={TEXT_MUTED} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* --- Categories List (ALWAYS VISIBLE) --- */}
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
                                        setSelectedCategory(cat.name);
                                        setSearchTerm(""); 
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

                {/* --- Product Grid (Content Area) --- */}
                <FlatList
                    data={filteredProducts}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id.toString()} 
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.listContentContainer}
                    // FIX: Pass the Empty State here. It will only render if data is empty.
                    ListEmptyComponent={
                        isLoading ? ( 
                            <View style={styles.inlineLoader}>
                                <ActivityIndicator size="small" color={ACCENT_GREEN} />
                                <Text style={styles.loadingText}>Filtering results...</Text>
                            </View>
                        ) : (
                            renderEmptyState()
                        )
                    }
                />
            </View>
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
    },
    center: {
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: CARD_BG,
    },
    loadingText: {
        marginTop: 10,
        color: TEXT_DARK,
        fontSize: 16,
    },
    inlineLoader: { // Style for loading indicator *inside* FlatList
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 200, // Give it a fixed height for visibility
        marginTop: 50,
    },
    // ... (rest of the styles: fixedHeader, header, title, searchBar, categoriesWrapper, etc.)
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
        textAlign: 'center', 
        marginLeft: -24, 
    },
    postButton: {
        paddingLeft: 10,
    },
    searchBar: { 
        flexDirection: "row", 
        alignItems: "center", 
        backgroundColor: BACKGROUND_LIGHT, 
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
    categoriesWrapper: {
        backgroundColor: CARD_BG,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: BORDER_LIGHT, 
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
    listContentContainer: { 
        paddingVertical: 15, 
        paddingHorizontal: 10,
        // When using ListEmptyComponent, ensure the container can stretch
        minHeight: screenHeight - 250, // Screen height minus fixed header/category height
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
        color: ACCENT_GREEN, 
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
        flex: 1, // Crucial for ListEmptyComponent to fill the space
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: BACKGROUND_LIGHT, // Use light background to differentiate
        margin: 10,
        borderRadius: 12,
        minHeight: 250, // Ensure minimum visible height
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