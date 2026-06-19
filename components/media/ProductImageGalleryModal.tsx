import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rV } from "@/styles/responsive";
import { AntDesign } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ImageSourcePropType,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;
const DISMISS_THRESHOLD = 120;

type ProductImageGalleryModalProps = {
  visible: boolean;
  images: ImageSourcePropType[];
  activeIndex: number;
  title: string;
  priceLabel: string;
  horizontalPadding: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  onSharePress: () => void;
};

export default function ProductImageGalleryModal({
  visible,
  images,
  activeIndex,
  title,
  priceLabel,
  horizontalPadding,
  onClose,
  onIndexChange,
  onSharePress,
}: ProductImageGalleryModalProps) {
  const insets = useSafeAreaInsets();
  const galleryRef = useRef<FlatList<ImageSourcePropType>>(null);
  const translateY = useSharedValue(0);
  const backdropOpacity = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      translateY.value = 0;
      backdropOpacity.value = 1;
    }
  }, [backdropOpacity, translateY, visible]);

  const dismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  const panGesture = Gesture.Pan()
    .activeOffsetY(12)
    .failOffsetX([-24, 24])
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
        backdropOpacity.value = interpolate(event.translationY, [0, 280], [1, 0.35]);
      }
    })
    .onEnd((event) => {
      if (event.translationY > DISMISS_THRESHOLD || event.velocityY > 900) {
        translateY.value = withTiming(420, { duration: 180 }, () => {
          runOnJS(dismiss)();
        });
        backdropOpacity.value = withTiming(0, { duration: 180 });
        return;
      }

      translateY.value = withSpring(0, { damping: 20, stiffness: 240 });
      backdropOpacity.value = withSpring(1);
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: interpolate(translateY.value, [0, 280], [1, 0.72]),
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.backdrop, backdropStyle]} />
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.fullscreenModal, sheetStyle]}>
          <View
            style={[
              styles.fullscreenHeader,
              {
                paddingTop: Math.max(insets.top + rV(6), rV(28)),
                paddingHorizontal: horizontalPadding,
              },
            ]}
          >
            <View style={styles.dragHandleWrap}>
              <View style={styles.dragHandle} />
              <Text style={styles.dragHint}>Drag down to close</Text>
            </View>
            <View style={styles.headerActions}>
              <View style={styles.fullscreenCounter}>
                <Text style={styles.fullscreenCounterText}>
                  {activeIndex + 1}/{images.length}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.fullscreenHeaderButton}
                activeOpacity={0.8}
                onPress={onSharePress}
              >
                <AntDesign name="share-alt" size={rMS(18)} color={AppColors.white} />
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            ref={galleryRef}
            style={styles.galleryList}
            data={images}
            horizontal
            pagingEnabled
            initialScrollIndex={activeIndex}
            getItemLayout={(_, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => `gallery-${index}`}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              onIndexChange(index);
            }}
            renderItem={({ item }) => (
              <View style={styles.fullscreenImageSlide}>
                <Image source={item} style={styles.fullscreenImage} resizeMode="contain" />
              </View>
            )}
          />

          <View style={styles.fullscreenFooter}>
            <Text style={styles.fullscreenTitle} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.fullscreenPrice}>{priceLabel}</Text>
            {images.length > 1 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.fullscreenThumbs}
              >
                {images.map((item, index) => {
                  const active = index === activeIndex;
                  return (
                    <TouchableOpacity
                      key={`gallery-thumb-${index}`}
                      activeOpacity={0.82}
                      onPress={() => {
                        onIndexChange(index);
                        galleryRef.current?.scrollToIndex({ index, animated: true });
                      }}
                      style={[
                        styles.fullscreenThumbWrap,
                        active && styles.fullscreenThumbWrapActive,
                      ]}
                    >
                      <Image
                        source={item}
                        style={styles.fullscreenThumbImage}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : null}
          </View>
        </Animated.View>
      </GestureDetector>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#020617",
  },
  fullscreenModal: {
    flex: 1,
    backgroundColor: "#020617",
  },
  galleryList: {
    flex: 1,
  },
  fullscreenHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    gap: rV(8),
  },
  dragHandleWrap: {
    alignItems: "center",
    gap: rV(6),
  },
  dragHandle: {
    width: rMS(42),
    height: rV(4),
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  dragHint: {
    fontSize: rMS(11),
    color: "rgba(255,255,255,0.62)",
    fontFamily: Fonts.text,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fullscreenHeaderButton: {
    width: rMS(42),
    height: rMS(42),
    borderRadius: rMS(21),
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  fullscreenCounter: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  fullscreenCounterText: {
    color: AppColors.white,
    fontSize: rMS(12),
    fontFamily: Fonts.titleBold,
  },
  fullscreenImageSlide: {
    width: screenWidth,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fullscreenImage: {
    width: screenWidth,
    height: "72%",
  },
  fullscreenFooter: {
    paddingHorizontal: 18,
    paddingBottom: rV(24),
  },
  fullscreenTitle: {
    color: AppColors.white,
    fontSize: rMS(16),
    fontFamily: Fonts.titleBold,
  },
  fullscreenPrice: {
    marginTop: rV(4),
    color: "#F8FAFC",
    fontSize: rMS(18),
    fontFamily: Fonts.titleBold,
  },
  fullscreenThumbs: {
    gap: 10,
    paddingTop: rV(14),
  },
  fullscreenThumbWrap: {
    width: rMS(54),
    height: rMS(54),
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  fullscreenThumbWrapActive: {
    borderColor: AppColors.white,
  },
  fullscreenThumbImage: {
    width: "100%",
    height: "100%",
  },
});
