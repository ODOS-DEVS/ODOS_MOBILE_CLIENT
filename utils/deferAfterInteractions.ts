/**
 * Run work once the UI has settled.
 *
 * Replaces `InteractionManager.runAfterInteractions`, which React Native
 * removed in 0.88 after deprecating it — its own deprecation notice pointed at
 * `requestIdleCallback`, which RN polyfills in `Libraries/Core/setUpTimers`.
 *
 * The semantics are close but not identical: `runAfterInteractions` waited for
 * registered interaction handles to clear, while `requestIdleCallback` waits
 * for an idle frame. For these callers — realtime socket events refreshing
 * stores behind the current screen — "don't compete with the frame the user is
 * looking at" is the whole requirement, and both satisfy it.
 *
 * The timeout matters: without it an app that never goes idle (a long scroll,
 * a running animation) could defer the callback indefinitely, and a dropped
 * order update is worse than one landing mid-frame.
 */
const IDLE_TIMEOUT_MS = 500;

export function deferAfterInteractions(task: () => void) {
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(() => task(), { timeout: IDLE_TIMEOUT_MS });
    return;
  }

  // Web and any runtime without the polyfill still need the work to happen.
  setTimeout(task, 0);
}
