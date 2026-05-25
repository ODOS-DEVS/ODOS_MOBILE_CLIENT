import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ImageSourcePropType,
} from "react-native";

export const productFormStyles = StyleSheet.create({
  sectionGap: {
    gap: rV(14),
  },
  helperText: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(19),
    color: "#6B7280",
  },
  fieldBlock: {
    gap: rV(10),
  },
  fieldLabel: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
    color: AppColors.text,
  },
  errorText: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    color: "#DC2626",
  },
  rowStack: {
    gap: rS(12),
  },
  rowSplit: {
    flexDirection: "row",
    gap: rS(12),
  },
  rowHalf: {
    flex: 1,
  },
});

type ProgressItem = {
  key: string;
  label: string;
  done: boolean;
};

export function ProductFormProgressCard({ items }: { items: ProgressItem[] }) {
  const doneCount = items.filter((item) => item.done).length;

  return (
    <View style={progressStyles.card}>
      <View style={progressStyles.header}>
        <Text style={progressStyles.title}>Listing readiness</Text>
        <Text style={progressStyles.count}>
          {doneCount}/{items.length} complete
        </Text>
      </View>
      <View style={progressStyles.track}>
        <View
          style={[
            progressStyles.fill,
            { width: `${Math.max(8, (doneCount / Math.max(items.length, 1)) * 100)}%` },
          ]}
        />
      </View>
      <View style={progressStyles.list}>
        {items.map((item) => (
          <View key={item.key} style={progressStyles.item}>
            <Ionicons
              name={item.done ? "checkmark-circle" : "ellipse-outline"}
              size={rMS(16)}
              color={item.done ? "#16A34A" : "#D1D5DB"}
            />
            <Text
              style={[progressStyles.itemLabel, item.done && progressStyles.itemLabelDone]}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function ProductFormPreviewCard({
  name,
  categoryLabel,
  priceLabel,
  imageUri,
}: {
  name: string;
  categoryLabel: string;
  priceLabel: string;
  imageUri?: string;
}) {
  const source: ImageSourcePropType | undefined = imageUri ? { uri: imageUri } : undefined;

  return (
    <View style={previewStyles.card}>
      <Text style={previewStyles.eyebrow}>Shopper preview</Text>
      <View style={previewStyles.row}>
        <View style={previewStyles.thumb}>
          {source ? (
            <Image source={source} style={previewStyles.thumbImage} resizeMode="cover" />
          ) : (
            <Ionicons name="image-outline" size={rMS(22)} color="#9CA3AF" />
          )}
        </View>
        <View style={previewStyles.copy}>
          <Text style={previewStyles.name} numberOfLines={2}>
            {name.trim() || "Product name"}
          </Text>
          <Text style={previewStyles.meta} numberOfLines={1}>
            {categoryLabel || "Category not set"}
          </Text>
          <Text style={previewStyles.price}>{priceLabel}</Text>
        </View>
      </View>
    </View>
  );
}

type GalleryImage = {
  uri: string;
};

export function ProductFormGallery({
  images,
  maxImages = 6,
  error,
  onAdd,
  onRemove,
  onSetCover,
}: {
  images: GalleryImage[];
  maxImages?: number;
  error?: string;
  onAdd: () => void;
  onRemove: (uri: string) => void;
  onSetCover: (uri: string) => void;
}) {
  const slotsLeft = maxImages - images.length;

  return (
    <View style={galleryStyles.wrap}>
      <TouchableOpacity style={galleryStyles.uploadZone} onPress={onAdd} activeOpacity={0.86}>
        <View style={galleryStyles.uploadIcon}>
          <Ionicons name="camera-outline" size={rMS(22)} color={AppColors.primary} />
        </View>
        <Text style={galleryStyles.uploadTitle}>
          {images.length ? "Add another photo" : "Upload product photos"}
        </Text>
        <Text style={galleryStyles.uploadHint}>
          Up to {maxImages} images. First photo is the cover shoppers see first.
        </Text>
        <Text style={galleryStyles.uploadMeta}>
          {images.length}/{maxImages} used
          {slotsLeft > 0 ? ` · ${slotsLeft} slot${slotsLeft === 1 ? "" : "s"} left` : ""}
        </Text>
      </TouchableOpacity>

      {error ? <Text style={productFormStyles.errorText}>{error}</Text> : null}

      {images.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={galleryStyles.previewRow}
        >
          {images.map((item, index) => (
            <View key={`${item.uri}-${index}`} style={galleryStyles.previewCard}>
              <Image source={{ uri: item.uri }} style={galleryStyles.previewImage} />
              <View
                style={[
                  galleryStyles.badge,
                  index === 0 ? galleryStyles.badgeCover : null,
                ]}
              >
                <Text style={galleryStyles.badgeText}>
                  {index === 0 ? "Cover" : `Photo ${index + 1}`}
                </Text>
              </View>
              <View style={galleryStyles.actions}>
                {index > 0 ? (
                  <TouchableOpacity
                    style={galleryStyles.actionBtn}
                    onPress={() => onSetCover(item.uri)}
                    activeOpacity={0.85}
                  >
                    <Text style={galleryStyles.actionBtnText}>Set cover</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  style={[galleryStyles.actionBtn, galleryStyles.actionBtnDanger]}
                  onPress={() => onRemove(item.uri)}
                  activeOpacity={0.85}
                >
                  <Text style={galleryStyles.actionBtnDangerText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={galleryStyles.empty}>
          <Ionicons name="images-outline" size={rMS(28)} color="#CBD5E1" />
          <Text style={galleryStyles.emptyTitle}>Photos bring listings to life</Text>
          <Text style={galleryStyles.emptyText}>
            Add clear, well-lit shots from multiple angles so shoppers trust what they are
            buying.
          </Text>
        </View>
      )}
    </View>
  );
}

export function ProductFormDiscountHint({
  price,
  oldPrice,
}: {
  price: number;
  oldPrice?: number;
}) {
  if (!oldPrice || oldPrice <= price || price <= 0) {
    return null;
  }

  const savings = Math.round(((oldPrice - price) / oldPrice) * 100);

  return (
    <View style={pricingStyles.discountCard}>
      <Ionicons name="pricetag-outline" size={rMS(16)} color="#166534" />
      <Text style={pricingStyles.discountText}>
        Shoppers will see {savings}% off when compare-at pricing is shown.
      </Text>
    </View>
  );
}

export function ProductFormPolicyPicker({
  isReturnable,
  onChange,
}: {
  isReturnable: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={policyStyles.row}>
      <TouchableOpacity
        style={[policyStyles.card, isReturnable && policyStyles.cardActive]}
        onPress={() => onChange(true)}
        activeOpacity={0.86}
      >
        <Ionicons
          name="refresh-outline"
          size={rMS(20)}
          color={isReturnable ? AppColors.primary : "#6B7280"}
        />
        <Text style={[policyStyles.title, isReturnable && policyStyles.titleActive]}>
          Returnable
        </Text>
        <Text style={[policyStyles.body, isReturnable && policyStyles.bodyActive]}>
          Eligible for return, refund, or exchange after delivery.
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[policyStyles.card, !isReturnable && policyStyles.cardActive]}
        onPress={() => onChange(false)}
        activeOpacity={0.86}
      >
        <Ionicons
          name="lock-closed-outline"
          size={rMS(20)}
          color={!isReturnable ? AppColors.primary : "#6B7280"}
        />
        <Text style={[policyStyles.title, !isReturnable && policyStyles.titleActive]}>
          Final sale
        </Text>
        <Text style={[policyStyles.body, !isReturnable && policyStyles.bodyActive]}>
          Excluded from the returns hub after delivery.
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export function ProductFormChipGroup({
  label,
  helper,
  options,
  selected,
  onToggle,
}: {
  label: string;
  helper: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <View style={chipStyles.block}>
      <Text style={productFormStyles.fieldLabel}>{label}</Text>
      <Text style={[productFormStyles.helperText, { marginBottom: rV(10) }]}>{helper}</Text>
      <View style={chipStyles.wrap}>
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <TouchableOpacity
              key={option}
              style={[chipStyles.chip, active && chipStyles.chipActive]}
              onPress={() => onToggle(option)}
              activeOpacity={0.85}
            >
              <Text style={[chipStyles.chipText, active && chipStyles.chipTextActive]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
        {selected
          .filter((value) => !options.includes(value))
          .map((value) => (
            <TouchableOpacity
              key={value}
              style={[chipStyles.chip, chipStyles.chipActive]}
              onPress={() => onToggle(value)}
              activeOpacity={0.85}
            >
              <Text style={[chipStyles.chipText, chipStyles.chipTextActive]}>{value} ×</Text>
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );
}

export function ProductFormDivider() {
  return <View style={dividerStyles.line} />;
}

const progressStyles = StyleSheet.create({
  card: {
    borderRadius: rMS(20),
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    padding: rS(16),
    gap: rV(12),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
    color: AppColors.text,
  },
  count: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12),
    color: AppColors.primary,
  },
  track: {
    height: rV(6),
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: AppColors.primary,
  },
  list: {
    gap: rV(8),
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
  },
  itemLabel: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    color: "#6B7280",
  },
  itemLabelDone: {
    color: AppColors.text,
  },
});

const previewStyles = StyleSheet.create({
  card: {
    borderRadius: rMS(20),
    backgroundColor: "#0F172A",
    padding: rS(16),
    gap: rV(12),
  },
  eyebrow: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(11),
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    gap: rS(12),
    alignItems: "center",
  },
  thumb: {
    width: rS(72),
    height: rS(72),
    borderRadius: rMS(16),
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  copy: {
    flex: 1,
    gap: rV(4),
  },
  name: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
    color: "#FFFFFF",
  },
  meta: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    color: "#CBD5E1",
  },
  price: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
    color: "#FFFFFF",
  },
});

const galleryStyles = StyleSheet.create({
  wrap: {
    gap: rV(12),
  },
  uploadZone: {
    borderRadius: rMS(20),
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    paddingHorizontal: rS(18),
    paddingVertical: rV(20),
    gap: rV(8),
  },
  uploadIcon: {
    width: rMS(48),
    height: rMS(48),
    borderRadius: rMS(24),
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    color: AppColors.text,
    textAlign: "center",
  },
  uploadHint: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
    color: "#6B7280",
    textAlign: "center",
  },
  uploadMeta: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(11.5),
    color: AppColors.primary,
  },
  previewRow: {
    gap: rS(12),
    paddingBottom: rV(4),
  },
  previewCard: {
    width: rS(132),
    gap: rV(8),
  },
  previewImage: {
    width: "100%",
    height: rV(132),
    borderRadius: rMS(18),
    backgroundColor: "#E5E7EB",
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: rS(10),
    paddingVertical: rV(5),
  },
  badgeCover: {
    backgroundColor: "#DCFCE7",
  },
  badgeText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(11),
    color: AppColors.text,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(6),
  },
  actionBtn: {
    borderRadius: 999,
    backgroundColor: "#EEF4FF",
    paddingHorizontal: rS(10),
    paddingVertical: rV(6),
  },
  actionBtnText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(11),
    color: AppColors.primary,
  },
  actionBtnDanger: {
    backgroundColor: "#FEE2E2",
  },
  actionBtnDangerText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(11),
    color: "#B91C1C",
  },
  empty: {
    alignItems: "center",
    gap: rV(8),
    paddingVertical: rV(24),
    paddingHorizontal: rS(12),
    borderRadius: rMS(18),
    backgroundColor: "#F8FAFC",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  emptyTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    color: AppColors.text,
  },
  emptyText: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(19),
    color: "#6B7280",
    textAlign: "center",
  },
});

const pricingStyles = StyleSheet.create({
  discountCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(10),
    borderRadius: rMS(14),
    backgroundColor: "#DCFCE7",
    paddingHorizontal: rS(12),
    paddingVertical: rV(10),
  },
  discountText: {
    flex: 1,
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
    color: "#166534",
  },
});

const policyStyles = StyleSheet.create({
  row: {
    gap: rV(10),
  },
  card: {
    borderRadius: rMS(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    gap: rV(6),
  },
  cardActive: {
    borderColor: "#93C5FD",
    backgroundColor: "#EFF6FF",
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    color: AppColors.text,
  },
  titleActive: {
    color: AppColors.primary,
  },
  body: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
    color: "#6B7280",
  },
  bodyActive: {
    color: "#1E40AF",
  },
});

const chipStyles = StyleSheet.create({
  block: {
    gap: rV(6),
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: rS(14),
    paddingVertical: rV(9),
    backgroundColor: "#F3F4F6",
  },
  chipActive: {
    backgroundColor: AppColors.primary,
  },
  chipText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12),
    color: "#4B5563",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
});

const dividerStyles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginVertical: rV(4),
  },
});
