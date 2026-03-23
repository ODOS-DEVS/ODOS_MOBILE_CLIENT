import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const StoreMapScreen = () => {
  const { title } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-4 mb-4 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-black/10 rounded-full justify-center items-center"
          style={{
            shadowColor: "#0f172a",
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text
          className="flex-1 text-2xl font-montserrat-extraBold text-gray-900"
          numberOfLines={1}
        >
          {title || "Store"} location
        </Text>
      </View>

      <View>
        <ImageBackground
          source={require("@/assets/images/map.png")}
          className="w-full h-[360px]  overflow-hidden border border-gray-200"
          resizeMode="cover"
        >
          <View className="flex-1 justify-center items-center">
            <View className="w-10 h-10 bg-red-500 rounded-full items-center justify-center shadow-lg">
              <Ionicons name="location-sharp" size={22} color="#fff" />
            </View>
          </View>
        </ImageBackground>

        {/* Store card */}
        <View className="px-5">
          <View
            className="mt-5 bg-white rounded-2xl p-4 border border-gray-200"
            style={{
              shadowColor: "#0f172a",
              shadowOpacity: 0.06,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <Text className="text-base font-montserrat-extraBold text-gray-900 mb-3">
              Zara Store
            </Text>
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-gray-200 mr-3" />
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="font-montserrat-extraBold text-gray-900">
                    Zara Store
                  </Text>
                  <Ionicons
                    name="person-circle-outline"
                    size={14}
                    color="#10b981"
                    style={{ marginLeft: 6 }}
                  />
                </View>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="location-outline" size={14} color="#6b7280" />
                  <Text className="ml-1 text-xs font-montserrat-medium text-gray-600">
                    9 km
                  </Text>
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color="#6b7280"
                    style={{ marginLeft: 10 }}
                  />
                  <Text className="ml-1 text-xs font-montserrat-medium text-gray-600">
                    40 minutes
                  </Text>
                </View>
                <Text className="text-sm text-gray-700 font-montserrat-medium mt-2">
                  Dew Street 9, Kokoroko rd, GS-000-0000
                </Text>
              </View>
            </View>
          </View>

          {/* Store info card */}
          <View
            className="mt-4 bg-white rounded-2xl p-4 border border-gray-200"
            style={{
              shadowColor: "#0f172a",
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 3,
            }}
          >
            <Text className="text-base font-montserrat-extraBold text-gray-900 mb-3">
              Store info
            </Text>

            <View className="flex-row items-center mb-2">
              <Ionicons name="call-outline" size={16} color="#6b7280" />
              <Text className="ml-2 text-sm font-montserrat-medium text-gray-700">
                (+233) 54 187 4005
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="mail-outline" size={16} color="#6b7280" />
              <Text className="ml-2 text-sm font-montserrat-medium text-gray-700">
                admin@gmail.com
              </Text>
            </View>
            <View className="flex-row items-center mb-4">
              <Ionicons name="pin-outline" size={16} color="#6b7280" />
              <Text className="ml-2 text-sm font-montserrat-medium text-gray-700">
                Dansoman, Accra
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Ionicons name="logo-facebook" size={18} color="#4b5563" />
                <Ionicons name="logo-twitter" size={18} color="#4b5563" />
                <Ionicons name="logo-instagram" size={18} color="#4b5563" />
                <Ionicons name="logo-linkedin" size={18} color="#4b5563" />
              </View>
              <Ionicons name="send-outline" size={18} color="#4b5563" />
            </View>

            <Text className="text-xs text-gray-500 font-montserrat-medium mt-4">
              Store is registered with RC
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default StoreMapScreen;
