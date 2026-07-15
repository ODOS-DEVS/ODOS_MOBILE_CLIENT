import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { AppState, Platform, Vibration } from "react-native";

const isExpoGo = Constants.appOwnership === "expo";
let soundInstance: Audio.Sound | null = null;
let soundLoading: Promise<void> | null = null;
let effectsChain: Promise<void> = Promise.resolve();
let pendingHapticTimeout: ReturnType<typeof setTimeout> | null = null;

async function ensureSoundLoaded() {
  if (isExpoGo || Platform.OS === "web") {
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
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      });
      const { sound } = await Audio.Sound.createAsync(
        require("@/assets/sounds/vendor_order.wav"),
        { shouldPlay: false, volume: 1 },
      );
      soundInstance = sound;
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
    const status = await soundInstance.getStatusAsync();
    if (!status.isLoaded) {
      return;
    }

    if (status.isPlaying) {
      await soundInstance.stopAsync();
    }

    await soundInstance.setPositionAsync(0);
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
    await soundInstance.playAsync();
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
    await soundInstance.unloadAsync();
  } catch {
    // Ignore unload failures.
  } finally {
    soundInstance = null;
  }
}
