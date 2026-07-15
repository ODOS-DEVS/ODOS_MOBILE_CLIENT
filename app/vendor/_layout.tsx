import { Stack } from "expo-router";

export default function VendorLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        freezeOnBlur: true,
      }}
    >
      <Stack.Screen
        name="orders/[orderId]"
        options={{
          animation: "fade",
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
