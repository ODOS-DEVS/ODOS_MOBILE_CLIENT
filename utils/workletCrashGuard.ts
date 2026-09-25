import { Alert } from "react-native";
import { runOnJS, runOnUI } from "react-native-reanimated";
import { captureWorkletError } from "@/utils/errorReporting";

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
 * The guard is applied at the run loop itself, not at the individual callbacks.
 *
 * An earlier version wrapped only `requestAnimationFrame` callbacks and still
 * crashed. Symbolicating that build against its own binary settled why: the
 * offsets were a constant shift of the previous crash, so it was failing at
 * exactly the same place. `executeQueue` runs three things in one frame --
 * frame callbacks, then `callMicrotasks()`, then finalizers -- and a throwing
 * microtask produces an identical stack while being dispatched from native
 * code, out of reach of any per-callback wrapper.
 *
 * `nativeFlushQueue` is the outermost JavaScript function in the frame, so
 * wrapping what schedules it covers all three at once. It re-registers itself
 * on its final line, which means a throw would otherwise stop the animation
 * loop permanently -- so the handler re-arms it explicitly.
 */

/**
 * A failing animation fails on every frame, and the guard deliberately re-arms
 * the loop afterwards -- so without a limit this would report sixty times a
 * second, exhaust a Sentry quota in under a minute, and cost real frame time.
 *
 * Deduplicating by message keeps one report per distinct fault, which is the
 * useful unit: the same animation throwing repeatedly is one bug, not
 * thousands.
 */
const seenMessages = new Set<string>();
const MAX_DISTINCT_REPORTS = 5;

let alerted = false;

function reportWorkletError(message: string, stack: string) {
  if (!seenMessages.has(message) && seenMessages.size < MAX_DISTINCT_REPORTS) {
    seenMessages.add(message);
    captureWorkletError(message, stack);
  }

  // The alert is a development affordance, not a product surface. It existed to
  // get a crash message out of a tester's hands by screenshot, which is no
  // longer the only channel now that these reach Sentry -- and a release user
  // should never be shown a stack trace. The app is not in danger either way:
  // the animation stops, the loop re-arms, and everything else keeps running.
  if (!__DEV__ || alerted) {
    return;
  }
  alerted = true;

  Alert.alert("Animation error", `${message}\n\n${stack.slice(0, 700)}`, [
    { text: "OK" },
  ]);
}

export function installWorkletCrashGuard() {
  try {
    runOnUI(() => {
      "worklet";

      const scope = globalThis as unknown as {
        __odosFrameGuardInstalled?: boolean;
        requestAnimationFrame?: (cb: (timestamp: number) => void) => number;
        requestAnimationFrameFinalizer?: (cb: () => void) => void;
        __nativeRequestAnimationFrame?: (cb: (timestamp: number) => void) => void;
      };

      // runOnUI may be invoked more than once across reloads; wrapping a
      // wrapper would nest handlers without adding protection.
      if (scope.__odosFrameGuardInstalled) {
        return;
      }

      const original = scope.requestAnimationFrame;
      const originalNative = scope.__nativeRequestAnimationFrame;

      if (typeof original !== "function" && typeof originalNative !== "function") {
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

      // The outer guard: covers everything a frame runs, microtasks included.
      // worklets re-registers the flush every frame, so wrapping the scheduler
      // takes effect from the next frame onward even though the run loop was
      // started long before this code could run.
      if (typeof originalNative === "function") {
        const rearm = (flush: (timestamp: number) => void) => {
          "worklet";
          originalNative((timestamp: number) => {
            try {
              flush(timestamp);
            } catch (error) {
              describe(error);
              // flush re-registers itself on its last line, which the throw
              // skipped. Without this the loop stops and the UI freezes for
              // good -- a worse outcome than the crash.
              rearm(flush);
            }
          });
        };

        scope.__nativeRequestAnimationFrame = rearm;
      }

      if (typeof original !== "function") {
        return;
      }

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
