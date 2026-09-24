/**
 * Error reporting, without a crash reporter.
 *
 * This replaces a Sentry integration that was added to diagnose a launch
 * crash and never reported a single event across three builds. It was also
 * the only native change between the last build confirmed working and the
 * builds that crash, which made it a liability rather than a diagnostic: it
 * added native startup code to an app whose problem is that it dies during
 * startup.
 *
 * The diagnostics that replaced it are pure JavaScript and cannot introduce a
 * native failure of their own -- a try/catch around the app entry (index.js)
 * that renders a startup error to the screen, and a React error boundary that
 * does the same for render errors. Both put the message where a tester can
 * screenshot it, which is the channel that has actually been available all
 * along.
 */

/**
 * Records a caught error.
 *
 * In development this prints, which is visible in the Metro console. In a
 * release build there is nowhere to send it, and that is deliberate for now:
 * the error boundary shows the message on screen instead. Should a crash
 * reporter be reintroduced later, this is the single place it attaches to.
 */
export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (__DEV__) {
    console.error("[odos] captured error", error, context ?? {});
  }
}
