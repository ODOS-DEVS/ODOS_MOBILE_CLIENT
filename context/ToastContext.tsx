import React, { createContext, useContext, useState } from "react";
import { Animated, Text, View } from "react-native";

type ToastContextType = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const opacity = new Animated.Value(0);

  const showToast = (msg: string) => {
    setMessage(msg);
    setVisible(true);

    // Fade in
    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        // Fade out after delay
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => setVisible(false));
      }, 1200);
    });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {visible && (
        <Animated.View
          style={{
            position: "absolute",
            top: 90,
            bottom: 0,
            left: 0,
            right: 0,
            alignItems: "center",
            opacity,
          }}
        >
          <View
            style={{
              backgroundColor: "black",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>{message}</Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
};
