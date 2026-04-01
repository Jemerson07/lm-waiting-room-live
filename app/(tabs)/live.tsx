import { StyleSheet, View, ScrollView, RefreshControl, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState, useCallback, useMemo } from "react";
import { LiveMotionBlock } from "@/components/live-motion-block";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { CompletedVehiclesPanel } from "@/components/completed-vehicles-panel";
import { LiveServiceSpotlight } from "@/components/live-service-spotlight";
import { NivusBackground } from "@/components/nivus-background";
import { VehicleCard } from "@/components/vehicle-card";
import { LiveHeader } from "@/components/live-header";
import { useAttendances } from "@/hooks/use-attendances";
import { useCompanySettings } from "@/hooks/use-company-settings";
import type { Attendance, AttendanceStatus } from "@/types/attendance";
import { STATUS_LABELS } from "@/types/attendance";

const { width } = Dimensions.get("window");
const STATUS_ORDER: AttendanceStatus[] = ["arrival", "waiting", "in_service"];
const RECENT_COMPLETED_LIMIT = 6;
const STATUS_MESSAGES: Record<AttendanceStatus, string> = {
  arrival: "Seu veículo chegou e já entrou no fluxo de atendimento.",
  waiting: "Estamos organizando a fila e em breve iniciaremos o serviço.",
  in_service: "Outros veículos em manutenção neste momento.",
  completed: "Atendimento concluído com sucesso. Obrigado pela confiança.",
};

function toTimestamp(value: string | number | Date): number {
  if (typeof value === "number") return value;
  if (value instanceof Date) return value.getTime();
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : new Date(value).getTime();
}

export default function LiveScreen() {
  const insets = useSafeAreaInsets();
  const { attendances, loading, reload } = useAttendances();
  const { settings } = useCompanySettings();
  const [refreshing, setRefreshing] = useState(false);
  const refreshInterval = Math.max(settings.autoRefreshInterval || 3, 1);

  useEffect(() => {
    const interval = setInterval(() => reload(), refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval, reload]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  const grouped: Record<AttendanceStatus, typeof attendances> = {
    arrival: attendances.filter((a) => a.status === "arrival"),
    waiting: attendances.filter((a) => a.status === "waiting"),
    in_service: attendances.filter((a) => a.status === "in_service"),
    completed: attendances.filter((a) => a.status === "completed"),
  };

  const sortedInService = useMemo(
    () => [...grouped.in_service].sort((a, b) => toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt)),
    [grouped.in_service],
  );

  const spotlightAttendance: Attendance | null = sortedInService[0] || null;
  const inServiceQueue = useMemo(
    () => sortedInService.filter((attendance) => attendance.id !== spotlightAttendance?.id),
    [sortedInService, spotlightAttendance],
  );

  const active = useMemo(() => STATUS_ORDER.flatMap((status) => grouped[status]), [grouped]);
  const recentCompleted = useMemo(
    () => [...grouped.completed].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, RECENT_COMPLETED_LIMIT),
    [grouped.completed],
  );

  return (
    <ThemedView style={styles.container}>
      <NivusBackground />
      <LiveMotionBlock delay={0} intensity="soft">
        <LiveHeader totalAttendances={attendances.length} completedAttendances={grouped.completed.length} />
      </LiveMotionBlock>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: 8, paddingBottom: Math.max(insets.bottom, 20) + 28 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />}
      >
        {spotlightAttendance ? (
          <LiveMotionBlock delay={120} intensity="medium">
            <LiveServiceSpotlight attendance={spotlightAttendance} />
          </LiveMotionBlock>
        ) : null}

        {STATUS_ORDER.map((status, index) => {
          const items = status === "in_service" ? inServiceQueue : grouped[status];
          if (!items.length) return null;
          return (
            <LiveMotionBlock key={status} delay={220 + index * 110} intensity={status === "in_service" ? "medium" : "soft"}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeadingRow}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>{STATUS_LABELS[status]}</ThemedText>
                    <View style={styles.badge}><ThemedText style={styles.badgeText}>{items.length}</ThemedText></View>
                  </View>
                  <ThemedText style={styles.sectionMessage}>{STATUS_MESSAGES[status]}</ThemedText>
                </View>
                {items.map((attendance) => <VehicleCard key={attendance.id} attendance={attendance} showAnimation={status === "in_service"} />)}
              </View>
            </LiveMotionBlock>
          );
        })}

        {!active.length && !loading && (
          <LiveMotionBlock delay={300} intensity="soft">
            <View style={styles.emptyState}>
              <ThemedText type="subtitle" style={styles.emptyTitle}>Nenhum atendimento ativo no momento</ThemedText>
              <ThemedText style={styles.emptyText}>Quando novos veículos entrarem na fila, eles aparecerão aqui automaticamente.</ThemedText>
            </View>
          </LiveMotionBlock>
        )}

        <LiveMotionBlock delay={420} intensity="soft">
          <CompletedVehiclesPanel items={recentCompleted} totalCompleted={grouped.completed.length} />
        </LiveMotionBlock>

        <LiveMotionBlock delay={520} intensity="soft">
          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>Sistema de Atendimento Veicular • {settings.companyName}</ThemedText>
            <ThemedText style={styles.footerSubtext}>Atualização automática a cada {refreshInterval} segundos</ThemedText>
          </View>
        </LiveMotionBlock>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: width > 768 ? 32 : 0, maxWidth: width > 1280 ? 1380 : "100%", alignSelf: "center", width: "100%" },
  section: { marginBottom: 22, backgroundColor: "rgba(4, 16, 29, 0.34)", borderRadius: 28, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingTop: 16, paddingBottom: 6, overflow: "hidden" },
  sectionHeader: { paddingHorizontal: 20, marginBottom: 14 },
  sectionHeadingRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  sectionTitle: { fontSize: width > 768 ? 28 : 22, fontWeight: "800", color: "#FFFFFF", marginRight: 10 },
  badge: { backgroundColor: "rgba(255,255,255,0.14)", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, minWidth: 34, alignItems: "center" },
  badgeText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  sectionMessage: { fontSize: 13, color: "rgba(255,255,255,0.78)", lineHeight: 20 },
  emptyState: { marginHorizontal: 20, marginTop: 16, backgroundColor: "rgba(3, 18, 33, 0.62)", borderRadius: 28, paddingHorizontal: 24, paddingVertical: 30, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", alignItems: "center" },
  emptyTitle: { fontSize: 22, color: "#FFFFFF", textAlign: "center", marginBottom: 8, fontWeight: "800" },
  emptyText: { fontSize: 14, color: "rgba(255,255,255,0.74)", textAlign: "center", lineHeight: 22, maxWidth: 560 },
  footer: { alignItems: "center", marginTop: 8, paddingHorizontal: 18, paddingBottom: 8 },
  footerText: { fontSize: 12, color: "rgba(255,255,255,0.72)", textAlign: "center", marginBottom: 4 },
  footerSubtext: { fontSize: 11, color: "rgba(255,255,255,0.54)", textAlign: "center" },
});
