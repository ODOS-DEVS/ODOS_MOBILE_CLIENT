import UserAvatar from "@/components/UserAvatar";
import {
  AccountActionButton,
  AccountChoiceOption,
  AccountChoiceSheet,
  AccountFormField,
  AccountInsightCard,
  AccountPickerField,
  AccountProfileHero,
  AccountSectionCard,
  useAccountStyles,
} from "@/components/account/AccountUi";
import DateOfBirthPicker, {
  AndroidBirthDatePicker,
} from "@/components/profile/DateOfBirthPicker";
import EmailVerifiedBadge from "@/components/profile/EmailVerifiedBadge";
import PhoneVerificationField from "@/components/profile/PhoneVerificationField";
import KeyboardAwareScreen from "@/components/layout/KeyboardAwareScreen";
import ProfileHeader from "@/components/profile/ProfileHeader";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { usePhoneVerification } from "@/hooks/usePhoneVerification";
import { rMS, rS, rV } from "@/styles/responsive";
import {
  formatBirthDateForApi,
  formatBirthDateForDisplay,
  getDefaultBirthDate,
  parseBirthDateInput,
} from "@/utils/dateOfBirth";
import {
  buildFullName,
  parseFullName,
  validateNameParts,
} from "@/utils/fullName";
import {
  GHANA_REGIONS,
  getCitiesForRegion,
  matchGhanaRegion,
} from "@/utils/ghanaLocations";
import { pickCroppedImage } from "@/utils/imagePicker";
import { formatPhoneInput, validateGhanaPhone } from "@/utils/phone";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

const GENDER_OPTIONS = ["Male", "Female"];

