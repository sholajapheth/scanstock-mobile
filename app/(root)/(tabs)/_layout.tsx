import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case "index":
              iconName = focused ? "home" : "home-outline";
              break;
            case "scanner":
              iconName = focused ? "barcode" : "barcode-outline";
              break;
            case "inventory":
              iconName = focused ? "list" : "list-outline";
              break;
            case "checkout":
              iconName = focused ? "cart" : "cart-outline";
              break;
            default:
              iconName = "help-outline";
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: "Scanner",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: "Inventory",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="checkout"
        options={{
          title: "Checkout",
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
