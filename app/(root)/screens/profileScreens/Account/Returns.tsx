import {
  AccountActionButton,
  AccountBadge,
  AccountEmptyState,
  AccountInsightCard,
  AccountListCard,
  AccountSegmentedTabs,
  useAccountStyles,
} from "@/components/account/AccountUi";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import KeyboardAwareScreen from "@/components/layout/KeyboardAwareScreen";
import KeyboardAwareScrollView from "@/components/layout/KeyboardAwareScrollView";
import ScreenLoader from "@/components/loaders/ScreenLoader";
import CommerceImage from "@/components/media/CommerceImage";
import ProfileHeader from "@/components/profile/ProfileHeader";
import TextInputField from "@/components/TextInputField";
import Fonts from "@/constants/Fonts";
import type { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { Order, OrderItem, ReturnRequest, useOrders } from "@/hooks/useOrders";
import { rMS, rS, rV } from "@/styles/responsive";
import { pickCroppedImage } from "@/utils/imagePicker";
import { resolveImageSource } from "@/utils/media";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ReturnsView = "eligible" | "requests";

type ReturnTarget = {
  order: Order;
  item: OrderItem;
};

const OPEN_RETURN_STATUSES = new Set(["requested", "under_review", "approved"]);

function getReturnStatusMeta(status: ReturnRequest["status"], colors: ThemeColors) {
  switch (status) {
    case "requested":
      return { label: "Requested", bg: colors.warningSoft, color: colors.warningText };
    case "under_review":
      return { label: "Under Review", bg: colors.infoSoft, color: colors.infoText };
    case "approved":
      return { label: "Approved", bg: colors.successSoft, color: colors.successText };
    case "rejected":
      return { label: "Declined", bg: colors.dangerSoft, color: colors.dangerText };
    case "refunded":
      return { label: "Refunded", bg: colors.successSoft, color: colors.successText };
    case "exchanged":
      return { label: "Exchanged", bg: colors.infoSoft, color: colors.infoText };
    default:
      return { label: status.replace(/_/g, " "), bg: colors.surfaceMuted, color: colors.textSecondary };
  }
}

function formatFriendlyDate(value?: string | null) {
  if (!value) {
    return "Just now";
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ReturnsScreen() {
  const accountStyles = useAccountStyles();
  const { orders, isLoadingOrders, createReturnRequest, isMutatingOrder, refreshOrders } =
    useOrders();
  const { showToast } = useToast();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeView, setActiveView] = useState<ReturnsView>("eligible");
  const [target, setTarget] = useState<ReturnTarget | null>(null);
  const [returnType, setReturnType] = useState<"refund" | "exchange" | "return">("refund");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [evidenceImages, setEvidenceImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const latestRequestByItem = useMemo(() => {
    const grouped = new Map<string, ReturnRequest>();

    for (const order of orders) {
      for (const request of order.return_requests ?? []) {
        const existing = grouped.get(request.order_item_id);
        if (!existing) {
          grouped.set(request.order_item_id, request);
          continue;
        }

        if (new Date(request.created_at).getTime() > new Date(existing.created_at).getTime()) {
          grouped.set(request.order_item_id, request);
        }
      }
    }

    return grouped;
  }, [orders]);

  const eligibleItems = useMemo(() => {
    return orders
      .filter((order) => order.status === "delivered")
      .flatMap((order) =>
        order.items
          .filter((item) => item.is_returnable !== false)
          .map((item) => ({
            order,
            item,
            latestRequest: latestRequestByItem.get(item.id) ?? null,
          })),
      )
      .sort(
        (left, right) =>
          new Date(right.order.delivered_at ?? right.order.created_at).getTime() -
          new Date(left.order.delivered_at ?? left.order.created_at).getTime(),
      );
  }, [latestRequestByItem, orders]);

  const submittedRequests = useMemo(() => {
    return orders
      .flatMap((order) =>
        (order.return_requests ?? []).map((request) => ({
          order,
          request,
          item: order.items.find((candidate) => candidate.id === request.order_item_id) ?? null,
        })),
      )
      .sort(
        (left, right) =>
          new Date(right.request.created_at).getTime() - new Date(left.request.created_at).getTime(),
      );
  }, [orders]);

  const openComposer = (nextTarget: ReturnTarget) => {
    setTarget(nextTarget);
    setReturnType("refund");
    setQuantity(1);
    setReason("");
    setDetails("");
    setEvidenceImages([]);
  };

  const closeComposer = (force = false) => {
    if (isSubmitting && !force) {
      return;
    }

    setTarget(null);
    setReturnType("refund");
    setQuantity(1);
    setReason("");
    setDetails("");
    setEvidenceImages([]);
  };

  const handleAddEvidence = async () => {
    if (evidenceImages.length >= 4) {
      Alert.alert("Limit reached", "You can attach up to 4 photos to one request.");
      return;
    }

    const picked = await pickCroppedImage(undefined, 0.82);
    if (!picked.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo library access so you can attach product photos to your return request.",
      );
      return;
    }

    if (picked.tooLarge) {
      Alert.alert("Photo too large", "Please choose a photo under 8MB.");
      return;
    }

    if (picked.canceled || !picked.uri) {
      return;
    }

    setEvidenceImages((current) => [...current, picked.uri!]);
  };

  const handleRemoveEvidence = (imageUri: string) => {
    setEvidenceImages((current) => current.filter((item) => item !== imageUri));
  };

  const handleSubmit = async () => {
    if (!target) {
      return;
    }

    const trimmedReason = reason.trim();
    const trimmedDetails = details.trim();
    if (trimmedReason.length < 2) {
      Alert.alert("Reason needed", "Tell ODOS what went wrong before sending the request.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createReturnRequest(target.order.id, {
        order_item_id: target.item.id,
        request_type: returnType,
        quantity,
        reason: trimmedReason,
        details: trimmedDetails || null,
        evidence_images: evidenceImages,
      });
      await refreshOrders();
      closeComposer(true);
      setActiveView("requests");
      showToast("Return request submitted.");
    } catch (error) {
      Alert.alert(
        "Unable to submit request",
        error instanceof Error
          ? error.message
          : "We couldn't submit your request right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingOrders) {
    return (
      <View style={accountStyles.screen}>
        <ProfileHeader title="Returns" />
        <ScreenLoader label="Loading return options..." />
      </View>
    );
  }

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader title="Returns" />

      <KeyboardAwareScreen
        showsVerticalScrollIndicator={false}
        contentContainerStyle={accountStyles.content}
      >
        <AccountInsightCard
          title="Returns, refunds & exchanges"
          subtitle="Start a case from any delivered item, add optional photos, and follow ODOS review updates here."
          stats={[
            { value: eligibleItems.length, label: "Eligible" },
            { value: submittedRequests.length, label: "Requests" },
          ]}
        />

        <AccountSegmentedTabs
          options={[
            { key: "eligible", label: "Eligible items" },
            { key: "requests", label: "My requests" },
          ]}
          activeKey={activeView}
          onChange={setActiveView}
        />

        {activeView === "eligible" ? (
          eligibleItems.length === 0 ? (
            <AccountEmptyState
              icon="bag-check-outline"
              title="No returnable items yet"
              message="Once a returnable order item is delivered, it will show up here so you can request a refund, exchange, or return."
            />
          ) : (
            eligibleItems.map(({ order, item, latestRequest }) => {
              const imageSource = resolveImageSource(item.image_url, item.image_key);
              const hasOpenRequest = latestRequest
                ? OPEN_RETURN_STATUSES.has(latestRequest.status)
                : false;
              const statusMeta = latestRequest
                ? getReturnStatusMeta(latestRequest.status, colors)
                : null;

              return (
                <AccountListCard key={`${order.id}-${item.id}`}>
                  <View style={styles.itemTopRow}>
                    <View style={styles.itemImageWrap}>
                      {imageSource ? (
                        <CommerceImage
                          source={imageSource}
                          style={styles.itemImage}
                          contentFit="contain"
                          trackingId={`return-item-${item.id}`}
                          recyclingKey={item.image_url || item.image_key || item.id}
                          placeholderColor={colors.surfaceMuted}
                        />
                      ) : (
                        <Ionicons name="image-outline" size={rMS(20)} color={colors.iconMuted} />
                      )}
                    </View>

                    <View style={styles.itemInfo}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemMeta}>
                        Order #{order.order_number} · Delivered {formatFriendlyDate(order.delivered_at)}
                      </Text>
                      <Text style={styles.itemMeta}>
                        Qty {item.quantity} · ₵{item.line_total.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.itemFooter}>
                    {latestRequest && statusMeta ? (
                      <AccountBadge label={statusMeta.label} tone="info" />
                    ) : (
                      <AccountBadge label="Photos optional" tone="neutral" />
                    )}

                    <AccountActionButton
                      label={
                        hasOpenRequest
                          ? "In review"
                          : latestRequest
                            ? "Request again"
                            : "Start request"
                      }
                      variant="primary"
                      compact
                      disabled={hasOpenRequest || isMutatingOrder}
                      onPress={() => openComposer({ order, item })}
                    />
                  </View>
                </AccountListCard>
              );
            })
          )
        ) : submittedRequests.length === 0 ? (
          <AccountEmptyState
            icon="swap-horizontal-outline"
            title="No return requests yet"
            message="When you submit a return, refund, or exchange case, ODOS will keep status updates here."
          />
        ) : (
          submittedRequests.map(({ order, request, item }) => {
            const statusMeta = getReturnStatusMeta(request.status, colors);
            return (
              <AccountListCard key={request.id}>
                <View style={styles.requestTopRow}>
                  <View style={styles.requestTopText}>
                    <Text style={styles.requestTitle}>{item?.title || "Order item"}</Text>
                    <Text style={styles.requestMeta}>
                      Order #{order.order_number} · {request.request_type} · Qty {request.quantity}
                    </Text>
                  </View>
                  <AccountBadge label={statusMeta.label} tone="info" />
                </View>

                <Text style={styles.requestReason}>{request.reason}</Text>
                {request.details ? (
                  <Text style={styles.requestDetails}>{request.details}</Text>
                ) : null}

                {request.evidence_image_urls?.length ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.evidenceRow}
                  >
                    {request.evidence_image_urls.map((imageUrl, index) => {
                      const source = resolveImageSource(imageUrl);
                      return source ? (
                        <CommerceImage
                          key={`${request.id}-${index}`}
                          source={source}
                          style={styles.evidenceThumb}
                          contentFit="cover"
                          trackingId={`return-evidence-${request.id}-${index}`}
                          recyclingKey={imageUrl}
                          placeholderColor={colors.segmentBg}
                        />
                      ) : null;
                    })}
                  </ScrollView>
                ) : null}

                <View style={styles.requestFooter}>
                  <Text style={styles.requestTimestamp}>
                    Sent {formatFriendlyDate(request.created_at)}
                  </Text>
                  {request.refund_amount !== null && request.refund_amount !== undefined ? (
                    <Text style={styles.requestRefund}>
                      Refund ₵{request.refund_amount.toFixed(2)}
                    </Text>
                  ) : null}
                </View>

                {request.admin_note ? (
                  <View style={styles.noteCard}>
                    <Text style={styles.noteLabel}>ODOS note</Text>
                    <Text style={styles.noteText}>{request.admin_note}</Text>
                  </View>
                ) : null}
              </AccountListCard>
            );
          })
        )}
      </KeyboardAwareScreen>

      <Modal
        visible={Boolean(target)}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => closeComposer()}
      >
        <View style={styles.modalScreen}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => closeComposer()} disabled={isSubmitting}>
              <Text style={styles.modalHeaderAction}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>New return request</Text>
            <TouchableOpacity onPress={() => void handleSubmit()} disabled={isSubmitting}>
              <Text style={styles.modalHeaderAction}>
                {isSubmitting ? "Sending..." : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>

          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalContent}
          >
            {target ? (
              <>
                <View style={styles.modalCard}>
                  <Text style={styles.modalSectionTitle}>Selected item</Text>
                  <Text style={styles.modalItemTitle}>{target.item.title}</Text>
                  <Text style={styles.modalItemMeta}>
                    Order #{target.order.order_number} · Delivered {formatFriendlyDate(target.order.delivered_at)}
                  </Text>
                </View>

                <View style={styles.modalCard}>
                  <Text style={styles.modalSectionTitle}>Request type</Text>
                  <View style={styles.choiceRow}>
                    {(["refund", "exchange", "return"] as const).map((option) => {
                      const active = returnType === option;
                      return (
                        <TouchableOpacity
                          key={option}
                          style={[styles.choiceChip, active && styles.choiceChipActive]}
                          activeOpacity={0.88}
                          onPress={() => setReturnType(option)}
                        >
                          <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>
                            {option === "refund"
                              ? "Refund"
                              : option === "exchange"
                                ? "Exchange"
                                : "Return"}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.quantityRow}>
                    <View style={styles.quantityInfo}>
                      <Text style={styles.quantityLabel}>Quantity</Text>
                      <Text style={styles.quantityHint}>
                        Choose how many units from this delivered item should be reviewed.
                      </Text>
                    </View>
                    <View style={styles.quantityStepper}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        activeOpacity={0.88}
                        disabled={quantity <= 1}
                        onPress={() => setQuantity((current) => Math.max(1, current - 1))}
                      >
                        <Ionicons name="remove" size={rMS(16)} color={colors.text} />
                      </TouchableOpacity>
                      <Text style={styles.quantityValue}>{quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        activeOpacity={0.88}
                        disabled={quantity >= target.item.quantity}
                        onPress={() => setQuantity((current) => Math.min(target.item.quantity, current + 1))}
                      >
                        <Ionicons name="add" size={rMS(16)} color={colors.text} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={styles.modalCard}>
                  <TextInputField
                    label="Reason"
                    placeholder="What happened with this item?"
                    value={reason}
                    onChangeText={setReason}
                    helperText="Keep it specific so ODOS can review it faster."
                  />
                  <TextInputField
                    label="Extra details"
                    placeholder="Add a little more context if needed"
                    value={details}
                    onChangeText={setDetails}
                    multiline
                    numberOfLines={5}
                    helperText="Optional, but helpful for damaged, wrong, or incomplete orders."
                  />
                </View>

                <View style={styles.modalCard}>
                  <View style={styles.modalEvidenceHeader}>
                    <View style={styles.modalEvidenceTextWrap}>
                      <Text style={styles.modalSectionTitle}>Photo evidence</Text>
                      <Text style={styles.modalEvidenceHint}>
                        Optional. Attach up to 4 photos if they help explain the issue.
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.addPhotoButton} activeOpacity={0.88} onPress={() => void handleAddEvidence()}>
                      <Ionicons name="camera-outline" size={rMS(14)} color={colors.infoText} />
                      <Text style={styles.addPhotoButtonText}>Add photo</Text>
                    </TouchableOpacity>
                  </View>

                  {evidenceImages.length ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.evidenceComposerRow}
                    >
                      {evidenceImages.map((imageUri) => {
                        const source = resolveImageSource(imageUri);
                        return source ? (
                          <View key={imageUri} style={styles.composerImageWrap}>
                            <CommerceImage
                              source={source}
                              style={styles.composerImage}
                              contentFit="cover"
                              trackingId={`return-composer-evidence-${imageUri}`}
                              recyclingKey={imageUri}
                              placeholderColor={colors.segmentBg}
                            />
                            <TouchableOpacity
                              style={styles.removePhotoButton}
                              activeOpacity={0.88}
                              onPress={() => handleRemoveEvidence(imageUri)}
                            >
                              <Ionicons name="close" size={rMS(12)} color={colors.onInverseSurface} />
                            </TouchableOpacity>
                          </View>
                        ) : null;
                      })}
                    </ScrollView>
                  ) : (
                    <View style={styles.photoEmptyState}>
                      <Ionicons name="images-outline" size={rMS(18)} color={colors.iconMuted} />
                      <Text style={styles.photoEmptyText}>No photos attached yet.</Text>
                    </View>
                  )}
                </View>

                <PrimaryButton
                  title={isSubmitting ? "Submitting..." : "Submit Request"}
                  onPress={() => {
                    void handleSubmit();
                  }}
                  isLoading={isSubmitting}
                  className="mt-2"
                />
              </>
            ) : null}
          </KeyboardAwareScrollView>
        </View>
      </Modal>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.screen,
    },
    content: {
      paddingHorizontal: rS(16),
      paddingTop: rV(14),
      paddingBottom: rV(32),
    },
    heroCard: {
      backgroundColor: colors.card,
      borderRadius: rMS(22),
      padding: rS(18),
      marginBottom: rV(14),
    },
    heroTitle: {
      fontSize: rMS(17),
      fontFamily: Fonts.titleBold,
      color: colors.text,
    },
    heroText: {
      marginTop: rV(8),
      fontSize: rMS(12),
      lineHeight: rMS(18),
      fontFamily: Fonts.text,
      color: colors.textSecondary,
    },
    switcher: {
      flexDirection: "row",
      backgroundColor: colors.segmentBg,
      borderRadius: rMS(16),
      padding: rMS(4),
      marginBottom: rV(14),
    },
    switchChip: {
      flex: 1,
      borderRadius: rMS(12),
      paddingVertical: rV(10),
      alignItems: "center",
    },
    switchChipActive: {
      backgroundColor: colors.segmentActive,
    },
    switchChipText: {
      fontSize: rMS(12),
      fontFamily: Fonts.textBold,
      color: colors.textSecondary,
    },
    switchChipTextActive: {
      color: colors.text,
    },
    emptyCard: {
      backgroundColor: colors.card,
      borderRadius: rMS(22),
      paddingHorizontal: rS(18),
      paddingVertical: rV(22),
      alignItems: "center",
    },
    emptyTitle: {
      marginTop: rV(10),
      fontSize: rMS(15),
      fontFamily: Fonts.titleBold,
      color: colors.text,
    },
    emptyText: {
      marginTop: rV(8),
      textAlign: "center",
      fontSize: rMS(12),
      lineHeight: rMS(18),
      fontFamily: Fonts.text,
      color: colors.textSecondary,
    },
    itemCard: {
      backgroundColor: colors.card,
      borderRadius: rMS(20),
      padding: rS(16),
      marginBottom: rV(12),
    },
    itemTopRow: {
      flexDirection: "row",
      gap: rS(12),
    },
    itemImageWrap: {
      width: rMS(68),
      height: rMS(68),
      borderRadius: rMS(14),
      backgroundColor: colors.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    itemImage: {
      width: "84%",
      height: "84%",
    },
    itemInfo: {
      flex: 1,
    },
    itemTitle: {
      fontSize: rMS(14),
      fontFamily: Fonts.textBold,
      color: colors.text,
    },
    itemMeta: {
      marginTop: rV(4),
      fontSize: rMS(11),
      lineHeight: rMS(16),
      fontFamily: Fonts.text,
      color: colors.textSecondary,
    },
    itemFooter: {
      marginTop: rV(14),
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: rS(10),
    },
    statusPill: {
      borderRadius: rMS(999),
      paddingHorizontal: rS(10),
      paddingVertical: rV(6),
    },
    statusPillText: {
      fontSize: rMS(10),
      fontFamily: Fonts.textBold,
    },
    helperPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(6),
      borderRadius: rMS(999),
      paddingHorizontal: rS(10),
      paddingVertical: rV(6),
      backgroundColor: colors.surfaceSubtle,
    },
    helperPillText: {
      fontSize: rMS(10),
      fontFamily: Fonts.textBold,
      color: colors.textSecondary,
    },
    actionButton: {
      minHeight: rV(38),
      borderRadius: rMS(12),
      paddingHorizontal: rS(14),
      backgroundColor: colors.infoText,
      alignItems: "center",
      justifyContent: "center",
    },
    actionButtonDisabled: {
      backgroundColor: colors.iconMuted,
    },
    actionButtonText: {
      fontSize: rMS(12),
      fontFamily: Fonts.textBold,
      color: colors.onPrimary,
    },
    requestCard: {
      backgroundColor: colors.card,
      borderRadius: rMS(20),
      padding: rS(16),
      marginBottom: rV(12),
    },
    requestTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: rS(10),
    },
    requestTopText: {
      flex: 1,
    },
    requestTitle: {
      fontSize: rMS(14),
      fontFamily: Fonts.textBold,
      color: colors.text,
    },
    requestMeta: {
      marginTop: rV(4),
      fontSize: rMS(11),
      lineHeight: rMS(16),
      fontFamily: Fonts.text,
      color: colors.textSecondary,
    },
    requestReason: {
      marginTop: rV(12),
      fontSize: rMS(12),
      fontFamily: Fonts.textBold,
      color: colors.text,
    },
    requestDetails: {
      marginTop: rV(5),
      fontSize: rMS(12),
      lineHeight: rMS(18),
      fontFamily: Fonts.text,
      color: colors.textSecondary,
    },
    evidenceRow: {
      gap: rS(10),
      paddingTop: rV(12),
    },
    evidenceThumb: {
      width: rMS(86),
      height: rMS(86),
      borderRadius: rMS(12),
      backgroundColor: colors.segmentBg,
    },
    requestFooter: {
      marginTop: rV(12),
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: rS(10),
    },
    requestTimestamp: {
      flex: 1,
      fontSize: rMS(11),
      fontFamily: Fonts.text,
      color: colors.textSecondary,
    },
    requestRefund: {
      fontSize: rMS(11),
      fontFamily: Fonts.textBold,
      color: colors.successText,
    },
    noteCard: {
      marginTop: rV(12),
      backgroundColor: colors.infoSoft,
      borderRadius: rMS(14),
      paddingHorizontal: rS(12),
      paddingVertical: rV(10),
    },
    noteLabel: {
      fontSize: rMS(10),
      fontFamily: Fonts.textBold,
      color: colors.infoText,
      textTransform: "uppercase",
    },
    noteText: {
      marginTop: rV(4),
      fontSize: rMS(12),
      lineHeight: rMS(18),
      fontFamily: Fonts.text,
      color: colors.text,
    },
    modalScreen: {
      flex: 1,
      backgroundColor: colors.screen,
    },
    modalHeader: {
      backgroundColor: colors.header,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.headerBorder,
      paddingHorizontal: rS(16),
      paddingTop: rV(18),
      paddingBottom: rV(14),
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    modalHeaderAction: {
      fontSize: rMS(13),
      fontFamily: Fonts.textBold,
      color: colors.primary,
    },
    modalHeaderTitle: {
      fontSize: rMS(15),
      fontFamily: Fonts.titleBold,
      color: colors.text,
    },
    modalContent: {
      paddingHorizontal: rS(16),
      paddingTop: rV(16),
      paddingBottom: rV(28),
    },
    modalCard: {
      backgroundColor: colors.card,
      borderRadius: rMS(18),
      padding: rS(16),
      marginBottom: rV(12),
    },
    modalSectionTitle: {
      fontSize: rMS(13),
      fontFamily: Fonts.textBold,
      color: colors.text,
      marginBottom: rV(10),
    },
    modalItemTitle: {
      fontSize: rMS(16),
      fontFamily: Fonts.titleBold,
      color: colors.text,
    },
    modalItemMeta: {
      marginTop: rV(4),
      fontSize: rMS(12),
      fontFamily: Fonts.text,
      color: colors.textSecondary,
    },
    choiceRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: rS(8),
      marginBottom: rV(16),
    },
    choiceChip: {
      paddingHorizontal: rS(14),
      paddingVertical: rV(9),
      borderRadius: rMS(999),
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSubtle,
    },
    choiceChipActive: {
      borderColor: colors.infoText,
      backgroundColor: colors.infoSoft,
    },
    choiceChipText: {
      fontSize: rMS(12),
      fontFamily: Fonts.textBold,
      color: colors.textSecondary,
    },
    choiceChipTextActive: {
      color: colors.infoText,
    },
    quantityRow: {
      borderRadius: rMS(16),
      backgroundColor: colors.surfaceSubtle,
      paddingHorizontal: rS(14),
      paddingVertical: rV(14),
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: rS(12),
    },
    quantityInfo: {
      flex: 1,
    },
    quantityLabel: {
      fontSize: rMS(12),
      fontFamily: Fonts.textBold,
      color: colors.text,
    },
    quantityHint: {
      marginTop: rV(4),
      fontSize: rMS(11),
      lineHeight: rMS(16),
      fontFamily: Fonts.text,
      color: colors.textSecondary,
    },
    quantityStepper: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(10),
    },
    quantityButton: {
      width: rMS(32),
      height: rMS(32),
      borderRadius: rMS(16),
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    quantityValue: {
      minWidth: rS(24),
      textAlign: "center",
      fontSize: rMS(14),
      fontFamily: Fonts.titleBold,
      color: colors.text,
    },
    modalEvidenceHeader: {
      gap: rV(10),
    },
    modalEvidenceTextWrap: {
      width: "100%",
    },
    modalEvidenceHint: {
      marginTop: rV(4),
      fontSize: rMS(11),
      lineHeight: rMS(16),
      fontFamily: Fonts.text,
      color: colors.textSecondary,
    },
    addPhotoButton: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: rS(6),
      borderRadius: rMS(999),
      backgroundColor: colors.infoSoft,
      paddingHorizontal: rS(12),
      paddingVertical: rV(8),
    },
    addPhotoButtonText: {
      fontSize: rMS(11),
      fontFamily: Fonts.textBold,
      color: colors.infoText,
    },
    evidenceComposerRow: {
      gap: rS(10),
      paddingTop: rV(12),
    },
    composerImageWrap: {
      width: rMS(94),
      height: rMS(94),
      borderRadius: rMS(14),
      overflow: "hidden",
      backgroundColor: colors.segmentBg,
    },
    composerImage: {
      width: "100%",
      height: "100%",
    },
    removePhotoButton: {
      position: "absolute",
      top: rV(6),
      right: rS(6),
      width: rMS(22),
      height: rMS(22),
      borderRadius: rMS(11),
      backgroundColor: "rgba(0,0,0,0.6)",
      alignItems: "center",
      justifyContent: "center",
    },
    photoEmptyState: {
      marginTop: rV(12),
      borderRadius: rMS(14),
      backgroundColor: colors.surfaceSubtle,
      paddingHorizontal: rS(14),
      paddingVertical: rV(14),
      flexDirection: "row",
      alignItems: "center",
      gap: rS(8),
    },
    photoEmptyText: {
      fontSize: rMS(12),
      fontFamily: Fonts.text,
      color: colors.textSecondary,
    },
  });
}
