import { useTheme } from "@/context/ThemeContext";
import { startNegotiation } from "@/services/negotiationService";
import { rV } from "@/styles/responsive";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const digitsOnly = (value: string) => value.replace(/[^0-9]/g, "");
const money = (value: number) => `GH₵${value.toLocaleString()}`;

/**
 * Make an offer on a negotiable product.
 *
 * Asks for a price, a quantity and an optional note, and nothing else. The seller's minimum is
 * never shown or hinted at — it is private, and an offer below it still reaches them to accept
 * or decline. Everything checked here is checked again on the server.
 */
export default function MakeOfferSheet({
  visible,
  onClose,
  productId,
  productTitle,
  listedPrice,
  negotiationNote,
  selectedColor,
  selectedSize,
}: {
  visible: boolean;
  onClose: () => void;
  productId: string;
  productTitle: string;
  listedPrice: number;
  negotiationNote?: string;
  selectedColor?: string | null;
  selectedSize?: string | null;
}) {
  const { colors } = useTheme();
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const offer = Number(price || 0);
  const qty = Math.max(1, Number(quantity || 1));
  const tooHigh = offer > 0 && offer >= listedPrice;
  const saving = offer > 0 && offer < listedPrice ? listedPrice - offer : 0;
  const percent = saving > 0 ? Math.round((saving / listedPrice) * 100) : 0;

  const submit = async () => {
    setBusy(true);
    try {
      const negotiation = await startNegotiation({
        productId,
        unitPrice: offer,
        quantity: qty,
        message: message.trim() || null,
        selectedColor: selectedColor ?? null,
        selectedSize: selectedSize ?? null,
      });
      onClose();
      setPrice("");
      setMessage("");
      router.push({
        pathname: "/(root)/screens/negotiations/[id]" as any,
        params: { id: negotiation.id },
      });
    } catch (err) {
      Alert.alert("Offer", err instanceof Error ? err.message : "We couldn't send that offer.");
    } finally {
      setBusy(false);
    }
  };

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
              Make an offer
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
                {productTitle}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: rV(12), marginTop: 4 }}>
                Listed at {money(listedPrice)}
              </Text>
              {negotiationNote ? (
                <Text style={{ color: colors.textMuted, fontSize: rV(11), marginTop: 6 }}>
                  Seller says: {negotiationNote}
                </Text>
              ) : null}
            </View>

            <Text style={{ color: colors.text, fontWeight: "600", fontSize: rV(13), marginTop: rV(16) }}>
              Your offer per unit
            </Text>
            <TextInput
              value={price}
              onChangeText={(value) => setPrice(digitsOnly(value))}
              keyboardType="number-pad"
              placeholder={String(Math.max(1, Math.round(listedPrice * 0.9)))}
              placeholderTextColor={colors.placeholder}
              style={{
                marginTop: rV(8),
                borderWidth: 1,
                borderColor: tooHigh ? colors.dangerText : colors.inputBorder,
                backgroundColor: colors.inputBg,
                borderRadius: rV(12),
                padding: rV(12),
                color: colors.text,
                fontSize: rV(15),
              }}
            />
            {tooHigh ? (
              <Text style={{ color: colors.dangerText, fontSize: rV(11), marginTop: 6 }}>
                That is at or above the listed price — just buy it at {money(listedPrice)}.
              </Text>
            ) : saving > 0 ? (
              <Text style={{ color: colors.textMuted, fontSize: rV(11), marginTop: 6 }}>
                {percent}% below list · {money(saving * qty)} off in total
              </Text>
            ) : null}

            <Text style={{ color: colors.text, fontWeight: "600", fontSize: rV(13), marginTop: rV(16) }}>
              Quantity
            </Text>
            <TextInput
              value={quantity}
              onChangeText={(value) => setQuantity(digitsOnly(value) || "1")}
              keyboardType="number-pad"
              style={{
                marginTop: rV(8),
                borderWidth: 1,
                borderColor: colors.inputBorder,
                backgroundColor: colors.inputBg,
                borderRadius: rV(12),
                padding: rV(12),
                color: colors.text,
                fontSize: rV(15),
              }}
            />
            <Text style={{ color: colors.textMuted, fontSize: rV(11), marginTop: 6 }}>
              The agreed price will cover exactly this many.
            </Text>

            <Text style={{ color: colors.text, fontWeight: "600", fontSize: rV(13), marginTop: rV(16) }}>
              Message (optional)
            </Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
              placeholder="Buying several, collecting in person…"
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
              }}
            />

            <Pressable
              onPress={submit}
              disabled={!offer || tooHigh || busy}
              style={{
                marginTop: rV(20),
                paddingVertical: rV(14),
                borderRadius: rV(14),
                alignItems: "center",
                backgroundColor: colors.primary,
                opacity: !offer || tooHigh || busy ? 0.5 : 1,
              }}
            >
              {busy ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={{ color: colors.onPrimary, fontWeight: "700", fontSize: rV(15) }}>
                  Send offer
                </Text>
              )}
            </Pressable>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: rV(11),
                textAlign: "center",
                marginTop: rV(10),
              }}
            >
              The seller can accept, decline, or come back with their own price.
            </Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
