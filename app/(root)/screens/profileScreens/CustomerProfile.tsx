import UserAvatar from "@/components/UserAvatar";
import {
  AccountActionButton,
  AccountBadge,
  AccountChoiceOption,
  AccountChoiceSheet,
  AccountFormField,
  AccountInsightCard,
  AccountPickerField,
  AccountProfileHero,
  AccountSectionCard,
  useAccountStyles,
} from "@/components/account/AccountUi";
import PhoneVerificationPanel from "@/components/profile/PhoneVerificationPanel";
import DateOfBirthPicker, {
  AndroidBirthDatePicker,
} from "@/components/profile/DateOfBirthPicker";
import KeyboardAwareScreen from "@/components/layout/KeyboardAwareScreen";
import ProfileHeader from "@/components/profile/ProfileHeader";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { rMS, rS, rV } from "@/styles/responsive";
import {
  formatBirthDateForApi,
  formatBirthDateForDisplay,
  getDefaultBirthDate,
  parseBirthDateInput,
} from "@/utils/dateOfBirth";
import { getKeyboardVerticalOffset } from "@/utils/keyboard";
import { pickCroppedImage } from "@/utils/imagePicker";
import {
  formatPhoneInput,
  isGhanaPhoneVerified,
  normalizeGhanaPhone,
  validateGhanaPhone,
} from "@/utils/phone";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GENDER_OPTIONS = ["Male", "Female"];

