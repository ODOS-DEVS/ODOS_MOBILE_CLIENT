import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function DeliveredDetails({
  order,
  onBack,
}: {
  order: any;
  onBack: () => void;
}) {
  return (
    <View>
      <TouchableOpacity onPress={onBack}>
        <Text style={{ marginBottom: 12 }}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>{order.name}</Text>

        <Text style={styles.label}>Delivery Address</Text>
        <Text style={styles.value}>Dew Street, Kokroko road</Text>

        <Text style={styles.label}>Payment Method</Text>
        <Text style={styles.value}>MTN Mobile Money</Text>

        <Text style={styles.total}>Total: ${order.price}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnDark}>
          <Text style={styles.btnText}>Rates</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnLight}>
          <Text style={styles.btnTextDark}>Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: "#777",
    marginTop: 12,
  },
  value: {
    fontSize: 13,
    color: "#111",
  },
  total: {
    marginTop: 16,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  btnDark: {
    flex: 1,
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  btnLight: {
    flex: 1,
    backgroundColor: "#EEE",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
  btnTextDark: {
    color: "#111",
    fontWeight: "600",
  },
});
