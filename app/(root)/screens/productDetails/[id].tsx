import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ProductDetailScreen() {
  const [selectedColor, setSelectedColor] = useState("brown");
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedWaist, setSelectedWaist] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const colors = [
    { id: "blue", bg: "#4F83CC", name: "Ocean Blue" },
    { id: "brown", bg: "#C46B3B", name: "Caramel" },
    { id: "green", bg: "#2F6B4F", name: "Forest" },
    { id: "black", bg: "#1F1F1F", name: "Midnight" },
  ];

  const sizes = ["XS", "S", "M", "L", "XL"];
  const waistOptions = [28, 30, 32, 34, 36, 38];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 pt-12 pb-4 flex-row justify-between items-center">
        <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
          <Text className="text-lg">←</Text>
        </TouchableOpacity>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => setIsFavorite(!isFavorite)}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <Text className={isFavorite ? "text-red-500" : "text-gray-700"}>
              {isFavorite ? "♥" : "♡"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
            <Text className="text-lg">⤴</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Image */}
      <View className="bg-white px-6 py-8">
        <View
          className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl p-8 items-center justify-center relative"
          style={{ aspectRatio: 1 }}
        >
          <View className="absolute top-4 left-4 bg-black px-3 py-1.5 rounded-full">
            <Text className="text-white text-xs font-semibold">
              New Arrival
            </Text>
          </View>
          <Image
            source={require("../../../../assets/images/wallet1.png")}
            className="w-64 h-64"
            resizeMode="contain"
          />
        </View>

        {/* Thumbnails */}
        {/* <View className="flex-row justify-between">
          {[1, 2, 3, 4].map((item) => (
            <TouchableOpacity
              key={item}
              className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-transparent"
              activeOpacity={0.7}
            />
          ))}
        </View> */}
      </View>

      {/* Product Info */}
      <View className="px-6 py-6 bg-white mt-2">
        {/* Rating */}
        <View className="flex-row items-center mb-3">
          <Text className="text-yellow-500 font-montserrat-bold mr-2">★★★★★</Text>
          <Text className="text-sm text-gray-500 font-montserrat-semiBold">(248 reviews)</Text>
        </View>

        {/* Title */}
        <Text className="text-3xl font-montserrat-extraBold mb-2">Relax Dry Stretch</Text>
        <Text className="text-gray-600 text-base font-montserrat-text leading-6 mb-6">
          Breathable everyday shorts designed for comfort and style. Perfect for
          active lifestyles.
        </Text>

        {/* Price */}
        <View className="flex-row items-center mb-8">
          <Text className="text-4xl font-bold mr-3">$69</Text>
          <Text className="text-xl text-gray-400 line-through mr-3">$89</Text>
          <View className="bg-green-100 px-3 py-1 rounded-full">
            <Text className="text-green-700 text-sm font-semibold">
              22% OFF
            </Text>
          </View>
        </View>

        {/* Color Selector */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm font-semibold text-gray-900">Color</Text>
            <Text className="text-sm text-gray-500">
              {colors.find((c) => c.id === selectedColor)?.name}
            </Text>
          </View>
          <View className="flex-row gap-3">
            {colors.map((color) => (
              <TouchableOpacity
                key={color.id}
                onPress={() => setSelectedColor(color.id)}
                className={`w-12 h-12 rounded-full items-center justify-center ${
                  selectedColor === color.id ? "border-2 border-black" : ""
                }`}
                style={selectedColor === color.id ? { padding: 3 } : {}}
              >
                <View
                  className="w-full h-full rounded-full"
                  style={{ backgroundColor: color.bg }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Size Selector */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm font-semibold text-gray-900">
              Fit Size
            </Text>
            <TouchableOpacity>
              <Text className="text-sm text-blue-600">Size Guide</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row gap-3">
            {sizes.map((size) => (
              <TouchableOpacity
                key={size}
                onPress={() => setSelectedSize(size)}
                className={`px-6 py-3 rounded-xl ${
                  selectedSize === size ? "bg-black" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    selectedSize === size ? "text-white" : "text-gray-700"
                  }`}
                >
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Waist Size */}
        <View className="bg-gray-50 rounded-2xl p-6 mb-8">
          <Text className="font-semibold text-gray-900 mb-2">
            Find Your Perfect Fit
          </Text>
          <Text className="text-sm text-gray-600 mb-4">
            Select your waist measurement for personalized sizing
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {waistOptions.map((waist) => (
              <TouchableOpacity
                key={waist}
                onPress={() => setSelectedWaist(waist as any)}
                className={`px-5 py-3 rounded-lg ${
                  selectedWaist === waist
                    ? "bg-black"
                    : "bg-white border border-gray-200"
                }`}
                style={{ minWidth: 100 }}
              >
                <Text
                  className={`text-sm font-medium text-center ${
                    selectedWaist === waist ? "text-white" : "text-gray-700"
                  }`}
                >
                  {waist}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedWaist && (
            <View className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <Text className="text-sm text-blue-900">
                ✓ Recommended:{" "}
                <Text className="font-semibold">{selectedSize}</Text> based on{" "}
                {selectedWaist} waist
              </Text>
            </View>
          )}
        </View>

        {/* Quantity */}
        <View className="mb-8">
          <Text className="text-sm font-semibold text-gray-900 mb-3">
            Quantity
          </Text>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center"
            >
              <Text className="text-xl font-semibold">−</Text>
            </TouchableOpacity>
            <Text className="text-xl font-semibold w-12 text-center">
              {quantity}
            </Text>
            <TouchableOpacity
              onPress={() => setQuantity(quantity + 1)}
              className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center"
            >
              <Text className="text-xl font-semibold">+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features */}
        <View className="flex-row justify-between py-6 border-t border-gray-200 mb-6">
          <View className="items-center flex-1">
            <Text className="text-2xl mb-1">🚚</Text>
            <Text className="text-xs text-gray-600 text-center">
              Free Shipping
            </Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-2xl mb-1">↩️</Text>
            <Text className="text-xs text-gray-600 text-center">
              Easy Returns
            </Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-2xl mb-1">✓</Text>
            <Text className="text-xs text-gray-600 text-center">
              2-Year Warranty
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-3 mb-6">
          <TouchableOpacity className="bg-black rounded-full py-4">
            <Text className="text-white text-center font-semibold text-lg">
              Add to Cart • ${(69 * quantity).toFixed(2)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="border-2 border-black rounded-full py-4">
            <Text className="text-black text-center font-semibold text-lg">
              Visit Store
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
