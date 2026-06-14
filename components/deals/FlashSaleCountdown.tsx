import { formatFlashEndsInLabel, getSecondsRemaining } from "@/utils/countdown";
import { rS, rV } from "@/styles/responsive";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

type FlashSaleCountdownProps = {
  endsAt?: string | null;
  serverSecondsRemaining?: number | null;
  tone?: "dark" | "gold";
  labelPrefix?: string;
};

export function FlashSaleCountdown({
  endsAt,
  serverSecondsRemaining,
  tone = "dark",
  labelPrefix = "Ends in",
}: FlashSaleCountdownProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(() => {
    if (typeof serverSecondsRemaining === "number") {
      return Math.max(serverSecondsRemaining, 0);
    }
    return getSecondsRemaining(endsAt);
  });

  useEffect(() => {
    if (typeof serverSecondsRemaining === "number") {
      setSecondsRemaining(Math.max(serverSecondsRemaining, 0));
    } else {
      setSecondsRemaining(getSecondsRemaining(endsAt));
    }
  }, [endsAt, serverSecondsRemaining]);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((current) => {
        if (typeof serverSecondsRemaining === "number") {
          return Math.max(current - 1, 0);
        }
        return getSecondsRemaining(endsAt);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [endsAt, secondsRemaining, serverSecondsRemaining]);

  const label =
    secondsRemaining <= 0
      ? "Sale ended"
      : `${labelPrefix} ${formatFlashEndsInLabel(secondsRemaining).replace(/^Ends in /, "")}`;

  const palette =
    tone === "gold"
      ? {
          backgroundColor: "rgba(17, 24, 39, 0.88)",
          color: "#FCD34D",
        }
      : {
          backgroundColor: "rgba(220, 38, 38, 0.12)",
          color: "#B91C1C",
        };

  return (
    <View
      style={{
        backgroundColor: palette.backgroundColor,
        paddingVertical: rV(4),
        paddingHorizontal: rS(10),
        borderRadius: rS(999),
      }}
    >
      <Text
        style={{
          color: palette.color,
          fontSize: rS(11),
          fontWeight: "700",
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default FlashSaleCountdown;
