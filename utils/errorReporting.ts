import * as Sentry from "@sentry/react-native";

/**
 * One place errors are reported from, and the only file that knows Sentry
 * exists.
 *
 * Sentry was removed from this app once, on the theory that it was failing to
 * report the launch crash. That was the wrong conclusion. The crash was a
 * JavaScript error thrown inside a Reanimated worklet on the UI runtime, which
 * worklets invokes from C++ without a try/catch -- so it aborted the process
 * without ever passing through the JS runtime's error handler. No crash
 * reporter could have seen it. Sentry was not broken; it was structurally
 * blind to that one class, and fine for everything else.
 *
 * So the important part of this file is not `Sentry.init`. It is that the
 * worklet guard reports *through here* (see captureWorkletError), which is what
 * closes the gap that made the original crash invisible for six builds.
 *
 * Coverage, stated plainly:
 *
 *   JS errors, unhandled rejections   -> Sentry, automatically
 *   native crashes                    -> Sentry, automatically
 *   React render errors               -> RootErrorBoundary -> captureError
 *   startup/bundle errors             -> index.js guard    -> captureError
 *   UI-runtime worklet errors         -> workletCrashGuard -> captureWorkletError
 *
 * The last line is the one that had to be built by hand.
 */

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? "";

/**
 * A plain-text switch, separate from the DSN.
 *
 * The DSN is stored as an EAS secret, and secrets take precedence over a build
 * profile's `env` block -- so overriding the DSN to disable Sentry silently
 * does nothing. This variable is not a secret, so a profile can actually set
 * it.
 */
const DISABLED = process.env.EXPO_PUBLIC_DISABLE_SENTRY === "1";

/**
 * Checked by shape rather than truthiness: a blank or half-pasted value would
 * pass a truthiness test and leave Sentry initialised against nothing,
 * reporting into a void while looking configured.
 */
export const isSentryEnabled =
  !DISABLED && DSN.startsWith("https://") && DSN.includes("ingest");

let initialised = false;

export function initErrorReporting() {
  if (initialised) {
    return;
  }
  initialised = true;

  if (!isSentryEnabled) {
    // No DSN is a normal local state. Reporting must never be the thing that
    // breaks the app.
    return;
  }

  try {
    Sentry.init({
      dsn: DSN,

      // Crashes only. Tracing is the usual way to exhaust a free tier and it
      // answers a question nobody is asking yet.
      tracesSampleRate: 0,

      // `release` is deliberately not set: the SDK derives it from the native
      // bundle (id@version+build), which is correct and automatic. It was once
      // pointed at EXPO_PUBLIC_APP_VERSION -- set nowhere -- so every event
      // carried release: undefined and Release Health recorded no sessions at
      // all, because it requires one.

      enableAutoSessionTracking: true,
      enableNativeCrashHandling: true,
    });
  } catch {
    // If initialisation fails the app carries on unreported. Losing reports is
    // bad; losing the app to the reporter would be worse.
  }
}

/** Reports a caught error. No-op when reporting is off. */
export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (__DEV__) {
    console.error("[odos] captured error", error, context ?? {});
  }

  if (!isSentryEnabled) {
    return;
  }

  try {
    Sentry.captureException(error, context ? { extra: context } : undefined);
  } catch {
    // Same reasoning as initErrorReporting.
  }
}

/**
 * Reports an error caught on the UI runtime.
 *
 * These arrive as a message and a stack string rather than an Error, because
 * they are marshalled across from the worklet runtime -- the original object
 * cannot cross that boundary. Rebuilding an Error here gives Sentry something
 * it can group and display properly instead of a bare string.
 *
 * Tagged so these are separable in Sentry: they are the class that aborts the
 * process outright when unguarded, so they deserve to be findable on their own
 * rather than mixed in with ordinary JS errors.
 */
export function captureWorkletError(message: string, stack: string) {
  if (__DEV__) {
    console.error("[odos] worklet animation error", message, stack);
  }

  if (!isSentryEnabled) {
    return;
  }

  try {
    const error = new Error(message);
    error.name = "WorkletRuntimeError";
    if (stack) {
      // Replace the (useless) JS-thread stack with the UI-runtime one the
      // guard actually captured.
      error.stack = `${error.name}: ${message}\n${stack}`;
    }

    Sentry.captureException(error, {
      tags: { runtime: "ui-worklet" },
      extra: { workletStack: stack },
    });
  } catch {
    // Same reasoning as above.
  }
}
