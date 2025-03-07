import { Stack, Redirect } from "expo-router";
import { AuthContext, AuthProvider } from "../../src/context/AuthContext";
import { InventoryProvider } from "../../src/context/InventoryContext";
import { useUser } from "@/src/hooks/useAuth";
import { View, Text, ActivityIndicator } from "react-native";
import { useContext } from "react";

export default function RootLayout() {
  //   const { isAuthenticated, userToken,  isLoading } = useContext(AuthContext);

  //   if (isLoading) {
  //     return (
  //       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //         <ActivityIndicator size="large" color="#2563eb" />
  //         <Text style={{ marginTop: 12, color: "#64748b" }}>Loading...</Text>
  //       </View>
  //     );
  //   }

  //   console.log("isAuthenticated", userToken);
  //   if (!isAuthenticated) {
  //     return <Redirect href="/login" />;
  //   }

  return (
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
        <Stack.Screen
          name="activityhistory"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="receipts"
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
          name="sales"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </InventoryProvider>
  );
}
