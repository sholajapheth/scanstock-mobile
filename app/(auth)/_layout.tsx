import { Stack, Redirect } from "expo-router";
import { useUser } from "@/src/hooks/useAuth";

export default function AuthLayout() {
  const { isAuthenticated } = useUser();

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
