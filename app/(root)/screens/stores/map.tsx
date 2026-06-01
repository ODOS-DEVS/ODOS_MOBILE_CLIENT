import { StoreMapSkeleton } from "@/components/loaders/CommerceSkeletons";
import StoreLocationExperience from "@/components/store/StoreLocationExperience";
import { useStore } from "@/hooks/useCommerce";
import { goBackOr } from "@/utils/navigation";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const StoreMapScreen = () => {
  const params = useLocalSearchParams();
  const storeId = getParam(params.storeId);
  const { store, isLoading } = useStore({ storeId });

  if (isLoading && !store) {
    return <StoreMapSkeleton />;
  }

  return (
    <StoreLocationExperience
      store={store}
      fallbackTitle={getParam(params.title) || "Store location"}
      onBack={() =>
        goBackOr(router, { fallback: "/(root)/screens/stores/stores" as any })
      }
    />
  );
};

export default StoreMapScreen;
