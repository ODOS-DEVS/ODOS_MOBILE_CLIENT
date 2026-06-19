import TextInputField from "@/components/TextInputField";
import ProfileHeader from "@/components/profile/ProfileHeader";
import {
  AccountActionButton,
  StatCard,
  VendorPageIntro,
  VendorScreenShell,
  vendorStyles,
} from "@/components/vendor/VendorUi";
import { VendorEmptyState } from "@/components/vendor/VendorEmptyState";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useToast } from "@/context/ToastContext";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import {
  archiveVendorVoucher,
  createVendorVoucher,
  fetchVendorVouchers,
  giftVendorVoucher,
  updateVendorVoucher,
} from "@/services/vendorVoucherService";
import { rMS, rS, rV, useResponsive } from "@/styles/responsive";
import type {
  VendorVoucher,
  VendorVoucherAvailability,
  VendorVoucherDiscountType,
  VendorVoucherInput,
} from "@/types/store";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const availabilityOptions: Array<{
  label: string;
  value: VendorVoucherAvailability;
  description: string;
}> = [
  {
    label: "Automatic",
    value: "auto",
    description: "Eligible shoppers can use it without claiming first.",
  },
  {
    label: "Claimable",
    value: "claim",
    description: "Shoppers first save it from your store page into their wallet.",
  },
  {
    label: "Gifted",
    value: "assigned",
    description: "Only shoppers you send it to can use it.",
  },
];

const discountOptions: Array<{ label: string; value: VendorVoucherDiscountType }> = [
  { label: "Percent", value: "percent" },
  { label: "Fixed", value: "fixed" },
];

type VoucherFormState = {
  code: string;
  title: string;
  description: string;
  issuerName: string;
  availability: VendorVoucherAvailability;
  discountType: VendorVoucherDiscountType;
  discountValue: string;
  minSubtotal: string;
  maxDiscount: string;
  usageLimit: string;
  perUserLimit: string;
  startsAt: Date | null;
  endsAt: Date | null;
  isActive: boolean;
};

const initialForm: VoucherFormState = {
  code: "",
  title: "",
  description: "",
  issuerName: "",
  availability: "claim",
  discountType: "percent",
  discountValue: "10",
  minSubtotal: "0",
  maxDiscount: "",
  usageLimit: "",
  perUserLimit: "1",
  startsAt: null,
  endsAt: null,
  isActive: true,
};

function formatCurrency(value: number) {
  return `GHS ${value.toFixed(2)}`;
}

function parseDateTimeValue(value?: string | null) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIsoString(value: Date | null) {
  if (!value) {
    return null;
  }
  return Number.isNaN(value.getTime()) ? null : value.toISOString();
}

