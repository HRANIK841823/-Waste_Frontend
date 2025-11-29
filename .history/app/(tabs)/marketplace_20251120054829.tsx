import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

// Import local JSON
import marketData from "../../data/marketData.json";

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Marketplace"); // ✅ Active tab state

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

  useEffect(() => {
    setProducts(marketData);
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "All" ? true : p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/marketplace/${item.id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      {item.price === "Free" && (
        <View style={styles.freeTag}>
          <Text style={styles.freeText}>Free</Text>
        </View>
      )}
      <Text style={styles.name}>{item.name}</Text>
      <Text
        style={[
          styles.price,
          item.price === "Free" && { color: "#F6A700", fontWeight: "700" },
        ]}
      >
        {item.price}
      </Text>
      <Text style={styles.location}>{item.location}</Text>
    </TouchableOpacity>
  );

  const handleTabPress = (tabName, route) => {
    setActiveTab(tabName);
    if (route) router.push(route);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/homeScreen")}>
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
                  name={cat.icon}
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
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 15, paddingTop: 5 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      />

      {/* Bottom Navbar */}
      
    </View>
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
  price: { color: "#000", marginLeft: 10, fontWeight: "500", marginTop: 4 },
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