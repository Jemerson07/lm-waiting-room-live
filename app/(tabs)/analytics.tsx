import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Alert,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo, useState } from "react";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAttendances } from "@/hooks/use-attendances";
import {
  exportAttendancesToCSV,
  exportProductivityReportToCSV,
  exportServiceTypeReportToCSV,
  downloadCSV,
  generateFilename,
} from "@/lib/csv-export";

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

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor({}, "cardBackground");

  const { attendances, loading } = useAttendances();
  const [startDate, setStartDate] = useState<string>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState<string>("00:00");
  const [endTime, setEndTime] = useState<string>("23:59");

  const filteredAttendances = useMemo(() => {
    const { start, end } = toDateTimeRange(startDate, startTime, endDate, endTime);
    return attendances.filter((att) => {
      const createdAt = new Date(att.createdAt);
      return createdAt >= start && createdAt <= end;
    });
  }, [attendances, startDate, startTime, endDate, endTime]);

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

    return {
      total,
      completed,
      active,
      inService,
      waiting,
      arrival,
      avgCompletedMinutes,
      avgActiveMinutes,
      tireCount,
      correctiveCount,
      preventiveCount,
      completionRate,
    };
  }, [filteredAttendances]);

  const metrics: MetricCard[] = useMemo(
    () => [
      { title: "Total no período", value: totals.total, color: tintColor, icon: "📊" },
      { title: "Concluí�os", value: totals.completed, subtitle: `${totals.completionRate}%`, color: "#00C853", icon: "✓" },
      { title: "Ativos", value: totals.active, subtitle: "Chegada + aguardando + em Atendimento", color: "#5C6BC0", icon: "📟" },
      { title: "Em Atendimento", value: totals.inService, color: "#FF6B00", icon: "⚙️" },
      { title: "Aguardando", value: totals.waiting, color: "#FFA000", icon: "⛳️" },
      { title: "Chegada", value: totals.arrival, color: "#0091EA", icon: "🚕"K
      { title: "Tempo médio concluído", value: `${totals.avgCompletedMinutes}min`, subtitle: "Criado até ultima atualização", color: "#0052A3", icon: "✅"},
      { title: "Tempo médio ativo", value: `${totals.avgActiveMinutes}min`, subtitle: "Tempo atual dos atendimentos abertos", color: "#7B1FA2", icon: "⟱️" },
      { title: "Pneu", value: totals.tireCount, subtitle: `${totals.total > 0 ? Math.round((totals.tireCount / totals.total) * 100) : 0}% do total`, color: "#0052A3", icon: "🔧"},
      { title: "Corretiva", value: totals.correctiveCount, subtitle: `${totals.total > 0 ? Math.round((totals.correctiveCount / totals.total) * 100) : 0}% do total`, color: "#FF6B00", icon: "➠️" },
      { title: "Preventiva", value: totals.preventiveCount, subtitle: `${totals.total > 0 ? Math.round((totals.preventiveCount / totals.total) * 100) : 0}% do total`, color: "#00C853", icon: "🛡️" },
    ],
    [totals, tintColor],
  );

  async function handleExportAttendances() {
    try {
      await downloadCSV(exportAttendancesToCSV(filteredAttendances), generateFilename("atendimentos_filtrados"));
      Alert.alert("Sucesso", "Relatório de atendimentos exportado com sucesso!");
    } catch {}
      Alert.alert("Erro", "Não foi possível exportar o relatório");
    }
  }

  async function handleExportProductivity() {
    try {
      await downloadCSV(exportProductivityReportToCSV(filteredAttendances), generateFilename("produtividade_filtrada"));
      Alert.alert("Sucesso", "Relatório de produtividade exportado com sucesso!");
    } catch {}
      Alert.alert("Erro", "Não foi possível exportar o relatório");
    }
  }

  async function handleExportServiceType() {
    try {
      await downloadCSV(exportServiceTypeReportToCSV(filteredAttendances), generateFilename("servicos_filtrados"));
      Alert.alert("Sucesso", "Relatório de serviços exportado com sucesso!");
    } catch {}
      Alert.alert("Erro", "Não foi possível exportar o relatório");
    }
  }

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
        </View>
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
          <ThemedText style={styles.filterTitle}>📕 Filtrar por Período</ThemedText>
          <View style={styles.filterRow}>
            <View style={styles.filterInput}>
              <ThemedText style={styles.filterLabel}>Data Inicial</ThemedText>
              <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={startDate} onChangeText={setStartDate} />
            </View>
            <View style={styles.filterInput}>
              <ThemedText style={styles.filterLabel}>Hora Inicial</ThemedText>
              <TextInput style={styles.input} placeholder="HH:MM" value={startTime} onChangeText={setStartTime} />
            </View>
          </View>
          <View style={styles.filterRow}>
            <View style={styles.filterInput}>
              <ThemedText style={styles.filterLabel}>Data Final</ThemedText>
              <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={endDate} onChangeText={setEndDate} />
            </View>
            <View style={styles.filterInput}>
              <ThemedText style={styles.filterLabel}>Hora Final</ThemedText>
              <TextInput style={styles.input} placeholder="HH:MM" value={endTime} onChangeText={setEndTime} />
            </View>
          </View>
          <ThemedText style={styles.filterInfo}>Mostrando {filteredAttendances.length} atendimentos no período selecionado</ThemedText>
        </View>

        <View style={styles.metricsGrid}>
          {metrics.map((metric, index) => (
            <View key={index} style={[styles.metricCard, { backgroundColor: cardBackground, borderLeftColor: metric.color }]}>
              <View style={styles.metricHeader}>
                <ThemedText style={styles.metricIcon}>{metric.icon}</ThemedText>
                <ThemedText style={styles.metricTitle}>{metric.title}</ThemedText>
              </View>
              <ThemedText style={[styles.metricValue, { color: metric.color }]}>{metric.value}</ThemedText>
              {metric.subtitle ? <ThemedText style={styles.metricSubtitle}>{metric.subtitle}</ThemedText> : null}
            </View>
          ))}
        </View>

        <View style={styles.exportSection}>
          <ThemedText type="subtitle" style={styles.exportTitle}>📥 Exportar Relatórios</ThemedText>
          <View style={styles.exportButtons}>
            <Pressable style={[styles.exportButton, { backgroundColor: tintColor }]} onPress={handleExportAttendances}>
              <ThemedText style={styles.exportButtonText}>Atendimentos</ThemedText>
            </Pressable>
            <Pressable style={[styles.exportButton, { backgroundColor: tintColor }]} onPress={handleExportProductivity}>
              <ThemedText style={styles.exportButtonText}>Produtividade</ThemedText>
            </Pressable>
            <Pressable style={[styles.exportButton, { backgroundColor: tintColor }]} onPress={handleExportServiceType}>
              <ThemedText style={styles.exportButtonText}>Serviço</ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={[styles.summarySection, { backgroundColor: cardBackground }]}>
          <ThemedText type="subtitle" style={styles.summaryTitle}>📈 Resumo do Período</ThemedText>
          <View style={styles.summaryRow}><ThemedText style={styles.summaryLabel}>Atendimentos processados</ThemedText><ThemedText style={[styles.summaryValue, { color: tintColor }]}>{totals.total}</ThemedText></View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}><ThemedText style={styles.summaryLabel}>Taxa de conclusão</ThemedText><ThemedText style={[styles.summaryValue, { color: totals.completionRate >= 80 ? "#00C853" : totals.completionRate > 0 ? "#FFA500" : "#999" }]}>{totals.completionRate}%</ThemedText></View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}><ThemedText style={styles.summaryLabel}>Tempo médio concluído</ThemedText><ThemedText style={styles.summaryValue}>{totals.avgCompletedMinutes} min</ThemedText></View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}><ThemedText style={styles.summaryLabel}>Tempo médio ativo</ThemedText><ThemedText style={styles.summaryValue}>{totals.avgActiveMinutes} min</ThemedText></View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}><ThemedText style={styles.summaryLabel}>Distribuição de serviço</ThemedText><ThemedText style={styles.summaryValue}>🔧 {totals.tireCount} | ⚠️ {totals.correctiveCount} | 🛡️ {totals.preventiveCount}</ThemedText></View>
        </View>

        <View style={[styles.tipsSection, { backgroundColor: cardBackground }]}>
          <ThemedText type="subtitle" style={styles.tipsTitle}>💡 Leitura rápida</ThemedText>
          {totals.total === 0 ? <ThemedText style={styles.tipText}>Nenhum atendimento encontrado no período selecionado.</ThemedText> : null}
          {totals.active > 3 ? <ThemedText style={styles.tipText}>⚠️ Há muitos atendimentos ativos no período. Vale revisar fila e capacidade operacional.</ThemedText> : null}
          {totals.completionRate >= 80 && totals.total > 0 ? <ThemedText style={styles.tipText}>✓ Excelente desempenho no período analizado. Taxa de conclusão acima de 80%.</ThemedText> : null}
          {totals.avgActiveMinutes > totals.avgCompletedMinutes && totals.completed > 0 ? <ThemedText style={styles.tipText}>⏱️ S tempo médio dos ativos já está acima do tempo médio dos concluídos. Pode haver gargalo em emandamento.</ThemedText> : null}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  header: { marginBottom: 32 },
  subtitle: { fontSize: 16, opacity: 0.7, marginTop: 8 },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  metricCard: {width: (SCREEN_WIDTH - 64) / 2, borderLeftWidth: 4, borderRadius: 12, padding: 16 },
  metricHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  metricIcon: { marginRight: 8, fontSize: 24 },
  metricTitle: { fontSize: 12, opacity: 0.6, flex: 1 },
  metricValue: { fontSize: 28, fontWeight: "700", marginBottom: 4 },
  metricSubtitle: { fontSize: 11, opacity: 0.5 },
  summarySection: { borderRadius: 16, padding: 20, marginBottom: 20 },
  summaryTitle: {fontSize: 18, fontWeight: "600", marginBottom: 16 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  summaryLabel: {fontSize: 14, opacity: 0.7, flex: 1, marginRight: 12 },
  summaryValue: { fontSize: 16, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "rgba(0, 0, 0, 0.1)" },
  tipsSection: { borderRadius: 16, padding: 20, marginBottom: 20 },
  tipsTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  tipText: { fontSize: 14, lineHeight: 20, marginBottom: 8, opacity: 0.8 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  exportSection: { borderRadius: 16, padding: 20, marginBottom: 20, backgroundColor: "rgba(0, 82, 163, 0.05)" },
  exportTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  exportButtons: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  exportButton: { flex: 1, minWidth: 100, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: "center" },
  exportButtonText: {color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  filterSection: { borderRadius: 16, padding: 20, marginBottom: 24, backgroundColor: "rgba(0, 82, 163, 0.05)" },
  filterTitle: { fontSize: 16, fontWeight: "600", marginBottom: 16 },
  filterRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  filterInput: {flex: 1 },
  filterLabel: {fontSize: 12, opacity: 0.7, marginBottom: 6, fontWeight: "500" },
  input: { borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.2)", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#333" },
  filterInfo: { fontSize: 13, opacity: 0.7, marginTop: 12, fontWeight: "500" },
});
