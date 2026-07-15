import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import {
  detectCardBrand,
  formatCardCvvInput,
  formatCardExpiryInput,
  formatCardholderName,
  formatCardNumberForPreview,
  formatCardNumberInput,
  getCardBrandColors,
  getCardBrandLabel,
  getCardNumberMaxLength,
  getCvvMaxLength,
  type CardBrand,
  type CardFieldErrors,
  type CardFormValues,
} from "@/utils/cardPayment";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInput as TextInputType,
} from "react-native";

type CardEntryFormProps = {
  values: CardFormValues;
  errors: CardFieldErrors;
  onChange: (field: keyof CardFormValues, value: string) => void;
  onClearError: (field: keyof CardFormValues) => void;
};

function CardBrandMark({ brand }: { brand: CardBrand }) {
  const label = getCardBrandLabel(brand);

  return (
    <View style={brandMarkStyles.shell}>
      {brand === "mastercard" ? (
        <View style={brandMarkStyles.mastercardRow}>
          <View style={[brandMarkStyles.mastercardCircle, { backgroundColor: "#EB001B" }]} />
          <View
            style={[
              brandMarkStyles.mastercardCircle,
              { backgroundColor: "#F79E1B", marginLeft: -rS(10) },
            ]}
          />
        </View>
      ) : (
        <Text style={brandMarkStyles.label}>{brand === "unknown" ? "CARD" : label.toUpperCase()}</Text>
      )}
    </View>
  );
}

const brandMarkStyles = StyleSheet.create({
  shell: {
    minWidth: rMS(54),
    alignItems: "flex-end",
    justifyContent: "center",
  },
  label: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(11),
    letterSpacing: 1.1,
    color: "rgba(255,255,255,0.92)",
  },
  mastercardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  mastercardCircle: {
    width: rMS(22),
    height: rMS(22),
    borderRadius: rMS(11),
    opacity: 0.95,
  },
});

