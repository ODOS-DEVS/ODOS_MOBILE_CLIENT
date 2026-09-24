import { Alert } from "react-native";
import { runOnJS, runOnUI } from "react-native-reanimated";

/**
 * Stops a JavaScript error inside an animation frame from killing the app.
 *
 * Reanimated drives every animation by scheduling `requestAnimationFrame` on
 * the UI runtime (see valueSetter.ts: `step` calls `animation.onFrame`, then
 * re-schedules itself). Worklets runs that queue from C++:
 *
 *     for (const auto &callback : callbacks) {
 *       uiWorkletRuntime->runSync(*callback, timestampMs);
 *     }
 *
 * There is no try/catch around it. A JS error thrown in any animation step
 * propagates out as a C++ exception, through the CADisplayLink callback, and
 * finds no handler -- so the process calls std::terminate and dies with
 * SIGABRT. That is the crash reported from TestFlight: the stack ends in
 * AnimationFrameBatchinator::flush -> runSync -> throwPendingError, 1.66s
 * after launch, with no message attached.
 *
 * It also explains why nothing caught it. The error never reaches the React
 * tree, so an error boundary cannot see it; it never reaches the JS runtime's
 * handler, so a crash reporter cannot see it; and Apple's crash report carries
 * the C++ frames but not the JavaScript message. The failure was invisible
 * from every direction it was looked at.
 *
 * Wrapping the callback restores the missing handler. The animation that threw
 * stops, the app keeps running, and the message is surfaced instead of lost.
 *
 * Two entry points need it, not one. `executeQueue` runs frame callbacks, then
 * microtasks, then finalizers -- all unprotected. Layout animations (FadeIn,
 * FadeOut) are scheduled through `requestAnimationFrameFinalizer` rather than
 * `requestAnimationFrame`, and this app uses them on both the splash and
 * onboarding screens, so guarding only the frame callbacks would have left the
 * launch path half covered. Microtasks are dispatched from native code and
 * cannot be wrapped from here.
 */

let reported = false;

function reportWorkletError(message: string, stack: string) {
  if (reported) {
    // One animation failing tends to fail on every frame. Showing the first is
    // informative; showing sixty a second is unusable.
    return;
  }
  reported = true;

  console.error("[odos] worklet animation error", message, stack);

  Alert.alert(
    "Animation error (please screenshot)",
    `${message}\n\n${stack.slice(0, 700)}`,
    [{ text: "OK" }],
  );
}

export function installWorkletCrashGuard() {
  try {
    runOnUI(() => {
      "worklet";

      const scope = globalThis as unknown as {
        __odosFrameGuardInstalled?: boolean;
        requestAnimationFrame?: (cb: (timestamp: number) => void) => number;
        requestAnimationFrameFinalizer?: (cb: () => void) => void;
      };

      // runOnUI may be invoked more than once across reloads; wrapping a
      // wrapper would nest handlers without adding protection.
      if (scope.__odosFrameGuardInstalled) {
        return;
      }

      const original = scope.requestAnimationFrame;
      if (typeof original !== "function") {
        // Nothing to protect: the UI runtime has not installed its run loop.
        return;
      }

      scope.__odosFrameGuardInstalled = true;

      const describe = (error: unknown) => {
        "worklet";
        const err = error as { message?: string; stack?: string };
        runOnJS(reportWorkletError)(
          String(err?.message ?? error),
          String(err?.stack ?? ""),
        );
      };

      scope.requestAnimationFrame = (callback: (timestamp: number) => void) =>
        original((timestamp: number) => {
          try {
            callback(timestamp);
          } catch (error) {
            describe(error);
          }
        });

      // Layout animations take this path instead of the one above.
      const originalFinalizer = scope.requestAnimationFrameFinalizer;
      if (typeof originalFinalizer === "function") {
        scope.requestAnimationFrameFinalizer = (callback: () => void) =>
          originalFinalizer(() => {
            try {
              callback();
            } catch (error) {
              describe(error);
            }
          });
      }
    })();
  } catch {
    // A guard that cannot install must not itself become the failure.
  }
}
