import { StyleSheet, View, ScrollView, RefreshControl, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState, useCallback } from "react";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { NivusBackground } from "@/components/nivus-background";
import { VehicleCard } from "@/components/vehicle-card";
import { LiveHeader } from "@/components/live-header";
import { useAttendances } from "@/hooks/use-attendances";
import { useCompanySettings } from "@/hooks/use-company-settings";
import type { AttendanceStatus } from "@/types/attendance";
import { STATUS_LABELS } from "@/types/attendance";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const STATUS_MESSAGES: Record<AttendanceStatus, string> = {
  arrival: "Seu veículo chegou e já entrou no fluxo de atendimento.",
  waiting: "Estamos organizando a fila e em breve iniciaremos o serviço.",
  in_service: "Seu veículo está em manutenção neste momento.",
  completed: "Atendimento concluído com sucesso. Obrigado pela confiança.",
};

const STATUS_ORDER: AttendanceStatus[] = ["arrival", "waiting", "in_service", "completed"];

export default function LiveScreen() {
  const insets = useSafeAreaInsets();
  const { attendances, loading, reload } = useAttendances();
  const { settings } = useCompanySettings();
  const [refreshing, setRefreshing] = useState(false);

  const refreshInterval = Math.max(settings.autoRefreshInterval || 3, 1);

  useEffect(() => {
    const interval = setInterval(() => {
      reload();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval, reload]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  const groupedAttendances: Record<AttendanceStatus, typeof attendances> = {
    arrival: attendances.filter((a) => a.status === "arrival"),
    waiting: attendances.filter((a) => a.status === "waiting"),
    in_service: attendances.filter((a) => a.status === "in_service"),
    completed: attendances.filter((a) => a.status === "completed"),
  };

  return (
    <ThemedView style={styles.container}>
      <NivusBackground />

      <LiveHeader
        totalAttendances={attendances.length}
        completedAttendances={groupedAttendances.completed.length}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: 8,
            paddingBottom: Math.max(insets.bottom, 20) + 28,
          },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />
        }
      >
        {STATUS_ORDER.map((status) => {
          const items = groupedAttendances[status];
          if (items.length === 0) return null;

          return (
            <View key={status} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeadingRow}>
                  <ThemedText type="subtitle" style={styles.sectionTitle}>
                    {STATUS_LABELS[status]}
                  </ThemedText>
                  <View style={styles.badge}>
                    <ThemedText style={styles.badgeText}>{items.length}</ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.sectionMessage}>{STATUS_MESSAGES[status]}</ThemedText>
              </View>

              {items.map((attendance) => (
                <VehicleCard
                  key={attendance.id}
                  attendance={attendance}
                  showAnimation={status === "in_service"}
                />
              ))}
            </View>
          );
        })}

        {attendances.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              Nenhum atendimento no momento
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              Quando novos veículos entrarem na fila, eles aparecerão aqui automaticamente.
            </ThemedText>
          </View>
        )}

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Sistema de Atendimento Veicular • {settings.companyName}
          </ThemedText>
          <ThemedText style={styles.footerSubtext}>
            Atualização automática a cada {refreshInterval} segundos
          </ThemedText>
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
    paddingHorizontal: SCREEN_WIDTH > 768 ? 32 : 0,
    maxWidth: SCREEN_WIDTH > 1280 ? 1380 : "100%",
    alignSelf: "center",
    width: "100%",
  },
  section: {
    marginBottom: 22,
    backgroundColor: "rgba(4, 16, 29, 0.34)",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingTop: 16,
    paddingBottom: 6,
    overflow: "hidden",
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: SCREEN_WIDTH > 768 ? 28 : 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginRight: 10,
  },
  badge: {
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    minWidth: 34,
    alignItems: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  sectionMessage: {
    fontSize: 13,
    color: "rgba(255,255,255,0.78)",
    lineHeight: 20,
  },
  emptyState: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: "rgba(3, 18, 33, 0.62)",
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 22,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "800",
  },
  emptyText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.74)",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 560,
  },
  footer: {
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.72)",
    textAlign: "center",
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    color: "rgba(255,255,255,0.54)",
    textAlign: "center",
  },
});
