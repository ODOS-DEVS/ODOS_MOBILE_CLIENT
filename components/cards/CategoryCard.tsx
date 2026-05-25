import { CategoryBrowseCard } from "@/components/category/CategoryUi";
import React from "react";
import type { ImageSourcePropType } from "react-native";

interface CategoryCardProps {
  title: string;
  subtitle: string;
  image: ImageSourcePropType | null;
  subcategoryCount?: number;
  onPress?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = (props) => {
  return <CategoryBrowseCard {...props} />;
};

export default CategoryCard;
