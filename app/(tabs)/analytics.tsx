import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAttendances } from "@/hooks/use-attendances";
import type { AttendanceStatus } from "@/types/attendance";
import { STATUS_LABELS, SERVICE_TYPE_LABELS } from "@/types/attendance";
import {
  exportAttendancesToCSV,
  exportProductivityReportToCSV,
  exportServiceTypeReportToCSV,
  downloadCSV,
  generateFilename,
} from "@/lib/csv-export";
import { Alert, Pressable } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface MetricCard {
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
  icon: string;
}

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor({}, "cardBackground");

  const { attendances, loading } = useAttendances();
  const [metrics, setMetrics] = useState<MetricCard[]>([]);

  const handleExportAttendances = async () => {
    try {
      const csv = exportAttendancesToCSV(attendances);
      const filename = generateFilename("atendimentos");
      await downloadCSV(csv, filename);
      Alert.alert("Sucesso", "Relatório de atendimentos exportado com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível exportar o relatório");
    }
  };

  const handleExportProductivity = async () => {
    try {
      const csv = exportProductivityReportToCSV(attendances);
      const filename = generateFilename("produtividade");
      await downloadCSV(csv, filename);
      Alert.alert("Sucesso", "Relatório de produtividade exportado com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível exportar o relatório");
    }
  };

  const handleExportServiceType = async () => {
    try {
      const csv = exportServiceTypeReportToCSV(attendances);
      const filename = generateFilename("servicos");
      await downloadCSV(csv, filename);
      Alert.alert("Sucesso", "Relatório de serviços exportado com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível exportar o relatório");
    }
  };

  useEffect(() => {
    calculateMetrics();
  }, [attendances]);

  const calculateMetrics = () => {
    const total = attendances.length;
    const completed = attendances.filter((a) => a.status === "completed").length;
    const inService = attendances.filter((a) => a.status === "in_service").length;
    const waiting = attendances.filter((a) => a.status === "waiting").length;

    // Calcular tempo médio de atendimento
    const completedWithTime = attendances.filter((a) => a.status === "completed");
    const avgTime =
      completedWithTime.length > 0
        ? Math.round(
            completedWithTime.reduce((sum, a) => {
              const start = new Date(a.createdAt).getTime();
              const end = new Date().getTime();
              return sum + (end - start);
            }, 0) / completedWithTime.length / 60000
          )
        : 0;

    // Contar por tipo de serviço
    const tireCount = attendances.filter((a) => a.serviceType === "tire").length;
    const correctiveCount = attendances.filter(
      (a) => a.serviceType === "corrective"
    ).length;
    const preventiveCount = attendances.filter(
      (a) => a.serviceType === "preventive"
    ).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    setMetrics([
      {
        title: "Total de Atendimentos",
        value: total,
        color: tintColor,
        icon: "📊",
      },
      {
        title: "Concluídos",
        value: completed,
        subtitle: `${completionRate}% de conclusão`,
        color: "#00C853",
        icon: "✓",
      },
      {
        title: "Em Atendimento",
        value: inService,
        color: "#FF6B00",
        icon: "⚙️",
      },
      {
        title: "Aguardando",
        value: waiting,
        color: "#FFA500",
        icon: "⏳",
      },
      {
        title: "Tempo Médio",
        value: `${avgTime}min`,
        subtitle: "Atendimentos concluídos",
        color: "#0052A3",
        icon: "⏱️",
      },
      {
        title: "Pneu",
        value: tireCount,
        subtitle: `${total > 0 ? Math.round((tireCount / total) * 100) : 0}% do total`,
        color: "#0052A3",
        icon: "🔧",
      },
      {
        title: "Corretiva",
        value: correctiveCount,
        subtitle: `${total > 0 ? Math.round((correctiveCount / total) * 100) : 0}% do total`,
        color: "#FF6B00",
        icon: "⚠️",
      },
      {
        title: "Preventiva",
        value: preventiveCount,
        subtitle: `${total > 0 ? Math.round((preventiveCount / total) * 100) : 0}% do total`,
        color: "#00C853",
        icon: "✓",
      },
    ]);
  };

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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 20) + 20,
            paddingBottom: Math.max(insets.bottom, 20) + 20,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">Relatório de Produtividade</ThemedText>
          <ThemedText style={styles.subtitle}>
            Análise em tempo real do desempenho
          </ThemedText>
        </View>

        {/* Métricas em Grid */}
        <View style={styles.metricsGrid}>
          {metrics.map((metric, index) => (
            <View
              key={index}
              style={[
                styles.metricCard,
                {
                  backgroundColor: cardBackground,
                  borderLeftColor: metric.color,
                },
              ]}
            >
              <View style={styles.metricHeader}>
                <ThemedText style={[styles.metricIcon, { fontSize: 24 }]}>
                  {metric.icon}
                </ThemedText>
                <ThemedText style={styles.metricTitle}>{metric.title}</ThemedText>
              </View>
              <ThemedText style={[styles.metricValue, { color: metric.color }]}>
                {metric.value}
              </ThemedText>
              {metric.subtitle && (
                <ThemedText style={styles.metricSubtitle}>
                  {metric.subtitle}
                </ThemedText>
              )}
            </View>
          ))}
        </View>

        {/* Botões de Exportação */}
        <View style={styles.exportSection}>
          <ThemedText type="subtitle" style={styles.exportTitle}>
            📥 Exportar Relatórios
          </ThemedText>
          <View style={styles.exportButtons}>
            <Pressable
              style={[styles.exportButton, { backgroundColor: tintColor }]}
              onPress={handleExportAttendances}
            >
              <ThemedText style={styles.exportButtonText}>Atendimentos</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.exportButton, { backgroundColor: tintColor }]}
              onPress={handleExportProductivity}
            >
              <ThemedText style={styles.exportButtonText}>Produtividade</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.exportButton, { backgroundColor: tintColor }]}
              onPress={handleExportServiceType}
            >
              <ThemedText style={styles.exportButtonText}>Serviços</ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Resumo */}
        <View style={[styles.summarySection, { backgroundColor: cardBackground }]}>
          <ThemedText type="subtitle" style={styles.summaryTitle}>
            📈 Resumo do Dia
          </ThemedText>

          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>
              Atendimentos Processados
            </ThemedText>
            <ThemedText style={[styles.summaryValue, { color: tintColor }]}>
              {attendances.length}
            </ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>
              Taxa de Conclusão
            </ThemedText>
            <ThemedText
              style={[
                styles.summaryValue,
                {
                  color:
                    attendances.length > 0
                      ? Math.round(
                          (attendances.filter((a) => a.status === "completed")
                            .length /
                            attendances.length) *
                            100
                        ) >= 80
                        ? "#00C853"
                        : "#FFA500"
                      : "#999",
                },
              ]}
            >
              {attendances.length > 0
                ? Math.round(
                    (attendances.filter((a) => a.status === "completed").length /
                      attendances.length) *
                      100
                  )
                : 0}
              %
            </ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>
              Distribuição de Serviços
            </ThemedText>
            <ThemedText style={styles.summaryValue}>
              🔧 {attendances.filter((a) => a.serviceType === "tire").length} | ⚠️{" "}
              {attendances.filter((a) => a.serviceType === "corrective").length} | ✓{" "}
              {attendances.filter((a) => a.serviceType === "preventive").length}
            </ThemedText>
          </View>
        </View>

        {/* Dicas */}
        <View style={[styles.tipsSection, { backgroundColor: cardBackground }]}>
          <ThemedText type="subtitle" style={styles.tipsTitle}>
            💡 Dicas de Otimização
          </ThemedText>

          {attendances.length === 0 && (
            <ThemedText style={styles.tipText}>
              Nenhum atendimento registrado ainda. Comece adicionando atendimentos
              no painel administrativo.
            </ThemedText>
          )}

          {attendances.filter((a) => a.status !== "completed").length > 3 && (
            <ThemedText style={styles.tipText}>
              ⚠️ Você tem muitos atendimentos em andamento. Considere aumentar a
              equipe ou acelerar o atendimento.
            </ThemedText>
          )}

          {attendances.length > 0 &&
            Math.round(
              (attendances.filter((a) => a.status === "completed").length /
                attendances.length) *
                100
            ) >= 80 && (
              <ThemedText style={styles.tipText}>
                ✓ Excelente desempenho! Taxa de conclusão acima de 80%.
              </ThemedText>
            )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 8,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: (SCREEN_WIDTH - 64) / 2,
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 16,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metricIcon: {
    marginRight: 8,
  },
  metricTitle: {
    fontSize: 12,
    opacity: 0.6,
    flex: 1,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 11,
    opacity: 0.5,
  },
  summarySection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  summaryLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  tipsSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    opacity: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  exportSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    backgroundColor: "rgba(0, 82, 163, 0.05)",
  },
  exportTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  exportButtons: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  exportButton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  exportButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
