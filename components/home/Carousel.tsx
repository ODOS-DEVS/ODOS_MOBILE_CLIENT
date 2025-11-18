// src/components/Carousel.tsx
import { Slide } from "@/constants/CorouselData";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface CarouselProps {
  slides: Slide[];
  height?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const Carousel: React.FC<CarouselProps> = ({
  slides,
  height = 220,
  autoPlay = true,
  autoPlayInterval = 4000,
}) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatRef = useRef<FlatList<Slide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

 
  useEffect(() => {
    if (autoPlay) startAutoPlay();
    return stopAutoPlay;
  }, [currentIndex]);

  const startAutoPlay = () => {
    stopAutoPlay();
    timer.current = setInterval(() => {
      const nextIndex = (currentIndex + 1) % slides.length;
      flatRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, autoPlayInterval);
  };

  const stopAutoPlay = () => {
    if (timer.current) clearInterval(timer.current);
  };

  const onScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }: { item: Slide }) => (
    <View style={[styles.slide, { width, height }]}>
      <Image source={item.image} style={[styles.image, { width, height }]} />

      <View style={[styles.overlay, { height }]}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <Text style={styles.price}>{item.price}</Text>

        <TouchableOpacity style={styles.ctaBtn}>
          <Text style={styles.ctaText}>{item.cta}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View>
      <Animated.FlatList
        ref={flatRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={(_, i) => i.toString()}
        onMomentumScrollEnd={onScrollEnd}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      />


      <View style={styles.dotsContainer}>
        {slides.map((_, i) => {
          const opacity = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });
          return <Animated.View key={i} style={[styles.dot, { opacity }]} />;
        })}
      </View>
    </View>
  );
};

export default Carousel;

const styles = StyleSheet.create({
  slide: {
    borderRadius: 20,
    overflow: "hidden",
    padding: 5, 
  },
  image: {
    resizeMode: "cover",
  },
  overlay: {
    position: "absolute",
    left: 20,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  title: {
    color: "#0088CC",
    fontSize: 13,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 19,
    fontWeight: "bold",
    marginTop: 4,
  },
  price: {
    marginTop: 10,
    fontSize: 12,
    color: "#0088CC",
  },
  ctaBtn: {
    borderRadius: 50,
    paddingVertical: 9,
    marginTop: 10,
    paddingHorizontal: 12,
    backgroundColor: "#d9d9d9",
    alignSelf: "flex-start",
  },
  ctaText: {
    fontSize: 12,
    color: "black",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    flexDirection: "row",
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: "white",
    marginHorizontal: 4,
  },
});
