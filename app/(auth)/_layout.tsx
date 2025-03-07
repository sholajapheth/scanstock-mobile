import { Stack, Redirect } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "@/src/context/AuthContext";
import { View, Text, ActivityIndicator } from "react-native";
import { useUser } from "@/src/hooks/useAuth";

export default function AuthLayout() {
  const { userToken, isLoading } = useContext(AuthContext);
  const { isAuthenticated, isLoading: isUserLoading, user } = useUser();

  if (isUserLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 12, color: "#64748b" }}>Loading...</Text>
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
    </Stack>
  );
}
