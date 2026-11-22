import { useTheme } from "@/context/ThemeContext";
import type { Order } from "@/hooks/useOrders";
import { rV } from "@/styles/responsive";
import { SHOPPER_CANCEL_REASONS, cancellability, orderIsPaid } from "@/utils/orderState";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const money = (value: number) => `GH₵${value.toLocaleString()}`;

/**
 * Collects why a shopper is cancelling, and tells them what will happen.
 *
 * What it says depends on what is actually true of this order: a paid one names
 * the refund amount, an unpaid one says nothing was charged, and an order the
 * seller has already accepted asks rather than promises. Reporting the outcome
 * is the screen's job, since only the server's answer says whether the order
 * stopped or the request is merely on its way.
 */
export default function CancelOrderSheet({
  visible,
  order,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  order: Order;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (reasonCode: string, note: string | null) => void;
}) {
  const { colors } = useTheme();
  const [reasonCode, setReasonCode] = useState(SHOPPER_CANCEL_REASONS[0].value);
  const [note, setNote] = useState("");

  const ability = cancellability(order);
  const paid = orderIsPaid(order);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: colors.backdrop, justifyContent: "flex-end" }}
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={{
            backgroundColor: colors.screen,
            borderTopLeftRadius: rV(22),
            borderTopRightRadius: rV(22),
            maxHeight: "88%",
          }}
        >
          <ScrollView contentContainerStyle={{ padding: rV(20) }}>
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: rV(18) }}>
              {ability.requiresReview ? "Ask to cancel this order" : "Cancel this order"}
            </Text>

            <View
              style={{
                marginTop: rV(14),
                padding: rV(12),
                borderRadius: rV(14),
                backgroundColor: colors.surfaceMuted,
              }}
            >
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: rV(13) }}>
                Order #{order.order_number}
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: rV(12),
                  marginTop: 6,
                  lineHeight: rV(18),
                }}
              >
                {ability.requiresReview
                  ? ability.reason
                  : paid
                    ? `You paid ${money(order.total_amount)}. Cancelling starts a refund — we'll confirm once the money has been sent back.`
                    : "You haven't been charged for this order, so there is nothing to refund."}
              </Text>
            </View>

            <Text
              style={{ color: colors.text, fontWeight: "600", fontSize: rV(13), marginTop: rV(18) }}
            >
              Why are you cancelling?
            </Text>
            <View style={{ marginTop: rV(10), gap: rV(8) }}>
              {SHOPPER_CANCEL_REASONS.map((option) => {
                const selected = option.value === reasonCode;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setReasonCode(option.value)}
                    disabled={isSubmitting}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: rV(10),
                      paddingVertical: rV(11),
                      paddingHorizontal: rV(12),
                      borderRadius: rV(12),
                      borderWidth: 1,
                      borderColor: selected ? colors.primary : colors.inputBorder,
                      backgroundColor: selected ? colors.surfaceMuted : "transparent",
                    }}
                  >
                    <View
                      style={{
                        width: rV(18),
                        height: rV(18),
                        borderRadius: rV(9),
                        borderWidth: 2,
                        borderColor: selected ? colors.primary : colors.inputBorder,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {selected ? (
                        <View
                          style={{
                            width: rV(8),
                            height: rV(8),
                            borderRadius: rV(4),
                            backgroundColor: colors.primary,
                          }}
                        />
                      ) : null}
                    </View>
                    <Text style={{ color: colors.text, fontSize: rV(13), flex: 1 }}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text
              style={{ color: colors.text, fontWeight: "600", fontSize: rV(13), marginTop: rV(18) }}
            >
              Anything else? (optional)
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              multiline
              maxLength={500}
              editable={!isSubmitting}
              placeholder="A little more detail helps the seller."
              placeholderTextColor={colors.placeholder}
              style={{
                marginTop: rV(8),
                borderWidth: 1,
                borderColor: colors.inputBorder,
                backgroundColor: colors.inputBg,
                borderRadius: rV(12),
                padding: rV(12),
                minHeight: rV(80),
                color: colors.text,
                fontSize: rV(14),
                textAlignVertical: "top",
              }}
            />

            <Pressable
              onPress={() => onSubmit(reasonCode, note.trim() || null)}
              disabled={isSubmitting}
              style={{
                marginTop: rV(20),
                backgroundColor: colors.primary,
                borderRadius: rV(14),
                paddingVertical: rV(14),
                alignItems: "center",
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={{ color: colors.onPrimary, fontWeight: "700", fontSize: rV(14) }}>
                  {ability.requiresReview ? "Request cancellation" : "Cancel this order"}
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={onClose}
              disabled={isSubmitting}
              style={{ marginTop: rV(10), paddingVertical: rV(12), alignItems: "center" }}
            >
              <Text style={{ color: colors.textMuted, fontWeight: "600", fontSize: rV(13) }}>
                Keep my order
              </Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
