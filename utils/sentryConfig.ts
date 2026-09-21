import * as Sentry from "@sentry/react-native";

/**
 * Crash reporting, in one place.
 *
 * This exists because of a specific, repeated failure: a tester's iOS crash
 * arrived as a C++ stack ending in `HermesRuntimeImpl::throwPendingError()`.
 * That says a JavaScript error was thrown inside a Reanimated worklet, and
 * says nothing whatsoever about *which* error -- Apple's crash reports do not
 * carry the Hermes message. Four plausible causes were investigated and ruled
 * out from the stack alone before it became obvious that the stack could not
 * settle it. Sentry captures the JS error itself, before the process dies.
 */

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? "";

/**
 * Checked by shape rather than truthiness, for the same reason the Mapbox
 * token is: a blank or half-pasted value would pass a truthiness test and
 * leave Sentry initialised against nothing, reporting silently into a void
 * while looking configured.
 */
export const isSentryEnabled = DSN.startsWith("https://") && DSN.includes("ingest");

export function initSentry() {
  if (!isSentryEnabled) {
    // No DSN is a perfectly normal local state. Crash reporting is the thing
    // that must never itself be the crash.
    return;
  }

  try {
    Sentry.init({
      dsn: DSN,

      // Crashes only. Performance tracing is the usual way to exhaust a free
      // tier, and it answers a question nobody is asking yet.
      tracesSampleRate: 0,

      // Tells Sentry which build an event came from, so a fixed crash can be
      // seen to stop rather than merely going quiet.
      release: process.env.EXPO_PUBLIC_APP_VERSION,

      // Breadcrumbs matter more than usual here: the open question is what
      // ran in the two seconds between launch and abort.
      enableAutoSessionTracking: true,

      // Native crashes are exactly the class this was added for -- a worklet
      // error surfaces as a native abort, not a JS exception.
      enableNativeCrashHandling: true,
    });
  } catch {
    // If initialisation itself fails, the app carries on without reporting.
    // Losing crash reports is bad; losing the app because of the crash
    // reporter would be worse.
  }
}
