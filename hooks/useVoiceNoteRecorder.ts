import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useCallback } from "react";

/** Wraps expo-audio's recorder in the small imperative surface the chat
 * composer's press-and-hold UI needs. expo-av's Audio.Recording is
 * deprecated on newer Expo SDKs and was the source of native crashes here —
 * expo-audio is the maintained replacement. */
export function useVoiceNoteRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);

  const startRecording = useCallback(async () => {
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        return { granted: false as const };
      }

      // iOS refuses to record until the audio session is explicitly switched
      // into a recording-capable mode — RecordingDisabledException otherwise.
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      return { granted: true as const };
    } catch {
      await setAudioModeAsync({ allowsRecording: false }).catch(() => undefined);
      return { granted: false as const };
    }
  }, [recorder]);

  const stopRecording = useCallback(async () => {
    if (!recorderState.isRecording) {
      return null;
    }

    // Read the duration BEFORE stopping — `currentTime` resets to 0 the
    // instant `.stop()` is called, so reading it after always looked like a
    // sub-1-second (i.e. discarded) recording no matter how long you held.
    const durationSeconds = Math.round(recorder.currentTime);
    await recorder.stop();
    await setAudioModeAsync({ allowsRecording: false });
    const uri = recorder.uri;

    if (!uri || durationSeconds < 1) {
      return null;
    }

    return { uri, durationSeconds };
  }, [recorder, recorderState.isRecording]);

  const discardRecording = useCallback(async () => {
    if (recorderState.isRecording) {
      await recorder.stop().catch(() => undefined);
    }
    await setAudioModeAsync({ allowsRecording: false }).catch(() => undefined);
  }, [recorder, recorderState.isRecording]);

  return {
    isRecording: recorderState.isRecording,
    elapsedSeconds: Math.floor((recorderState.durationMillis ?? 0) / 1000),
    startRecording,
    stopRecording,
    discardRecording,
  };
}
