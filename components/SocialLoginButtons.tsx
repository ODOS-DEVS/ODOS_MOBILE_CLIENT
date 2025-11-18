import React from "react";
import { View, TouchableOpacity, Image } from "react-native";

const SocialLoginButtons = () => (
  <View className="flex-row">
    <TouchableOpacity className="bg-[#ECF1F6] rounded-full p-6 mx-3 shadow-sm">
      <Image
        source={require("@/assets/images/Icon - Google.png")}
        className="w-7 h-7"
        resizeMode="contain"
      />
    </TouchableOpacity>

    <TouchableOpacity className="bg-[#ECF1F6] rounded-full p-6 mx-3 shadow-sm">
      <Image
        source={require("@/assets/images/Icon - Apple.png")}
        className="w-7 h-7"
        resizeMode="contain"
      />
    </TouchableOpacity>

    <TouchableOpacity className="bg-[#ECF1F6] rounded-full p-6 mx-3 shadow-sm">
      <Image
        source={require("@/assets/images/Icon - Facebook.png")}
        className="w-7 h-7"
        resizeMode="contain"
      />
    </TouchableOpacity>
  </View>
);

export default SocialLoginButtons;
