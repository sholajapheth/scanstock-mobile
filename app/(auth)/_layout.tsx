import { Stack, Redirect } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import { useUser } from "@/src/hooks/useAuth";

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useUser();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 12, color: "#64748b" }}>Loading...</Text>
      </View>
    );
  }

  // If already authenticated, redirect to main app
  if (isAuthenticated) {
    return <Redirect href="/(root)/(tabs)" />;
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
    </Stack>
  );
}
