import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

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

function getSpeechModule(): SpeechModule | null {
  if (speechModule !== undefined) {
    return speechModule;
  }
  try {
    // Optional native module — assistant still works without it.
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
  }, []);

  const startListening = useCallback(
    async (onResult: (text: string) => void) => {
      const module = getSpeechModule();
      if (!module || isListening) {
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
    const module = getSpeechModule();
    module?.stop();
    setIsListening(false);
  }, []);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
  };
}
