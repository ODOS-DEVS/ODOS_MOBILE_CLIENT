import React from "react";
import { ActivityIndicator, Image, TouchableOpacity, View } from "react-native";

type SocialLoginButtonsProps = {
  onGooglePress?: () => void | Promise<void>;
  googleLoading?: boolean;
};

const SocialLoginButtons = ({
  onGooglePress,
  googleLoading = false,
}: SocialLoginButtonsProps) => (
  <View className="flex-row">
    <TouchableOpacity
      className="bg-[#ECF1F6] rounded-full p-6 mx-3 shadow-sm"
      onPress={onGooglePress}
      disabled={!onGooglePress || googleLoading}
      style={{
        opacity: !onGooglePress || googleLoading ? 0.7 : 1,
      }}
    >
      {googleLoading ? (
        <ActivityIndicator size="small" color="#2F80ED" />
      ) : (
        <Image
          source={require("@/assets/images/Icon - Google.png")}
          className="w-7 h-7"
          resizeMode="contain"
        />
      )}
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
