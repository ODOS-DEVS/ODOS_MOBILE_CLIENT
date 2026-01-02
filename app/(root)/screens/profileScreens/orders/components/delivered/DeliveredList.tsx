import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

const mockOrders = [1, 2, 3, 4];

export default function DeliveredList({
  onSelectOrder,
}: {
  onSelectOrder: (order: any) => void;
}) {
  return (
    <View style={styles.container}>
      {mockOrders.map((_, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
          onPress={() =>
            onSelectOrder({
              id: index,
              name: "Karia backpack",
              price: 69,
            })
          }
          activeOpacity={0.7}
        >
          {/* Image Container */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: "https://via.placeholder.com/70" }}
              style={styles.image}
            />
          </View>

          {/* Info Section */}
          <View style={styles.info}>
            <Text style={styles.orderId}>Order #21342</Text>
            <Text style={styles.name}>Karia backpack</Text>
            <Text style={styles.sub}>Backpack, travel</Text>
          </View>

          {/* Right Section */}
          <View style={styles.right}>
            <View style={styles.statusBadge}>
              <Text style={styles.status}>Delivered</Text>
            </View>
            <Text style={styles.price}>$69</Text>
            <Text style={styles.arrow}>›</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },

  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: "#F8F9FA",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },

  orderId: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 4,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 3,
  },

  sub: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
  },

  right: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 70,
  },

  statusBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  status: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "700",
  },

  price: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
  },

  arrow: {
    fontSize: 28,
    color: "#D1D5DB",
    fontWeight: "300",
  },
});
