import { Stack } from "expo-router";

export default function ManagementLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="categories"
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
    </Stack>
  );
}
