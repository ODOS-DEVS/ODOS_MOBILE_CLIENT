import { AccountEmptyState, AccountListCard } from "@/components/account/AccountUi";
import {
  VendorPageIntro,
  VendorScreenShell,
  vendorStyles,
} from "@/components/vendor/VendorUi";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import {
  createStoreSection,
  deleteStoreSection,
  fetchStoreSectionSuggestions,
  fetchStoreSections,
  renameStoreSection,
  reorderStoreSections,
} from "@/services/vendorService";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import type { StoreSection } from "@/types/vendor";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VendorSectionsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { contentMaxWidth } = useResponsive();
  const { hasVendorAccess, isCheckingVendorAccess, session } = useRequireVendor();

  const [sections, setSections] = useState<StoreSection[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const sectionsCountRef = useRef(0);
  sectionsCountRef.current = sections.length;

  const styles = useMemo(() => createStyles(colors), [colors]);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [rows, starters] = await Promise.all([
        fetchStoreSections(session),
        // Only needed for the empty state, but fetching both together avoids a
        // second spinner the moment the list turns out to be empty.
        fetchStoreSectionSuggestions(session).catch(() => [] as string[]),
      ]);
      setSections(rows);
      setSuggestions(starters);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Could not load sections.",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      if (!hasVendorAccess) return undefined;
      if (sectionsCountRef.current === 0) {
        setIsLoading(true);
      }
      void load();
      return undefined;
    }, [hasVendorAccess, load]),
  );

  const addSection = useCallback(
    async (title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      setBusyId("new");
      try {
        const created = await createStoreSection(session, trimmed);
        setSections((current) => [...current, created]);
        setSuggestions((current) => current.filter((item) => item !== trimmed));
        setNewTitle("");
      } catch (addError) {
        Alert.alert(
          "Couldn't add section",
          addError instanceof Error ? addError.message : "Please try again.",
        );
      } finally {
        setBusyId(null);
      }
    },
    [session],
  );

  // Renaming edits the row in place rather than opening a system prompt.
  // Alert.prompt is iOS-only: on Android it is undefined, so a prompt-based
  // rename would leave the button doing nothing at all with no error.
  const beginRename = useCallback((section: StoreSection) => {
    setEditingId(section.id);
    setEditingTitle(section.title);
  }, []);

  const cancelRename = useCallback(() => {
    setEditingId(null);
    setEditingTitle("");
  }, []);

  const commitRename = useCallback(
    async (section: StoreSection) => {
      const trimmed = editingTitle.trim();
      if (!trimmed || trimmed === section.title) {
        cancelRename();
        return;
      }
      setBusyId(section.id);
      try {
        const updated = await renameStoreSection(session, section.id, trimmed);
        setSections((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
        cancelRename();
      } catch (renameError) {
        Alert.alert(
          "Couldn't rename",
          renameError instanceof Error ? renameError.message : "Please try again.",
        );
      } finally {
        setBusyId(null);
      }
    },
    [cancelRename, editingTitle, session],
  );

  const remove = useCallback(
    (section: StoreSection) => {
      Alert.alert(
        `Remove "${section.title}"?`,
        section.productCount > 0
          ? `${section.productCount} product${section.productCount === 1 ? "" : "s"} will stay in your store — they just won't be in this section any more.`
          : "This section is empty, so nothing else changes.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              setBusyId(section.id);
              try {
                await deleteStoreSection(session, section.id);
                setSections((current) =>
                  current.filter((item) => item.id !== section.id),
                );
              } catch (removeError) {
                Alert.alert(
                  "Couldn't remove",
                  removeError instanceof Error
                    ? removeError.message
                    : "Please try again.",
                );
              } finally {
                setBusyId(null);
              }
            },
          },
        ],
      );
    },
    [session],
  );

  const move = useCallback(
    async (index: number, direction: -1 | 1) => {
      const target = index + direction;
      if (target < 0 || target >= sections.length) return;

      const reordered = [...sections];
      [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
      // Optimistic: the arrows should feel instant. If the server disagrees the
      // reload below puts the real order back.
      setSections(reordered);
      try {
        const saved = await reorderStoreSections(
          session,
          reordered.map((item) => item.id),
        );
        setSections(saved);
      } catch {
        void load();
      }
    },
    [load, sections, session],
  );

  if (isCheckingVendorAccess || !hasVendorAccess) {
    return (
      <VendorScreenShell title="Sections" loading loadingLabel="Loading sections..." />
    );
  }

  return (
    <VendorScreenShell title="Sections">
      <FlatList
        data={sections}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              void load();
            }}
          />
        }
        contentContainerStyle={[
          vendorStyles.listContent,
          { paddingBottom: insets.bottom + rV(28) },
        ]}
        ListHeaderComponent={
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <VendorPageIntro
              title="Organise your shop"
              subtitle="Group your products the way your shop is laid out. Shoppers see these as rows on your store page."
              stats={[
                { value: sections.length, label: "Sections" },
                {
                  value: sections.reduce((sum, item) => sum + item.productCount, 0),
                  label: "Placed",
                },
              ]}
              error={error}
            />

            <View style={styles.addRow}>
              <TextInput
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="Add a section, e.g. Trousers"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                returnKeyType="done"
                onSubmitEditing={() => void addSection(newTitle)}
                maxLength={80}
              />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Add section"
                onPress={() => void addSection(newTitle)}
                disabled={!newTitle.trim() || busyId === "new"}
                style={[
                  styles.addButton,
                  (!newTitle.trim() || busyId === "new") && styles.addButtonDisabled,
                ]}
              >
                {busyId === "new" ? (
                  <ActivityIndicator size="small" color={colors.onPrimary} />
                ) : (
                  <Ionicons name="add" size={rMS(20)} color={colors.onPrimary} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
            <AccountListCard>
              <View style={styles.row}>
                <View style={styles.orderControls}>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Move ${item.title} up`}
                    disabled={index === 0}
                    onPress={() => void move(index, -1)}
                    style={styles.arrow}
                  >
                    <Ionicons
                      name="chevron-up"
                      size={rMS(16)}
                      color={index === 0 ? colors.textMuted : colors.text}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Move ${item.title} down`}
                    disabled={index === sections.length - 1}
                    onPress={() => void move(index, 1)}
                    style={styles.arrow}
                  >
                    <Ionicons
                      name="chevron-down"
                      size={rMS(16)}
                      color={
                        index === sections.length - 1
                          ? colors.textMuted
                          : colors.text
                      }
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.details}>
                  {editingId === item.id ? (
                    <TextInput
                      value={editingTitle}
                      onChangeText={setEditingTitle}
                      style={styles.renameInput}
                      autoFocus
                      selectTextOnFocus
                      maxLength={80}
                      returnKeyType="done"
                      onSubmitEditing={() => void commitRename(item)}
                      onBlur={() => void commitRename(item)}
                      accessibilityLabel={`Rename ${item.title}`}
                    />
                  ) : (
                    <>
                      <Text style={styles.title}>{item.title}</Text>
                      <Text style={styles.meta}>
                        {item.productCount === 0
                          ? "No products yet — shoppers won't see this section"
                          : `${item.productCount} product${item.productCount === 1 ? "" : "s"}`}
                      </Text>
                    </>
                  )}
                </View>

                {busyId === item.id ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={
                        editingId === item.id
                          ? `Save ${item.title}`
                          : `Rename ${item.title}`
                      }
                      onPress={() =>
                        editingId === item.id
                          ? void commitRename(item)
                          : beginRename(item)
                      }
                      style={styles.action}
                    >
                      <Ionicons
                        name={
                          editingId === item.id ? "checkmark" : "create-outline"
                        }
                        size={rMS(18)}
                        color={colors.text}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${item.title}`}
                      onPress={() => remove(item)}
                      style={styles.action}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={rMS(18)}
                        color={colors.dangerText}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </AccountListCard>
          </View>
        )}
        ListEmptyComponent={
          <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
            {isLoading ? (
              <AccountEmptyState
                icon="albums-outline"
                title="Loading sections"
                message="One moment."
              />
            ) : suggestions.length > 0 ? (
              <AccountListCard>
                <Text style={styles.suggestTitle}>Start with these</Text>
                <Text style={styles.suggestBody}>
                  Common sections for a shop like yours. Tap to add — you can rename or
                  remove any of them later.
                </Text>
                <View style={styles.chips}>
                  {suggestions.map((title) => (
                    <TouchableOpacity
                      key={title}
                      accessibilityRole="button"
                      onPress={() => void addSection(title)}
                      style={styles.chip}
                      disabled={busyId === "new"}
                    >
                      <Ionicons name="add" size={rMS(14)} color={colors.primary} />
                      <Text style={styles.chipText}>{title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </AccountListCard>
            ) : (
              <AccountEmptyState
                icon="albums-outline"
                title={error ? "Couldn't load sections" : "No sections yet"}
                message={
                  error ?? "Add your first section above to start grouping products."
                }
              />
            )}
          </View>
        }
      />
    </VendorScreenShell>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    addRow: {
      flexDirection: "row",
      gap: rS(8),
      marginBottom: rV(12),
    },
    input: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: rMS(12),
      paddingHorizontal: rS(14),
      paddingVertical: rV(10),
      fontFamily: Fonts.text,
      fontSize: rMS(14),
      color: colors.text,
    },
    addButton: {
      width: rMS(46),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderRadius: rMS(12),
    },
    addButtonDisabled: { opacity: 0.5 },
    row: { flexDirection: "row", alignItems: "center", gap: rS(10) },
    orderControls: { gap: rV(2) },
    arrow: {
      width: rMS(28),
      height: rMS(22),
      alignItems: "center",
      justifyContent: "center",
    },
    details: { flex: 1 },
    renameInput: {
      fontFamily: Fonts.textBold,
      fontSize: rMS(15),
      color: colors.text,
      borderBottomWidth: 1,
      borderBottomColor: colors.primary,
      paddingVertical: rV(2),
    },
    title: {
      fontFamily: Fonts.textBold,
      fontSize: rMS(15),
      color: colors.text,
    },
    meta: {
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: colors.textMuted,
      marginTop: rV(2),
    },
    actions: { flexDirection: "row", gap: rS(4) },
    action: { padding: rMS(6) },
    suggestTitle: {
      fontFamily: Fonts.textBold,
      fontSize: rMS(15),
      color: colors.text,
    },
    suggestBody: {
      fontFamily: Fonts.text,
      fontSize: rMS(13),
      color: colors.textMuted,
      marginTop: rV(4),
      marginBottom: rV(12),
    },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: rS(8) },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(4),
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: rMS(20),
      paddingHorizontal: rS(12),
      paddingVertical: rV(7),
    },
    chipText: {
      fontFamily: Fonts.text,
      fontSize: rMS(13),
      color: colors.text,
    },
  });
}
