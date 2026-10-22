import CommerceImage from "@/components/media/CommerceImage";
import { productCardGapX, productCardGapY, rS, rV } from "@/styles/responsive";
import { useCatalogCardTextStyles, useCommerceTheme } from "@/styles/themedCommerce";
import {
  computeStoreOpenStatus,
  formatNextOpenLabel,
  type BusinessHoursMap,
} from "@/utils/storeHours";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface StoreCardProps {
  id: string;
  image: any;
  imageKey?: string;
  imageUrl?: string;
  imageBannerUrl?: string;
  title: string;
  category?: string;
  city?: string;
  rating?: number;
  reviews?: string;
  status?: string;
  isOnVacation?: boolean;
  businessHours?: BusinessHoursMap | null;
  /** Optional width override to match product cards */
  cardWidth?: number;
  /** Optional override for horizontal spacing (margin-right) */
  horizontalSpacing?: number;
}

const StoreCard: React.FC<StoreCardProps> = ({
  id,
  image,
  imageKey,
  imageUrl,
  imageBannerUrl,
  title,
  category,
  city,
  rating,
  reviews,
  status,
  isOnVacation,
  businessHours,
  cardWidth,
  horizontalSpacing,
}) => {
  const { cardShell, colors } = useCommerceTheme();
  const textStyles = useCatalogCardTextStyles();
  const width = cardWidth ?? rS(160);
  const imageHeight = rV(130);
  const spacingRight = horizontalSpacing ?? productCardGapX();
  const hasRating = typeof rating === "number" && Number.isFinite(rating);
  const isVerified = status === "active";
  const subtitle = category || city;
  const openStatus = useMemo(() => computeStoreOpenStatus(businessHours), [businessHours]);
  const showClosedBadge = isOnVacation || (openStatus && !openStatus.isOpen);
  const nextOpenLabel = useMemo(
    () => (showClosedBadge && !isOnVacation ? formatNextOpenLabel(businessHours) : null),
    [businessHours, isOnVacation, showClosedBadge],
  );

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: "/(root)/screens/stores/[id]" as any,
          params: {
            id,
            image: imageUrl ?? undefined,
            imageKey,
            imageUrl,
            imageBanner: imageBannerUrl ?? undefined,
            title,
          },
        })
      }
    >
      <View
        style={{
          width,
          borderRadius: rS(16),
          marginRight: spacingRight,
          marginBottom: productCardGapY(),
          marginTop: rV(2),
          ...cardShell,
        }}
      >
        <View
          style={{
            position: "relative",
            height: imageHeight,
            backgroundColor: colors.imagePlaceholder,
            borderTopLeftRadius: rS(16),
            borderTopRightRadius: rS(16),
            borderBottomLeftRadius: rS(16),
            borderBottomRightRadius: rS(16),
            overflow: "hidden",
          }}
        >
          {image ? (
            <CommerceImage
              source={image}
              trackingId={`store-${id}`}
              recyclingKey={imageKey || imageUrl || id}
              placeholderColor={colors.imagePlaceholder}
            />
          ) : (
            <View
              style={{
                width: "100%",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                gap: rV(6),
                backgroundColor: colors.imagePlaceholder,
              }}
            >
              <Ionicons name="storefront-outline" size={rS(22)} color={colors.iconMuted} />
              <Text style={{ fontSize: rS(11), ...textStyles.placeholderLabel }}>
                Store image pending
              </Text>
            </View>
          )}
          {/*
            A closed store reads as closed before a word is read.

            This used to be a small red pill in the corner, which competed with
            the artwork rather than qualifying it — a shopper scanning a row of
            bright, identical-looking cards had to find and parse a badge on
            each one to learn that half of them could not be ordered from.

            Dimming the image does that work pre-attentively: the closed cards
            recede, the open ones stay forward, and the row sorts itself
            visually. The scrim then gives the one fact the dimming cannot —
            when to come back — so the card answers "can I order now?" and
            "when can I?" in a single glance.

            Still tappable on purpose: browsing a closed shop and scheduling is
            exactly what "Scheduled only" exists for, so this must not read as
            a disabled control.
          */}
          {showClosedBadge ? (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: rS(10),
                gap: rV(6),
                backgroundColor: "rgba(9, 12, 18, 0.62)",
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: rS(12),
                  fontWeight: "700",
                  textAlign: "center",
                }}
                numberOfLines={2}
              >
                {isOnVacation ? "On a break" : (nextOpenLabel ?? "Closed")}
              </Text>
              <View
                style={{
                  paddingHorizontal: rS(9),
                  paddingVertical: rV(4),
                  borderRadius: rS(999),
                  backgroundColor: "rgba(255, 255, 255, 0.94)",
                }}
              >
                <Text
                  style={{ color: "#111827", fontSize: rS(10), fontWeight: "700" }}
                  numberOfLines={1}
                >
                  {isOnVacation ? "Back soon" : "Scheduled only"}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={{ padding: rS(12) }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: rS(8),
            }}
          >
            <Text
              style={{ ...textStyles.title, fontSize: rS(13), flex: 1, textAlign: "left" }}
              numberOfLines={1}
            >
              {title}
            </Text>

            {hasRating ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flexShrink: 0,
                  gap: rS(2),
                }}
              >
                <Ionicons name="star" size={rS(13)} color="#facc15" />
                <Text
                  style={{ ...textStyles.category, fontSize: rS(11), marginLeft: rS(2) }}
                >
                  {rating!.toFixed(1)}
                </Text>
              </View>
            ) : isVerified ? (
              <Ionicons name="checkmark-circle" size={rS(14)} color={colors.textMuted} />
            ) : null}
          </View>

          {subtitle || reviews ? (
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: rV(3), gap: rS(4) }}>
              {subtitle ? (
                <Text
                  style={{ ...textStyles.category, fontSize: rS(11), flex: 1 }}
                  numberOfLines={1}
                >
                  {subtitle}
                </Text>
              ) : null}
              {reviews ? (
                <Text style={{ ...textStyles.category, fontSize: rS(10.5) }}>
                  {reviews}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default StoreCard;
