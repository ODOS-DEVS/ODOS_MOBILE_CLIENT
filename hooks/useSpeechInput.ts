import Constants from "expo-constants";
import { useCallback, useEffect, useState } from "react";
import { NativeModules, Platform } from "react-native";

type SpeechModule = {
  requestPermissionsAsync: () => Promise<{ granted: boolean }>;
  start: (options: { lang?: string; interimResults?: boolean }) => void;
  stop: () => void;
  isRecognitionAvailable?: () => boolean;
  addListener: (
    event: "result" | "error" | "end",
    callback: (event: { results?: { transcript?: string }[]; error?: string }) => void,
  ) => { remove: () => void };
};

let speechModule: SpeechModule | null | undefined;

function isExpoGo(): boolean {
  return Constants.appOwnership === "expo";
}

function hasNativeSpeechModule(): boolean {
  return Boolean((NativeModules as Record<string, unknown>).ExpoSpeechRecognition);
}

function getSpeechModule(): SpeechModule | null {
  if (speechModule !== undefined) {
    return speechModule;
  }

  speechModule = null;

  // expo-speech-recognition requires a dev/production build — not Expo Go.
  if (isExpoGo() || !hasNativeSpeechModule()) {
    return null;
  }

  try {
    speechModule = require("expo-speech-recognition") as SpeechModule;
  } catch {
    speechModule = null;
  }

  return speechModule;
}

export function useSpeechInput() {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (isExpoGo() || !hasNativeSpeechModule()) {
      setIsSupported(false);
      return;
    }

    try {
      const module = getSpeechModule();
      if (!module) {
        setIsSupported(false);
        return;
      }
      const available =
        typeof module.isRecognitionAvailable === "function"
          ? module.isRecognitionAvailable()
          : Platform.OS !== "web";
      setIsSupported(Boolean(available));
    } catch {
      setIsSupported(false);
    }
  }, []);

  const startListening = useCallback(
    async (onResult: (text: string) => void) => {
      if (isExpoGo() || isListening) {
        return;
      }

      let module: SpeechModule | null = null;
      try {
        module = getSpeechModule();
      } catch {
        module = null;
      }

      if (!module) {
        return;
      }

      const permission = await module.requestPermissionsAsync();
      if (!permission.granted) {
        return;
      }

      const resultListener = module.addListener("result", (event) => {
        const transcript = event.results?.[0]?.transcript?.trim();
        if (transcript) {
          onResult(transcript);
        }
      });
      const endListener = module.addListener("end", () => {
        setIsListening(false);
        resultListener.remove();
        endListener.remove();
        errorListener.remove();
      });
      const errorListener = module.addListener("error", () => {
        setIsListening(false);
        resultListener.remove();
        endListener.remove();
        errorListener.remove();
      });

      setIsListening(true);
      module.start({
        lang: "en-GH",
        interimResults: false,
      });
    },
    [isListening],
  );

  const stopListening = useCallback(() => {
    try {
      getSpeechModule()?.stop();
    } catch {
      // Native module may be unavailable.
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
  };
}
