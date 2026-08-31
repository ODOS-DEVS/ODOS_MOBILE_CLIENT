import { VendorScreenShell, vendorStyles } from "@/components/vendor/VendorUi";
import Fonts from "@/constants/Fonts";
import type { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { fetchVendorProducts } from "@/services/storeService";
import {
  addProductsToSection,
  fetchSectionProductIds,
  removeProductFromSection,
} from "@/services/vendorService";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import type { VendorProduct } from "@/types/store";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Choose which of your products sit on one shelf. */
export default function SectionProductsScreen() {
  const { sectionId, title } = useLocalSearchParams<{
    sectionId: string;
    title?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { contentMaxWidth } = useResponsive();
  const { hasVendorAccess, isCheckingVendorAccess, session } = useRequireVendor();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [initial, setInitial] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!sectionId) return;
    try {
      setError(null);
      const [catalogue, placed] = await Promise.all([
        fetchVendorProducts(session),
        fetchSectionProductIds(session, sectionId),
      ]);
      setProducts(catalogue);
      setSelected(new Set(placed));
      // Kept separately so saving can send only what actually changed.
      setInitial(new Set(placed));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Could not load your products.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [sectionId, session]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return products;
    return products.filter((product) =>
      (product.name ?? "").toLowerCase().includes(needle),
    );
  }, [products, query]);

  const toggle = useCallback((productId: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  const dirty = useMemo(() => {
    if (selected.size !== initial.size) return true;
    for (const id of selected) {
      if (!initial.has(id)) return true;
    }
    return false;
  }, [initial, selected]);

  const save = useCallback(async () => {
    if (!sectionId || !dirty) return;
    const added = [...selected].filter((id) => !initial.has(id));
    const removed = [...initial].filter((id) => !selected.has(id));

    setIsSaving(true);
    try {
      if (added.length > 0) {
        await addProductsToSection(session, sectionId, added);
      }
      // Removal is one call per product; the API has no bulk delete, and
      // sending them sequentially keeps the failure obvious rather than
      // leaving a half-applied change from parallel requests.
      for (const productId of removed) {
        await removeProductFromSection(session, sectionId, productId);
      }
      setInitial(new Set(selected));
      Alert.alert(
        "Saved",
        selected.size === 0
          ? "This section is empty, so shoppers won't see it yet."
          : `${selected.size} product${selected.size === 1 ? "" : "s"} in this section.`,
      );
    } catch (saveError) {
      Alert.alert(
        "Couldn't save",
        saveError instanceof Error ? saveError.message : "Please try again.",
      );
      void load();
    } finally {
      setIsSaving(false);
    }
  }, [dirty, initial, load, sectionId, selected, session]);

  if (isCheckingVendorAccess || !hasVendorAccess) {
    return <VendorScreenShell title="Section" loading loadingLabel="Loading..." />;
  }

  return (
    <VendorScreenShell title={title || "Section"}>
      <View style={[styles.searchWrap, { maxWidth: contentMaxWidth }]}>
        <Ionicons name="search" size={rMS(16)} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search your products"
          placeholderTextColor={colors.textMuted}
          style={styles.search}
        />
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          vendorStyles.listContent,
          { paddingBottom: insets.bottom + rV(96) },
        ]}
        renderItem={({ item }) => {
          const isOn = selected.has(item.id);
          return (
            <TouchableOpacity
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isOn }}
              onPress={() => toggle(item.id)}
              activeOpacity={0.8}
              style={[
                styles.row,
                { maxWidth: contentMaxWidth },
                isOn && { borderColor: colors.primary },
              ]}
            >
              {item.imageUrls?.[0] ? (
                <Image source={{ uri: item.imageUrls[0] }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.thumbFallback]}>
                  <Ionicons name="image-outline" size={rMS(16)} color={colors.iconMuted} />
                </View>
              )}

              <View style={styles.rowText}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.meta}>
                  {item.status !== "active"
                    ? `${item.status} · not shown to shoppers yet`
                    : `GHS ${Number(item.price ?? 0).toFixed(2)}`}
                </Text>
              </View>

              <Ionicons
                name={isOn ? "checkmark-circle" : "ellipse-outline"}
                size={rMS(22)}
                color={isOn ? colors.primary : colors.iconMuted}
              />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            {isLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.emptyText}>
                {error ??
                  (query
                    ? "No products match that search."
                    : "You have no products yet. Add one first, then place it here.")}
              </Text>
            )}
          </View>
        }
      />

      {dirty ? (
        <View style={[styles.saveBar, { paddingBottom: insets.bottom + rV(12) }]}>
          <Text style={styles.saveHint}>
            {selected.size} selected
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => void save()}
            disabled={isSaving}
            style={[styles.saveButton, isSaving && { opacity: 0.6 }]}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.onInverseSurface} />
            ) : (
              <Text style={styles.saveText}>Save section</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}
    </VendorScreenShell>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    searchWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(8),
      alignSelf: "center",
      width: "100%",
      marginHorizontal: rS(16),
      paddingHorizontal: rS(12),
      marginBottom: rV(8),
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: rMS(12),
    },
    search: {
      flex: 1,
      paddingVertical: rV(10),
      fontFamily: Fonts.text,
      fontSize: rMS(14),
      color: colors.text,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(10),
      alignSelf: "center",
      width: "100%",
      padding: rS(10),
      marginBottom: rV(8),
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: rMS(12),
    },
    thumb: { width: rMS(44), height: rMS(44), borderRadius: rMS(8) },
    thumbFallback: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceMuted,
    },
    rowText: { flex: 1 },
    name: { fontFamily: Fonts.textBold, fontSize: rMS(14), color: colors.text },
    meta: {
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: colors.textMuted,
      marginTop: rV(2),
    },
    empty: { alignItems: "center", paddingTop: rV(50), paddingHorizontal: rS(30) },
    emptyText: {
      fontFamily: Fonts.text,
      fontSize: rMS(13),
      color: colors.textMuted,
      textAlign: "center",
    },
    saveBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: rS(12),
      paddingHorizontal: rS(16),
      paddingTop: rV(12),
      backgroundColor: colors.screen,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    saveHint: { fontFamily: Fonts.text, fontSize: rMS(13), color: colors.textMuted },
    saveButton: {
      paddingHorizontal: rS(20),
      paddingVertical: rV(12),
      borderRadius: rMS(12),
      backgroundColor: colors.inverseSurface,
    },
    saveText: {
      fontFamily: Fonts.textBold,
      fontSize: rMS(14),
      color: colors.onInverseSurface,
    },
  });
}
