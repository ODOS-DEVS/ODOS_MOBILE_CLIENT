import AddToCartBtn from "@/components/buttons/AddToCartBtn";
import AddToWishList from "@/components/buttons/AddToWishList";
import CollapsibleShippingCard from "@/components/cards/CollapsableCard";
import ProductCard from "@/components/cards/ProductCard";
import { AppColors } from "@/constants/Colors";
import { PopularProducts } from "@/constants/Data";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProductDetail() {
  const getParam = (param: string | string[] | undefined) =>
    Array.isArray(param) ? param[0] : param;

  const params = useLocalSearchParams();

  const id = String(getParam(params.id) ?? "");
  const title = getParam(params.title) ?? "";
  const category = getParam(params.category);
  const image = getParam(params.image);
  const price = Number(getParam(params.price) ?? 0);
  const oldPrice = Number(getParam(params.oldPrice) ?? 0);
  const rating = Number(getParam(params.rating) ?? 0);
  const reviews = getParam(params.reviews);
  const discount = getParam(params.discount);

  const handleBuyNow = () => {
    router.push({
      pathname: "/screens/Checkout" as any,
      params: { id, title, price, oldPrice, category },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={AppColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product</Text>
        <TouchableOpacity style={styles.headerAction} activeOpacity={0.7}>
          <AntDesign name="more" size={22} color={AppColors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image */}
        <View style={styles.imageWrap}>
          <Image
            source={image as any}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {title}
            </Text>
            <View style={styles.badges}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>In Stock</Text>
              </View>
              {discount ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{discount}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.metaRow}>
            {category ? (
              <Text style={styles.category}>{category}</Text>
            ) : null}
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#facc15" />
              <Text style={styles.ratingText}>{rating || "—"}</Text>
              {reviews != null && (
                <Text style={styles.reviewsText}>({reviews} reviews)</Text>
              )}
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₵{price}</Text>
            {oldPrice > 0 && (
              <Text style={styles.oldPrice}>₵{oldPrice}</Text>
            )}
          </View>
        </View>

        {/* Description, Shipping, Returns */}
        <View style={styles.sections}>
          <CollapsibleShippingCard
            title="Description"
            icon={
              <Ionicons name="information-outline" size={22} color={AppColors.subtext[100]} />
            }
            description={[
              "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
            ]}
            defaultExpanded={false}
          />
          <CollapsibleShippingCard
            title="Shipping"
            icon={<Ionicons name="arrow-up-right-box" size={18} color={AppColors.subtext[100]} />}
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
                deliveryTime: "Arrives in 1 business day",
                price: "GHC49",
              },
            ]}
            defaultExpanded={false}
          />
          <CollapsibleShippingCard
            title="Return Policy"
            icon={<Ionicons name="at-circle" size={18} color={AppColors.subtext[100]} />}
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

        {/* You may also like */}
        <Text style={styles.sectionHeading}>You may also like</Text>
        <FlatList
          data={PopularProducts}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard {...item} />}
          contentContainerStyle={styles.alsoLikeList}
        />

        {/* Bottom actions */}
        <View style={styles.actions}>
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
            activeIconColor="#fff"
            containerStyle={styles.iconBtn}
          />
          <TouchableOpacity
            style={styles.buyNowBtn}
            activeOpacity={0.85}
            onPress={handleBuyNow}
          >
            <Text style={styles.buyNowText}>Buy Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chatBtn} activeOpacity={0.85}>
            <Ionicons name="chatbubble-outline" size={20} color={AppColors.white} />
            <Text style={styles.chatBtnText}>Chat</Text>
          </TouchableOpacity>
          <AddToCartBtn
            item={{ id, title, category, price, image }}
            iconSize={22}
            containerStyle={styles.iconBtn}
            iconColor="#fff"
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rS(16),
    paddingTop: rV(38),
    paddingBottom: rV(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EEE",
  },
  backButton: {
    width: rMS(40),
    height: rMS(40),
    borderRadius: rMS(20),
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: rMS(18),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  headerAction: {
    width: rMS(40),
    height: rMS(40),
    borderRadius: rMS(20),
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: rV(24),
  },
  imageWrap: {
    width: "100%",
    height: rV(300),
    backgroundColor: "#F5F5F5",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  info: {
    paddingHorizontal: rS(16),
    paddingTop: rV(20),
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: rS(12),
  },
  productTitle: {
    flex: 1,
    fontSize: rMS(20),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  badges: {
    flexDirection: "row",
    gap: rS(8),
  },
  badge: {
    backgroundColor: AppColors.secondary,
    paddingHorizontal: rS(10),
    paddingVertical: rV(6),
    borderRadius: rMS(8),
  },
  badgeText: {
    fontSize: rMS(11),
    fontFamily: Fonts.textBold,
    color: AppColors.white,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: rV(10),
  },
  category: {
    fontSize: rMS(14),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    flex: 1,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: rMS(14),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
    marginLeft: rS(4),
  },
  reviewsText: {
    fontSize: rMS(13),
    fontFamily: Fonts.text,
    color: AppColors.subtext[100],
    marginLeft: rS(4),
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: rV(12),
  },
  price: {
    fontSize: rMS(22),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  oldPrice: {
    fontSize: rMS(18),
    fontFamily: Fonts.text,
    color: AppColors.subtext[100],
    marginLeft: rS(10),
    textDecorationLine: "line-through",
  },
  sections: {
    marginTop: rV(24),
    marginHorizontal: rS(16),
  },
  sectionHeading: {
    fontSize: rMS(17),
    fontFamily: Fonts.title,
    color: AppColors.text,
    marginTop: rV(24),
    marginHorizontal: rS(16),
    marginBottom: rV(12),
  },
  alsoLikeList: {
    paddingHorizontal: rS(16),
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: rV(24),
    marginHorizontal: rS(16),
    gap: rS(10),
  },
  iconBtn: {
    backgroundColor: AppColors.secondary,
    padding: rS(13),
    borderRadius: rMS(14),
  },
  buyNowBtn: {
    flex: 1,
    backgroundColor: AppColors.secondary,
    paddingVertical: rV(16),
    borderRadius: rMS(14),
    alignItems: "center",
    justifyContent: "center",
  },
  buyNowText: {
    fontSize: rMS(16),
    fontFamily: Fonts.textBold,
    color: AppColors.white,
  },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(6),
    paddingVertical: rV(16),
    paddingHorizontal: rS(16),
    borderRadius: rMS(14),
    backgroundColor: AppColors.secondary,
  },
  chatBtnText: {
    fontSize: rMS(14),
    fontFamily: Fonts.textBold,
    color: AppColors.white,
  },
  bottomSpacer: {
    height: rV(40),
  },
});
