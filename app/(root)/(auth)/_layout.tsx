import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgotpassword" />
      <Stack.Screen name="verification" options={{ gestureEnabled: false }} />
      <Stack.Screen name="createpassowrd" options={{ gestureEnabled: false }} />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
