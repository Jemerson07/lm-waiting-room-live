import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";

const COLORS: Record<string, string> = {
  checkin: "#3B82F6",
  diagnostico: "#8B5CF6",
  aprovacao: "#F59E0B",
  em_servico: "#10B981",
  teste_final: "#06B6D4",
  finalizada: "#22C55E",
  entregue: "#64748B",
};

const LABELS: Record<string, string> = {
  checkin: "Check-in",
  diagnostico: "Diagnóstico",
  aprovacao: "Aprovação",
  em_servico: "Em serviço",
  teste_final: "Teste final",
  finalizada: "Finalizada",
  entregue: "Entregue",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: COLORS[status] ?? "#475569" }]}>
      <ThemedText style={styles.text}>{LABELS[status] ?? status}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, alignSelf: "flex-start" },
  text: { color: "#fff", fontWeight: "700", fontSize: 12 },
});
