import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import type { Attendance } from "@/types/attendance";
import { SERVICE_TYPE_LABELS, SLA_SEVERITY_LABELS, getAttendanceSlaSnapshot } from "@/types/attendance";

interface CompletedVehiclesPanelProps {
  items: Attendance[];
  totalCompleted: number;
}

const toTs = (value: string | number | Date | undefined) => {
  if (!value) return Date.now();
  if (typeof value === "number") return value;
  if (value instanceof Date) return value.getTime();
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : new Date(value).getTime();
};

const formatClock = (value: string | number | Date | undefined) =>
  new Date(toTs(value)).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

export function CompletedVehiclesPanel({ items, totalCompleted }: CompletedVehiclesPanelProps) {
  if (!items.length) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedToday = items.filter((item) => toTs(item.updatedAt) >= today.getTime()).length;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <ThemedText type="subtitle" style={styles.title}>Histórico visual de finalizados</ThemedText>
          <ThemedText style={styles.subtitle}>
            Os concluídos saem da fila principal e ficam aqui como histórico rápido para a sala de espera.
          </ThemedText>
        </View>
        <View style={styles.counter}>
          <ThemedText style={styles.counterText}>{totalCompleted}</ThemedText>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <ThemedText style={styles.summaryLabel}>Hoje</ThemedText>
          <ThemedText style={styles.summaryValue}>{completedToday}</ThemedText>
        </View>
        <View style={styles.summaryCard}>
          <ThemedText style={styles.summaryLabel}>Última conclusão</ThemedText>
          <ThemedText style={styles.summaryValue}>{formatClock(items[0]?.updatedAt)}</ThemedText>
        </View>
        <View style={styles.summaryCard}>
          <ThemedText style={styles.summaryLabel}>Em tela</ThemedText>
          <ThemedText style={styles.summaryValue}>{items.length}</ThemedText>
        </View>
      </View>

      <View style={styles.grid}>
        {items.map((attendance) => {
          const sla = getAttendanceSlaSnapshot(attendance);
          return (
            <View key={attendance.id} style={styles.card}>
              <View style={styles.cardTop}>
                <ThemedText style={styles.plate}>{attendance.licensePlate}</ThemedText>
                <ThemedText style={styles.time}>{formatClock(attendance.updatedAt)}</ThemedText>
              </View>
              <ThemedText style={styles.model}>{attendance.vehicleModel}</ThemedText>
              <View style={styles.tags}>
                <View style={styles.tag}><ThemedText style={styles.tagText}>{SERVICE_TYPE_LABELS[attendance.serviceType]}</ThemedText></View>
                <View style={styles.tag}><ThemedText style={styles.tagText}>{SLA_SEVERITY_LABELS[sla.severity]}</ThemedText></View>
              </View>
              {attendance.customerName ? <ThemedText style={styles.meta}>Cliente: {attendance.customerName}</ThemedText> : null}
              <ThemedText style={styles.meta}>Meta {sla.targetMinutes} min • fora da área principal da Live</ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginHorizontal: 20, marginBottom: 20, backgroundColor: "rgba(2, 12, 22, 0.74)", borderRadius: 28, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 },
  headerText: { flex: 1 },
  title: { color: "#FFFFFF", fontSize: 22, fontWeight: "800", marginBottom: 6 },
  subtitle: { color: "rgba(255,255,255,0.72)", fontSize: 13, lineHeight: 20 },
  counter: { minWidth: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(0, 200, 83, 0.18)", borderWidth: 1, borderColor: "rgba(0, 200, 83, 0.34)", justifyContent: "center", alignItems: "center" },
  counterText: { color: "#A7FFD1", fontSize: 18, fontWeight: "800" },
  summaryRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },
  summaryCard: { flexGrow: 1, minWidth: 120, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  summaryLabel: { color: "rgba(255,255,255,0.66)", fontSize: 12, fontWeight: "700", marginBottom: 8 },
  summaryValue: { color: "#FFFFFF", fontSize: 22, fontWeight: "900" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: { minWidth: 240, flexGrow: 1, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 10 },
  plate: { color: "#FFFFFF", fontSize: 18, fontWeight: "800", letterSpacing: 0.8 },
  time: { color: "#A7FFD1", fontSize: 12, fontWeight: "800" },
  model: { color: "#FFFFFF", fontSize: 15, fontWeight: "600", marginBottom: 10 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  tag: { backgroundColor: "rgba(255,255,255,0.08)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  tagText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  meta: { color: "rgba(255,255,255,0.72)", fontSize: 12, marginBottom: 4, lineHeight: 18 },
});