const CustomerProfile = () => {
  const insets = useSafeAreaInsets();
  const accountStyles = useAccountStyles();
  const { showToast } = useToast();
  const {
    isUpdatingProfile,
    isSendingPhoneVerificationCode,
    isVerifyingPhoneNumber,
    updateProfile,
    sendPhoneVerificationCode,
    verifyPhoneNumber,
    user,
  } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAndroidDatePicker, setShowAndroidDatePicker] = useState(false);
  const [draftDateOfBirth, setDraftDateOfBirth] = useState<Date>(getDefaultBirthDate(null));
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isPickingAvatar, setIsPickingAvatar] = useState(false);
  const [fullNameError, setFullNameError] = useState("");
  const [dateOfBirthError, setDateOfBirthError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [genderError, setGenderError] = useState("");
  const [cityError, setCityError] = useState("");
  const [regionError, setRegionError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [phoneVerifyError, setPhoneVerifyError] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    setFullName(user.full_name || "");
    setEmail(user.email || "");
    setDateOfBirth(parseBirthDateInput(user.date_of_birth));
    setPhoneNumber(user.phone_number || "");
    setGender(user.gender || "");
    setCity(user.city || "");
    setRegion(user.region || "");
    setAvatarUri(user.avatar_url || null);
    setPhoneCodeSent(false);
    setPhoneVerifyError("");
  }, [user]);

  const normalizedDraftPhone = useMemo(
    () => normalizeGhanaPhone(phoneNumber),
    [phoneNumber],
  );

  const isPhoneVerified = useMemo(
    () =>
      isGhanaPhoneVerified(
        phoneNumber,
        user?.phone_number,
        user?.phone_verified ?? false,
      ),
    [phoneNumber, user?.phone_number, user?.phone_verified],
  );

  const showPhoneVerification = Boolean(
    normalizedDraftPhone && !isPhoneVerified,
  );

  const profileCompletion = useMemo(() => {
    const fields = [
      fullName,
      isPhoneVerified ? phoneNumber : "",
      gender,
      city,
      region,
      dateOfBirth,
    ];
    const filled = fields.filter((value) => {
      if (value instanceof Date) {
        return true;
      }
      return String(value ?? "").trim().length > 0;
    }).length;
    return Math.round((filled / fields.length) * 100);
  }, [city, dateOfBirth, fullName, gender, isPhoneVerified, phoneNumber, region]);

  const clearGeneralError = () => {
    if (generalError) {
      setGeneralError("");
    }
  };

  const handleSave = async () => {
    let hasError = false;

    setFullNameError("");
    setDateOfBirthError("");
    setPhoneNumberError("");
    setGenderError("");
    setCityError("");
    setRegionError("");
    setGeneralError("");

    const trimmedFullName = fullName.trim();
    const trimmedPhoneNumber = phoneNumber.trim();
    const trimmedGender = gender.trim();
    const trimmedCity = city.trim();
    const trimmedRegion = region.trim();
    const formattedDateOfBirth = formatBirthDateForApi(dateOfBirth);

    if (!trimmedFullName) {
      setFullNameError("Enter your full name.");
      hasError = true;
    } else if (trimmedFullName.length < 2) {
      setFullNameError("Full name must be at least 2 characters.");
      hasError = true;
    }

    const phoneValidationMessage = trimmedPhoneNumber
      ? validateGhanaPhone(trimmedPhoneNumber)
      : null;

    if (phoneValidationMessage) {
      setPhoneNumberError(phoneValidationMessage);
      hasError = true;
    } else if (trimmedPhoneNumber && !isPhoneVerified) {
      setPhoneNumberError("Verify your phone number before saving.");
      hasError = true;
    }

    if (trimmedGender && trimmedGender.length < 2) {
      setGenderError("Select a valid gender.");
      hasError = true;
    }

    if (trimmedCity && trimmedCity.length < 2) {
      setCityError("City must be at least 2 characters.");
      hasError = true;
    }

    if (trimmedRegion && trimmedRegion.length < 2) {
      setRegionError("Region must be at least 2 characters.");
      hasError = true;
    }

    if (dateOfBirth && dateOfBirth > new Date()) {
      setDateOfBirthError("Choose a valid date of birth.");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    const result = await updateProfile({
      fullName: trimmedFullName,
      ...(trimmedPhoneNumber ? {} : { phoneNumber: "" }),
      dateOfBirth: formattedDateOfBirth,
      gender: trimmedGender,
      city: trimmedCity,
      region: trimmedRegion,
      avatarUrl: avatarUri || null,
    });

    if (result.success) {
      showToast("Profile updated successfully.");
      return;
    }

    setFullNameError(result.fieldErrors?.fullName || "");
    setPhoneNumberError(result.fieldErrors?.phoneNumber || "");
    setDateOfBirthError(result.fieldErrors?.dateOfBirth || "");
    setGenderError(result.fieldErrors?.gender || "");
    setCityError(result.fieldErrors?.city || "");
    setRegionError(result.fieldErrors?.region || "");
    setGeneralError(result.fieldErrors?.general || result.message || "");
  };

  const handlePickAvatar = async () => {
    setIsPickingAvatar(true);

    try {
      const result = await pickCroppedImage(undefined, 0.7);
      if (!result.granted) {
        showToast("Allow photo access to update your profile picture.");
        return;
      }
      if (result.canceled || !result.uri) {
        return;
      }
      const selectedUri = result.uri;
      setAvatarUri(selectedUri);

      const updateResult = await updateProfile({
        fullName: fullName.trim(),
        dateOfBirth: formatBirthDateForApi(dateOfBirth),
        gender: gender.trim(),
        city: city.trim(),
        region: region.trim(),
        avatarUrl: selectedUri,
      });

      if (updateResult.success) {
        showToast("Profile photo updated.");
        return;
      }

      setAvatarUri(user?.avatar_url || null);
      showToast(updateResult.message || "We couldn't update your profile photo.");
    } finally {
      setIsPickingAvatar(false);
    }
  };

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader title="My Profile" />

      <KeyboardAwareScreen
        keyboardVerticalOffset={getKeyboardVerticalOffset(insets.top)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={accountStyles.content}
        keyboardShouldPersistTaps="always"
      >
        <AccountProfileHero
          name={user?.full_name || fullName || "ODOS User"}
          email={user?.email || email || "No email on file"}
          onEditPhoto={() => void handlePickAvatar()}
          isEditingPhoto={isPickingAvatar}
          renderAvatar={(size) => (
            <UserAvatar avatarUrl={avatarUri} size={size} imageStyle={styles.avatar} />
          )}
        />

        <AccountInsightCard
          title="Profile completeness"
          subtitle="A complete profile helps checkout, delivery, and support move faster when you need help."
          stats={[
            { value: `${profileCompletion}%`, label: "Complete" },
            { value: city ? "Set" : "—", label: "City" },
            { value: phoneNumber ? "Set" : "—", label: "Phone" },
          ]}
        />

        <AccountSectionCard title="Basic details">
          <AccountFormField
            label="Full name"
            icon="person-outline"
            placeholder="Your full name"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              setFullNameError("");
              clearGeneralError();
            }}
            error={fullNameError}
            autoCapitalize="words"
          />
          <AccountFormField
            label="Email"
            icon="mail-outline"
            placeholder="Email address"
            value={email}
            editable={false}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <AccountPickerField
            label="Date of birth"
            value={formatBirthDateForDisplay(dateOfBirth)}
            placeholder="Select date of birth"
            icon="calendar-outline"
            error={dateOfBirthError}
            onPress={() => {
              setDraftDateOfBirth(getDefaultBirthDate(dateOfBirth));
              setDateOfBirthError("");
              clearGeneralError();
              if (Platform.OS === "android") {
                setShowAndroidDatePicker(true);
                return;
              }
              setShowDatePicker(true);
            }}
            onClear={() => setDateOfBirth(null)}
          />
          <View>
            <AccountFormField
              label="Phone number"
              icon="call-outline"
              placeholder="0541234567"
              value={phoneNumber}
              onChangeText={(text) => {
                const formatted = formatPhoneInput(text);
                setPhoneNumber(formatted);
                setPhoneNumberError("");
                setPhoneVerifyError("");
                setPhoneCodeSent(false);
                clearGeneralError();
              }}
              error={phoneNumberError}
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={10}
            />
            {isPhoneVerified ? (
              <View style={styles.phoneStatusRow}>
                <AccountBadge label="Verified" tone="success" />
              </View>
            ) : null}
            {showPhoneVerification && normalizedDraftPhone ? (
              <PhoneVerificationPanel
                phoneNumber={normalizedDraftPhone}
                codeSent={phoneCodeSent}
                isSendingCode={isSendingPhoneVerificationCode}
                isVerifying={isVerifyingPhoneNumber}
                error={phoneVerifyError}
                onDismissError={() => setPhoneVerifyError("")}
                onSendCode={async () => {
                  const validation = validateGhanaPhone(phoneNumber);
                  if (validation) {
                    setPhoneNumberError(validation);
                    return;
                  }

                  const result = await sendPhoneVerificationCode(normalizedDraftPhone);
                  if (!result.success) {
                    setPhoneVerifyError(
                      result.fieldErrors?.general ||
                        result.fieldErrors?.phoneNumber ||
                        "We couldn't send a code.",
                    );
                    return;
                  }

                  setPhoneCodeSent(true);
                  showToast(result.message || "Verification code sent.");
                }}
                onVerify={async (code) => {
                  const result = await verifyPhoneNumber(normalizedDraftPhone, code);
                  if (!result.success) {
                    setPhoneVerifyError(
                      result.fieldErrors?.general || "That code could not be verified.",
                    );
                    return;
                  }

                  setPhoneVerifyError("");
                  setPhoneNumberError("");
                  if (result.user?.phone_number) {
                    setPhoneNumber(result.user.phone_number);
                  }
                  showToast("Phone number verified.");
                }}
              />
            ) : null}
          </View>
          <AccountPickerField
            label="Gender"
            value={gender}
            placeholder="Select gender"
            icon="male-female-outline"
            error={genderError}
            onPress={() => {
              setShowGenderPicker(true);
              setGenderError("");
              clearGeneralError();
            }}
            onClear={() => setGender("")}
          />
        </AccountSectionCard>

        <AccountSectionCard title="Location">
          <AccountFormField
            label="City"
            icon="business-outline"
            placeholder="Your city"
            value={city}
            onChangeText={(text) => {
              setCity(text);
              setCityError("");
              clearGeneralError();
            }}
            error={cityError}
            autoCapitalize="words"
          />
          <AccountFormField
            label="Region / state"
            icon="map-outline"
            placeholder="Your region or state"
            value={region}
            onChangeText={(text) => {
              setRegion(text);
              setRegionError("");
              clearGeneralError();
            }}
            error={regionError}
            autoCapitalize="words"
          />
        </AccountSectionCard>

        {generalError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{generalError}</Text>
          </View>
        ) : null}

        <AccountActionButton
          label={isUpdatingProfile ? "Saving..." : "Save changes"}
          variant="primary"
          onPress={() => void handleSave()}
          disabled={isUpdatingProfile}
        />
      </KeyboardAwareScreen>

      <AccountChoiceSheet
        visible={showDatePicker}
        title="Date of birth"
        onClose={() => setShowDatePicker(false)}
        footer={
          <View style={styles.sheetFooter}>
            <AccountActionButton
              label="Cancel"
              variant="secondary"
              onPress={() => setShowDatePicker(false)}
            />
            <AccountActionButton
              label="Done"
              variant="primary"
              onPress={() => {
                setDateOfBirth(draftDateOfBirth);
                setShowDatePicker(false);
              }}
            />
          </View>
        }
      >
        <DateOfBirthPicker
          value={draftDateOfBirth}
          maximumDate={new Date()}
          onChange={setDraftDateOfBirth}
        />
      </AccountChoiceSheet>

      <AndroidBirthDatePicker
        visible={showAndroidDatePicker}
        value={draftDateOfBirth}
        maximumDate={new Date()}
        onDismiss={() => setShowAndroidDatePicker(false)}
        onChange={(selectedDate) => {
          setDateOfBirth(selectedDate);
          setDraftDateOfBirth(selectedDate);
          setDateOfBirthError("");
          clearGeneralError();
        }}
      />

      <AccountChoiceSheet
        visible={showGenderPicker}
        title="Gender"
        onClose={() => setShowGenderPicker(false)}
      >
        {GENDER_OPTIONS.map((option) => (
          <AccountChoiceOption
            key={option}
            label={option}
            selected={gender === option}
            onPress={() => {
              setGender(option);
              setShowGenderPicker(false);
            }}
          />
        ))}
      </AccountChoiceSheet>
    </View>
  );
};

export default CustomerProfile;

const styles = StyleSheet.create({
  avatar: {
    borderRadius: rMS(48),
  },
  errorBanner: {
    borderRadius: rMS(14),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: rS(14),
    paddingVertical: rV(12),
  },
  errorBannerText: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    color: "#B91C1C",
    lineHeight: rMS(18),
  },
  sheetFooter: {
    flexDirection: "row",
    gap: rS(10),
    marginTop: rV(12),
    marginBottom: rV(8),
  },
  phoneStatusRow: {
    flexDirection: "row",
    marginTop: -rV(8),
    marginBottom: rV(8),
    paddingLeft: rS(4),
  },
});
