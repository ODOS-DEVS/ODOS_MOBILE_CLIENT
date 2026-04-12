import TextInputField from "@/components/TextInputField";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function VendorRequestScreen() {
  const [form, setForm] = useState({
    businessName: "",
    contactPerson: "",
    email: "",
    phone: "",
    businessAddress: "",
    businessRegistration: "",
    taxId: "",
    website: "",
    yearsInBusiness: "",
    numberOfEmployees: "",
    businessType: "",
    productCategories: [] as string[],
    expectedSalesVolume: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankName: "",
    description: "",
    termsAccepted: false,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const requiredFields = [
      "businessName",
      "contactPerson",
      "email",
      "phone",
      "businessAddress",
      "businessRegistration",
      "businessType",
      "description",
    ];

    const missingFields = requiredFields.filter(
      (field) => !form[field as keyof typeof form],
    );

    if (missingFields.length > 0) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!form.termsAccepted) {
      Alert.alert("Error", "Please accept the terms and conditions");
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "Request Submitted",
        "Your vendor request has been submitted successfully. We'll review your application and get back to you within 3-5 business days.",
        [{ text: "OK" }],
      );
      // Reset form
      setForm({
        businessName: "",
        contactPerson: "",
        email: "",
        phone: "",
        businessAddress: "",
        businessRegistration: "",
        taxId: "",
        website: "",
        yearsInBusiness: "",
        numberOfEmployees: "",
        businessType: "",
        productCategories: [],
        expectedSalesVolume: "",
        bankAccountName: "",
        bankAccountNumber: "",
        bankName: "",
        description: "",
        termsAccepted: false,
      });
    }, 2000);
  };

  const businessTypes = [
    "Fashion & Clothing",
    "Electronics",
    "Home & Garden",
    "Beauty & Personal Care",
    "Sports & Outdoors",
    "Books & Media",
    "Food & Beverages",
    "Health & Wellness",
    "Automotive",
    "Other",
  ];

  const productCategories = [
    "Clothing",
    "Shoes",
    "Accessories",
    "Electronics",
    "Home Decor",
    "Kitchen",
    "Beauty",
    "Health",
    "Sports",
    "Books",
    "Food",
    "Beverages",
    "Automotive",
    "Tools",
    "Toys",
    "Baby Products",
    "Pet Supplies",
  ];

  const salesVolumes = [
    "Under $1,000",
    "$1,000 - $5,000",
    "$5,000 - $10,000",
    "$10,000 - $25,000",
    "$25,000 - $50,000",
    "Over $50,000",
  ];

  return (
    <View style={styles.container}>
      <ProfileHeader title="Request to be Vendor" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.content}>
          <Text style={styles.description}>
            Join our marketplace as a vendor and start selling your products to
            thousands of customers. Fill out the form below and we&apos;ll
            review your application.
          </Text>

          <View style={styles.form}>
            <TextInputField
              label="Business Name *"
              icon="business-outline"
              placeholder="Enter your business name"
              value={form.businessName}
              onChangeText={(text: string) =>
                setForm({ ...form, businessName: text })
              }
            />

            <TextInputField
              label="Contact Person Name *"
              icon="person-outline"
              placeholder="Enter contact person's full name"
              value={form.contactPerson}
              onChangeText={(text: string) =>
                setForm({ ...form, contactPerson: text })
              }
            />

            <TextInputField
              label="Email Address *"
              icon="mail-outline"
              placeholder="Enter your business email"
              value={form.email}
              onChangeText={(text: string) => setForm({ ...form, email: text })}
              keyboardType="email-address"
            />

            <TextInputField
              label="Phone Number *"
              icon="call-outline"
              placeholder="Enter your contact number"
              value={form.phone}
              onChangeText={(text: string) => setForm({ ...form, phone: text })}
              keyboardType="phone-pad"
            />

            <TextInputField
              label="Business Address *"
              icon="location-outline"
              placeholder="Enter your business address"
              value={form.businessAddress}
              onChangeText={(text: string) =>
                setForm({ ...form, businessAddress: text })
              }
            />

            <TextInputField
              label="Business Registration Number *"
              icon="document-text-outline"
              placeholder="Enter your business registration number"
              value={form.businessRegistration}
              onChangeText={(text: string) =>
                setForm({ ...form, businessRegistration: text })
              }
            />

            <TextInputField
              label="Tax ID"
              icon="card-outline"
              placeholder="Enter your tax identification number"
              value={form.taxId}
              onChangeText={(text: string) => setForm({ ...form, taxId: text })}
            />

            <TextInputField
              label="Website"
              icon="globe-outline"
              placeholder="Enter your website URL (optional)"
              value={form.website}
              onChangeText={(text: string) =>
                setForm({ ...form, website: text })
              }
              keyboardType="url"
            />

            <View style={styles.rowContainer}>
              <View style={styles.halfWidth}>
                <TextInputField
                  label="Years in Business"
                  icon="time-outline"
                  placeholder="e.g., 5"
                  value={form.yearsInBusiness}
                  onChangeText={(text: string) =>
                    setForm({ ...form, yearsInBusiness: text })
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfWidth}>
                <TextInputField
                  label="Number of Employees"
                  icon="people-outline"
                  placeholder="e.g., 10"
                  value={form.numberOfEmployees}
                  onChangeText={(text: string) =>
                    setForm({ ...form, numberOfEmployees: text })
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Business Type *</Text>
              <View style={styles.businessTypeContainer}>
                {businessTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.businessTypeButton,
                      form.businessType === type &&
                        styles.businessTypeButtonSelected,
                    ]}
                    onPress={() => setForm({ ...form, businessType: type })}
                  >
                    <Text
                      style={[
                        styles.businessTypeText,
                        form.businessType === type &&
                          styles.businessTypeTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>
                Product Categories (Select all that apply)
              </Text>
              <View style={styles.productCategoriesContainer}>
                {productCategories.map((category) => {
                  const isSelected = form.productCategories.includes(category);
                  return (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryButton,
                        isSelected && styles.categoryButtonSelected,
                      ]}
                      onPress={() => {
                        const newCategories = isSelected
                          ? form.productCategories.filter((c) => c !== category)
                          : [...form.productCategories, category];
                        setForm({ ...form, productCategories: newCategories });
                      }}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          isSelected && styles.categoryTextSelected,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Expected Monthly Sales Volume</Text>
              <View style={styles.salesVolumeContainer}>
                {salesVolumes.map((volume) => (
                  <TouchableOpacity
                    key={volume}
                    style={[
                      styles.volumeButton,
                      form.expectedSalesVolume === volume &&
                        styles.volumeButtonSelected,
                    ]}
                    onPress={() =>
                      setForm({ ...form, expectedSalesVolume: volume })
                    }
                  >
                    <Text
                      style={[
                        styles.volumeText,
                        form.expectedSalesVolume === volume &&
                          styles.volumeTextSelected,
                      ]}
                    >
                      {volume}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.sectionTitle}>Bank Account Information</Text>

            <TextInputField
              label="Account Holder Name"
              icon="person-outline"
              placeholder="Enter account holder name"
              value={form.bankAccountName}
              onChangeText={(text: string) =>
                setForm({ ...form, bankAccountName: text })
              }
            />

            <TextInputField
              label="Account Number"
              icon="card-outline"
              placeholder="Enter your bank account number"
              value={form.bankAccountNumber}
              onChangeText={(text: string) =>
                setForm({ ...form, bankAccountNumber: text })
              }
              keyboardType="numeric"
            />

            <TextInputField
              label="Bank Name"
              icon="business-outline"
              placeholder="Enter your bank name"
              value={form.bankName}
              onChangeText={(text: string) =>
                setForm({ ...form, bankName: text })
              }
            />

            <Text style={styles.sectionTitle}>Additional Information</Text>
            <View style={styles.textAreaContainer}>
              <Text style={styles.label}>Business Description *</Text>
              <View style={styles.textAreaWrapper}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Tell us about your business, products, and what makes you unique..."
                  value={form.description}
                  onChangeText={(text) =>
                    setForm({ ...form, description: text })
                  }
                  multiline
                  numberOfLines={4}
                  placeholderTextColor={AppColors.subtext[200]}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() =>
                setForm({ ...form, termsAccepted: !form.termsAccepted })
              }
            >
              <View
                style={[
                  styles.checkbox,
                  form.termsAccepted && styles.checkboxChecked,
                ]}
              >
                {form.termsAccepted && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
              <Text style={styles.checkboxText}>
                I agree to the{" "}
                <Text style={styles.linkText}>Terms and Conditions</Text> and{" "}
                <Text style={styles.linkText}>Vendor Agreement</Text>
              </Text>
            </TouchableOpacity>

            <PrimaryButton
              title={loading ? "Submitting..." : "Submit Request"}
              onPress={handleSubmit}
              className={loading ? "opacity-50" : ""}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    paddingHorizontal: rS(16),
    paddingTop: rV(20),
  },
  description: {
    fontSize: rMS(14),
    color: AppColors.subtext[100],
    lineHeight: rMS(20),
    marginBottom: rV(24),
    fontFamily: Fonts.text,
  },
  form: {
    gap: rV(16),
  },
  sectionTitle: {
    fontSize: rMS(16),
    color: AppColors.text,
    fontFamily: Fonts.textBold,
    marginTop: rV(24),
    marginBottom: rV(16),
  },
  rowContainer: {
    flexDirection: "row",
    gap: rS(12),
  },
  halfWidth: {
    flex: 1,
  },
  pickerContainer: {
    marginBottom: rV(16),
  },
  label: {
    fontSize: rMS(14),
    color: AppColors.text,
    fontFamily: Fonts.textBold,
    marginBottom: rV(8),
  },
  businessTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
  },
  businessTypeButton: {
    paddingHorizontal: rS(12),
    paddingVertical: rV(8),
    borderRadius: rMS(20),
    borderWidth: 1,
    borderColor: AppColors.secondary,
    backgroundColor: "white",
  },
  businessTypeButtonSelected: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  businessTypeText: {
    fontSize: rMS(12),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
  },
  businessTypeTextSelected: {
    color: "white",
    fontFamily: Fonts.textBold,
  },
  productCategoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
  },
  categoryButton: {
    paddingHorizontal: rS(10),
    paddingVertical: rV(6),
    borderRadius: rMS(16),
    borderWidth: 1,
    borderColor: AppColors.secondary,
    backgroundColor: "white",
  },
  categoryButtonSelected: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  categoryText: {
    fontSize: rMS(11),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
  },
  categoryTextSelected: {
    color: "white",
    fontFamily: Fonts.textBold,
  },
  salesVolumeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
  },
  volumeButton: {
    paddingHorizontal: rS(12),
    paddingVertical: rV(8),
    borderRadius: rMS(20),
    borderWidth: 1,
    borderColor: AppColors.secondary,
    backgroundColor: "white",
  },
  volumeButtonSelected: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  volumeText: {
    fontSize: rMS(12),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
  },
  volumeTextSelected: {
    color: "white",
    fontFamily: Fonts.textBold,
  },
  textAreaContainer: {
    marginBottom: rV(16),
  },
  textAreaWrapper: {
    borderWidth: 1,
    borderColor: AppColors.secondary,
    borderRadius: rMS(8),
    backgroundColor: "white",
    paddingHorizontal: rS(12),
    paddingVertical: rV(12),
  },
  textArea: {
    fontSize: rMS(14),
    color: AppColors.text,
    fontFamily: Fonts.text,
    minHeight: rV(80),
    textAlignVertical: "top",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: rV(24),
  },
  checkbox: {
    width: rS(20),
    height: rV(20),
    borderRadius: rMS(4),
    borderWidth: 2,
    borderColor: AppColors.secondary,
    marginRight: rS(12),
    marginTop: rV(2),
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  checkboxText: {
    flex: 1,
    fontSize: rMS(14),
    color: AppColors.subtext[100],
    lineHeight: rMS(20),
    fontFamily: Fonts.text,
  },
  linkText: {
    color: AppColors.primary,
    textDecorationLine: "underline",
  },
});
