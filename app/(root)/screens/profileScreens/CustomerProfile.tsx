import UserAvatar from "@/components/UserAvatar";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import TextInputField from "@/components/TextInputField";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PHONE_REGEX = /^[+0-9()\-\s]{7,30}$/;
const GENDER_OPTIONS = [
  "Male",
  "Female",
  "Non-binary",
  "Prefer not to say",
];

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
    return "Select date";
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

  const openDatePicker = () => {
    setDraftDateOfBirth(dateOfBirth || new Date(2000, 0, 1));
    setShowDatePicker(true);
    if (dateOfBirthError) {
      setDateOfBirthError("");
    }
    if (generalError) {
      setGeneralError("");
    }
  };

  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    if (!selectedDate) {
      return;
    }

    setDraftDateOfBirth(selectedDate);
  };

  const handleConfirmDate = () => {
    setDateOfBirth(draftDateOfBirth);
    setShowDatePicker(false);
  };

  const handlePickAvatar = async () => {
    setIsPickingAvatar(true);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast("Allow photo access to update your profile picture.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled || !result.assets.length) {
        return;
      }

      const selectedUri = result.assets[0].uri;
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
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={2}
    >
      <ProfileHeader title="Customer Profile" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.avatarContainer}>
          <UserAvatar avatarUrl={avatarUri} size={rS(96)} imageStyle={styles.avatar} />
          <TouchableOpacity
            style={styles.editAvatar}
            activeOpacity={0.8}
            onPress={handlePickAvatar}
            disabled={isPickingAvatar}
          >
            {isPickingAvatar ? (
              <ActivityIndicator size="small" color={AppColors.white} />
            ) : (
              <Ionicons name="camera-outline" size={18} color={AppColors.white} />
            )}
          </TouchableOpacity>
          <Text style={styles.name}>{user?.full_name || "ODOS User"}</Text>
          <Text style={styles.email}>{user?.email || "No email available"}</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionLabel}>Basic Details</Text>
          <TextInputField
            icon="person-outline"
            label="Name"
            placeholder="Enter your name"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (fullNameError) {
                setFullNameError("");
              }
              if (generalError) {
                setGeneralError("");
              }
            }}
            errorMessage={fullNameError}
            autoCapitalize="words"
          />
          <TextInputField
            icon="mail-outline"
            label="Email"
            placeholder="Enter your email"
            value={email}
            editable={false}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.dateFieldContainer}>
            <Text style={styles.dateFieldLabel}>Date of Birth</Text>
            <TouchableOpacity
              style={[
                styles.dateField,
                dateOfBirthError ? styles.dateFieldError : null,
              ]}
              activeOpacity={0.8}
              onPress={openDatePicker}
            >
              <View style={styles.dateFieldValueRow}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={AppColors.secondary}
                />
                <Text
                  style={[
                    styles.dateFieldValue,
                    !dateOfBirth ? styles.dateFieldPlaceholder : null,
                  ]}
                >
                  {formatDateForDisplay(dateOfBirth)}
                </Text>
              </View>
              <Ionicons
                name="chevron-down-outline"
                size={18}
                color={AppColors.secondary}
              />
            </TouchableOpacity>
            {dateOfBirth ? (
              <TouchableOpacity
                style={styles.clearDateButton}
                onPress={() => setDateOfBirth(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.clearDateButtonText}>Clear date</Text>
              </TouchableOpacity>
            ) : null}
            {dateOfBirthError ? (
              <Text style={styles.errorText}>{dateOfBirthError}</Text>
            ) : null}
          </View>
          <Modal
            visible={showDatePicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.datePickerModal}>
                <Text style={styles.datePickerModalTitle}>Select Date of Birth</Text>
                <DateTimePicker
                  value={draftDateOfBirth}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  maximumDate={new Date()}
                  onChange={handleDateChange}
                  style={styles.datePickerControl}
                />
                <View style={styles.datePickerActions}>
                  <TouchableOpacity
                    style={styles.datePickerSecondaryButton}
                    onPress={() => setShowDatePicker(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.datePickerSecondaryText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.datePickerPrimaryButton}
                    onPress={handleConfirmDate}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.datePickerPrimaryText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          <TextInputField
            icon="call-outline"
            label="Telephone"
            placeholder="+233 54 187 4005"
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              if (phoneNumberError) {
                setPhoneNumberError("");
              }
              if (generalError) {
                setGeneralError("");
              }
            }}
            errorMessage={phoneNumberError}
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.dateFieldContainer}>
            <Text style={styles.dateFieldLabel}>Gender</Text>
            <TouchableOpacity
              style={[
                styles.dateField,
                genderError ? styles.dateFieldError : null,
              ]}
              activeOpacity={0.8}
              onPress={() => {
                setShowGenderPicker(true);
                if (genderError) {
                  setGenderError("");
                }
                if (generalError) {
                  setGeneralError("");
                }
              }}
            >
              <View style={styles.dateFieldValueRow}>
                <Ionicons
                  name="male-female-outline"
                  size={18}
                  color={AppColors.secondary}
                />
                <Text
                  style={[
                    styles.dateFieldValue,
                    !gender ? styles.dateFieldPlaceholder : null,
                  ]}
                >
                  {gender || "Select gender"}
                </Text>
              </View>
              <Ionicons
                name="chevron-down-outline"
                size={18}
                color={AppColors.secondary}
              />
            </TouchableOpacity>
            {gender ? (
              <TouchableOpacity
                style={styles.clearDateButton}
                onPress={() => setGender("")}
                activeOpacity={0.8}
              >
                <Text style={styles.clearDateButtonText}>Clear selection</Text>
              </TouchableOpacity>
            ) : null}
            {genderError ? <Text style={styles.errorText}>{genderError}</Text> : null}
          </View>

          <Modal
            visible={showGenderPicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowGenderPicker(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.optionModal}>
                <Text style={styles.datePickerModalTitle}>Select Gender</Text>
                {GENDER_OPTIONS.map((option) => {
                  const isSelected = gender === option;

                  return (
                    <TouchableOpacity
                      key={option}
                      style={styles.optionRow}
                      activeOpacity={0.85}
                      onPress={() => {
                        setGender(option);
                        setShowGenderPicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          isSelected ? styles.optionTextSelected : null,
                        ]}
                      >
                        {option}
                      </Text>
                      {isSelected ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={AppColors.primary}
                        />
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  style={styles.datePickerSecondaryButton}
                  onPress={() => setShowGenderPicker(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.datePickerSecondaryText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Text style={[styles.sectionLabel, styles.sectionSpacing]}>Location</Text>
          <TextInputField
            icon="business-outline"
            label="City"
            placeholder="Enter your city"
            value={city}
            onChangeText={(text) => {
              setCity(text);
              if (cityError) {
                setCityError("");
              }
              if (generalError) {
                setGeneralError("");
              }
            }}
            errorMessage={cityError}
            autoCapitalize="words"
          />
          <TextInputField
            icon="map-outline"
            label="Region / State"
            placeholder="Enter your region or state"
            value={region}
            onChangeText={(text) => {
              setRegion(text);
              if (regionError) {
                setRegionError("");
              }
              if (generalError) {
                setGeneralError("");
              }
            }}
            errorMessage={regionError}
            autoCapitalize="words"
          />
        </View>

        {generalError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{generalError}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.saveBtn, isUpdatingProfile ? styles.saveBtnDisabled : null]}
          activeOpacity={0.85}
          onPress={handleSave}
          disabled={isUpdatingProfile}
        >
          <Text style={styles.saveBtnText}>
            {isUpdatingProfile ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CustomerProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: rS(16),
    paddingTop: rV(16),
    paddingBottom: rV(72),
  },
  avatarContainer: {
    alignItems: "center",
    borderRadius: rMS(16),
    paddingVertical: rV(18),
    marginBottom: rV(12),
  },
  avatar: {
    width: rMS(96),
    height: rMS(96),
    borderRadius: rMS(48),
  },
  editAvatar: {
    position: "absolute",
    top: rV(78),
    right: "36%",
    backgroundColor: AppColors.primary,
    width: rMS(34),
    height: rMS(34),
    borderRadius: rMS(17),
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    marginTop: rV(10),
    fontSize: rMS(17),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
  },
  email: {
    marginTop: rV(2),
    fontSize: rMS(13),
    color: AppColors.subtext[100],
    fontFamily: Fonts.text,
  },
  formCard: {
    borderRadius: rMS(16),
  },
  sectionLabel: {
    marginBottom: rV(10),
    fontSize: rMS(13),
    color: AppColors.secondary,
    fontFamily: Fonts.textBold,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  sectionSpacing: {
    marginTop: rV(8),
  },
  dateFieldContainer: {
    marginBottom: rV(16),
  },
  dateFieldLabel: {
    marginBottom: rV(6),
    paddingLeft: rS(8),
    fontFamily: Fonts.textBold,
    fontSize: rMS(13),
    color: AppColors.primary,
  },
  dateField: {
    minHeight: rV(54),
    borderRadius: rMS(22),
    borderWidth: 1,
    borderColor: "#D1D1D1",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: rS(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateFieldError: {
    borderColor: "#D64545",
  },
  dateFieldValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
  },
  dateFieldValue: {
    color: AppColors.text,
    fontFamily: Fonts.text,
    fontSize: rMS(14),
  },
  dateFieldPlaceholder: {
    color: AppColors.secondary,
  },
  clearDateButton: {
    alignSelf: "flex-end",
    paddingTop: rV(8),
    paddingRight: rS(6),
  },
  clearDateButtonText: {
    color: AppColors.primary,
    fontFamily: Fonts.textBold,
    fontSize: rMS(12),
  },
  datePickerWrap: {
    marginTop: rV(8),
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.28)",
    justifyContent: "center",
    paddingHorizontal: rS(18),
  },
  datePickerModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: rMS(22),
    paddingHorizontal: rS(16),
    paddingTop: rV(18),
    paddingBottom: rV(14),
  },
  optionModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: rMS(22),
    paddingHorizontal: rS(16),
    paddingTop: rV(18),
    paddingBottom: rV(14),
  },
  datePickerModalTitle: {
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
    marginBottom: rV(10),
    textAlign: "center",
  },
  optionRow: {
    minHeight: rV(48),
    borderRadius: rMS(14),
    paddingHorizontal: rS(14),
    marginBottom: rV(8),
    backgroundColor: "#F8FAFB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionText: {
    color: AppColors.text,
    fontFamily: Fonts.text,
    fontSize: rMS(14),
  },
  optionTextSelected: {
    fontFamily: Fonts.textBold,
  },
  datePickerControl: {
    alignSelf: "center",
  },
  datePickerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: rS(10),
    marginTop: rV(12),
  },
  datePickerSecondaryButton: {
    minWidth: rS(86),
    paddingHorizontal: rS(16),
    paddingVertical: rV(12),
    borderRadius: rMS(14),
    backgroundColor: "#F3F5F6",
    alignItems: "center",
  },
  datePickerPrimaryButton: {
    minWidth: rS(86),
    paddingHorizontal: rS(16),
    paddingVertical: rV(12),
    borderRadius: rMS(14),
    backgroundColor: AppColors.primary,
    alignItems: "center",
  },
  datePickerSecondaryText: {
    color: AppColors.text,
    fontFamily: Fonts.textBold,
    fontSize: rMS(13),
  },
  datePickerPrimaryText: {
    color: AppColors.white,
    fontFamily: Fonts.textBold,
    fontSize: rMS(13),
  },
  errorCard: {
    marginTop: rV(8),
    borderRadius: rMS(16),
    borderWidth: 1,
    borderColor: "#F2C7C7",
    backgroundColor: "#FDF1F1",
    paddingHorizontal: rS(14),
    paddingVertical: rV(12),
  },
  errorText: {
    color: "#B93838",
    fontSize: rMS(13),
    fontFamily: Fonts.text,
  },
  saveBtn: {
    marginTop: rV(18),
    borderRadius: rMS(50),
    backgroundColor: AppColors.primary,
    paddingVertical: rV(14),
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    fontSize: rMS(15),
    color: AppColors.white,
    fontFamily: Fonts.textBold,
  },
});
