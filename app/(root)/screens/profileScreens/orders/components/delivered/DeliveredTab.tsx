import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export default function DeliveredDetails({
  order,
  onBack,
}: {
  order?: any;
  onBack?: () => void;
}) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Product Card */}
      <View style={styles.productCard}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: "https://via.placeholder.com/70" }}
            style={styles.image}
          />
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.orderId}>Order #21342</Text>
          <Text style={styles.name}>Karia backpack</Text>
          <Text style={styles.sub}>Backpack, travel</Text>
        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.status}>Delivered</Text>
        </View>
      </View>

      {/* Progress Timeline */}
      <View style={styles.timeline}>
        <View style={styles.timelineItem}>
          <View style={[styles.dot, styles.dotCompleted]} />
          <View style={[styles.line, styles.lineCompleted]} />
          <Text style={styles.timelineLabel}>Order</Text>
        </View>

        <View style={styles.timelineItem}>
          <View style={[styles.dot, styles.dotCompleted]} />
          <View style={[styles.line, styles.lineCompleted]} />
          <Text style={styles.timelineLabel}>Processing</Text>
        </View>

        <View style={styles.timelineItem}>
          <View style={[styles.dot, styles.dotCompleted]} />
          <View style={[styles.line, styles.lineCompleted]} />
          <Text style={styles.timelineLabel}>Packed</Text>
        </View>

        <View style={styles.timelineItem}>
          <View style={[styles.dot, styles.dotCompleted]} />
          <View style={[styles.line, styles.lineCompleted]} />
          <Text style={styles.timelineLabel}>Shipped</Text>
        </View>

        <View style={styles.timelineItem}>
          <View style={[styles.dot, styles.dotCompleted]} />
          <Text style={styles.timelineLabel}>Arrived</Text>
        </View>
      </View>

      {/* Details Sections */}
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <Text style={styles.detailText}>
          Dew Street, Kokorko road, GZJ-291-1999
        </Text>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Shipping Method</Text>
        <Text style={styles.detailText}>
          Regular. Arrives in 4-5 business days
        </Text>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Estimate Time</Text>
        <Text style={styles.detailText}>
          November 24, 2022 at 09:00 - 12:00 AM
        </Text>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <Text style={styles.detailText}>MTN Mobile Money</Text>
      </View>

      {/* Price Breakdown */}
      <View style={styles.priceCard}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.priceValue}>$69</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Shipping Default (Regular)</Text>
          <Text style={styles.priceValue}>$29</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>Amount Payable</Text>
          <Text style={styles.totalValue}>$98</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.rateButton} activeOpacity={0.8}>
          <Text style={styles.rateButtonText}>Rate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.downloadButton} activeOpacity={0.8}>
          <Text style={styles.downloadButtonText}>Download</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  productCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
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

  productInfo: {
    flex: 1,
    marginLeft: 14,
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

  statusBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  status: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "700",
  },

  timeline: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },

  timelineItem: {
    alignItems: "center",
    flex: 1,
  },

  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },

  dotCompleted: {
    backgroundColor: "#10B981",
  },

  line: {
    position: "absolute",
    top: 12,
    left: "50%",
    width: "100%",
    height: 2,
    backgroundColor: "#E5E7EB",
    zIndex: -1,
  },

  lineCompleted: {
    backgroundColor: "#10B981",
  },

  timelineLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    textAlign: "center",
  },

  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },

  detailText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    lineHeight: 20,
  },

  priceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },

  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  priceLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },

  priceValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },

  totalLabel: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "700",
  },

  totalValue: {
    fontSize: 18,
    color: "#1F2937",
    fontWeight: "800",
  },

  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },

  rateButton: {
    flex: 1,
    backgroundColor: "#6B7280",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  rateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  downloadButton: {
    flex: 1,
    backgroundColor: "#1F2937",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  downloadButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
