import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ------------------
// Types
// ------------------
type VoucherStatus = "open" | "used" | "expired";

interface Voucher {
  id: string;
  title: string;
  amount: string;
  expiry: string;
  code?: string;
  status: VoucherStatus;
}

// ------------------
// Mock Data
// ------------------
const vouchers: Voucher[] = [
  {
    id: "1",
    title: "Zara Voucher",
    amount: "GHC 100",
    expiry: "Until 31 Dec, 2025",
    code: "VXASDUA01",
    status: "open",
  },
  {
    id: "2",
    title: "Zara Voucher",
    amount: "GHC 200",
    expiry: "Until 31 Dec, 2025",
    code: "VXASDUA01",
    status: "used",
  },
  {
    id: "3",
    title: "Zara Voucher",
    amount: "GHC 200",
    expiry: "Until 31 Dec, 2025",
    code: "VXASDUA01",
    status: "expired",
  },
  {
    id: "4",
    title: "Redeem Code",
    amount: "10% Cashback",
    expiry: "Until 31 Jul, 2022",
    status: "open",
  },
];

// ------------------
// Helpers
// ------------------
const statusStyles = {
  open: "bg-green-100 text-green-700",
  used: "bg-gray-200 text-gray-600",
  expired: "bg-red-100 text-red-600",
};

// ------------------
// Component
// ------------------
export default function VouchersScreen() {
  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-14 pb-4 bg-white">
        <TouchableOpacity className="mr-3">
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Vouchers</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {vouchers.map((voucher) => (
          <View
            key={voucher.id}
            className="bg-white rounded-2xl mb-4 shadow-sm overflow-hidden"
          >
            {/* Image Placeholder */}
            <View className="h-28 bg-teal-600" />

            {/* Content */}
            <View className="p-4">
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text className="text-base font-semibold">
                    {voucher.title}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1">
                    {voucher.amount}
                  </Text>
                </View>

                <View
                  className={`px-3 py-1 rounded-full ${statusStyles[voucher.status]}`}
                >
                  <Text className="text-xs font-medium capitalize">
                    {voucher.status}
                  </Text>
                </View>
              </View>

              {/* Expiry */}
              <View className="flex-row items-center mb-3">
                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                <Text className="text-xs text-gray-500 ml-2">
                  {voucher.expiry}
                </Text>
              </View>

              {/* Code */}
              {voucher.code && (
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-xs text-gray-500">
                    Voucher Code
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-xs font-medium mr-2">
                      {voucher.code}
                    </Text>
                    <Ionicons
                      name="copy-outline"
                      size={14}
                      color="#111"
                    />
                  </View>
                </View>
              )}

              {/* Action */}
              {voucher.status === "open" && (
                <TouchableOpacity className="bg-black rounded-full py-3 mt-2">
                  <Text className="text-center text-white font-semibold">
                    {voucher.title === "Redeem Code"
                      ? "Claim"
                      : "Use Voucher"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
