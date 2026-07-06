import { AppColors } from "@/constants/Colors";
import { rMS, rS, rV } from "@/styles/responsive";
import { Pressable, StyleSheet, View } from "react-native";

type CarouselDotsProps = {
  count: number;
  activeIndex: number;
  onSelectIndex?: (index: number) => void;
};

export function CarouselDots({ count, activeIndex, onSelectIndex }: CarouselDotsProps) {
  if (count <= 1) {
    return null;
  }

  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, index) => {
        const isActive = index === activeIndex;
        return (
          <Pressable
            key={index}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Show slide ${index + 1} of ${count}`}
            onPress={() => onSelectIndex?.(index)}
            style={[
              styles.dot,
              {
                width: rS(isActive ? 20 : 7),
                backgroundColor: isActive ? AppColors.text : "#CBD5E1",
                opacity: isActive ? 1 : 0.95,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(7),
    marginTop: rV(12),
    paddingBottom: rV(2),
  },
  dot: {
    height: rV(7),
    borderRadius: rMS(999),
  },
});
