import Colors from "@/constants/Colors";
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
              paddingTop: 80,
            }}
          >
            <View style={{ marginTop: 40 }}>
              <Image
                source={item.image}
                style={{
                  width: width * 95,
                  height: 500,
                  resizeMode: "contain",
                }}
              />
            </View>
            <View
              style={{
                position: "absolute",
                bottom: 60,
                backgroundColor: Colors.white,
                width: width * 0.8,
                borderRadius: 20,
                paddingVertical: 60,
                paddingHorizontal: 39,
                alignSelf: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  textAlign: "center",
                  marginBottom: 10,
                  position: "relative",
                  bottom: 30,
                }}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  color: Colors.secondary,
                  position: "relative",
                  bottom: 30,
                  textAlign: "center",
                  marginBottom: 10,
                }}
              >
                {item.text}
              </Text>

              
              <View style={{ flexDirection: "row", marginBottom: 20 }}>
                {slides.map((_, index) => (
                  <View
                    key={index}
                    style={{
                      height: 8,
                      width: index === currentIndex ? 18 : 8,
                      borderRadius: 4,
                      backgroundColor:
                        index === currentIndex ? "#66797F" : "#ddd",
                      marginHorizontal: 4,
                    }}
                  />
                ))}
              </View>

              <TouchableOpacity
                onPress={handleNext}
                style={{
                  backgroundColor: Colors.primary,
                  borderRadius: 20,
                  paddingVertical: 15,
                  paddingHorizontal: 30,
                }}
              >
                <Text style={{ color: "#ffffff", fontWeight: "600" }}>
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
