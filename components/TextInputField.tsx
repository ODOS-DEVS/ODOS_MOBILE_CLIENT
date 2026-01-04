import Colors, { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface TextInputFieldProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
}

const TextInputField: React.FC<TextInputFieldProps> = ({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputWrapper}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={AppColors.secondary}
            style={styles.icon}
          />
        )}

        <TextInput
          placeholder={placeholder}
          placeholderTextColor={AppColors.secondary}
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
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

const styles = StyleSheet.create({
  container: {
    marginBottom: rV(16),
  },

  label: {
    marginBottom: rV(6),
    paddingLeft: rS(8),
    fontFamily: Fonts.textBold,
    fontSize: rMS(13),
    color: Colors.primary,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#D1D1D1",
    borderRadius: rMS(22),
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
  },

  icon: {
    marginRight: rS(8),
  },

  input: {
    flex: 1,
    fontFamily: Fonts.text,
    fontSize: rMS(14),
    color: AppColors.text,
  },
});
