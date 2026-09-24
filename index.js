/**
 * App entry point, wrapped so that a failure during startup is visible.
 *
 * The default entry is `expo-router/entry`. This file replaces it with the
 * same thing inside a try/catch, for one reason: three builds have now reached
 * testers and crashed on launch on both platforms, and every attempt to find
 * out why has come back empty. Sentry reported nothing, the native crash
 * reports carry no JavaScript message, and there is no Android device here to
 * read logcat from.
 *
 * An error thrown while the bundle is being evaluated -- at the top level of
 * any module, including any of the route files expo-router loads eagerly at
 * startup -- happens before React renders and before Sentry initialises. The
 * root error boundary cannot catch it (React does not exist yet) and Sentry
 * cannot report it (it has not been configured yet). The process simply dies,
 * which is precisely the "crash on launch with no feedback" being reported.
 *
 * Catching it here is the earliest point at which anything can be caught at
 * all, and rendering the message means a tester can answer the question with a
 * screenshot instead of a toolchain.
 */

import { AppRegistry, Platform, ScrollView, Text, View } from "react-native";

function renderStartupFailure(error) {
  const message = error?.message ?? String(error);
  const stack = error?.stack ?? "";

  function StartupFailure() {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: "#0B0B0B" }}
        contentContainerStyle={{ padding: 24, paddingTop: 72 }}
      >
        <Text style={{ color: "#FF6B6B", fontSize: 18, fontWeight: "700", marginBottom: 6 }}>
          Startup failed
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, marginBottom: 18 }}>
          Please screenshot this whole screen and send it over.
        </Text>

        <Text selectable style={{ color: "#FFFFFF", fontSize: 14, lineHeight: 20, marginBottom: 18 }}>
          {message}
        </Text>

        {/*
          The stack is minified in a release build, but the frame names that
          survive are still enough to say which module failed -- which is the
          single fact that has been missing this whole time.
        */}
        <Text selectable style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, lineHeight: 15 }}>
          {stack}
        </Text>
      </ScrollView>
    );
  }

  // Registered under the name the native host is already looking for, so this
  // replaces the app rather than racing it.
  AppRegistry.registerComponent("main", () => StartupFailure);
}

try {
  require("expo-router/entry");
} catch (error) {
  // Deliberately not rethrown: rethrowing restores exactly the silent abort
  // this exists to replace.
  try {
    renderStartupFailure(error);
  } catch {
    // If even the fallback cannot render, there is nothing further to try.
  }
}
