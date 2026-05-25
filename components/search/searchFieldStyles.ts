import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { StyleSheet } from "react-native";

export const searchFieldStyles = StyleSheet.create({
  wrapper: {
    marginTop: rV(12),
    minHeight: rMS(46),
    borderRadius: rMS(999),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: rS(12),
    paddingVertical: rV(9),
    flexDirection: "row",
    alignItems: "center",
    gap: rS(10),
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  wrapperLarge: {
    minHeight: rMS(56),
    paddingHorizontal: rS(14),
    paddingVertical: rV(11),
    borderRadius: rMS(18),
    borderColor: "#DDE3EA",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  wrapperEmbedded: {
    marginTop: 0,
    width: "100%",
    alignSelf: "stretch",
    minHeight: rMS(46),
  },
  iconShell: {
    width: rS(36),
    height: rS(36),
    borderRadius: rS(18),
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  iconShellLarge: {
    width: rS(42),
    height: rS(42),
    borderRadius: rS(14),
    backgroundColor: "#EEF2F6",
  },
  input: {
    flex: 1,
    fontSize: rMS(13.5),
    color: AppColors.text,
    fontFamily: Fonts.text,
    paddingVertical: rV(4),
  },
  inputLarge: {
    fontSize: rMS(15),
    paddingVertical: rV(6),
  },
  placeholder: {
    flex: 1,
    fontSize: rMS(13.5),
    fontFamily: Fonts.text,
    color: "#9CA3AF",
  },
  placeholderLarge: {
    fontSize: rMS(15),
  },
  clearBtn: {
    padding: rS(2),
  },
});
