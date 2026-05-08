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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";

type ToastContextType = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
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
    ]).start(() => setVisible(false));
  }, [clearHideTimer, opacity, translateY]);

  const showToast = useCallback(
    (msg: string) => {
      clearHideTimer();
      setMessage(msg);
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
      }, 2200);
    },
    [clearHideTimer, hideToast, opacity, translateY],
  );

  useEffect(() => () => clearHideTimer(), [clearHideTimer]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {visible ? (
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
            style={styles.banner}
            android_ripple={{ color: "rgba(255,255,255,0.08)" }}
          >
            <View style={styles.iconWrap}>
              <Ionicons
                name="checkmark-circle"
                size={rMS(24)}
                color={AppColors.white}
              />
            </View>

            <View style={styles.textWrap}>
              <Text style={styles.title}>Success</Text>
              <Text style={styles.message}>{message}</Text>
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
    backgroundColor: "#11A85C",
    paddingHorizontal: rS(16),
    paddingVertical: rV(14),
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0E7A44",
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 22,
    elevation: 8,
  },
  iconWrap: {
    width: rMS(42),
    height: rMS(42),
    borderRadius: rMS(21),
    backgroundColor: "rgba(255,255,255,0.18)",
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
