import { Stack, Redirect } from "expo-router";
import { InventoryProvider } from "../../src/context/InventoryContext";
import { useUser } from "@/src/hooks/useAuth";
import { View, Text, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useUser();

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 12, color: "#64748b" }}>Loading...</Text>
      </View>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // User is authenticated, render app
  return (
    <InventoryProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* All your other screens */}
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
            title: "Product Details",
            headerBackTitle: "Back",
            headerStyle: {
              backgroundColor: "#fff",
            },
            headerTitleStyle: {
              color: "#000",
            },
            headerTintColor: "#000",
          }}
        />
        <Stack.Screen
          name="activityhistory"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="sales"
          options={{
            headerShown: false,
          }}
        />
        {/* <Stack.Screen
          name="add-product"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="edit-product/[id]"
          options={{
            headerShown: false,
          }}
        /> */}
        <Stack.Screen
          name="checkout"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="management"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </InventoryProvider>
  );
}
