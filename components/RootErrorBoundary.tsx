import { captureError } from "@/utils/errorReporting";
import React from "react";
import { Pressable, Text, View } from "react-native";

/**
 * Catches render-time errors anywhere below it and shows a screen instead of
 * letting the app disappear.
 *
 * Testers have twice reported the app "quitting with no feedback", which is the
 * worst possible failure to receive a report about: it tells the person nothing,
 * so they tell us nothing. An uncaught error thrown during render takes the
 * whole tree down, and React's default behaviour on native is to unmount to a
 * blank screen -- indistinguishable, to the person holding the phone, from a
 * crash.
 *
 * Deliberately styled with literal values and system fonts rather than the
 * theme context and Montserrat. This component has to render correctly in
 * precisely the situation where something below it has already failed, and the
 * theme provider is itself below the point where this is mounted -- depending
 * on it would risk the fallback failing for the same reason as the app.
 *
 * Note this catches render errors only. Errors thrown from a Reanimated worklet
 * on the UI thread, or from an async callback, never pass through React and so
 * cannot be caught here -- they abort the process natively. Sentry is what
 * covers those.
 */

type Props = { children: React.ReactNode };
type State = { error: Error | null };

export default class RootErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // The component stack is the part Apple's crash reports never carry, and
    // the reason several theories about this crash could not be settled. It is
    // shown on screen by the fallback below, which is now the only channel.
    captureError(error, { componentStack: info.componentStack });
  }

  render() {
    const { error } = this.state;

    if (!error) {
      return this.props.children;
    }

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0B0B0B",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 28,
          gap: 12,
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 19,
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          Something went wrong
        </Text>
        <Text
          style={{
            color: "rgba(255,255,255,0.62)",
            fontSize: 14,
            lineHeight: 20,
            textAlign: "center",
          }}
        >
          The app hit an unexpected error and has reported it. Try again, and if
          it keeps happening please let us know what you were doing.
        </Text>

        {/*
          Shown because these reports arrive second-hand, from a tester relaying
          what they saw. One line of real error text in a screenshot is worth
          more than any number of descriptions of a blank screen.
        */}
        <Text
          style={{
            color: "rgba(255,255,255,0.38)",
            fontSize: 11,
            textAlign: "center",
            marginTop: 4,
          }}
          numberOfLines={4}
        >
          {error.message || String(error)}
        </Text>

        <Pressable
          onPress={() => this.setState({ error: null })}
          accessibilityRole="button"
          style={{
            marginTop: 16,
            paddingVertical: 12,
            paddingHorizontal: 28,
            borderRadius: 999,
            backgroundColor: "#FFFFFF",
          }}
        >
          <Text style={{ color: "#0B0B0B", fontSize: 15, fontWeight: "600" }}>
            Try again
          </Text>
        </Pressable>
      </View>
    );
  }
}