function parseOptionalNumber(value: string) {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function buildRewardPreview(discountType: VendorVoucherDiscountType, discountValue: number) {
  if (discountType === "percent") {
    return `${discountValue}% OFF`;
  }
  return `GHS ${discountValue} OFF`;
}

function formatScheduleValue(value: Date | null) {
  if (!value) {
    return "Pick date and time";
  }

  return value.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function mergeDatePart(current: Date, next: Date) {
  const merged = new Date(current);
  merged.setFullYear(next.getFullYear(), next.getMonth(), next.getDate());
  return merged;
}

function mergeTimePart(current: Date, next: Date) {
  const merged = new Date(current);
  merged.setHours(next.getHours(), next.getMinutes(), 0, 0);
  return merged;
}

export default function VendorVouchersScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { showToast } = useToast();
  const { hasVendorAccess, isCheckingVendorAccess, session } = useRequireVendor();

  const [vouchers, setVouchers] = useState<VendorVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<VendorVoucher | null>(null);
  const [form, setForm] = useState<VoucherFormState>(initialForm);
  const [giftTarget, setGiftTarget] = useState<VendorVoucher | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [giftNote, setGiftNote] = useState("");
  const [pickerTarget, setPickerTarget] = useState<"startsAt" | "endsAt" | null>(null);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [pickerDraft, setPickerDraft] = useState(new Date());

  const loadVouchers = React.useCallback(async () => {
    if (!hasVendorAccess) {
      return;
    }
    setIsLoading(true);
    try {
      const result = await fetchVendorVouchers(session);
      setVouchers(result);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "We couldn't load store promotions right now.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [hasVendorAccess, session, showToast]);

  useEffect(() => {
    void loadVouchers();
  }, [loadVouchers]);

  const summary = useMemo(
    () => ({
      liveCount: vouchers.filter((voucher) => voucher.status === "active").length,
      totalRedemptions: vouchers.reduce((sum, voucher) => sum + voucher.redemptionCount, 0),
      totalSavings: vouchers.reduce((sum, voucher) => sum + voucher.totalDiscountAmount, 0),
    }),
    [vouchers],
  );

  const rewardPreview = useMemo(
    () =>
      buildRewardPreview(
        form.discountType,
        Number.isFinite(Number(form.discountValue)) ? Number(form.discountValue) : 0,
      ),
    [form.discountType, form.discountValue],
  );

  function updateForm<K extends keyof VoucherFormState>(key: K, value: VoucherFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetEditor() {
    setEditingVoucher(null);
    setForm(initialForm);
  }

  function openCreate() {
    resetEditor();
    setEditorOpen(true);
  }

  function openEdit(voucher: VendorVoucher) {
    setEditingVoucher(voucher);
    setForm({
      code: voucher.code,
      title: voucher.title,
      description: voucher.description ?? "",
      issuerName: voucher.issuerName ?? "",
      availability: voucher.availability,
      discountType: voucher.discountType === "fixed" ? "fixed" : "percent",
      discountValue: String(voucher.discountValue),
      minSubtotal: String(voucher.minSubtotal),
      maxDiscount: voucher.maxDiscount != null ? String(voucher.maxDiscount) : "",
      usageLimit: voucher.usageLimit != null ? String(voucher.usageLimit) : "",
      perUserLimit: voucher.perUserLimit != null ? String(voucher.perUserLimit) : "",
      startsAt: parseDateTimeValue(voucher.startsAt),
      endsAt: parseDateTimeValue(voucher.endsAt),
      isActive: voucher.isActive,
    });
    setEditorOpen(true);
  }

  function buildPayload(): VendorVoucherInput | null {
    const code = form.code.trim().toUpperCase();
    const title = form.title.trim();
    if (!code || !title) {
      showToast("Add both a promotion code and title.");
      return null;
    }
    const discountValue = Number(form.discountValue);
    const minSubtotal = Number(form.minSubtotal);
    if (!Number.isFinite(discountValue) || !Number.isFinite(minSubtotal)) {
      showToast("Check the discount value and minimum subtotal.");
      return null;
    }

    if (form.startsAt && form.endsAt && form.endsAt.getTime() <= form.startsAt.getTime()) {
      showToast("The end date must be later than the start date.");
      return null;
    }

    return {
      code,
      title,
      description: form.description.trim() || null,
      issuerName: form.issuerName.trim() || null,
      availability: form.availability,
      discountType: form.discountType,
      discountValue,
      minSubtotal,
      maxDiscount: parseOptionalNumber(form.maxDiscount),
      usageLimit: parseOptionalNumber(form.usageLimit),
      perUserLimit: parseOptionalNumber(form.perUserLimit),
      isActive: form.isActive,
      startsAt: toIsoString(form.startsAt),
      endsAt: toIsoString(form.endsAt),
    };
  }

  function openDateTimePicker(field: "startsAt" | "endsAt") {
    const initialValue = form[field] ?? new Date();

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: initialValue,
        mode: "date",
        is24Hour: false,
        onChange: (event, selectedDate) => {
          if (event.type !== "set" || !selectedDate) {
            return;
          }

          const nextDate = mergeDatePart(initialValue, selectedDate);
          DateTimePickerAndroid.open({
            value: nextDate,
            mode: "time",
            is24Hour: false,
            onChange: (timeEvent, selectedTime) => {
              if (timeEvent.type !== "set" || !selectedTime) {
                return;
              }

              updateForm(field, mergeTimePart(nextDate, selectedTime));
            },
          });
        },
      });
      return;
    }

    setPickerTarget(field);
    setPickerMode("date");
    setPickerDraft(initialValue);
  }

  function handlePickerChange(event: { type?: string }, selectedDate?: Date) {
    if (event.type === "dismissed" || !selectedDate) {
      return;
    }

    setPickerDraft((current) =>
      pickerMode === "date" ? mergeDatePart(current, selectedDate) : mergeTimePart(current, selectedDate),
    );
  }

  function closePicker() {
    setPickerTarget(null);
    setPickerMode("date");
  }

  function handlePickerConfirm() {
    if (pickerMode === "date") {
      setPickerMode("time");
      return;
    }

    if (pickerTarget) {
      updateForm(pickerTarget, pickerDraft);
    }
    closePicker();
  }

  function clearDateTime(field: "startsAt" | "endsAt") {
    updateForm(field, null);
  }

  async function handleSave() {
    const payload = buildPayload();
    if (!payload) {
      return;
    }

    setIsSaving(true);
    try {
      if (editingVoucher) {
        const updated = await updateVendorVoucher(session, editingVoucher.id, payload);
        setVouchers((current) =>
          current.map((voucher) => (voucher.id === updated.id ? updated : voucher)),
        );
        showToast(`${updated.code} updated.`);
      } else {
        const created = await createVendorVoucher(session, payload);
        setVouchers((current) => [created, ...current]);
        showToast(`${created.code} is live for your store.`);
      }
      setEditorOpen(false);
      resetEditor();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "We couldn't save that promotion.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleArchive(voucher: VendorVoucher) {
    setIsSaving(true);
    try {
      await archiveVendorVoucher(session, voucher.id);
      setVouchers((current) =>
        current.map((item) =>
          item.id === voucher.id ? { ...item, isActive: false, status: "disabled" } : item,
        ),
      );
      showToast(`${voucher.code} archived.`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "We couldn't archive that promotion.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleGiftVoucher() {
    if (!giftTarget) {
      return;
    }
    if (!recipientEmail.trim()) {
      showToast("Enter the shopper email first.");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await giftVendorVoucher(session, giftTarget.id, recipientEmail, giftNote);
      setVouchers((current) =>
        current.map((voucher) => (voucher.id === updated.id ? updated : voucher)),
      );
      showToast(`${updated.code} gifted successfully.`);
      setGiftTarget(null);
      setRecipientEmail("");
      setGiftNote("");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "We couldn't gift that promotion.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isCheckingVendorAccess || isLoading) {
    return (
      <VendorScreenShell
        title="Store Promotions"
        loading
        loadingLabel="Loading store promotions..."
      />
    );
  }

  if (!hasVendorAccess) {
    return null;
  }

  return (
    <VendorScreenShell title="Store Promotions">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[vendorStyles.content, { paddingBottom: insets.bottom + rV(28) }]}
      >
        <View style={[vendorStyles.contentWrap, { maxWidth: contentMaxWidth }]}>
          <VendorPageIntro
            title="Run cleaner store offers"
            subtitle="Create claimable promotions, gift private offers to selected shoppers, and track returned value."
            stats={[
              { value: summary.liveCount, label: "Live" },
              { value: summary.totalRedemptions, label: "Redemptions" },
              { value: formatCurrency(summary.totalSavings), label: "Savings" },
            ]}
          />
          <AccountActionButton
            label="Create promotion"
            variant="primary"
            icon="add-circle-outline"
            onPress={openCreate}
          />

          <View style={vendorStyles.statsRow}>
            <StatCard
              label="Live"
              value={String(summary.liveCount)}
              hint="Active promotions"
              tone="success"
            />
            <StatCard
              label="Redemptions"
              value={String(summary.totalRedemptions)}
              hint="Applied at checkout"
              tone="accent"
            />
          </View>

          {vouchers.length === 0 ? (
            <View style={styles.emptyCard}>
              <VendorEmptyState
                icon="ticket-outline"
                title="No store promotions yet"
                message="Create the first offer your shoppers can claim, use automatically, or receive as a gift."
                actionLabel="Create promotion"
                onAction={openCreate}
              />
            </View>
          ) : (
            vouchers.map((voucher) => (
              <View key={voucher.id} style={styles.voucherCard}>
                <View style={styles.voucherTopRow}>
                  <View>
                    <Text style={styles.voucherCode}>{voucher.code}</Text>
                    <Text style={styles.voucherTitle}>{voucher.title}</Text>
                  </View>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>
                      {voucher.approvalStatus === "pending"
                        ? "Pending review"
                        : voucher.status.replace(/_/g, " ")}
                    </Text>
                  </View>
                </View>

                {voucher.approvalStatus === "pending" ? (
                  <Text style={styles.pendingNote}>
                    ODOS is reviewing this store offer before it goes live.
                  </Text>
                ) : null}
                {voucher.approvalStatus === "rejected" && voucher.reviewNotes ? (
                  <Text style={styles.pendingNote}>{voucher.reviewNotes}</Text>
                ) : null}

                <Text style={styles.rewardText}>{voucher.rewardText}</Text>
                <Text style={styles.metaText}>
                  {voucher.availability === "assigned"
                    ? "Gifted only"
                    : voucher.availability === "claim"
                      ? "Claimable from store"
                      : "Available automatically"}
                </Text>
                <Text style={styles.metaText}>
                  Min spend {formatCurrency(voucher.minSubtotal)} · Redeemed {voucher.redemptionCount} time(s)
                </Text>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    activeOpacity={0.85}
                    onPress={() => setGiftTarget(voucher)}
                  >
                    <Text style={styles.secondaryBtnText}>Gift</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    activeOpacity={0.85}
                    onPress={() => openEdit(voucher)}
                  >
                    <Text style={styles.secondaryBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dangerBtn}
                    activeOpacity={0.85}
                    onPress={() => void handleArchive(voucher)}
                  >
                    <Text style={styles.dangerBtnText}>Archive</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={editorOpen} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalScreen}>
          <ProfileHeader title={editingVoucher ? "Edit Promotion" : "Create Promotion"} />
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.modalContent, { paddingBottom: insets.bottom + rV(30) }]}
          >
            <View style={styles.editorIntroCard}>
              <Text style={styles.editorIntroTitle}>Build the offer in four quick steps</Text>
              <Text style={styles.editorIntroBody}>
                Start with the basic identity, choose how shoppers receive it, then set the discount and optional schedule.
              </Text>
            </View>

            <View style={styles.formSectionCard}>
              <Text style={styles.formSectionTitle}>Offer basics</Text>
              <Text style={styles.formSectionBody}>
                This is the name and code shoppers will recognize.
              </Text>
              <TextInputField
                label="Promotion code"
                value={form.code}
                onChangeText={(text) => updateForm("code", text.toUpperCase())}
                helperText="Short code shoppers can enter at checkout, like ZEENO15."
              />
              <TextInputField
                label="Title"
                value={form.title}
                onChangeText={(text) => updateForm("title", text)}
                helperText="Name shown in promotion cards and your voucher wallet surfaces."
              />
              <TextInputField
                label="Shown as"
                value={form.issuerName}
                onChangeText={(text) => updateForm("issuerName", text)}
                helperText="Optional display name for the offer source. Leave blank to fall back to your store name."
              />
              <TextInputField
                label="Description"
                value={form.description}
                onChangeText={(text) => updateForm("description", text)}
                helperText="Optional short explanation of when shoppers should use this promotion."
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formSectionCard}>
              <Text style={styles.formSectionTitle}>How shoppers receive it</Text>
              <Text style={styles.formSectionBody}>
                Choose whether the promotion is automatic, claimable, or privately gifted.
              </Text>
              <Text style={styles.fieldLabel}>Availability</Text>
              <View style={styles.segmentRow}>
                {availabilityOptions.map((option) => {
                  const selected = form.availability === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.segmentChip, selected && styles.segmentChipActive]}
                      activeOpacity={0.85}
                      onPress={() => updateForm("availability", option.value)}
                    >
                      <Text style={[styles.segmentChipText, selected && styles.segmentChipTextActive]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.helperText}>
                {availabilityOptions.find((option) => option.value === form.availability)?.description}
              </Text>
            </View>

            <View style={styles.formSectionCard}>
              <Text style={styles.formSectionTitle}>Discount rules</Text>
              <Text style={styles.formSectionBody}>
                Decide what the shopper gets and the basket size needed to unlock it.
              </Text>
              <Text style={styles.fieldLabel}>Discount type</Text>
              <View style={styles.segmentRow}>
                {discountOptions.map((option) => {
                  const selected = form.discountType === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.segmentChip, selected && styles.segmentChipActive]}
                      activeOpacity={0.85}
                      onPress={() => updateForm("discountType", option.value)}
                    >
                      <Text style={[styles.segmentChipText, selected && styles.segmentChipTextActive]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.helperText}>
                {form.discountType === "percent"
                  ? "Percent is great for broad promotions. Example: 10 means 10% off."
                  : "Fixed gives a flat GHS amount off the qualifying basket."}
              </Text>

              <TextInputField
                label="Discount value"
                value={form.discountValue}
                onChangeText={(text) => updateForm("discountValue", text)}
                keyboardType="numeric"
                helperText={
                  form.discountType === "percent"
                    ? "Enter the percentage number only."
                    : "Enter the GHS amount to take off."
                }
              />
              <TextInputField
                label="Minimum subtotal"
                value={form.minSubtotal}
                onChangeText={(text) => updateForm("minSubtotal", text)}
                keyboardType="numeric"
                helperText="Order subtotal a shopper must reach before this promotion works."
              />
              <TextInputField
                label="Max discount"
                value={form.maxDiscount}
                onChangeText={(text) => updateForm("maxDiscount", text)}
                keyboardType="numeric"
                helperText="Optional cap for percentage discounts. Leave blank if you do not need one."
              />
            </View>

            <View style={styles.formSectionCard}>
              <Text style={styles.formSectionTitle}>Timing and limits</Text>
              <Text style={styles.formSectionBody}>
                These controls are optional. Use them only if you want the system to stop or schedule the offer automatically.
              </Text>

              <View style={styles.dateFieldContainer}>
                <Text style={styles.dateFieldLabel}>Starts at</Text>
                <TouchableOpacity
                  style={styles.dateField}
                  activeOpacity={0.85}
                  onPress={() => openDateTimePicker("startsAt")}
                >
                  <View style={styles.dateFieldValueRow}>
                    <Ionicons name="calendar-outline" size={18} color={AppColors.secondary} />
                    <Text
                      style={[
                        styles.dateFieldValue,
                        !form.startsAt ? styles.dateFieldPlaceholder : null,
                      ]}
                    >
                      {formatScheduleValue(form.startsAt)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down-outline" size={18} color={AppColors.secondary} />
                </TouchableOpacity>
                <Text style={styles.helperText}>
                  Leave blank if the promotion should start working as soon as it is active.
                </Text>
                {form.startsAt ? (
                  <TouchableOpacity
                    style={styles.clearDateButton}
                    activeOpacity={0.8}
                    onPress={() => clearDateTime("startsAt")}
                  >
                    <Text style={styles.clearDateButtonText}>Clear start date</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={styles.dateFieldContainer}>
                <Text style={styles.dateFieldLabel}>Ends at</Text>
                <TouchableOpacity
                  style={styles.dateField}
                  activeOpacity={0.85}
                  onPress={() => openDateTimePicker("endsAt")}
                >
                  <View style={styles.dateFieldValueRow}>
                    <Ionicons name="calendar-outline" size={18} color={AppColors.secondary} />
                    <Text
                      style={[
                        styles.dateFieldValue,
                        !form.endsAt ? styles.dateFieldPlaceholder : null,
                      ]}
                    >
                      {formatScheduleValue(form.endsAt)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down-outline" size={18} color={AppColors.secondary} />
                </TouchableOpacity>
                <Text style={styles.helperText}>
                  Leave blank if the promotion should stay available until you disable it.
                </Text>
                {form.endsAt ? (
                  <TouchableOpacity
                    style={styles.clearDateButton}
                    activeOpacity={0.8}
                    onPress={() => clearDateTime("endsAt")}
                  >
                    <Text style={styles.clearDateButtonText}>Clear end date</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <TextInputField
                label="Usage limit"
                value={form.usageLimit}
                onChangeText={(text) => updateForm("usageLimit", text)}
                keyboardType="numeric"
                helperText="Optional total number of successful redemptions across all shoppers."
              />
              <TextInputField
                label="Per-user limit"
                value={form.perUserLimit}
                onChangeText={(text) => updateForm("perUserLimit", text)}
                keyboardType="numeric"
                helperText="How many times one shopper can use it. One-time promotions usually stay at 1."
              />
            </View>

            <View style={styles.previewCard}>
              <Text style={styles.previewEyebrow}>Reward preview</Text>
              <Text style={styles.previewValue}>{rewardPreview}</Text>
              <Text style={styles.previewMeta}>
                Shoppers unlock this after spending at least {formatCurrency(Number(form.minSubtotal) || 0)}.
              </Text>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Promotion active</Text>
                <Switch value={form.isActive} onValueChange={(value) => updateForm("isActive", value)} />
              </View>
            </View>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalGhostBtn}
                activeOpacity={0.85}
                onPress={() => {
                  setEditorOpen(false);
                  resetEditor();
                }}
              >
                <Text style={styles.modalGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                activeOpacity={0.88}
                onPress={() => void handleSave()}
                disabled={isSaving}
              >
                <Text style={styles.modalPrimaryText}>
                  {isSaving ? "Saving..." : editingVoucher ? "Save changes" : "Create promotion"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {Platform.OS === "ios" && pickerTarget ? (
            <View style={styles.inlinePickerOverlay}>
              <View style={styles.datePickerSheet}>
                <Text style={styles.giftTitle}>
                  {pickerTarget === "startsAt"
                    ? "Choose start date and time"
                    : "Choose end date and time"}
                </Text>
                <Text style={styles.giftBody}>
                  {pickerMode === "date"
                    ? "Pick the calendar date first."
                    : "Now choose the time that should go with that date."}
                </Text>
                <DateTimePicker
                  value={pickerDraft}
                  mode={pickerMode}
                  display="spinner"
                  onChange={handlePickerChange}
                  style={styles.datePickerControl}
                />
                <View style={styles.modalActionRow}>
                  <TouchableOpacity
                    style={styles.modalGhostBtn}
                    activeOpacity={0.85}
                    onPress={closePicker}
                  >
                    <Text style={styles.modalGhostText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalPrimaryBtn}
                    activeOpacity={0.88}
                    onPress={handlePickerConfirm}
                  >
                    <Text style={styles.modalPrimaryText}>
                      {pickerMode === "date" ? "Next: time" : "Done"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>

      <Modal visible={Boolean(giftTarget)} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.giftSheet}>
            <Text style={styles.giftTitle}>Gift promotion</Text>
            <Text style={styles.giftBody}>
              Send {giftTarget?.code ?? "this offer"} to a shopper by email so it shows up in their promotions wallet.
            </Text>
            <TextInputField
              label="Shopper email"
              value={recipientEmail}
              onChangeText={setRecipientEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInputField
              label="Note"
              value={giftNote}
              onChangeText={setGiftNote}
              placeholder="Optional reason or context"
            />
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalGhostBtn}
                activeOpacity={0.85}
                onPress={() => {
                  setGiftTarget(null);
                  setRecipientEmail("");
                  setGiftNote("");
                }}
              >
                <Text style={styles.modalGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                activeOpacity={0.88}
                onPress={() => void handleGiftVoucher()}
                disabled={isSaving}
              >
                <Text style={styles.modalPrimaryText}>{isSaving ? "Sending..." : "Gift promotion"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </VendorScreenShell>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollContent: {
    paddingHorizontal: rS(16),
    paddingTop: rV(18),
  },
  contentWrap: {
    width: "100%",
    alignSelf: "center",
  },
  heroCard: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(24),
    padding: rS(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  heroEyebrow: {
    color: AppColors.primary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(11.5),
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  heroTitle: {
    marginTop: rV(10),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(22),
  },
  heroBody: {
    marginTop: rV(8),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(20),
  },
  primaryCta: {
    marginTop: rV(18),
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
    borderRadius: rMS(999),
    backgroundColor: AppColors.text,
    paddingHorizontal: rS(16),
    paddingVertical: rV(12),
  },
  primaryCtaText: {
    color: AppColors.white,
    fontFamily: Fonts.textBold,
    fontSize: rMS(12.5),
  },
  statsRow: {
    flexDirection: "row",
    gap: rS(10),
    marginTop: rV(14),
  },
  statCard: {
    flex: 1,
    backgroundColor: AppColors.white,
    borderRadius: rMS(18),
    padding: rS(16),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  statLabel: {
    color: AppColors.subtext[100],
    fontFamily: Fonts.text,
    fontSize: rMS(11),
  },
  statValue: {
    marginTop: rV(8),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
  },
  emptyCard: {
    marginTop: rV(14),
  },
  voucherCard: {
    marginTop: rV(14),
    backgroundColor: AppColors.white,
    borderRadius: rMS(22),
    padding: rS(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  voucherTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: rS(12),
  },
  voucherCode: {
    color: AppColors.primary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(11),
    letterSpacing: 0.5,
  },
  voucherTitle: {
    marginTop: rV(6),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(17),
  },
  statusPill: {
    borderRadius: rMS(999),
    backgroundColor: "#EEF2F7",
    paddingHorizontal: rS(10),
    paddingVertical: rV(6),
  },
  statusPillText: {
    color: AppColors.secondary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(10.5),
    textTransform: "capitalize",
  },
  pendingNote: {
    marginTop: rV(8),
    color: "#B45309",
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    lineHeight: rMS(16),
  },
  rewardText: {
    marginTop: rV(14),
    color: AppColors.text,
    fontFamily: Fonts.black,
    fontSize: rMS(24),
  },
  metaText: {
    marginTop: rV(6),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
  actionRow: {
    flexDirection: "row",
    gap: rS(10),
    marginTop: rV(16),
  },
  secondaryBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: rMS(999),
    backgroundColor: "#EEF2F7",
    paddingVertical: rV(11),
  },
  secondaryBtnText: {
    color: AppColors.text,
    fontFamily: Fonts.textBold,
    fontSize: rMS(12),
  },
  dangerBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: rMS(999),
    backgroundColor: "#FEE2E2",
    paddingVertical: rV(11),
  },
  dangerBtnText: {
    color: "#B91C1C",
    fontFamily: Fonts.textBold,
    fontSize: rMS(12),
  },
  modalScreen: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  inlinePickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    paddingHorizontal: rS(18),
  },
  modalContent: {
    paddingHorizontal: rS(16),
    paddingTop: rV(16),
  },
  editorIntroCard: {
    borderRadius: rMS(22),
    backgroundColor: "#EEF4FF",
    padding: rS(16),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#D8E4FF",
  },
  editorIntroTitle: {
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
  },
  editorIntroBody: {
    marginTop: rV(8),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(19),
  },
  formSectionCard: {
    marginTop: rV(14),
    borderRadius: rMS(24),
    backgroundColor: AppColors.white,
    padding: rS(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  formSectionTitle: {
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
  },
  formSectionBody: {
    marginTop: rV(6),
    marginBottom: rV(16),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(19),
  },
  fieldLabel: {
    marginBottom: rV(8),
    color: AppColors.primary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(13),
  },
  segmentRow: {
    flexDirection: "row",
    gap: rS(8),
    flexWrap: "wrap",
    marginBottom: rV(8),
  },
  segmentChip: {
    borderRadius: rMS(999),
    borderWidth: 1,
    borderColor: "#D6DCE5",
    backgroundColor: AppColors.white,
    paddingHorizontal: rS(12),
    paddingVertical: rV(9),
  },
  segmentChipActive: {
    borderColor: AppColors.text,
    backgroundColor: AppColors.text,
  },
  segmentChipText: {
    color: AppColors.text,
    fontFamily: Fonts.textBold,
    fontSize: rMS(12),
  },
  segmentChipTextActive: {
    color: AppColors.white,
  },
  helperText: {
    marginBottom: rV(16),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(18),
  },
  dateFieldContainer: {
    marginBottom: rV(16),
  },
  dateFieldLabel: {
    marginBottom: rV(6),
    paddingLeft: rS(8),
    color: AppColors.primary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(13),
  },
  dateField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#D1D1D1",
    borderRadius: rMS(22),
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
  },
  dateFieldValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
    flex: 1,
    paddingRight: rS(8),
  },
  dateFieldValue: {
    flex: 1,
    color: AppColors.text,
    fontFamily: Fonts.text,
    fontSize: rMS(14),
  },
  dateFieldPlaceholder: {
    color: AppColors.secondary,
  },
  clearDateButton: {
    marginTop: rV(8),
    alignSelf: "flex-start",
    paddingLeft: rS(8),
  },
  clearDateButtonText: {
    color: AppColors.primary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(11.5),
  },
  previewCard: {
    marginTop: rV(8),
    borderRadius: rMS(22),
    backgroundColor: AppColors.white,
    padding: rS(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  previewEyebrow: {
    color: AppColors.subtext[100],
    fontFamily: Fonts.textBold,
    fontSize: rMS(11),
    textTransform: "uppercase",
  },
  previewValue: {
    marginTop: rV(10),
    color: AppColors.text,
    fontFamily: Fonts.black,
    fontSize: rMS(24),
  },
  previewMeta: {
    marginTop: rV(8),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(18),
  },
  switchRow: {
    marginTop: rV(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchLabel: {
    color: AppColors.text,
    fontFamily: Fonts.textBold,
    fontSize: rMS(13),
  },
  modalActionRow: {
    flexDirection: "row",
    gap: rS(10),
    marginTop: rV(18),
  },
  modalGhostBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: rMS(999),
    backgroundColor: "#E9EEF4",
    paddingVertical: rV(13),
  },
  modalGhostText: {
    color: AppColors.text,
    fontFamily: Fonts.textBold,
    fontSize: rMS(12.5),
  },
  modalPrimaryBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: rMS(999),
    backgroundColor: AppColors.text,
    paddingVertical: rV(13),
  },
  modalPrimaryText: {
    color: AppColors.white,
    fontFamily: Fonts.textBold,
    fontSize: rMS(12.5),
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    paddingHorizontal: rS(18),
  },
  giftSheet: {
    borderRadius: rMS(24),
    backgroundColor: AppColors.white,
    padding: rS(18),
  },
  datePickerSheet: {
    borderRadius: rMS(24),
    backgroundColor: AppColors.white,
    padding: rS(18),
  },
  datePickerControl: {
    alignSelf: "stretch",
    marginTop: rV(6),
  },
  giftTitle: {
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
  },
  giftBody: {
    marginTop: rV(8),
    marginBottom: rV(16),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(19),
  },
});
