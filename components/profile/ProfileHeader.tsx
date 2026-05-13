import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { goBackOr } from "@/utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import { type Href, usePathname, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

interface ProfileHeaderProps {
  title: string;
  onBack?: () => void;
  rightNode?: React.ReactNode;
  showBackButton?: boolean;
  fallbackHref?: Href;
}

function resolveHeaderFallback(pathname: string): Href {
  if (pathname.includes("/vendor/dashboard")) {
    return "/(root)/(tabs)/profile";
  }

  if (pathname.includes("/vendor/apply") || pathname.includes("/vendor/application-status")) {
    return "/(root)/(tabs)/profile";
  }

  if (pathname.includes("/vendor")) {
    return "/vendor/dashboard" as Href;
  }

  if (
    pathname.endsWith("/screens/profileScreens/orders") ||
    pathname.endsWith("/profileScreens/orders")
  ) {
    return "/(root)/(tabs)/profile";
  }

  if (pathname.includes("/screens/profileScreens/orders")) {
    return "/(root)/screens/profileScreens/orders" as any;
  }

  if (pathname.includes("/screens/profileScreens")) {
    return "/(root)/(tabs)/profile";
  }

  if (pathname.includes("/screens/categories")) {
    return "/(root)/(tabs)/category";
  }

  if (pathname.includes("/screens/stores/stores")) {
    return "/(root)/(tabs)";
  }

  if (pathname.includes("/screens/stores")) {
    return "/(root)/screens/stores/stores" as any;
  }

  if (
    pathname.includes("/screens/market") ||
    pathname.includes("/screens/recommendation") ||
    pathname.includes("/screens/popular") ||
    pathname.includes("/screens/search") ||
    pathname.includes("/screens/Notification")
  ) {
    return "/(root)/(tabs)";
  }

  return "/(root)/(tabs)";
}

export default function ProfileHeader({
  title,
  onBack,
  rightNode,
  showBackButton = true,
  fallbackHref,
}: ProfileHeaderProps) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const pathname = usePathname();

  const headerSizing = useMemo(() => {
    if (width >= 1200) {
      return {
        maxWidth: 1120,
        paddingX: 28,
        paddingTop: rV(60),
        paddingBottom: rV(22),
      };
    }
    if (width >= 900) {
      return {
        maxWidth: 980,
        paddingX: 24,
        paddingTop: rV(56),
        paddingBottom: rV(20),
      };
    }
    if (width >= 600) {
      return {
        maxWidth: 760,
        paddingX: 18,
        paddingTop: rV(50),
        paddingBottom: rV(16),
      };
    }
    // Phones and small tablets
    return {
      maxWidth: width,
      paddingX: 16,
      paddingTop: rV(48),
      paddingBottom: rV(12),
    };
  }, [width]);

  const resolvedFallback = useMemo(
    () => fallbackHref ?? resolveHeaderFallback(pathname),
    [fallbackHref, pathname],
  );

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: headerSizing.paddingTop,
          paddingBottom: headerSizing.paddingBottom,
        },
      ]}
    >
      <View
        style={[
          styles.headerContent,
          {
            maxWidth: headerSizing.maxWidth,
            paddingHorizontal: headerSizing.paddingX,
          },
        ]}
      >
        {showBackButton ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={
              onBack ??
              (() =>
                goBackOr(router, {
                  fallback: resolvedFallback,
                }))
            }
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={AppColors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.leftSlot} />
        )}

        <Text numberOfLines={1} style={styles.headerTitle}>
          {title}
        </Text>

        <View style={styles.rightSlot}>{rightNode ?? null}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    backgroundColor: AppColors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    alignSelf: "center",
  },
  backButton: {
    width: rMS(38),
    height: rMS(38),
    borderRadius: rMS(19),
    backgroundColor: "#F1F3F5",
    alignItems: "center",
    justifyContent: "center",
  },
  leftSlot: {
    width: rMS(38),
    height: rMS(38),
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    marginHorizontal: rS(8),
    fontSize: rMS(18),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  rightSlot: {
    width: rMS(38),
    alignItems: "center",
    justifyContent: "center",
  },
});
