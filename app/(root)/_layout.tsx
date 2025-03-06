import { Stack, Redirect } from "expo-router";
import { AuthProvider } from "../../src/context/AuthContext";
import { InventoryProvider } from "../../src/context/InventoryContext";
import { useUser } from "@/src/hooks/useAuth";
import { View, Text, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useUser();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 12, color: "#64748b" }}>Loading...</Text>
      </View>
    );
  }
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <AuthProvider>
      <InventoryProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="product-detail/[id]"
            options={{
              title: "Product Details",
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="product-detail/index"
            options={{
              title: "New Product",
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="checkout"
            options={{
              title: "Checkout",
              headerBackTitle: "Back",
            }}
          />
        </Stack>
      </InventoryProvider>
    </AuthProvider>
  );
}
