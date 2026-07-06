import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { Platform, Vibration } from "react-native";

const isExpoGo = Constants.appOwnership === "expo";
let soundInstance: Audio.Sound | null = null;
let soundLoading: Promise<void> | null = null;

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
        require("@/assets/sounds/vendor-order.wav"),
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

export async function playVendorOrderAlertSound() {
  await ensureSoundLoaded();
  if (!soundInstance) {
    return;
  }

  try {
    await soundInstance.setPositionAsync(0);
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
  void options;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

  if (Platform.OS !== "web") {
    Vibration.vibrate(
      options?.isReminder ? [0, 500, 200, 500, 200, 500, 200, 700] : [0, 400, 180, 400, 180, 600],
    );
  }

  await playVendorOrderAlertSound();

  setTimeout(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, options?.isReminder ? 1200 : 900);
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
