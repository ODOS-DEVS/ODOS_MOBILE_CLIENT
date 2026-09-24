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
/**
 * A separate, plain-text switch rather than an empty DSN.
 *
 * Overriding the DSN from a build profile does not work: it is stored as an
 * EAS secret, and secrets take precedence over a profile's `env` block. An
 * attempt to build a Sentry-free control that way produced two effectively
 * identical APKs, both carrying the real DSN -- confirmed by finding the org
 * id in both bundles. This variable is not a secret, so a profile can set it.
 */
const DISABLED = process.env.EXPO_PUBLIC_DISABLE_SENTRY === "1";

export const isSentryEnabled =
  !DISABLED && DSN.startsWith("https://") && DSN.includes("ingest");

let initialised = false;

export function initSentry() {
  if (initialised) {
    // Safe to call from more than one place. The module self-initialises on
    // import (see the bottom of this file) and callers may also ask
    // explicitly; double-initialising Sentry is not harmless.
    return;
  }
  initialised = true;

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

      // `release` is deliberately not set. The SDK derives it from the native
      // bundle (id@version+build), which is both correct and automatic. It was
      // previously pointed at EXPO_PUBLIC_APP_VERSION -- a variable that is
      // set nowhere -- so every event carried release: undefined, and Release
      // Health silently recorded no sessions at all because it requires one.

      // Breadcrumbs matter more than usual here: the open question is what
      // ran in the two seconds between launch and abort.
      enableAutoSessionTracking: true,

      // Native crashes are exactly the class this was added for -- a worklet
      // error surfaces as a native abort, not a JS exception.
      enableNativeCrashHandling: true,
    });

    // DIAGNOSTIC -- remove once the launch crash is fixed.
    //
    // Two builds have now reached testers, crashed, and produced nothing in
    // Sentry. That silence has two very different explanations and no way to
    // tell them apart: either Sentry is not reporting at all (DSN, network,
    // init), or it is fine and the crash happens before this line runs. One
    // event per cold start separates them. If this arrives and the crash does
    // not, the crash is beating initialisation and the fix is to arm the
    // native handler earlier. If not even this arrives, the pipeline is broken
    // and chasing the crash is premature.
    Sentry.captureMessage("cold start reached Sentry.init", "info");
  } catch {
    // If initialisation itself fails, the app carries on without reporting.
    // Losing crash reports is bad; losing the app because of the crash
    // reporter would be worse.
  }
}

/**
 * Reports a caught error, and is a no-op when Sentry is not configured.
 *
 * Exists so callers -- chiefly the root error boundary -- never have to know
 * whether reporting is switched on, and never have to guard a call themselves.
 */
export function captureError(
  error: unknown,
  context?: Record<string, unknown>,
) {
  if (!isSentryEnabled) {
    return;
  }

  try {
    Sentry.captureException(error, context ? { extra: context } : undefined);
  } catch {
    // Same reasoning as initSentry: reporting a crash must not cause one.
  }
}

// Initialised on import, not from a caller, and this module is deliberately the
// first import in app/_layout.tsx. ES module imports all evaluate before any
// statement in the importing file, so a call placed in _layout's body -- where
// this used to live -- runs only after every other context and provider module
// has already been evaluated. An error thrown while evaluating any of those
// would have happened with no handler armed, and looked exactly like the
// silence being investigated.
initSentry();
