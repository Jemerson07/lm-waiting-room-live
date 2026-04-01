import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import type { Attendance } from "@/types/attendance";

interface CompletedVehiclesPanelProps {
  items: Attendance[];
  totalCompleted: number;
}

export function CompletedVehiclesPanel({ items, totalCompleted }: CompletedVehiclesPanelProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <ThemedText type="subtitle" style={styles.title}>
            Finalizados recentes
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Os concluídos saem da área principal e ficam aqui como histórico rápido, sem poluir a tela Live.
          </ThemedText>
        </View>

        <View style={styles.counter}>
          <ThemedText style={styles.counterText}>{totalCompleted}</ThemedText>
        </View>
      </View>

      <View style={styles.grid}>
        {items.map((attendance) => (
          <View key={attendance.id} style={styles.card}>
            <View style={styles.cardTop}>
              <ThemedText style={styles.plate}>{attendance.licensePlate}</ThemedText>
              <View style={styles.pill}>
                <ThemedText style={styles.pillText}>Concluído</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.model}>{attendance.vehicleModel}</ThemedText>

            {attendance.customerName ? (
              <ThemedText style={styles.meta}>Cliente: {attendance.customerName}</ThemedText>
            ) : null}

            <ThemedText style={styles.meta}>Mantido para histórico e relatórios</ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "rgba(2, 12, 22, 0.72)",
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
  },
  subtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    lineHeight: 20,
  },
  counter: {
    minWidth: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 200, 83, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(0, 200, 83, 0.34)",
    justifyContent: "center",
    alignItems: "center",
  },
  counterText: {
    color: "#A7FFD1",
    fontSize: 16,
    fontWeight: "800",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    minWidth: 220,
    flexGrow: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  plate: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  pill: {
    backgroundColor: "rgba(0, 200, 83, 0.18)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillText: {
    color: "#A7FFD1",
    fontSize: 11,
    fontWeight: "800",
  },
  model: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  meta: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    marginBottom: 4,
  },
});
