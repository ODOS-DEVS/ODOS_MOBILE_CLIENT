import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

interface Section {
  id: string;
  title: string;
  content: string[];
}

const LEGAL_SECTIONS: Section[] = [
  {
    id: "terms",
    title: "1. Terms of Service",
    content: [
      "By accessing and using this e-commerce platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.",
      "The materials and products on this platform are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim all other warranties including, without limitation, implied warranties of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.",
      "We reserve the right to modify these terms at any time. By continuing to use the platform after changes are posted, you agree to be bound by the revised terms.",
    ],
  },
  {
    id: "changes",
    title: "Changes to the Service and/or Terms",
    content: [
      "We reserve the right to modify, suspend, or discontinue any aspect of our service at any time without prior notice. This includes but is not limited to features, products, pricing, and availability. We are not liable to you or any third party for any modification, suspension, or discontinuance of the service.",
      "Price changes may occur at any time and will be reflected on the platform immediately. Products in your cart are not reserved at the displayed price until payment is completed. We reserve the right to limit quantities and refuse service to anyone at our discretion.",
      "Terms of Service updates will be posted on this page with the revision date. Material changes will be communicated through email or prominent notice on our platform. It is your responsibility to review these terms periodically for any updates or changes.",
    ],
  },
  {
    id: "privacy",
    title: "2. Privacy Policy",
    content: [
      "We collect personal information including but not limited to your name, email address, shipping address, payment information, and browsing behavior. This information is used to process orders, improve our services, and communicate with you about your purchases and account.",
      "Your payment information is processed securely through encrypted connections. We do not store complete credit card details on our servers. All payment processing is handled by certified third-party payment processors compliant with PCI-DSS standards.",
      "We may share your information with trusted third-party service providers who assist in operating our platform, conducting business, or servicing you. These parties are obligated to keep your information confidential and use it only for the purposes we specify.",
    ],
  },
  {
    id: "shipping",
    title: "3. Shipping and Returns",
    content: [
      "Standard shipping typically takes 5-7 business days from the date of order confirmation. Expedited shipping options are available at checkout. Shipping times are estimates and not guaranteed. We are not responsible for delays caused by customs, weather, or carrier issues.",
      "Items may be returned within 30 days of delivery in original condition with tags attached. Free returns are available for most items. Refunds will be processed to the original payment method within 7-10 business days after we receive your return.",
      "Sale items, final sale merchandise, and personalized products cannot be returned unless defective. If you receive a damaged or incorrect item, please contact our customer service within 48 hours of delivery with photos of the issue.",
    ],
  },
  {
    id: "intellectual",
    title: "4. Intellectual Property",
    content: [
      "All content on this platform including text, graphics, logos, images, product descriptions, and software is the property of our company or our content suppliers and is protected by international copyright laws. Unauthorized use of any materials may violate copyright, trademark, and other laws.",
      "You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit any content from our platform for commercial purposes without express written permission. This includes scraping product data or images for use on other platforms.",
      "Product names, brand names, and logos displayed on this platform are trademarks of their respective owners. Use of these trademarks does not imply endorsement or affiliation unless explicitly stated.",
    ],
  },
  {
    id: "accounts",
    title: "5. User Accounts",
    content: [
      "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account or any other breach of security.",
      "You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate and current. We reserve the right to suspend or terminate accounts that contain false or misleading information.",
      "Accounts found to be in violation of our terms, engaged in fraudulent activity, or abusing our services may be terminated without notice. We reserve the right to refuse service to anyone for any reason at any time.",
    ],
  },
];

export default function LegalPoliciesScreen() {
  const router = useRouter();

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="px-6 pt-4 pb-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleGoBack}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4"
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color="#3B82F6" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">
            Legal and Policies
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-10"
      >
        {LEGAL_SECTIONS.map((section, index) => (
          <View
            key={section.id}
            className={`bg-white px-6 py-6 ${index > 0 ? "mt-2" : ""}`}
          >
            <Text className="text-base font-bold text-gray-900 mb-4">
              {section.title}
            </Text>
            {section.content.map((paragraph, pIndex) => (
              <Text
                key={`${section.id}-${pIndex}`}
                className="text-sm text-gray-600 leading-6 mb-4"
              >
                {paragraph}
              </Text>
            ))}
          </View>
        ))}

        {/* Footer Info */}
        <View className="bg-white mt-2 px-6 py-8">
          <View className="items-center pt-4 border-t border-gray-200">
            <Text className="text-xs text-gray-500 mb-2 font-medium">
              Last updated: January 20, 2026
            </Text>
            <Text className="text-xs text-gray-500 text-center leading-5 mt-2">
              For questions about these terms, please contact us at
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-xs text-blue-600 font-medium mt-1">
                legal@relaxdrystyle.com
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
