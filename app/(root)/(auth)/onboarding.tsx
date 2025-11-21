import Colors from "@/constants/Colors";
import { rMS, rS, rV } from "@/styles/responsive";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    image: require("@/assets/images/onboarding1.png"),
    title: "Find a quality bag that fits your needs",
    text: "Semper in cursus magna et eu varius nunc adipiscing. Elementum justo, laoreet id sem.",
  },
  {
    id: "2",
    image: require("@/assets/images/onboarding2.png"),
    title: "Find a quality bag that fits your needs",
    text: "Semper in cursus magna et eu varius nunc adipiscing. Elementum justo, laoreet id sem.",
  },
  {
    id: "3",
    image: require("@/assets/images/onboarding4.png"),
    title: "Find a quality bag that fits your needs",
    text: "Semper in cursus magna et eu varius nunc adipiscing. Elementum justo, laoreet id sem.",
  },
];

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace("./signin");
    }
  };

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.primary }}>
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        renderItem={({ item }) => (
          <View
            style={{
              width,
              alignItems: "center",
              justifyContent: "flex-start",
              paddingTop: rV(80),
            }}
          >
            {/* IMAGE */}
            <View style={{ marginTop: rV(40) }}>
              <Image
                source={item.image}
                style={{
                  width: width * 0.95,
                  height: rV(380),
                  resizeMode: "contain",
                }}
              />
            </View>

            {/* CARD */}
            <View
              style={{
                position: "absolute",
                bottom: rV(60),
                backgroundColor: Colors.white,
                width: width * 0.8,
                borderRadius: rS(20),
                paddingVertical: rV(40),
                paddingHorizontal: rS(30),
                alignSelf: "center",
                alignItems: "center",
              }}
            >
              {/* TITLE */}
              <Text
                style={{
                  fontSize: rMS(18),
                  fontWeight: "bold",
                  textAlign: "center",
                  marginBottom: rV(10),
                  position: "relative",
                  bottom: rV(25),
                }}
              >
                {item.title}
              </Text>

              {/* TEXT */}
              <Text
                style={{
                  color: Colors.secondary,
                  fontSize: rMS(14),
                  position: "relative",
                  bottom: rV(25),
                  textAlign: "center",
                  marginBottom: rV(10),
                }}
              >
                {item.text}
              </Text>

              {/* DOTS */}
              <View style={{ flexDirection: "row", marginBottom: rV(15) }}>
                {slides.map((_, index) => (
                  <View
                    key={index}
                    style={{
                      height: rS(8),
                      width: index === currentIndex ? rS(18) : rS(8),
                      borderRadius: rS(4),
                      backgroundColor:
                        index === currentIndex ? "#66797F" : "#ddd",
                      marginHorizontal: rS(4),
                    }}
                  />
                ))}
              </View>

              {/* BUTTON */}
              <TouchableOpacity
                onPress={handleNext}
                style={{
                  backgroundColor: Colors.primary,
                  borderRadius: rS(20),
                  paddingVertical: rV(12),
                  paddingHorizontal: rS(25),
                }}
              >
                <Text
                  style={{
                    color: "#ffffff",
                    fontWeight: "600",
                    fontSize: rMS(14),
                  }}
                >
                  {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