export default function CardEntryForm({
  values,
  errors,
  onChange,
  onClearError,
}: CardEntryFormProps) {
  const { colors } = useTheme();
  const numberRef = useRef<TextInputType>(null);
  const expiryRef = useRef<TextInputType>(null);
  const cvvRef = useRef<TextInputType>(null);

  const brand = useMemo(() => detectCardBrand(values.cardNumber), [values.cardNumber]);
  const previewNumber = useMemo(
    () => formatCardNumberForPreview(values.cardNumber, brand),
    [brand, values.cardNumber],
  );
  const previewExpiry = values.expiry || "MM/YY";
  const previewName = values.cardName.trim() || "YOUR NAME";
  const gradientColors = getCardBrandColors(brand);
  const cvvMaxLength = getCvvMaxLength(brand);
  const cardNumberMaxLength = getCardNumberMaxLength(brand);
  const formattedCardNumber = formatCardNumberInput(values.cardNumber, brand);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          gap: rV(16),
        },
        preview: {
          borderRadius: rMS(20),
          overflow: "hidden",
          minHeight: rV(176),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: "rgba(255,255,255,0.18)",
        },
        previewInner: {
          flex: 1,
          paddingHorizontal: rS(18),
          paddingVertical: rV(18),
          justifyContent: "space-between",
        },
        previewTop: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        chip: {
          width: rMS(42),
          height: rMS(30),
          borderRadius: rMS(7),
          backgroundColor: "rgba(255,255,255,0.22)",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: "rgba(255,255,255,0.28)",
        },
        previewNumber: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(21),
          letterSpacing: 1.6,
          color: "#FFFFFF",
          marginTop: rV(18),
        },
        previewBottom: {
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginTop: rV(18),
        },
        previewLabel: {
          fontFamily: Fonts.text,
          fontSize: rMS(10),
          letterSpacing: 0.8,
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.68)",
          marginBottom: rV(4),
        },
        previewName: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(14),
          color: "#FFFFFF",
          textTransform: "uppercase",
        },
        previewExpiry: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(14),
          color: "#FFFFFF",
          letterSpacing: 1,
        },
        secureNote: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(8),
          paddingHorizontal: rS(12),
          paddingVertical: rV(10),
          borderRadius: rMS(14),
          backgroundColor: colors.surfaceMuted,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        secureText: {
          flex: 1,
          fontFamily: Fonts.text,
          fontSize: rMS(11.5),
          lineHeight: rMS(17),
          color: colors.textMuted,
        },
        fieldBlock: {
          gap: rV(6),
        },
        fieldLabel: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
          color: colors.textSecondary,
        },
        inputRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(10),
          minHeight: rV(52),
          paddingHorizontal: rS(14),
          borderRadius: rMS(16),
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        inputRowError: {
          borderColor: colors.dangerText,
        },
        input: {
          flex: 1,
          fontFamily: Fonts.text,
          fontSize: rMS(15),
          color: colors.text,
          paddingVertical: 0,
        },
        helper: {
          fontFamily: Fonts.text,
          fontSize: rMS(11),
          color: colors.textMuted,
        },
        error: {
          fontFamily: Fonts.text,
          fontSize: rMS(11),
          color: colors.dangerText,
        },
        brandHint: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(11),
          color: colors.primary,
        },
        row: {
          flexDirection: "row",
          gap: rS(10),
        },
        cvvHelp: {
          marginTop: rV(4),
          fontFamily: Fonts.text,
          fontSize: rMS(11),
          color: colors.textMuted,
        },
      }),
    [colors],
  );

  const updateField = (field: keyof CardFormValues, value: string) => {
    onChange(field, value);
    onClearError(field);
  };

  const handleCardNumberChange = (raw: string) => {
    updateField("cardNumber", formatCardNumberInput(raw, brand));
    const digits = raw.replace(/\D/g, "");
    if (digits.length >= cardNumberMaxLength) {
      expiryRef.current?.focus();
    }
  };

  const handleExpiryChange = (raw: string) => {
    const formatted = formatCardExpiryInput(raw);
    updateField("expiry", formatted);
    if (formatted.length === 5) {
      cvvRef.current?.focus();
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.preview}>
        <LinearGradient colors={gradientColors} style={styles.previewInner}>
          <View style={styles.previewTop}>
            <View style={styles.chip} />
            <CardBrandMark brand={brand} />
          </View>

          <Text style={styles.previewNumber}>{previewNumber}</Text>

          <View style={styles.previewBottom}>
            <View style={{ flex: 1, minWidth: 0, paddingRight: rS(12) }}>
              <Text style={styles.previewLabel}>Cardholder</Text>
              <Text style={styles.previewName} numberOfLines={1}>
                {previewName}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.previewLabel}>Expires</Text>
              <Text style={styles.previewExpiry}>{previewExpiry}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.secureNote}>
        <Ionicons name="shield-checkmark-outline" size={rMS(16)} color={colors.primary} />
        <Text style={styles.secureText}>
          Your card is tokenized for wallet top-ups through Paystack. ODOS never stores your full
          card number or CVV.
        </Text>
      </View>

      <View style={styles.fieldBlock}>
        <Text style={styles.fieldLabel}>Cardholder name</Text>
        <View style={[styles.inputRow, errors.cardName ? styles.inputRowError : null]}>
          <Ionicons name="person-outline" size={rMS(18)} color={colors.placeholder} />
          <TextInput
            value={values.cardName}
            onChangeText={(value) => updateField("cardName", formatCardholderName(value))}
            placeholder="As printed on card"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => numberRef.current?.focus()}
            style={styles.input}
          />
        </View>
        {errors.cardName ? <Text style={styles.error}>{errors.cardName}</Text> : null}
      </View>

      <View style={styles.fieldBlock}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={styles.fieldLabel}>Card number</Text>
          {brand !== "unknown" ? <Text style={styles.brandHint}>{getCardBrandLabel(brand)}</Text> : null}
        </View>
        <View style={[styles.inputRow, errors.cardNumber ? styles.inputRowError : null]}>
          <Ionicons name="card-outline" size={rMS(18)} color={colors.placeholder} />
          <TextInput
            ref={numberRef}
            value={formattedCardNumber}
            onChangeText={handleCardNumberChange}
            placeholder={brand === "amex" ? "3782 822463 10005" : "4242 4242 4242 4242"}
            placeholderTextColor={colors.placeholder}
            keyboardType="number-pad"
            returnKeyType="next"
            onSubmitEditing={() => expiryRef.current?.focus()}
            maxLength={brand === "amex" ? 17 : 19}
            style={styles.input}
          />
        </View>
        {errors.cardNumber ? (
          <Text style={styles.error}>{errors.cardNumber}</Text>
        ) : (
          <Text style={styles.helper}>Spaces are added automatically as you type.</Text>
        )}
      </View>

      <View style={styles.row}>
        <View style={[styles.fieldBlock, { flex: 1 }]}>
          <Text style={styles.fieldLabel}>Expiry date</Text>
          <View style={[styles.inputRow, errors.expiry ? styles.inputRowError : null]}>
            <Ionicons name="calendar-outline" size={rMS(18)} color={colors.placeholder} />
            <TextInput
              ref={expiryRef}
              value={values.expiry}
              onChangeText={handleExpiryChange}
              placeholder="MM/YY"
              placeholderTextColor={colors.placeholder}
              keyboardType="number-pad"
              returnKeyType="next"
              onSubmitEditing={() => cvvRef.current?.focus()}
              maxLength={5}
              style={styles.input}
            />
          </View>
          {errors.expiry ? (
            <Text style={styles.error}>{errors.expiry}</Text>
          ) : (
            <Text style={styles.helper}>Type month and year — we add the slash for you.</Text>
          )}
        </View>

        <View style={[styles.fieldBlock, { flex: 1 }]}>
          <Text style={styles.fieldLabel}>Security code</Text>
          <View style={[styles.inputRow, errors.cvv ? styles.inputRowError : null]}>
            <Ionicons name="lock-closed-outline" size={rMS(18)} color={colors.placeholder} />
            <TextInput
              ref={cvvRef}
              value={values.cvv}
              onChangeText={(value) => updateField("cvv", formatCardCvvInput(value, brand))}
              placeholder={brand === "amex" ? "1234" : "123"}
              placeholderTextColor={colors.placeholder}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={cvvMaxLength}
              style={styles.input}
            />
          </View>
          {errors.cvv ? (
            <Text style={styles.error}>{errors.cvv}</Text>
          ) : (
            <Text style={styles.cvvHelp}>
              {brand === "amex" ? "4 digits on the front." : "3 digits on the back."}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
