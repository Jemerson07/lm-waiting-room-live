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
import { STATUS_LABELS, getAttendancePrioritySnapshot, getAttendanceSlaSnapshot } from "@/types/attendance";

const { width } = Dimensions.get("window");
const STATUS_ORDER: AttendanceStatus[] = ["arrival", "waiting", "in_service"];
const RECENT_COMPLETED_LIMIT = 6;

function toTimestamp(value: string | number | Date): number {
  if (typeof value === "number") return value;
  if (value instanceof Date) return value.getTime();
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : new Date(value).getTime();
}

function sortAttendancesByPriority(items: Attendance[]) {
  return [...items].sort((a, b) => {
    const priorityDelta = getAttendancePrioritySnapshot(b).score - getAttendancePrioritySnapshot(a).score;
    if (priorityDelta !== 0) return priorityDelta;
    return toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt);
  });
}

export default function LiveScreen() {
  const insets = useSafeAreaInsets();
  const { attendances, loading, reload } = useAttendances({ scope: "live" });
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

  const grouped: Record<AttendanceStatus, Attendance[]> = useMemo(() => ({
    arrival: sortAttendancesByPriority(attendances.filter((a) => a.status === "arrival")),
    waiting: sortAttendancesByPriority(attendances.filter((a) => a.status === "waiting")),
    in_service: sortAttendancesByPriority(attendances.filter((a) => a.status === "in_service")),
    completed: [...attendances.filter((a) => a.status === "completed")].sort((a, b) => toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt)),
  }), [attendances]);

  const active = useMemo(() => sortAttendancesByPriority(STATUS_ORDER.flatMap((status) => grouped[status])), [grouped]);
  const spotlightAttendance: Attendance | null = active[0] || null;

  const sectionItems = useMemo(() => {
    if (!spotlightAttendance) return grouped;
    return {
      arrival: grouped.arrival.filter((attendance) => attendance.id !== spotlightAttendance.id),
      waiting: grouped.waiting.filter((attendance) => attendance.id !== spotlightAttendance.id),
      in_service: grouped.in_service.filter((attendance) => attendance.id !== spotlightAttendance.id),
      completed: grouped.completed,
    };
  }, [grouped, spotlightAttendance]);

  const recentCompleted = useMemo(() => grouped.completed.slice(0, RECENT_COMPLETED_LIMIT), [grouped.completed]);
  const criticalCount = useMemo(() => active.filter((attendance) => getAttendancePrioritySnapshot(attendance).level === "critical").length, [active]);
  const attentionCount = useMemo(() => active.filter((attendance) => getAttendancePrioritySnapshot(attendance).level === "attention").length, [active]);
  const breachedCount = useMemo(() => active.filter((attendance) => getAttendanceSlaSnapshot(attendance).severity === "breached").length, [active]);
  const riskCount = useMemo(() => active.filter((attendance) => getAttendanceSlaSnapshot(attendance).severity === "risk").length, [active]);

  const operationalBanner = useMemo(() => {
    if (!active.length) return null;
    if (breachedCount > 0) {
      return {
        title: "Ação imediata no fluxo",
        message: `${breachedCount} atendimento(s) já ultrapassaram o SLA total. A fila foi reordenada para destacar os casos mais urgentes.`,
        tone: "critical" as const,
      };
    }
    if (riskCount > 0 || attentionCount > 0) {
      return {
        title: "Atenção operacional ativa",
        message: `${Math.max(riskCount, attentionCount)} atendimento(s) estão perto do limite do SLA ou com atraso registrado.`,
        tone: "attention" as const,
      };
    }
    return {
      title: "Fluxo sob controle",
      message: "A fila está organizada por prioridade operacional e todos os atendimentos seguem dentro do ritmo esperado.",
      tone: "normal" as const,
    };
  }, [active.length, attentionCount, breachedCount, riskCount]);

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
        {operationalBanner ? (
          <LiveMotionBlock delay={80} intensity="soft">
            <View style={[styles.banner, operationalBanner.tone === "critical" ? styles.bannerCritical : operationalBanner.tone === "attention" ? styles.bannerAttention : styles.bannerNormal]}>
              <View style={styles.bannerRow}><ThemedText style={styles.bannerTitle}>{operationalBanner.title}</ThemedText><ThemedText style={styles.bannerCount}>{criticalCount > 0 ? `${criticalCount} crítico(s)` : `${active.length} ativo(s)`}</ThemedText></View>
              <ThemedText style={styles.bannerMessage}>{operationalBanner.message}</ThemedText>
            </View>
          </LiveMotionBlock>
        ) : null}

        {spotlightAttendance ? (
          <LiveMotionBlock delay={120} intensity="medium">
            <LiveServiceSpotlight attendance={spotlightAttendance} />
          </LiveMotionBlock>
        ) : null}

        {STATUS_ORDER.map((status, index) => {
          const items = sectionItems[status];
          if (!items.length) return null;
          const sectionPriority = items[0] ? getAttendancePrioritySnapshot(items[0]) : null;
          const sectionMessage = sectionPriority?.level === "critical"
            ? "Casos desta coluna exigem resposta rápida da equipe operacional."
            : sectionPriority?.level === "attention"
              ? "Fila acompanhada com atenção para evitar estouro de prazo."
              : status === "arrival"
                ? "Veículos recém-chegados no fluxo de atendimento."
                : status === "waiting"
                  ? "Aguardando avanço de fila ou liberação operacional."
                  : "Atendimentos em manutenção neste momento.";

          return (
            <LiveMotionBlock key={status} delay={220 + index * 110} intensity={status === "in_service" ? "medium" : "soft"}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeadingRow}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>{STATUS_LABELS[status]}</ThemedText>
                    <View style={styles.badge}><ThemedText style={styles.badgeText}>{items.length}</ThemedText></View>
                  </View>
                  <ThemedText style={styles.sectionMessage}>{sectionMessage}</ThemedText>
                </View>
                {items.map((attendance) => <VehicleCard key={attendance.id} attendance={attendance} showAnimation={status === "in_service" || getAttendancePrioritySnapshot(attendance).level === "critical"} />)}
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
            <ThemedText style={styles.footerSubtext}>Atualização automática a cada {refreshInterval} segundos • Prioridade baseada em SLA, atraso e estágio do fluxo</ThemedText>
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
  banner: { marginHorizontal: 20, marginBottom: 18, borderRadius: 22, paddingHorizontal: 18, paddingVertical: 16, borderWidth: 1 },
  bannerNormal: { backgroundColor: "rgba(4, 28, 48, 0.62)", borderColor: "rgba(255,255,255,0.08)" },
  bannerAttention: { backgroundColor: "rgba(70, 46, 6, 0.74)", borderColor: "rgba(255, 193, 7, 0.26)" },
  bannerCritical: { backgroundColor: "rgba(79, 18, 28, 0.78)", borderColor: "rgba(255, 82, 82, 0.28)" },
  bannerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 8 },
  bannerTitle: { fontSize: 18, fontWeight: "900", color: "#FFFFFF" },
  bannerCount: { fontSize: 12, fontWeight: "800", color: "rgba(255,255,255,0.82)" },
  bannerMessage: { fontSize: 13, lineHeight: 20, color: "rgba(255,255,255,0.82)" },
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
