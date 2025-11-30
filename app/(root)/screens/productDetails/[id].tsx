import AddToWishList from "@/components/buttons/AddToWishList";
import { AppColors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BuyProductScreen = () => {
  const { title, image } = useLocalSearchParams();
  return (
    <ScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topSec}>
        <Image
          source={image as any}
          resizeMode="contain"
          className="w-full h-80 rounded-xl mt-28"
        />
      </View>
      <SafeAreaView className="absolute top-0 left-0 w-full px-4 py-3 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="rounded-full justify-center items-center"
        >
          <Ionicons name="chevron-back" size={22} color="#000" />
        </TouchableOpacity>

        <Text className="text-center text-primary text-2xl font-montserrat-extraBold">
          {title}
        </Text>

        <View>
          <AddToWishList />
        </View>
      </SafeAreaView>
      <View style={styles.bottomSec}></View>
    </ScrollView>
  );
};

export default BuyProductScreen;

const styles = StyleSheet.create({
  topSec: {
    flex: 1,
    backgroundColor: AppColors.tertiary,
  },
  bottomSec: {
    flex: 2,
    backgroundColor: AppColors.primary,
  },
});
