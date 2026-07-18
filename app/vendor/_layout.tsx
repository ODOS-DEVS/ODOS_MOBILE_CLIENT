import { Stack } from "expo-router";

export default function VendorLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        freezeOnBlur: false,
        fullScreenGestureEnabled: false,
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
