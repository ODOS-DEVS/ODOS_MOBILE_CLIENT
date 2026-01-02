import AddToCartBtn from "@/components/buttons/AddToCartBtn";
import AddToWishList from "@/components/buttons/AddToWishList";
import CollapsibleShippingCard from "@/components/cards/CollapsableCard";
import ProductCard from "@/components/cards/ProductCard";
import { AppColors } from "@/constants/Colors";
import { PopularProducts } from "@/constants/Data";
import { rS } from "@/styles/responsive";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProductDetail() {
  const getParam = (param: string | string[] | undefined) =>
    Array.isArray(param) ? param[0] : param;

  const params = useLocalSearchParams();

  const id = getParam(params.id) ?? "";
  const title = getParam(params.title) ?? "";
  const category = getParam(params.category);
  const image = getParam(params.image);
  const price = Number(getParam(params.price) ?? 0);
  const oldPrice = Number(getParam(params.oldPrice) ?? 0);
  const rating = Number(getParam(params.rating) ?? 0);
  const reviews = getParam(params.reviews);
  const discount = getParam(params.discount);

  return (
    <ScrollView className="flex-1 bg-white py-12">
      <View className="flex-row items-center justify-center mb-3 mt-4 px-4">
        {/* Back Icon */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-6"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>

        {/* Centered Title */}
        <Text className="text-lg font-montserrat-extraBold text-center">
          Detailed Product
        </Text>

        <TouchableOpacity className="relative right-[-100]" activeOpacity={0.7}>
          <AntDesign name="more" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View className="">
        {/* Image */}
        <View className="flex-row justify-center mt-3">
          <Image
            source={image as any}
            className="w-full h-[300px] rounded-sm"
            resizeMode="cover"
          />
        </View>

        <View className="mt-6 px-4">
          <View className="flex-row items-center mt-3 justify-between">
            <Text className="text-xl font-montserrat-extraBold">{title}</Text>
            <View className="flex-row">
              <Text className="ml-2 text-xs bg-secondary text-white px-2 py-2 rounded-md">
                In Stock
              </Text>
              {discount && (
                <Text className="ml-2 text-xs bg-secondary text-white px-2 py-2 rounded-md">
                  {discount}
                </Text>
              )}
            </View>
          </View>

          <View className="flex-row justify-between py-2">
            {category && (
              <Text className="text-md py-1 text-text font-montserrat">
                {category}
              </Text>
            )}

            <View className="flex-row">
              <Ionicons name="star" size={14} color="#facc15" />
              <Text className="ml-1 text-md text-text">{rating}</Text>
              {reviews && (
                <Text className="ml-1 text-md font-montserrat-semiBold text-text">
                  ({reviews} reviews)
                </Text>
              )}
            </View>
          </View>

          <View className="flex-row justify-between items-center mt-2">
            <View className="flex-row">
              <Text className="text-xl font-montserrat-semiBold text-subtext-200">
                ₵{price}
              </Text>
              {oldPrice && (
                <Text className="ml-2 text-xl font-montserrat-semiBold text-red-500 line-through">
                  ₵{oldPrice}
                </Text>
              )}
            </View>

            {/* Wrapper to scale the wishlist icon */}
            <View
              style={{ transform: [{ scale: 1.5 }] }}
              className="px-8"
            ></View>
          </View>
        </View>

        <View className="mt-8 mx-4">
          <CollapsibleShippingCard
            title="Description"
            icon={
              <Ionicons name="information-outline" size={22} color={"grey"} />
            }
            description={[
              "Lorem Ipsum is simply dummy text of the printing and typesetting industry",
            ]}
            defaultExpanded={false}
          />
          <CollapsibleShippingCard
            title="Shipping"
            icon={<Ionicons name="arrow-up-right-box" size={18} />}
            description={["Choose your preferred delivery method."]}
            shippingOptions={[
              {
                type: "Economy",
                deliveryTime: "Arrives in 7-10 business days",
                price: "GHC19",
              },
              {
                type: "Regular",
                deliveryTime: "Arrives in 4-5 business days",
                price: "GHC29",
              },
              {
                type: "One day",
                deliveryTime: "Arrives in 1 business days",
                price: "GHC49",
              },
            ]}
            defaultExpanded={false}
          />
          <CollapsibleShippingCard
            title="Return Policy"
            icon={<Ionicons name="at-circle" size={18} />}
            description={[
              "We accept returns of products purchased in online stores by following our Returns Policy below:\n",
              "1. Return within 30 days from the date of ordered through online store.\n",
              "2. Products through online purchases can only be returned to the UNIQLO warehouse for getting refund by returned product in new and original, unused, and still has the price tag and invoice attached.\n",
              "3. The amount refunded is based on the amount you have paid even if the discount has ended with the promotion.\n",
              "4. Products can be exchanged/refunded if there is a factory error.\n",
              "5. The following products cannot be exchanged/refunded for hygiene reasons: Socks, innerwear, camisole, baby products, shoes, AIRism accessories (such as masks, bed sheets, pillowcases, etc.) and other accessories unless the product was originally purchased damaged or defective product.",
            ]}
          />
        </View>

        <View className="flex-row justify-between mx-6 mt-8 ">
          <Text className="text-lg font-montserrat-semiBold ">
            You may also like
          </Text>
        </View>
        <FlatList
          data={PopularProducts}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard {...item} />}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />

        {/* Buttons */}
        <View className="flex-row items-center mt-10 mb-16 px-2 gap-2">
          <View>
            <AddToWishList
              product={{
                id,
                image,
                title,
                category,
                price,
                oldPrice,
                rating,
                reviews,
              }}
              size={19}
              iconColor="#fff"
              activeIconColor="#ff4d4d"
              containerStyle={{
                backgroundColor: AppColors.secondary,
                padding: rS(13),
              }}
            />
          </View>
          {/* Buy Now */}
          <TouchableOpacity
            className="flex-1 bg-secondary py-4 rounded-2xl"
            activeOpacity={0.8}
            onPress={() => {
              router.push({
                pathname: "./productDetails/[id]" as any,
                params: {
                  image,
                  price,
                  title,
                },
              });
            }}
          >
            <Text className="text-accent text-center font-montserrat-extraBold">
              Buy Now
            </Text>
          </TouchableOpacity>

          {/* Chat Vendor */}
          <TouchableOpacity
            className="flex-1 bg-secondary py-4 rounded-2xl ml-3"
            activeOpacity={0.8}
          >
            <Text className="text-accent text-center font-montserrat-extraBold">
              Chat Vendor
            </Text>
          </TouchableOpacity>
          <View>
            <AddToCartBtn
              item={{
                id,
                title,
                category,
                price,
                image,
              }}
              iconSize={22}
              containerStyle={{
                padding: rS(13),
                backgroundColor: AppColors.secondary,
              }}
              iconColor="#fff"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
