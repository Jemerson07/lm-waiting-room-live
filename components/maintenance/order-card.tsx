import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { StatusBadge } from "@/components/maintenance/status-badge";
import type { ManagerOrderView } from "@/types/maintenance";

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return value;
  }
}

export function OrderCard({
  order,
  onPress,
}: {
  order: ManagerOrderView;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <ThemedText type="subtitle">{order.plate}</ThemedText>
          <ThemedText style={styles.model}>
            {order.brand} {order.model}
          </ThemedText>
        </View>
        <StatusBadge status={String(order.current_status)} />
      </View>

      <View style={styles.metaRow}>
        <ThemedText style={styles.metaLabel}>Cliente</ThemedText>
        <ThemedText style={styles.metaValue}>{order.customer_name}</ThemedText>
      </View>

      <View style={styles.metaRow}>
        <ThemedText style={styles.metaLabel}>Serviço</ThemedText>
        <ThemedText style={styles.metaValue}>{String(order.service_type)}</ThemedText>
      </View>

      <View style={styles.metaRow}>
        <ThemedText style={styles.metaLabel}>Prioridade</ThemedText>
        <ThemedText style={styles.metaValue}>{String(order.priority)}</ThemedText>
      </View>

      {order.operator_name ? (
        <View style={styles.metaRow}>
          <ThemedText style={styles.metaLabel}>Operador</ThemedText>
          <ThemedText style={styles.metaValue}>{order.operator_name}</ThemedText>
        </View>
      ) : null}

      {order.complaint ? <ThemedText style={styles.complaint}>{order.complaint}</ThemedText> : null}
      <ThemedText style={styles.date}>Criada em {formatDate(order.created_at)}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: "rgba(15, 23, 42, 0.06)",
    gap: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  model: {
    opacity: 0.75,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  metaLabel: {
    opacity: 0.65,
    fontSize: 13,
  },
  metaValue: {
    flexShrink: 1,
    fontWeight: "600",
    textAlign: "right",
  },
  complaint: {
    opacity: 0.8,
  },
  date: {
    opacity: 0.55,
    fontSize: 12,
  },
}
);