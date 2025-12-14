import { HapticTab } from "@/components/haptic-tab";
import { Tabs } from "expo-router";
// 🛑 Changed the import to use Ionicons (standard Expo library)
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "white",
        tabBarStyle: { backgroundColor: "#125e17ff" },
        tabBarButton: HapticTab,
      }}
    >


      {/* 🛒 Marketplace Tab */}
      <Tabs.Screen
        name="marketplace"
        options={{
          title: "MarketPlace",
          tabBarIcon: ({ color }) => (
            // ✅ Used Ionicons with standard name 'cart'
            <Ionicons size={28} name="cart" color={color} />
          ),
        }}
      />

      {/* 👤 Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            // ✅ Used Ionicons with standard name 'person'
            <Ionicons size={28} name="person-outline" color={color} />
          ),
        }}
      />

      {/* ✏️ Post Tab */}
      <Tabs.Screen
        name="post"
        options={{
          title: "Post",
          tabBarIcon: ({ color }) => (
            // ✅ Used Ionicons with standard name 'create' (for pencil/edit)
            <Ionicons size={28} name="create" color={color} />
          ),
        }}
      />
      {/* ✏️ About Tab */}
      <Tabs.Screen
        name="about"
        options={{
          title: "About",
          tabBarIcon: ({ color }) => (
            // Recommended: The standard, professional icon for 'About'
            <Ionicons size={28} name="information-circle-outline" color={color} />
          ),
        }}
      />


    </Tabs>
  );
}