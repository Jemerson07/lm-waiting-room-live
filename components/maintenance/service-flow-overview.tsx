import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";

const FLOW = [
  ["checkin", "Check-in"],
  ["diagnostico", "Diagnóstico"],
  ["aprovacao", "Aprovação"],
  ["em_servico", "Em serviço"],
  ["teste_final", "Teste final"],
  ["finalizada", "Finalizada"],
  ["entregue", "Entregue"],
] as const;

export function ServiceFlowOverview({ counts }: { counts: Record<string, number> }) {
  return (
    <View style={styles.container}>
      {FLOW.map(([key, label]) => (
        <View key={key} style={styles.row}>
          <View style={styles.left}>
            <View style={styles.dot} />
            <ThemedText style={styles.label}>{label}</ThemedText>
          </View>
          <View style={styles.countBox}>
            <ThemedText style={styles.countText}>{String(counts[key] ?? 0)}</ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  row: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.72)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 999, backgroundColor: "#0f172a" },
  label: { fontWeight: "700" },
  countBox: {
    minWidth: 42,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.08)",
  },
  countText: { fontWeight: "800" },
});
