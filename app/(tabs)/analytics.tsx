import { StyleSheet, View, ScrollView, Dimensions, ActivityIndicator, TextInput, Alert, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo, useState } from "react";
import { AccessRequiredCard } from "@/components/access-required-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { trpc } from "@/lib/trpc";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAttendances } from "@/hooks/use-attendances";
import { exportAttendancesToCSV, exportProductivityReportToCSV, exportServiceTypeReportToCSV, downloadCSV, generateFilename } from "@/lib/csv-export";
import { CRITICAL_QUEUE_SEVERITY_LABELS, STATUS_LABELS } from "@/types/attendance";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type MetricCard = {
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
  icon: string;
};

function toDateTimeRange(startDate: string, startTime: string, endDate: string, endTime: string) {
  const start = new Date(`${startDate}T${startTime || "00:00"}:00`);
  const end = new Date(`${endDate}T${endTime || "23:59"}:59`);
  return { start, end };
}

function getDurationInMinutes(start: number, end: number) {
  return Math.max(0, Math.round((end - start) / 60000));
}

function getAverage(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function formatLogDate(value: string | number | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor({}, "cardBackground");
  const borderColor = useThemeColor({}, "border");
  const { user, isAdmin, loading: userLoading } = useCurrentUser();
  const { attendances, loading } = useAttendances({ scope: "manage", enabled: Boolean(user && isAdmin) });
  const [startDate, setStartDate] = useState<string>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState<string>("00:00");
  const [endTime, setEndTime] = useState<string>("23:59");

  const dateRange = useMemo(() => toDateTimeRange(startDate, startTime, endDate, endTime), [startDate, startTime, endDate, endTime]);

  const filteredAttendances = useMemo(() => {
    const { start, end } = dateRange;
    return attendances.filter((att) => {
      const createdAt = new Date(att.createdAt);
      return createdAt >= start && createdAt <= end;
    });
  }, [attendances, dateRange]);

  const { data: operationalMetrics } = trpc.attendances.metrics.useQuery(
    { startAt: dateRange.start, endAt: dateRange.end },
    { enabled: Boolean(user && isAdmin), retry: false },
  );

  const { data: notificationHealth } = trpc.attendances.notificationHealth.useQuery(
    { startAt: dateRange.start, endAt: dateRange.end },
    { enabled: Boolean(user && isAdmin), retry: false },
  );

  const totals = useMemo(() => {
    const total = filteredAttendances.length;
    const completedItems = filteredAttendances.filter((a) => a.status === "completed");
    const activeItems = filteredAttendances.filter((a) => a.status !== "completed");
    const completed = completedItems.length;
    const inService = filteredAttendances.filter((a) => a.status === "in_service").length;
    const waiting = filteredAttendances.filter((a) => a.status === "waiting").length;
    const arrival = filteredAttendances.filter((a) => a.status === "arrival").length;
    const active = activeItems.length;
    const avgCompletedMinutes = getAverage(completedItems.map((a) => getDurationInMinutes(a.createdAt, a.updatedAt)));
    const avgActiveMinutes = getAverage(activeItems.map((a) => getDurationInMinutes(a.createdAt, Date.now())));
    const tireCount = filteredAttendances.filter((a) => a.serviceType === "tire").length;
    const correctiveCount = filteredAttendances.filter((a) => a.serviceType === "corrective").length;
    const preventiveCount = filteredAttendances.filter((a) => a.serviceType === "preventive").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, active, inService, waiting, arrival, avgCompletedMinutes, avgActiveMinutes, tireCount, correctiveCount, preventiveCount, completionRate };
  }, [filteredAttendances]);

  const metrics: MetricCard[] = useMemo(() => [
    { title: "Total no período", value: totals.total, color: tintColor, icon: "📊" },
    { title: "Concluídos", value: totals.completed, subtitle: `${totals.completionRate}%`, color: "#00C853", icon: "✅" },
    { title: "Ativos", value: totals.active, subtitle: "Chegada + aguardando + em atendimento", color: "#5C6BC0", icon: "🧭" },
    { title: "Em atendimento", value: totals.inService, color: "#FF6B00", icon: "⚙️" },
    { title: "Aguardando", value: totals.waiting, color: "#FFA000", icon: "⏳" },
    { title: "Chegada", value: totals.arrival, color: "#0091EA", icon: "🚗" },
    { title: "Tempo médio concluído", value: `${operationalMetrics?.averageTotalMinutesCompleted ?? totals.avgCompletedMinutes} min`, subtitle: "Com base no histórico real", color: "#0052A3", icon: "📌" },
    { title: "Fila crítica", value: operationalMetrics?.criticalQueueCount ?? 0, subtitle: "Atendimentos acima do tempo alvo", color: (operationalMetrics?.criticalQueueCount ?? 0) > 0 ? "#B54708" : "#00C853", icon: "🚨" },
  ], [operationalMetrics, tintColor, totals]);

  const stageMetrics: MetricCard[] = useMemo(() => [
    { title: "Chegada", value: `${operationalMetrics?.averageArrivalMinutes ?? 0} min`, subtitle: "Tempo médio até próxima etapa", color: "#0091EA", icon: "🚗" },
    { title: "Aguardando", value: `${operationalMetrics?.averageWaitingMinutes ?? 0} min`, subtitle: "Tempo médio de fila", color: "#FFA000", icon: "⏳" },
    { title: "Em atendimento", value: `${operationalMetrics?.averageInServiceMinutes ?? 0} min`, subtitle: "Tempo médio de execução", color: "#FF6B00", icon: "🛠️" },
    { title: "Gargalo atual", value: operationalMetrics?.bottleneckStage ? STATUS_LABELS[operationalMetrics.bottleneckStage] : "Sem dados", subtitle: operationalMetrics?.bottleneckAverageMinutes ? `${operationalMetrics.bottleneckAverageMinutes} min de média` : "Aguardando mais histórico", color: "#7B1FA2", icon: "📍" },
  ], [operationalMetrics]);

  const notificationCards: MetricCard[] = useMemo(() => [
    { title: "Tentativas", value: notificationHealth?.totalAttempts ?? 0, subtitle: "Envios de WhatsApp no período", color: tintColor, icon: "📨" },
    { title: "Sucesso", value: notificationHealth?.successfulAttempts ?? 0, subtitle: `${notificationHealth?.successRate ?? 0}% de taxa`, color: "#00C853", icon: "✅" },
    { title: "Falhas", value: notificationHealth?.failedAttempts ?? 0, subtitle: "Requer atenção operacional", color: (notificationHealth?.failedAttempts ?? 0) > 0 ? "#B3261E" : "#00C853", icon: "⚠️" },
  ], [notificationHealth, tintColor]);

  const handleExportAttendances = async () => {
    try {
      await downloadCSV(exportAttendancesToCSV(filteredAttendances), generateFilename("atendimentos_filtrados"));
      Alert.alert("Sucesso", "Relatório de atendimentos exportado com sucesso!");
    } catch {
      Alert.alert("Erro", "Não foi possível exportar o relatório");
    }
  };

  const handleExportProductivity = async () => {
    try {
      await downloadCSV(exportProductivityReportToCSV(filteredAttendances), generateFilename("produtividade_filtrada"));
      Alert.alert("Sucesso", "Relatório de produtividade exportado com sucesso!");
    } catch {
      Alert.alert("Erro", "Não foi possível exportar o relatório");
    }
  };

  const handleExportServiceType = async () => {
    try {
      await downloadCSV(exportServiceTypeReportToCSV(filteredAttendances), generateFilename("servicos_filtrados"));
      Alert.alert("Sucesso", "Relatório de serviços exportado com sucesso!");
    } catch {
      Alert.alert("Erro", "Não foi possível exportar o relatório");
    }
  };

  if (userLoading || (user && isAdmin && loading)) {
    return <ThemedView style={[styles.container, { backgroundColor }]}><View style={styles.loadingContainer}><ActivityIndicator size="large" color={tintColor} /></View></ThemedView>;
  }

  if (!user) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}> 
        <ScrollView contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 20, paddingBottom: Math.max(insets.bottom, 20) + 20 }}>
          <View style={styles.header}><ThemedText type="title">Relatório de Produtividade</ThemedText><ThemedText style={styles.subtitle}>Área protegida para análise operacional</ThemedText></View>
          <AccessRequiredCard />
        </ScrollView>
      </ThemedView>
    );
  }

  if (!isAdmin) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}> 
        <ScrollView contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 20, paddingBottom: Math.max(insets.bottom, 20) + 20 }}>
          <View style={styles.header}><ThemedText type="title">Relatório de Produtividade</ThemedText><ThemedText style={styles.subtitle}>Área reservada à administração do sistema</ThemedText></View>
          <AccessRequiredCard title="Somente administradores" description="Relatórios gerenciais e exportações avançadas exigem perfil de administrador." />
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 20) + 20, paddingBottom: Math.max(insets.bottom, 20) + 20 }]}>
        <View style={styles.header}>
          <ThemedText type="title">Relatório de Produtividade</ThemedText>
          <ThemedText style={styles.subtitle}>Análise em tempo real do desempenho</ThemedText>
        </View>

        <View style={styles.filterSection}>
          <ThemedText style={styles.filterTitle}>Filtrar por período</ThemedText>
          <View style={styles.filterRow}>
            <View style={styles.filterInput}><ThemedText style={styles.filterLabel}>Data Inicial</ThemedText><TextInput style={styles.input} placeholder="YYYY-MM-DD" value={startDate} onChangeText={setStartDate} /></View>
            <View style={styles.filterInput}><ThemedText style={styles.filterLabel}>Hora Inicial</ThemedText><TextInput style={styles.input} placeholder="HH:MM" value={startTime} onChangeText={setStartTime} /></View>
          </View>
          <View style={styles.filterRow}>
            <View style={styles.filterInput}><ThemedText style={styles.filterLabel}>Data Final</ThemedText><TextInput style={styles.input} placeholder="YYYY-MM-DD" value={endDate} onChangeText={setEndDate} /></View>
            <View style={styles.filterInput}><ThemedText style={styles.filterLabel}>Hora Final</ThemedText><TextInput style={styles.input} placeholder="HH:MM" value={endTime} onChangeText={setEndTime} /></View>
          </View>
          <ThemedText style={styles.filterInfo}>Mostrando {filteredAttendances.length} atendimentos no período selecionado</ThemedText>
        </View>

        <View style={styles.metricsGrid}>
          {metrics.map((metric) => (
            <View key={metric.title} style={[styles.metricCard, { backgroundColor: cardBackground, borderLeftColor: metric.color }]}>
              <View style={styles.metricHeader}><ThemedText style={styles.metricIcon}>{metric.icon}</ThemedText><ThemedText style={styles.metricTitle}>{metric.title}</ThemedText></View>
              <ThemedText style={[styles.metricValue, { color: metric.color }]}>{metric.value}</ThemedText>
              {metric.subtitle ? <ThemedText style={styles.metricSubtitle}>{metric.subtitle}</ThemedText> : null}
            </View>
          ))}
        </View>

        <View style={[styles.stageSurface, { backgroundColor: cardBackground }]}> 
          <ThemedText type="subtitle" style={styles.stageTitle}>Tempos reais por etapa</ThemedText>
          <View style={styles.stageGrid}>
            {stageMetrics.map((metric) => (
              <View key={metric.title} style={styles.stageCard}>
                <ThemedText style={styles.stageCardLabel}>{metric.icon} {metric.title}</ThemedText>
                <ThemedText style={[styles.stageCardValue, { color: metric.color }]}>{metric.value}</ThemedText>
                {metric.subtitle ? <ThemedText style={styles.stageCardSubtitle}>{metric.subtitle}</ThemedText> : null}
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.exportSection, { marginTop: 0 }]}>
          <ThemedText type="subtitle" style={styles.exportTitle}>Exportar relatórios</ThemedText>
          <View style={styles.exportButtons}>
            <Pressable style={[styles.exportButton, { backgroundColor: tintColor }]} onPress={handleExportAttendances}><ThemedText style={styles.exportButtonText}>Atendimentos</ThemedText></Pressable>
            <Pressable style={[styles.exportButton, { backgroundColor: tintColor }]} onPress={handleExportProductivity}><ThemedText style={styles.exportButtonText}>Produtividade</ThemedText></Pressable>
            <Pressable style={[styles.exportButton, { backgroundColor: tintColor }]} onPress={handleExportServiceType}><ThemedText style={styles.exportButtonText}>Serviço</ThemedText></Pressable>
          </View>
        </View>

        <View style={[styles.summarySection, { backgroundColor: cardBackground }]}>
          <ThemedText type="subtitle" style={styles.summaryTitle}>Resumo do período</ThemedText>
          <View style={styles.summaryRow}><ThemedText style={styles.summaryLabel}>Atendimentos processados</ThemedText><ThemedText style={[styles.summaryValue, { color: tintColor }]}>{totals.total}</ThemedText></View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}><ThemedText style={styles.summaryLabel}>Taxa de conclusão</ThemedText><ThemedText style={[styles.summaryValue, { color: totals.completionRate >= 80 ? "#00C853" : totals.completionRate > 0 ? "#FFA500" : "#999" }]}>{totals.completionRate}%</ThemedText></View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}><ThemedText style={styles.summaryLabel}>Concluídos medidos</ThemedText><ThemedText style={styles.summaryValue}>{operationalMetrics?.completedMeasuredCount ?? 0}</ThemedText></View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}><ThemedText style={styles.summaryLabel}>Distribuição de serviço</ThemedText><ThemedText style={styles.summaryValue}>🔧 {totals.tireCount} | ⚠️ {totals.correctiveCount} | ✓ {totals.preventiveCount}</ThemedText></View>
        </View>

        <View style={[styles.criticalSurface, { backgroundColor: cardBackground }]}> 
          <ThemedText type="subtitle" style={styles.criticalTitle}>Gargalos e fila em risco</ThemedText>
          <ThemedText style={styles.criticalSubtitle}>
            Chegada {operationalMetrics?.criticalByStatus.arrival ?? 0} · Aguardando {operationalMetrics?.criticalByStatus.waiting ?? 0} · Em atendimento {operationalMetrics?.criticalByStatus.in_service ?? 0}
          </ThemedText>

          {operationalMetrics?.criticalAttendances?.length ? (
            operationalMetrics.criticalAttendances.map((item) => (
              <View key={item.attendanceId} style={[styles.criticalItem, { borderColor }]}> 
                <View style={styles.criticalItemHeader}>
                  <View>
                    <ThemedText style={styles.criticalPlate}>{item.licensePlate}</ThemedText>
                    <ThemedText style={styles.criticalVehicle}>{item.vehicleModel}</ThemedText>
                  </View>
                  <View style={[styles.criticalBadge, { backgroundColor: item.severity === "critical" ? "rgba(179,38,30,0.12)" : "rgba(181,71,8,0.12)" }]}>
                    <ThemedText style={[styles.criticalBadgeText, { color: item.severity === "critical" ? "#B3261E" : "#B54708" }]}>{CRITICAL_QUEUE_SEVERITY_LABELS[item.severity]}</ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.criticalDetails}>{STATUS_LABELS[item.status]} há {item.stageDurationMinutes} min · alvo {item.thresholdMinutes} min</ThemedText>
              </View>
            ))
          ) : (
            <View style={[styles.noCriticalSurface, { borderColor }]}> 
              <ThemedText style={styles.noCriticalText}>Nenhum atendimento acima do tempo alvo neste período filtrado.</ThemedText>
            </View>
          )}
        </View>

        <View style={[styles.notificationSurface, { backgroundColor: cardBackground }]}> 
          <ThemedText type="subtitle" style={styles.notificationTitle}>Saúde das notificações</ThemedText>
          <View style={styles.notificationGrid}>
            {notificationCards.map((metric) => (
              <View key={metric.title} style={styles.notificationCard}>
                <ThemedText style={styles.notificationCardLabel}>{metric.icon} {metric.title}</ThemedText>
                <ThemedText style={[styles.notificationCardValue, { color: metric.color }]}>{metric.value}</ThemedText>
                {metric.subtitle ? <ThemedText style={styles.notificationCardSubtitle}>{metric.subtitle}</ThemedText> : null}
              </View>
            ))}
          </View>

          <ThemedText style={styles.notificationFailuresTitle}>Falhas recentes</ThemedText>
          {notificationHealth?.latestFailures?.length ? (
            notificationHealth.latestFailures.map((log) => (
              <View key={log.id} style={[styles.failureItem, { borderColor }]}> 
                <View style={styles.failureHeader}>
                  <View>
                    <ThemedText style={styles.failureTitle}>Atendimento #{log.attendanceId} · {STATUS_LABELS[log.status]}</ThemedText>
                    <ThemedText style={styles.failureMeta}>{log.phoneNumber || "Sem telefone"} · {formatLogDate(log.createdAt)}</ThemedText>
                  </View>
                  <View style={styles.failureBadge}><ThemedText style={styles.failureBadgeText}>Falha</ThemedText></View>
                </View>
                <ThemedText style={styles.failureMessage}>{log.errorMessage || "Erro não informado pelo provedor"}</ThemedText>
              </View>
            ))
          ) : (
            <View style={[styles.noCriticalSurface, { borderColor }]}> 
              <ThemedText style={styles.noCriticalText}>Nenhuma falha de notificação registrada neste período.</ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  header: { marginBottom: 32, paddingHorizontal: 20 },
  subtitle: { fontSize: 16, opacity: 0.7, marginTop: 8 },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  metricCard: { width: (SCREEN_WIDTH - 64) / 2, borderLeftWidth: 4, borderRadius: 12, padding: 16 },
  metricHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  metricIcon: { marginRight: 8, fontSize: 24 },
  metricTitle: { fontSize: 12, opacity: 0.6, flex: 1 },
  metricValue: { fontSize: 28, fontWeight: "700", marginBottom: 4 },
  metricSubtitle: { fontSize: 11, opacity: 0.5 },
  stageSurface: { borderRadius: 16, padding: 20, marginBottom: 20 },
  stageTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  stageGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  stageCard: { width: (SCREEN_WIDTH - 76) / 2, backgroundColor: "rgba(0,0,0,0.03)", borderRadius: 14, padding: 14 },
  stageCardLabel: { fontSize: 12, opacity: 0.65, marginBottom: 8, fontWeight: "700" },
  stageCardValue: { fontSize: 22, fontWeight: "800", marginBottom: 6 },
  stageCardSubtitle: { fontSize: 11, opacity: 0.6, lineHeight: 17 },
  summarySection: { borderRadius: 16, padding: 20, marginBottom: 20 },
  summaryTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  summaryLabel: { fontSize: 14, opacity: 0.7, flex: 1, marginRight: 12 },
  summaryValue: { fontSize: 16, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "rgba(0, 0, 0, 0.1)" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  exportSection: { borderRadius: 16, padding: 20, marginBottom: 20, backgroundColor: "rgba(0, 82, 163, 0.05)" },
  exportTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  exportButtons: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  exportButton: { flex: 1, minWidth: 100, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: "center" },
  exportButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  filterSection: { borderRadius: 16, padding: 20, marginBottom: 24, backgroundColor: "rgba(0, 82, 163, 0.05)" },
  filterTitle: { fontSize: 16, fontWeight: "600", marginBottom: 16 },
  filterRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  filterInput: { flex: 1 },
  filterLabel: { fontSize: 12, opacity: 0.7, marginBottom: 6, fontWeight: "500" },
  input: { borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.2)", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#333" },
  filterInfo: { fontSize: 13, opacity: 0.7, marginTop: 12, fontWeight: "500" },
  criticalSurface: { borderRadius: 16, padding: 20, marginBottom: 20 },
  criticalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 6 },
  criticalSubtitle: { fontSize: 13, opacity: 0.7, marginBottom: 14 },
  criticalItem: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 },
  criticalItemHeader: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginBottom: 6, alignItems: "center" },
  criticalPlate: { fontSize: 16, fontWeight: "800" },
  criticalVehicle: { fontSize: 12, opacity: 0.66 },
  criticalBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  criticalBadgeText: { fontSize: 11, fontWeight: "800" },
  criticalDetails: { fontSize: 13, lineHeight: 20 },
  noCriticalSurface: { borderWidth: 1, borderRadius: 14, padding: 14 },
  noCriticalText: { fontSize: 13, opacity: 0.72 },
  notificationSurface: { borderRadius: 16, padding: 20, marginBottom: 20 },
  notificationTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  notificationGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 18 },
  notificationCard: { width: (SCREEN_WIDTH - 76) / 3, minWidth: 180, backgroundColor: "rgba(0,0,0,0.03)", borderRadius: 14, padding: 14 },
  notificationCardLabel: { fontSize: 12, opacity: 0.66, marginBottom: 8, fontWeight: "700" },
  notificationCardValue: { fontSize: 24, fontWeight: "800", marginBottom: 6 },
  notificationCardSubtitle: { fontSize: 11, opacity: 0.6, lineHeight: 17 },
  notificationFailuresTitle: { fontSize: 15, fontWeight: "800", marginBottom: 10 },
  failureItem: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 },
  failureHeader: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginBottom: 6, alignItems: "center" },
  failureTitle: { fontSize: 14, fontWeight: "800" },
  failureMeta: { fontSize: 12, opacity: 0.66 },
  failureBadge: { backgroundColor: "rgba(179,38,30,0.12)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  failureBadgeText: { fontSize: 11, fontWeight: "800", color: "#B3261E" },
  failureMessage: { fontSize: 13, lineHeight: 20 },
});
