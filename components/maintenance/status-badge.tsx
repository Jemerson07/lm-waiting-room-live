import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { MAINTENANCE_STATUS_COLORS, MAINTENANCE_STATUS_LABELS } from "@/types/maintenance";

export function StatusBadge({ status }: { status: string }) {
  const backgroundColor = MAINTENANCE_STATUS_COLORS[status] ?? "#475569";
  const label = MAINTENANCE_STATUS_LABELS[status] ?? status;

  return (
    <View style={[styles.badge, { backgroundColor }]}> 
      <ThemedText style={styles.label}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  label: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
