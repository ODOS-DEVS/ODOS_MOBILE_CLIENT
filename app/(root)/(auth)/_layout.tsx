import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
        freezeOnBlur: false,
        fullScreenGestureEnabled: false,
      }}
    >
      <Stack.Screen
        name="signin"
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="forgotpassword" />
      <Stack.Screen
        name="verification"
        options={{
          gestureEnabled: false,
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="createpassword"
        options={{
          gestureEnabled: false,
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="onboarding"
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
