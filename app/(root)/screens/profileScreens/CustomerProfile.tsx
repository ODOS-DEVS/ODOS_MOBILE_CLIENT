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
  accountStyles,
} from "@/components/account/AccountUi";
import DateTimePicker from "@react-native-community/datetimepicker";
import ProfileHeader from "@/components/profile/ProfileHeader";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { pickCroppedImage } from "@/utils/imagePicker";
import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PHONE_REGEX = /^[+0-9()\-\s]{7,30}$/;
const GENDER_OPTIONS = ["Male", "Female"];

function formatDateForInput(value?: string | null) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return null;
  }

  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateForDisplay(value: Date | null) {
  if (!value) {
    return "Select date of birth";
  }

  return value.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateForApi(value: Date | null) {
  if (!value) {
    return null;
  }

  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const CustomerProfile = () => {
  const { showToast } = useToast();
  const { isUpdatingProfile, updateProfile, user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [draftDateOfBirth, setDraftDateOfBirth] = useState<Date>(new Date(2000, 0, 1));
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

  useEffect(() => {
    if (!user) {
      return;
    }

    setFullName(user.full_name || "");
    setEmail(user.email || "");
    setDateOfBirth(formatDateForInput(user.date_of_birth));
    setPhoneNumber(user.phone_number || "");
    setGender(user.gender || "");
    setCity(user.city || "");
    setRegion(user.region || "");
    setAvatarUri(user.avatar_url || null);
  }, [user]);

  const profileCompletion = useMemo(() => {
    const fields = [fullName, phoneNumber, gender, city, region, dateOfBirth];
    const filled = fields.filter((value) => {
      if (value instanceof Date) {
        return true;
      }
      return String(value ?? "").trim().length > 0;
    }).length;
    return Math.round((filled / fields.length) * 100);
  }, [city, dateOfBirth, fullName, gender, phoneNumber, region]);

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
    const formattedDateOfBirth = formatDateForApi(dateOfBirth);

    if (!trimmedFullName) {
      setFullNameError("Enter your full name.");
      hasError = true;
    } else if (trimmedFullName.length < 2) {
      setFullNameError("Full name must be at least 2 characters.");
      hasError = true;
    }

    if (trimmedPhoneNumber && !PHONE_REGEX.test(trimmedPhoneNumber)) {
      setPhoneNumberError("Enter a valid phone number.");
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
      phoneNumber: trimmedPhoneNumber,
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
        phoneNumber: phoneNumber.trim(),
        dateOfBirth: formatDateForApi(dateOfBirth),
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
    <KeyboardAvoidingView
      style={accountStyles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={2}
    >
      <ProfileHeader title="My Profile" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={accountStyles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
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
            value={formatDateForDisplay(dateOfBirth)}
            placeholder="Select date of birth"
            icon="calendar-outline"
            error={dateOfBirthError}
            onPress={() => {
              setDraftDateOfBirth(dateOfBirth || new Date(2000, 0, 1));
              setShowDatePicker(true);
              setDateOfBirthError("");
              clearGeneralError();
            }}
            onClear={() => setDateOfBirth(null)}
          />
          <AccountFormField
            label="Phone number"
            icon="call-outline"
            placeholder="+233 54 187 4005"
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              setPhoneNumberError("");
              clearGeneralError();
            }}
            error={phoneNumberError}
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoCorrect={false}
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
      </ScrollView>

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
        <DateTimePicker
          value={draftDateOfBirth}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={new Date()}
          onChange={(_event, selectedDate) => {
            if (selectedDate) {
              setDraftDateOfBirth(selectedDate);
            }
          }}
          style={styles.datePicker}
        />
      </AccountChoiceSheet>

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
    </KeyboardAvoidingView>
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
  datePicker: {
    alignSelf: "center",
  },
});
