import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardTypeOptions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface TextInputFieldProps {
  label: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
}

const TextInputField: React.FC<TextInputFieldProps> = ({
  label,
  placeholder,
  keyboardType,
  secureTextEntry = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={{ marginVertical: rV(10) }}>
      <Text
        style={{
          marginBottom: rV(5),
          paddingLeft: rS(10),
          paddingBottom: rV(5),
          fontFamily: Fonts.textBold,
          color: Colors.primary,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
          borderWidth: 0.5,
          borderColor: "#696969",
          borderRadius: rMS(22),
          paddingHorizontal: rS(12),
          paddingVertical: rV(15),
        }}
      >
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={"#696969"}
          style={{ flex: 1, fontFamily: Fonts.textBold }}
          secureTextEntry={secureTextEntry && !isVisible}
          keyboardType={keyboardType}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setIsVisible(!isVisible)}>
            <Ionicons
              name={isVisible ? "eye" : "eye-off"}
              size={20}
              color={Colors.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default TextInputField;
