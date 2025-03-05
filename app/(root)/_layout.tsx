import { Stack } from "expo-router/stack";
import { AuthProvider } from "../../src/context/AuthContext";
import { InventoryProvider } from "../../src/context/InventoryContext";

export default function RootLayout() {
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
        </Stack>
      </InventoryProvider>
    </AuthProvider>
  );
}
