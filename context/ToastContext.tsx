import { Ionicons } from "@expo/vector-icons";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";

export type ToastVariant = "success" | "error" | "warning" | "info";

export type ToastInput = {
  message: string;
  title?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastContextType = {
  showToast: (input: string | ToastInput, variant?: ToastVariant) => void;
  showSuccessToast: (message: string, title?: string) => void;
  showErrorToast: (message: string, title?: string) => void;
  showWarningToast: (message: string, title?: string) => void;
  showInfoToast: (message: string, title?: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const VARIANT_META: Record<
  ToastVariant,
  {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    backgroundColor: string;
    shadowColor: string;
    iconColor: string;
    iconShell: string;
  }
> = {
  success: {
    title: "Success",
    icon: "checkmark-circle",
    backgroundColor: "#0F9D58",
    shadowColor: "#0B7A44",
    iconColor: "#FFFFFF",
    iconShell: "rgba(255,255,255,0.18)",
  },
  error: {
    title: "Something went wrong",
    icon: "close-circle",
    backgroundColor: "#DC2626",
    shadowColor: "#991B1B",
    iconColor: "#FFFFFF",
    iconShell: "rgba(255,255,255,0.16)",
  },
  warning: {
    title: "Heads up",
    icon: "alert-circle",
    backgroundColor: "#D97706",
    shadowColor: "#92400E",
    iconColor: "#FFFFFF",
    iconShell: "rgba(255,255,255,0.16)",
  },
  info: {
    title: "Notice",
    icon: "information-circle",
    backgroundColor: "#2563EB",
    shadowColor: "#1D4ED8",
    iconColor: "#FFFFFF",
    iconShell: "rgba(255,255,255,0.16)",
  },
};

function inferToastVariant(message: string): ToastVariant {
  const text = message.toLowerCase();

  if (
    /(couldn't|could not|failed|failure|unable to|invalid|error|denied|rejected|not found|wrong password|incorrect|expired|unavailable)/.test(
      text,
    )
  ) {
    return "error";
  }

  if (
    /(warning|caution|attention|required|complete the|fill in|allow photo|sign in|pending review)/.test(
      text,
    )
  ) {
    return "warning";
  }

  if (
    /(saved|success|added|updated|applied|sent|submitted|live|complete|removed|archived|copied)/.test(
      text,
    )
  ) {
    return "success";
  }

  return "info";
}

function normalizeToastInput(
  input: string | ToastInput,
  variantOverride?: ToastVariant,
): Required<ToastInput> & { variant: ToastVariant } {
  if (typeof input === "string") {
    const variant = variantOverride ?? inferToastVariant(input);
    return {
      message: input,
      title: VARIANT_META[variant].title,
      variant,
      duration: 2600,
    };
  }

  const variant = variantOverride ?? input.variant ?? inferToastVariant(input.message);
  return {
    message: input.message,
    title: input.title ?? VARIANT_META[variant].title,
    variant,
    duration: input.duration ?? 2600,
  };
}

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<(Required<ToastInput> & { variant: ToastVariant }) | null>(
    null,
  );
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(-140)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const hideToast = useCallback(() => {
    clearHideTimer();
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -140,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setToast(null);
    });
  }, [clearHideTimer, opacity, translateY]);

  const presentToast = useCallback(
    (input: string | ToastInput, variantOverride?: ToastVariant) => {
      const nextToast = normalizeToastInput(input, variantOverride);
      clearHideTimer();
      setToast(nextToast);
      setVisible(true);

      translateY.stopAnimation();
      opacity.stopAnimation();
      translateY.setValue(-140);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 16,
          stiffness: 150,
          mass: 0.9,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      hideTimerRef.current = setTimeout(() => {
        hideToast();
      }, nextToast.duration);
    },
    [clearHideTimer, hideToast, opacity, translateY],
  );

  const showSuccessToast = useCallback(
    (message: string, title?: string) => {
      presentToast({ message, title, variant: "success" });
    },
    [presentToast],
  );

  const showErrorToast = useCallback(
    (message: string, title?: string) => {
      presentToast({ message, title, variant: "error", duration: 3200 });
    },
    [presentToast],
  );

  const showWarningToast = useCallback(
    (message: string, title?: string) => {
      presentToast({ message, title, variant: "warning", duration: 2800 });
    },
    [presentToast],
  );

  const showInfoToast = useCallback(
    (message: string, title?: string) => {
      presentToast({ message, title, variant: "info" });
    },
    [presentToast],
  );

  useEffect(() => () => clearHideTimer(), [clearHideTimer]);

  const meta = toast ? VARIANT_META[toast.variant] : VARIANT_META.success;

  return (
    <ToastContext.Provider
      value={{
        showToast: presentToast,
        showSuccessToast,
        showErrorToast,
        showWarningToast,
        showInfoToast,
      }}
    >
      {children}

      {visible && toast ? (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.overlay,
            {
              paddingTop: insets.top + rV(8),
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <Pressable
            onPress={hideToast}
            style={[
              styles.banner,
              {
                backgroundColor: meta.backgroundColor,
                shadowColor: meta.shadowColor,
              } as StyleProp<ViewStyle>,
            ]}
            android_ripple={{ color: "rgba(255,255,255,0.08)" }}
          >
            <View style={[styles.iconWrap, { backgroundColor: meta.iconShell }]}>
              <Ionicons name={meta.icon} size={rMS(24)} color={meta.iconColor} />
            </View>

            <View style={styles.textWrap}>
              <Text style={styles.title}>{toast.title}</Text>
              <Text style={styles.message}>{toast.message}</Text>
            </View>

            <Ionicons
              name="close-outline"
              size={rMS(20)}
              color="rgba(255,255,255,0.92)"
            />
          </Pressable>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: rS(12),
  },
  banner: {
    minHeight: rV(76),
    borderRadius: rMS(22),
    paddingHorizontal: rS(16),
    paddingVertical: rV(14),
    flexDirection: "row",
    alignItems: "center",
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 22,
    elevation: 8,
  },
  iconWrap: {
    width: rMS(42),
    height: rMS(42),
    borderRadius: rMS(21),
    alignItems: "center",
    justifyContent: "center",
    marginRight: rS(12),
  },
  textWrap: {
    flex: 1,
    paddingRight: rS(8),
  },
  title: {
    color: AppColors.white,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    marginBottom: rV(2),
  },
  message: {
    color: "rgba(255,255,255,0.96)",
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(17),
  },
});
