// app/(root)/profile/_layout.tsx
import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="change-password"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="subscription"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="help"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="faq"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
