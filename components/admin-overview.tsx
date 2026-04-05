import { StyleSheet, View, ScrollView, Pressable, TextInput, Dimensions } from "react-native";
import { ThemedText } from "@/components/themed-text";
import type { Attendance, AttendanceOperationalMetrics, AttendanceStatus, DelayReason } from "@/types/attendance";
import {
  CRITICAL_QUEUE_SEVERITY_LABELS,
  DELAY_REASON_LABELS,
  SERVICE_TYPE_LABELS,
  STATUS_LABELS,
  getAttendancePrioritySnapshot,
} from "@/types/attendance";

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

function getStartOfTodayTimestamp() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
}

function getDominantDelayReason(items: Attendance[]): DelayReason | null {
  const counts = items
    .filter((attendance) => attendance.delayReason !== "none")
    .reduce<Record<string, number>>((acc, attendance) => {
      acc[attendance.delayReason] = (acc[attendance.delayReason] ?? 0) + 1;
      return acc;
    }, {});

  const [topEntry] = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return (topEntry?.[0] as DelayReason | undefined) ?? null;
}

function formatTime(value: number) {
  return new Date(Number(value)).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function AdminOverview({
  attendances,
  operationalMetrics,
  selectedFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  cardBackground,
  borderColor,
  tintColor,
}: AdminOverviewProps) {
  const todayStartTimestamp = getStartOfTodayTimestamp();
  const total = attendances.length;
  const completed = attendances.filter((a) => a.status === "completed").length;
  const inService = attendances.filter((a) => a.status === "in_service").length;
  const activeItems = attendances.filter((a) => a.status !== "completed");
  const active = total - completed;
  const criticalPriorityCount = activeItems.filter((a) => getAttendancePrioritySnapshot(a).level === "critical").length;
  const attentionPriorityCount = activeItems.filter((a) => getAttendancePrioritySnapshot(a).level === "attention").length;
  const normalPriorityCount = activeItems.filter((a) => getAttendancePrioritySnapshot(a).level === "normal").length;
  const recommendedAttendance = [...activeItems].sort((a, b) => getAttendancePrioritySnapshot(b).score - getAttendancePrioritySnapshot(a).score)[0];
  const recommendedPriority = recommendedAttendance ? getAttendancePrioritySnapshot(recommendedAttendance) : null;
  const completedToday = attendances.filter((attendance) => attendance.status === "completed" && Number(attendance.updatedAt) >= todayStartTimestamp).length;
  const delayedActiveCount = activeItems.filter((attendance) => attendance.delayReason !== "none").length;
  const slaExceptionsActiveCount = activeItems.filter((attendance) => attendance.slaExceptionActive).length;
  const activeSlaPressureCount = (operationalMetrics?.activeSlaRiskCount ?? 0) + (operationalMetrics?.activeSlaBreachedCount ?? 0);
  const missingPhoneCount = activeItems.filter((attendance) => !attendance.customerPhone?.trim()).length;
  const dominantDelayReason = getDominantDelayReason(activeItems);
  const recentOperationalTouches = [...activeItems].sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt)).slice(0, 3);

  const summaryCards = [
    { title: "Total", value: total, subtitle: "Atendimentos registrados", color: tintColor },
    { title: "Ativos", value: active, subtitle: "Em andamento no sistema", color: "#5C6BC0" },
    { title: "Críticos", value: criticalPriorityCount, subtitle: "Ação imediata", color: criticalPriorityCount > 0 ? "#B3261E" : "#00C853" },
    { title: "Atenção", value: attentionPriorityCount, subtitle: "Perto do limite", color: attentionPriorityCount > 0 ? "#B54708" : "#00C853" },
    { title: "Em atendimento", value: inService, subtitle: "Demandas em execução", color: "#FF6B00" },
    { title: "Fluxo normal", value: normalPriorityCount, subtitle: "Sem urgência alta", color: "#1C7C54" },
  ];

  const radarCards = [
    { title: "Concluídos hoje", value: completedToday, subtitle: "Atualizados hoje", color: "#00C853" },
    { title: "Atrasos ativos", value: delayedActiveCount, subtitle: "Com motivo registrado", color: delayedActiveCount > 0 ? "#B54708" : "#00C853" },
    { title: "Pressão de SLA", value: activeSlaPressureCount, subtitle: "Em risco + estourados", color: activeSlaPressureCount > 0 ? "#B3261E" : "#00C853" },
    { title: "Exceções ativas", value: slaExceptionsActiveCount, subtitle: "Fora da meta padrão", color: slaExceptionsActiveCount > 0 ? "#7B1FA2" : "#00C853" },
    { title: "Sem telefone", value: missingPhoneCount, subtitle: "Sem canal de WhatsApp", color: missingPhoneCount > 0 ? "#0052A3" : "#00C853" },
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

      {recommendedAttendance && recommendedPriority ? (
        <View style={[styles.recommendedSurface, { backgroundColor: cardBackground, borderColor: recommendedPriority.level === "critical" ? "rgba(179,38,30,0.25)" : recommendedPriority.level === "attention" ? "rgba(181,71,8,0.25)" : borderColor }]}>
          <View style={styles.recommendedHeaderRow}>
            <View>
              <ThemedText style={styles.recommendedLabel}>Próximo atendimento recomendado</ThemedText>
              <ThemedText style={styles.recommendedPlate}>{recommendedAttendance.licensePlate} · {recommendedAttendance.vehicleModel}</ThemedText>
            </View>
            <View style={[styles.recommendedBadge, { backgroundColor: recommendedPriority.level === "critical" ? "rgba(179,38,30,0.12)" : recommendedPriority.level === "attention" ? "rgba(181,71,8,0.12)" : "rgba(0,200,83,0.12)" }]}>
              <ThemedText style={[styles.recommendedBadgeText, { color: recommendedPriority.level === "critical" ? "#B3261E" : recommendedPriority.level === "attention" ? "#B54708" : "#1C7C54" }]}>{recommendedPriority.label}</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.recommendedText}>{recommendedPriority.reason}</ThemedText>
          <ThemedText style={styles.recommendedAction}>Ação sugerida: {recommendedPriority.actionLabel}</ThemedText>
        </View>
      ) : null}

      <View style={[styles.radarSurface, { backgroundColor: cardBackground, borderColor }]}>
        <View style={styles.radarHeaderRow}>
          <View style={styles.radarHeaderTextBlock}>
            <ThemedText style={styles.radarTitle}>Radar operacional do dia</ThemedText>
            <ThemedText style={styles.radarSubtitle}>Resumo rápido do que exige resposta mais imediata da operação.</ThemedText>
          </View>
          <View style={[styles.radarBadge, { backgroundColor: activeSlaPressureCount > 0 ? "rgba(179,38,30,0.12)" : "rgba(0,200,83,0.12)" }]}>
            <ThemedText style={[styles.radarBadgeText, { color: activeSlaPressureCount > 0 ? "#B3261E" : "#1C7C54" }]}>
              {activeSlaPressureCount > 0 ? "Operação pressionada" : "Operação estável"}
            </ThemedText>
          </View>
        </View>

        <View style={styles.radarGrid}>
          {radarCards.map((card) => (
            <View key={card.title} style={styles.radarCard}>
              <ThemedText style={styles.radarCardTitle}>{card.title}</ThemedText>
              <ThemedText style={[styles.radarCardValue, { color: card.color }]}>{card.value}</ThemedText>
              <ThemedText style={styles.radarCardSubtitle}>{card.subtitle}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.radarHighlightsRow}>
          <View style={styles.radarHighlightCard}>
            <ThemedText style={styles.radarHighlightLabel}>Motivo dominante de atraso</ThemedText>
            <ThemedText style={styles.radarHighlightValue}>
              {dominantDelayReason ? DELAY_REASON_LABELS[dominantDelayReason] : "Sem atrasos ativos"}
            </ThemedText>
            <ThemedText style={styles.radarHighlightHelper}>
              {dominantDelayReason
                ? "Use este motivo para agir no gargalo que mais aparece agora."
                : "Nenhum atendimento ativo com bloqueio formal registrado."}
            </ThemedText>
          </View>

          <View style={styles.radarHighlightCard}>
            <ThemedText style={styles.radarHighlightLabel}>Últimas movimentações</ThemedText>
            {recentOperationalTouches.length > 0 ? (
              recentOperationalTouches.map((attendance) => (
                <View key={attendance.id} style={styles.touchItem}>
                  <View style={styles.touchItemTextBlock}>
                    <ThemedText style={styles.touchPlate}>{attendance.licensePlate}</ThemedText>
                    <ThemedText style={styles.touchMeta}>
                      {attendance.vehicleModel} · {STATUS_LABELS[attendance.status]}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.touchTime}>{formatTime(Number(attendance.updatedAt))}</ThemedText>
                </View>
              ))
            ) : (
              <ThemedText style={styles.radarHighlightHelper}>Ainda não há movimentações recentes na fila ativa.</ThemedText>
            )}
          </View>
        </View>
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
  recommendedSurface: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 18 },
  recommendedHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 },
  recommendedLabel: { fontSize: 12, opacity: 0.65, marginBottom: 6, fontWeight: "700" },
  recommendedPlate: { fontSize: 20, fontWeight: "900" },
  recommendedBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  recommendedBadgeText: { fontSize: 11, fontWeight: "900" },
  recommendedText: { fontSize: 13, lineHeight: 20, opacity: 0.8, marginBottom: 6 },
  recommendedAction: { fontSize: 13, fontWeight: "800" },
  radarSurface: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 18 },
  radarHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16, flexWrap: "wrap" },
  radarHeaderTextBlock: { flex: 1, minWidth: 220 },
  radarTitle: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
  radarSubtitle: { fontSize: 12, opacity: 0.7, lineHeight: 18 },
  radarBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  radarBadgeText: { fontSize: 11, fontWeight: "900" },
  radarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 14 },
  radarCard: { flexGrow: 1, minWidth: SCREEN_WIDTH > 768 ? 160 : 140, backgroundColor: "rgba(0,0,0,0.025)", borderRadius: 14, padding: 14 },
  radarCardTitle: { fontSize: 12, opacity: 0.65, marginBottom: 8, fontWeight: "700" },
  radarCardValue: { fontSize: 24, fontWeight: "900", marginBottom: 6 },
  radarCardSubtitle: { fontSize: 12, opacity: 0.68, lineHeight: 18 },
  radarHighlightsRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  radarHighlightCard: { flex: 1, minWidth: SCREEN_WIDTH > 768 ? 260 : 220, backgroundColor: "rgba(0,0,0,0.025)", borderRadius: 14, padding: 14 },
  radarHighlightLabel: { fontSize: 12, opacity: 0.65, marginBottom: 8, fontWeight: "700" },
  radarHighlightValue: { fontSize: 16, fontWeight: "800", marginBottom: 6 },
  radarHighlightHelper: { fontSize: 12, opacity: 0.72, lineHeight: 18 },
  touchItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },
  touchItemTextBlock: { flex: 1 },
  touchPlate: { fontSize: 13, fontWeight: "800" },
  touchMeta: { fontSize: 12, opacity: 0.68, marginTop: 2 },
  touchTime: { fontSize: 12, fontWeight: "700", opacity: 0.7 },
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