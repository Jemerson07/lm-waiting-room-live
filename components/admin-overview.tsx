import { StyleSheet, View, ScrollView, Pressable, TextInput, Dimensions } from "react-native";
import { ThemedText } from "@/components/themed-text";
import type { Attendance, AttendanceStatus } from "@/types/attendance";
import { STATUS_LABELS } from "@/types/attendance";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const STATUS_FILTERS: Array<AttendanceStatus | "all"> = ["all", "arrival", "waiting", "in_service", "completed"];

interface AdminOverviewProps {
  attendances: Attendance[];
  selectedFilter: AttendanceStatus | "all";
  onFilterChange: (filter: AttendanceStatus | "all") => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  cardBackground: string;
  borderColor: string;
  tintColor: string;
}

export function AdminOverview({
  attendances,
  selectedFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  cardBackground,
  borderColor,
  tintColor,
}: AdminOverviewProps) {
  const total = attendances.length;
  const completed = attendances.filter((a) => a.status === "completed").length;
  const inService = attendances.filter((a) => a.status === "in_service").length;
  const active = total - completed;

  const summaryCards = [
    { title: "Total", value: total, subtitle: "Atendimentos registrados", color: tintColor },
    { title: "Ativos", value: active, subtitle: "Em andamento no sistema", color: "#5C6BC0" },
    { title: "Em atendimento", value: inService, subtitle: "Demandas em execução", color: "#FF6B00" },
    { title: "Concluídos", value: completed, subtitle: "Mantidos no histórico", color: "#00C853" },
  ];

  return (
    <>
      <View style={styles.summaryGrid}>
        {summaryCards.map((card) => (
          <View key={card.title} style={[styles.summaryCard, { backgroundColor: cardBackground, borderColor }]}>
            <ThemedText style={styles.summaryCardTitle}>{card.title}</ThemedText>
            <ThemedText style={[styles.summaryCardValue, { color: card.color }]}>{card.value}</ThemedText>
            <ThemedText style={styles.summaryCardSubtitle}>{card.subtitle}</ThemedText>
          </View>
        ))}
      </View>

      <View style={[styles.toolbar, { backgroundColor: cardBackground, borderColor }]}>
        <View style={styles.searchBlock}>
          <ThemedText style={styles.searchLabel}>Busca rápida</ThemedText>
          <TextInput
            style={[styles.searchInput, { borderColor }]}
            placeholder="Buscar por placa, modelo, cliente ou descrição"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          {STATUS_FILTERS.map((status) => {
            const count =
              status === "all"
                ? attendances.length
                : attendances.filter((attendance) => attendance.status === status).length;

            const label = status === "all" ? "Todos" : STATUS_LABELS[status];

            return (
              <Pressable
                key={status}
                style={[
                  styles.filterButton,
                  { backgroundColor: cardBackground, borderColor },
                  selectedFilter === status && { backgroundColor: tintColor, borderColor: tintColor },
                ]}
                onPress={() => onFilterChange(status)}
              >
                <ThemedText style={[styles.filterText, selectedFilter === status && styles.filterTextActive]}>
                  {label} ({count})
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 18,
  },
  summaryCard: {
    flexGrow: 1,
    minWidth: SCREEN_WIDTH > 768 ? 180 : 150,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  summaryCardTitle: { fontSize: 12, opacity: 0.65, marginBottom: 8, fontWeight: "600" },
  summaryCardValue: { fontSize: 28, fontWeight: "800", marginBottom: 6 },
  summaryCardSubtitle: { fontSize: 12, opacity: 0.68, lineHeight: 18 },
  toolbar: {
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 14,
    marginBottom: 18,
  },
  searchBlock: { paddingHorizontal: 14, marginBottom: 12 },
  searchLabel: { fontSize: 12, opacity: 0.65, marginBottom: 6, fontWeight: "600" },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  filters: { paddingHorizontal: 14 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999, marginRight: 8, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: "700" },
  filterTextActive: { color: "#FFFFFF" },
});
