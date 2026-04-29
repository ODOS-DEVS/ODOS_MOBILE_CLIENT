const catalogImageMap: Record<string, any> = {
  automotive: require("@/assets/images/automotive.png"),
  backpack1: require("@/assets/images/backpack1.png"),
  bag: require("@/assets/images/bag.png"),
  cosmetics: require("@/assets/images/cosmetics.png"),
  dress: require("@/assets/images/dress.png"),
  gents: require("@/assets/images/gents.png"),
  handbag: require("@/assets/images/handbag.png"),
  headset: require("@/assets/images/headset.png"),
  ladiesstore: require("@/assets/images/ladiesstore.png"),
  shoe5: require("@/assets/images/shoe5.png"),
  sports: require("@/assets/images/sports.png"),
};

export function resolveCatalogImage(imageKey?: string | null) {
  if (!imageKey) {
    return catalogImageMap.bag;
  }

  return catalogImageMap[imageKey] ?? catalogImageMap.bag;
}
