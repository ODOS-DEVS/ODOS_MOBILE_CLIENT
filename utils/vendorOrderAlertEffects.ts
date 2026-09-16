import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { AppState, Platform, Vibration } from "react-native";

// Was expo-av, which Expo dropped from the SDK at 57 — it is no longer in
// Expo Go, and importing it there fails before any runtime guard can help.
// expo-audio is the maintained replacement and is already used by the chat
// voice notes (see hooks/useVoiceNoteRecorder.ts).
//
// The old Expo Go guard is gone with it: this alert now works in Expo Go the
// same as anywhere else, which is the point of being able to test there.
let soundInstance: AudioPlayer | null = null;
let soundLoading: Promise<void> | null = null;
let effectsChain: Promise<void> = Promise.resolve();
let pendingHapticTimeout: ReturnType<typeof setTimeout> | null = null;

async function ensureSoundLoaded() {
  if (Platform.OS === "web") {
    return;
  }

  if (soundInstance) {
    return;
  }

  if (soundLoading) {
    await soundLoading;
    return;
  }

  soundLoading = (async () => {
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        // A new-order chime should cut through whatever the vendor is
        // listening to, then hand the audio session straight back.
        interruptionMode: "doNotMix",
        shouldRouteThroughEarpiece: false,
      });
      const player = createAudioPlayer(require("@/assets/sounds/vendor_order.wav"));
      player.volume = 1;
      soundInstance = player;
    } catch {
      soundInstance = null;
    } finally {
      soundLoading = null;
    }
  })();

  await soundLoading;
}

async function stopSoundIfPlaying() {
  if (!soundInstance) {
    return;
  }

  try {
    if (soundInstance.playing) {
      soundInstance.pause();
    }
    // Rewound rather than recreated: a second order arriving while the first
    // chime is still ringing should restart the sound, not stack a second
    // player on top of it.
    await soundInstance.seekTo(0);
  } catch {
    // Ignore stop/seek failures before the next play attempt.
  }
}

function clearPendingHaptic() {
  if (!pendingHapticTimeout) {
    return;
  }

  clearTimeout(pendingHapticTimeout);
  pendingHapticTimeout = null;
}

export async function playVendorOrderAlertSound() {
  await ensureSoundLoaded();
  if (!soundInstance) {
    return;
  }

  try {
    await stopSoundIfPlaying();
    soundInstance.play();
  } catch {
    // Best-effort custom alert sound.
  }
}

export async function playVendorOrderAlertEffects(options?: {
  title?: string;
  body?: string;
  isReminder?: boolean;
}) {
  const run = async () => {
    if (AppState.currentState !== "active") {
      return;
    }

    clearPendingHaptic();

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      // Best-effort haptic feedback.
    }

    if (Platform.OS !== "web") {
      try {
        if (Platform.OS === "android") {
          Vibration.cancel();
        }
        Vibration.vibrate(
          options?.isReminder
            ? [0, 500, 200, 500, 200, 500, 200, 700]
            : [0, 400, 180, 400, 180, 600],
        );
      } catch {
        // Best-effort vibration.
      }
    }

    await playVendorOrderAlertSound();

    pendingHapticTimeout = setTimeout(() => {
      pendingHapticTimeout = null;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {
        // Best-effort follow-up haptic.
      });
    }, options?.isReminder ? 1200 : 900);
  };

  effectsChain = effectsChain.then(run, run);
  await effectsChain;
}

export async function unloadVendorOrderAlertSound() {
  if (!soundInstance) {
    return;
  }

  try {
    soundInstance.remove();
  } catch {
    // Ignore unload failures.
  } finally {
    soundInstance = null;
  }
}