const CustomerProfile = () => {
  const accountStyles = useAccountStyles();
  const { showToast } = useToast();
  const { isUpdatingProfile, updateProfile, user } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otherNames, setOtherNames] = useState("");
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
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isPickingAvatar, setIsPickingAvatar] = useState(false);
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [dateOfBirthError, setDateOfBirthError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [genderError, setGenderError] = useState("");
  const [cityError, setCityError] = useState("");
  const [regionError, setRegionError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const phoneVerification = usePhoneVerification(phoneNumber, {
    linkToProfile: true,
  });

  const displayName = useMemo(
    () => buildFullName({ firstName, lastName, otherNames }),
    [firstName, lastName, otherNames],
  );

  const cityOptions = useMemo(
    () => getCitiesForRegion(region, city),
    [region, city],
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    const parsedName = parseFullName(user.full_name || "");
    setFirstName(parsedName.firstName);
    setLastName(parsedName.lastName);
    setOtherNames(parsedName.otherNames);
    setEmail(user.email || "");
    setDateOfBirth(parseBirthDateInput(user.date_of_birth));
    setPhoneNumber(user.phone_number || "");
    setGender(user.gender || "");
    setCity(user.city || "");
    setRegion((matchGhanaRegion(user.region || "") ?? user.region) || "");
    setAvatarUri(user.avatar_url || null);
  }, [
    user?.id,
    user?.full_name,
    user?.email,
    user?.date_of_birth,
    user?.phone_number,
    user?.gender,
    user?.city,
    user?.region,
    user?.avatar_url,
  ]);

  const profileCompletion = useMemo(() => {
    const fields = [
      firstName,
      lastName,
      phoneVerification.isVerified ? phoneNumber : "",
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
  }, [
    city,
    dateOfBirth,
    firstName,
    gender,
    lastName,
    phoneNumber,
    phoneVerification.isVerified,
    region,
  ]);

  const clearGeneralError = () => {
    if (generalError) {
      setGeneralError("");
    }
  };

  const handleSave = async () => {
    let hasError = false;

    setFirstNameError("");
    setLastNameError("");
    setDateOfBirthError("");
    setPhoneNumberError("");
    setGenderError("");
    setCityError("");
    setRegionError("");
    setGeneralError("");

    const trimmedFullName = buildFullName({ firstName, lastName, otherNames });
    const trimmedPhoneNumber = phoneNumber.trim();
    const trimmedGender = gender.trim();
    const trimmedCity = city.trim();
    const trimmedRegion = region.trim();
    const formattedDateOfBirth = formatBirthDateForApi(dateOfBirth);
    const nameErrors = validateNameParts({ firstName, lastName });

    if (nameErrors) {
      if (nameErrors.firstName) setFirstNameError(nameErrors.firstName);
      if (nameErrors.lastName) setLastNameError(nameErrors.lastName);
      hasError = true;
    }

    const phoneValidationMessage = trimmedPhoneNumber
      ? validateGhanaPhone(trimmedPhoneNumber)
      : null;

    if (phoneValidationMessage) {
      setPhoneNumberError(phoneValidationMessage);
      hasError = true;
    } else if (trimmedPhoneNumber && !phoneVerification.isVerified) {
      setPhoneNumberError("Verify your phone number before saving.");
      hasError = true;
    }

    if (trimmedGender && trimmedGender.length < 2) {
      setGenderError("Select a valid gender.");
      hasError = true;
    }

    if (!trimmedRegion) {
      setRegionError("Select your region.");
      hasError = true;
    }

    if (!trimmedCity) {
      setCityError("Select your town or city.");
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

    setFirstNameError(result.fieldErrors?.fullName || "");
    setLastNameError(result.fieldErrors?.fullName || "");
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
        fullName: displayName,
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={accountStyles.content}
        keyboardShouldPersistTaps="always"
      >
        <AccountProfileHero
          name={user?.full_name || displayName || "ODOS User"}
          email={user?.email || email || "No email on file"}
          onEditPhoto={() => void handlePickAvatar()}
          isEditingPhoto={isPickingAvatar}
          renderAvatar={(size) => (
            <UserAvatar
              avatarUrl={avatarUri}
              gender={gender || user?.gender}
              size={size}
              bordered
            />
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
            label="First name"
            icon="person-outline"
            placeholder="First name"
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              setFirstNameError("");
              clearGeneralError();
            }}
            error={firstNameError}
            autoCapitalize="words"
          />
          <AccountFormField
            label="Last name"
            icon="person-outline"
            placeholder="Last name"
            value={lastName}
            onChangeText={(text) => {
              setLastName(text);
              setLastNameError("");
              clearGeneralError();
            }}
            error={lastNameError}
            autoCapitalize="words"
          />
          <AccountFormField
            label="Other names (optional)"
            icon="person-outline"
            placeholder="Middle or other names"
            value={otherNames}
            onChangeText={(text) => {
              setOtherNames(text);
              clearGeneralError();
            }}
            autoCapitalize="words"
          />
          <View>
            <AccountFormField
              label="Email"
              icon="mail-outline"
              placeholder="Email address"
              value={email}
              editable={false}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {user?.is_verified ? <EmailVerifiedBadge email={email} /> : null}
          </View>
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
          <PhoneVerificationField
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(formatPhoneInput(text));
              setPhoneNumberError("");
              clearGeneralError();
            }}
            fieldError={phoneNumberError}
            verification={phoneVerification}
            verifiedTitle="Verified"
            onSendCode={async () => {
              const validation = validateGhanaPhone(phoneNumber);
              if (validation) {
                setPhoneNumberError(validation);
                return;
              }

              const result = await phoneVerification.handleSendCode();
              if (result.success) {
                showToast(result.message || "Verification code sent.");
              }
            }}
            onVerify={async (code) => {
              const result = await phoneVerification.handleVerify(code);
              if (!result.success) {
                return;
              }

              setPhoneNumberError("");
              if (result.user?.phone_number) {
                setPhoneNumber(result.user.phone_number);
              }
              showToast("Phone number verified.");
            }}
          />
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
          <AccountPickerField
            label="Region"
            value={region}
            placeholder="Select your region"
            icon="map-outline"
            error={regionError}
            onPress={() => {
              setShowRegionPicker(true);
              setRegionError("");
              clearGeneralError();
            }}
            onClear={() => {
              setRegion("");
              setCity("");
            }}
          />
          <AccountPickerField
            label="Town / city"
            value={city}
            placeholder={region ? "Select your town or city" : "Select a region first"}
            icon="business-outline"
            error={cityError}
            onPress={() => {
              if (!region.trim()) {
                setRegionError("Select your region first.");
                return;
              }
              setShowCityPicker(true);
              setCityError("");
              clearGeneralError();
            }}
            onClear={() => setCity("")}
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

      <AccountChoiceSheet
        visible={showRegionPicker}
        title="Select region"
        onClose={() => setShowRegionPicker(false)}
      >
        {GHANA_REGIONS.map((option) => (
          <AccountChoiceOption
            key={option}
            label={option}
            selected={region === option}
            onPress={() => {
              if (region !== option) {
                setCity("");
              }
              setRegion(option);
              setShowRegionPicker(false);
            }}
          />
        ))}
      </AccountChoiceSheet>

      <AccountChoiceSheet
        visible={showCityPicker}
        title={`Towns in ${region}`}
        onClose={() => setShowCityPicker(false)}
      >
        {cityOptions.map((option) => (
          <AccountChoiceOption
            key={option}
            label={option}
            selected={city === option}
            onPress={() => {
              setCity(option);
              setShowCityPicker(false);
            }}
          />
        ))}
      </AccountChoiceSheet>
    </View>
  );
};

export default CustomerProfile;

const styles = StyleSheet.create({
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
});
