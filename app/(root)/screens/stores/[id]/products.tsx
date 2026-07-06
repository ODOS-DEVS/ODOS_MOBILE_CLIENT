import StoreProductsBrowseScreen from "@/components/store/StoreProductsBrowseScreen";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function StoreProductsScreen() {
  const params = useLocalSearchParams();
  const storeId =
    typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const title =
    typeof params.title === "string"
      ? params.title
      : Array.isArray(params.title)
        ? params.title[0]
        : "Store";
  const image =
    typeof params.image === "string"
      ? params.image
      : Array.isArray(params.image)
        ? params.image[0]
        : undefined;
  const imageBanner =
    typeof params.imageBanner === "string"
      ? params.imageBanner
      : Array.isArray(params.imageBanner)
        ? params.imageBanner[0]
        : image;

  return (
    <StoreProductsBrowseScreen
      storeId={storeId}
      fallbackTitle={title}
      fallbackImage={image}
      fallbackImageBanner={imageBanner}
    />
  );
}
