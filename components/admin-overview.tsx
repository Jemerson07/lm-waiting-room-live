import { StyleSheet, View, ScrollView, Pressable, TextInput, Dimensions } from "react-native";
import { ThemedText } from "@/components/themed-text";
import type { Attendance, AttendanceOperationalMetrics, AttendanceStatus } from "@/types/attendance";
import { CRITICAL_QUEUE_SEVERITY_LABELS, DELAY_REASON_LABELS, SERVICE_TYPE_LABELS, STATUS_LABELS } from "@/types/attendance";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const STATUS_FILTERS: Array<AttendanceStatus | "all"> = ["all", "arrival", "waiting", "in_service", "completed"];

interface AdminOverviewProps {
  attendances: Attendance[];
  operationalMetrics?: AttendanceOperationalMetrics;
  selectedFilter: AttendanceStatus | "all";
  onFilterChange: (filter: AttendanceStatus | "all") => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  cardBackground: string;
  borderColor: string;
  tintColor: string;
}

export function AdminOverview({ attendances, operationalMetrics, selectedFilter, onFilterChange, searchQuery, onSearchChange, cardBackground, borderColor, tintColor }: AdminOverviewProps) {
  const total = attendances.length;
  const completed = attendances.filter((a) => a.status === "completed").length;
  const inService = attendances.filter((a) => a.status === "in_service").length;
  const active = total - completed;
  const criticalQueueCount = operationalMetrics?.criticalQueueCount ?? 0;

  const summaryCards = [
    { title: "Total", value: total, subtitle: "Atendimentos registrados", color: tintColor },
    { title: "Ativos", value: active, subtitle: "Em andamento no sistema", color: "#5C6BC0" },
    { title: "Em atendimento", value: inService, subtitle: "Demandas em execução", color: "#FF6B00" },
    { title: "Fila crítica", value: criticalQueueCount, subtitle: "Veículos acima do tempo ideal", color: criticalQueueCount > 0 ? "#B54708" : "#00C853" },
    { title: "SLA em risco", value: operationalMetrics?.activeSlaRiskCount ?? 0, subtitle: "Atendimentos perto da meta", color: (operationalMetrics?.activeSlaRiskCount ?? 0) > 0 ? "#A35B00" : "#00C853" },
    { title: "SLA estourado", value: operationalMetrics?.activeSlaBreachedCount ?? 0, subtitle: "Ativos fora da meta", color: (operationalMetrics?.activeSlaBreachedCount ?? 0) > 0 ? "#B3261E" : "#00C853" },
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

      {operationalMetrics ? (
        <View style={[styles.insightsSurface, { backgroundColor: cardBackground, borderColor }]}> 
          <View style={styles.insightsHeaderRow}>
            <View style={styles.insightCard}>
              <ThemedText style={styles.insightLabel}>Gargalo operacional</ThemedText>
              <ThemedText style={styles.insightValue}>{operationalMetrics.bottleneckStage ? STATUS_LABELS[operationalMetrics.bottleneckStage] : "Sem dados"}</ThemedText>
              <ThemedText style={styles.insightHelper}>{operationalMetrics.bottleneckAverageMinutes > 0 ? `${operationalMetrics.bottleneckAverageMinutes} min em média nesta etapa` : "Ainda não há volume suficiente para apontar gargalo."}</ThemedText>
            </View>
            <View style={styles.insightCard}>
              <ThemedText style={styles.insightLabel}>SLA concluído</ThemedText>
              <ThemedText style={styles.insightValueCompact}>Cumpridos {operationalMetrics.slaWithinCount} · Estourados {operationalMetrics.slaBreachedCount} · Exceções {operationalMetrics.slaExceptionCount}</ThemedText>
              <ThemedText style={styles.insightHelper}>Leitura do SLA total com base no histórico real e nas exceções marcadas.</ThemedText>
            </View>
          </View>

          <View style={styles.criticalHeaderRow}>
            <ThemedText style={styles.criticalTitle}>Fila em risco</ThemedText>
            <ThemedText style={styles.criticalSubtitle}>Chegada {operationalMetrics.criticalByStatus.arrival} · Aguardando {operationalMetrics.criticalByStatus.waiting} · Em atendimento {operationalMetrics.criticalByStatus.in_service}</ThemedText>
          </View>

          {operationalMetrics.criticalAttendances.length > 0 ? operationalMetrics.criticalAttendances.slice(0, 4).map((item) => (
            <View key={item.attendanceId} style={[styles.criticalItem, { borderColor }]}> 
              <View style={styles.criticalItemHeader}>
                <ThemedText style={styles.criticalItemPlate}>{item.licensePlate}</ThemedText>
                <View style={[styles.severityBadge, { backgroundColor: item.severity === "critical" ? "rgba(179, 38, 30, 0.12)" : "rgba(181, 71, 8, 0.12)" }]}><ThemedText style={[styles.severityBadgeText, { color: item.severity === "critical" ? "#B3261E" : "#B54708" }]}>{CRITICAL_QUEUE_SEVERITY_LABELS[item.severity]}</ThemedText></View>
              </View>
              <ThemedText style={styles.criticalItemMeta}>{item.vehicleModel}</ThemedText>
              <ThemedText style={styles.criticalItemDetail}>{STATUS_LABELS[item.status]} há {item.stageDurationMinutes} min · limite ideal {item.thresholdMinutes} min</ThemedText>
            </View>
          )) : <View style={[styles.noCriticalSurface, { borderColor }]}><ThemedText style={styles.noCriticalText}>Nenhum atendimento está acima do tempo alvo no momento.</ThemedText></View>}

          <View style={styles.criticalHeaderRow}>
            <ThemedText style={styles.criticalTitle}>SLA em atenção</ThemedText>
            <ThemedText style={styles.criticalSubtitle}>Atendimentos próximos ou acima da meta total, já considerando exceções.</ThemedText>
          </View>

          {operationalMetrics.topSlaAlerts.length > 0 ? operationalMetrics.topSlaAlerts.slice(0, 4).map((item) => (
            <View key={item.attendanceId} style={[styles.criticalItem, { borderColor }]}> 
              <View style={styles.criticalItemHeader}>
                <ThemedText style={styles.criticalItemPlate}>{item.licensePlate}</ThemedText>
                <View style={[styles.severityBadge, { backgroundColor: item.severity === "breached" ? "rgba(179, 38, 30, 0.12)" : "rgba(181, 71, 8, 0.12)" }]}><ThemedText style={[styles.severityBadgeText, { color: item.severity === "breached" ? "#B3261E" : "#B54708" }]}>{item.severity === "breached" ? "SLA estourado" : "Em risco"}</ThemedText></View>
              </View>
              <ThemedText style={styles.criticalItemMeta}>{item.vehicleModel} · {SERVICE_TYPE_LABELS[item.serviceType]}</ThemedText>
              <ThemedText style={styles.criticalItemDetail}>{STATUS_LABELS[item.status]} · {item.totalElapsedMinutes} min no total · meta {item.slaTargetMinutes} min</ThemedText>
              {item.delayReason !== "none" ? <ThemedText style={styles.alertReason}>Motivo registrado: {DELAY_REASON_LABELS[item.delayReason]}</ThemedText> : null}
            </View>
          )) : <View style={[styles.noCriticalSurface, { borderColor }]}><ThemedText style={styles.noCriticalText}>Nenhum atendimento em risco de SLA neste momento.</ThemedText></View>}
        </View>
      ) : null}

      <View style={[styles.toolbar, { backgroundColor: cardBackground, borderColor }]}>
        <View style={styles.searchBlock}>
          <ThemedText style={styles.searchLabel}>Busca rápida</ThemedText>
          <TextInput style={[styles.searchInput, { borderColor }]} placeholder="Buscar por placa, modelo, cliente ou descrição" placeholderTextColor="#999" value={searchQuery} onChangeText={onSearchChange} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          {STATUS_FILTERS.map((status) => {
            const count = status === "all" ? attendances.length : attendances.filter((attendance) => attendance.status === status).length;
            const label = status === "all" ? "Todos" : STATUS_LABELS[status];
            return (
              <Pressable key={status} style={[styles.filterButton, { backgroundColor: cardBackground, borderColor }, selectedFilter === status && { backgroundColor: tintColor, borderColor: tintColor }]} onPress={() => onFilterChange(status)}>
                <ThemedText style={[styles.filterText, selectedFilter === status && styles.filterTextActive]}>{label} ({count})</ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 18 },
  summaryCard: { flexGrow: 1, minWidth: SCREEN_WIDTH > 768 ? 180 : 150, borderRadius: 18, padding: 16, borderWidth: 1 },
  summaryCardTitle: { fontSize: 12, opacity: 0.65, marginBottom: 8, fontWeight: "600" },
  summaryCardValue: { fontSize: 28, fontWeight: "800", marginBottom: 6 },
  summaryCardSubtitle: { fontSize: 12, opacity: 0.68, lineHeight: 18 },
  insightsSurface: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 18 },
  insightsHeaderRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },
  insightCard: { flex: 1, minWidth: SCREEN_WIDTH > 768 ? 250 : 220, backgroundColor: "rgba(0,0,0,0.025)", borderRadius: 14, padding: 14 },
  insightLabel: { fontSize: 12, opacity: 0.65, marginBottom: 8, fontWeight: "700" },
  insightValue: { fontSize: 22, fontWeight: "800", marginBottom: 6 },
  insightValueCompact: { fontSize: 15, fontWeight: "800", lineHeight: 22, marginBottom: 6 },
  insightHelper: { fontSize: 12, opacity: 0.7, lineHeight: 18 },
  criticalHeaderRow: { marginBottom: 10, marginTop: 4 },
  criticalTitle: { fontSize: 15, fontWeight: "800", marginBottom: 4 },
  criticalSubtitle: { fontSize: 12, opacity: 0.68 },
  criticalItem: { borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 10 },
  criticalItemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 4 },
  criticalItemPlate: { fontSize: 16, fontWeight: "800" },
  criticalItemMeta: { fontSize: 12, opacity: 0.65, marginBottom: 6 },
  criticalItemDetail: { fontSize: 13, lineHeight: 20 },
  alertReason: { fontSize: 12, opacity: 0.72, marginTop: 6, fontWeight: "600" },
  severityBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  severityBadgeText: { fontSize: 11, fontWeight: "800" },
  noCriticalSurface: { borderWidth: 1, borderRadius: 14, padding: 14 },
  noCriticalText: { fontSize: 13, opacity: 0.72 },
  toolbar: { borderRadius: 18, borderWidth: 1, paddingVertical: 14, marginBottom: 18 },
  searchBlock: { paddingHorizontal: 14, marginBottom: 12 },
  searchLabel: { fontSize: 12, opacity: 0.65, marginBottom: 6, fontWeight: "600" },
  searchInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  filters: { paddingHorizontal: 14 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999, marginRight: 8, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: "700" },
  filterTextActive: { color: "#FFFFFF" },
});
