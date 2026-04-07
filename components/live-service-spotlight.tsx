import { StyleSheet, View, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useEffect, useMemo } from "react";
import { StatusProgressTrack } from "@/components/status-progress-track";
import { ThemedText } from "@/components/themed-text";
import type { Attendance } from "@/types/attendance";
import {
  DELAY_REASON_LABELS,
  SERVICE_TYPE_ICONS,
  SERVICE_TYPE_LABELS,
  SLA_SEVERITY_LABELS,
  getAttendancePrioritySnapshot,
  getAttendanceSlaSnapshot,
} from "@/types/attendance";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface LiveServiceSpotlightProps {
  attendance: Attendance;
}

function toTimestamp(value: string | number | Date): number {
  if (typeof value === "number") return value;
  if (value instanceof Date) return value.getTime();
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : new Date(value).getTime();
}

function getElapsedMinutes(createdAt: string | number | Date): number {
  return Math.max(0, Math.round((Date.now() - toTimestamp(createdAt)) / 60000));
}

function getAccent(attendance: Attendance) {
  const sla = getAttendanceSlaSnapshot(attendance);
  const priority = getAttendancePrioritySnapshot(attendance);

  if (sla.severity === "breached") {
    return {
      liveLabel: "PRIORIDADE MÁXIMA",
      pill: "SLA ESTOURADO",
      dot: "#FF8A80",
      glow: "rgba(255, 82, 82, 0.30)",
      colors: ["rgba(95, 16, 32, 0.96)", "rgba(53, 15, 22, 0.94)", "rgba(18, 8, 12, 0.94)"],
    };
  }

  if (sla.severity === "risk" || priority.level === "attention") {
    return {
      liveLabel: "ATENÇÃO OPERACIONAL",
      pill: "SLA EM RISCO",
      dot: "#FFD180",
      glow: "rgba(255, 171, 64, 0.28)",
      colors: ["rgba(91, 58, 10, 0.95)", "rgba(51, 33, 7, 0.94)", "rgba(18, 11, 4, 0.94)"],
    };
  }

  return {
    liveLabel: attendance.status === "in_service" ? "EM ATENDIMENTO AGORA" : "FLUXO PRIORITÁRIO",
    pill: attendance.status === "in_service" ? "TV MODE" : "EM FILA",
    dot: "#00E5FF",
    glow: "rgba(0, 153, 255, 0.22)",
    colors: ["rgba(10, 48, 84, 0.96)", "rgba(5, 24, 43, 0.92)", "rgba(2, 10, 18, 0.92)"],
  };
}

export function LiveServiceSpotlight({ attendance }: LiveServiceSpotlightProps) {
  const glowOpacity = useSharedValue(0.55);
  const glowScale = useSharedValue(1);
  const liveDotOpacity = useSharedValue(1);
  const priority = useMemo(() => getAttendancePrioritySnapshot(attendance), [attendance]);
  const sla = useMemo(() => getAttendanceSlaSnapshot(attendance), [attendance]);
  const accent = useMemo(() => getAccent(attendance), [attendance]);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(withTiming(0.9, { duration: 1500, easing: Easing.inOut(Easing.sin) }), withTiming(0.45, { duration: 1500, easing: Easing.inOut(Easing.sin) })),
      -1,
      false,
    );
    glowScale.value = withRepeat(
      withSequence(withTiming(1.03, { duration: 1500, easing: Easing.inOut(Easing.sin) }), withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) })),
      -1,
      false,
    );
    liveDotOpacity.value = withRepeat(
      withSequence(withTiming(0.2, { duration: 700, easing: Easing.inOut(Easing.sin) }), withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) })),
      -1,
      false,
    );
  }, [glowOpacity, glowScale, liveDotOpacity]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value, transform: [{ scale: glowScale.value }] }));
  const dotStyle = useAnimatedStyle(() => ({ opacity: liveDotOpacity.value }));

  const elapsedMinutes = getElapsedMinutes(attendance.createdAt);
  const updatedLabel = new Date(toTimestamp(attendance.updatedAt)).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.glowLayer, { backgroundColor: accent.glow }, glowStyle]} />
      <LinearGradient colors={accent.colors as [string, string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.surface}>
        <View style={styles.topRow}>
          <View style={styles.liveRow}>
            <Animated.View style={[styles.liveDot, { backgroundColor: accent.dot }, dotStyle]} />
            <ThemedText style={styles.liveLabel}>{accent.liveLabel}</ThemedText>
          </View>
          <View style={styles.livePill}><ThemedText style={styles.livePillText}>{accent.pill}</ThemedText></View>
        </View>

        <View style={styles.mainRow}>
          <View style={styles.mainInfo}>
            <ThemedText style={styles.licensePlate}>{attendance.licensePlate}</ThemedText>
            <ThemedText style={styles.vehicleModel}>{attendance.vehicleModel}</ThemedText>
            <ThemedText style={styles.helperText}>{priority.reason}</ThemedText>
          </View>

          <View style={styles.rightColumn}>
            <View style={styles.metricCard}><ThemedText style={styles.metricLabel}>Tempo total</ThemedText><ThemedText style={styles.metricValue}>{elapsedMinutes} min</ThemedText></View>
            <View style={styles.metricCard}><ThemedText style={styles.metricLabel}>Status SLA</ThemedText><ThemedText style={styles.metricValue}>{SLA_SEVERITY_LABELS[sla.severity]}</ThemedText></View>
            <View style={styles.metricCard}><ThemedText style={styles.metricLabel}>Atualizado às</ThemedText><ThemedText style={styles.metricValue}>{updatedLabel}</ThemedText></View>
          </View>
        </View>

        <View style={styles.progressWrapper}><StatusProgressTrack status={attendance.status} accentColor={accent.dot} lightText /></View>

        <View style={styles.bottomRow}>
          <View style={styles.serviceTypeBadge}><ThemedText style={styles.serviceTypeText}>{SERVICE_TYPE_ICONS[attendance.serviceType]} {SERVICE_TYPE_LABELS[attendance.serviceType]}</ThemedText></View>
          <View style={styles.priorityBadge}><ThemedText style={styles.priorityText}>{priority.label}</ThemedText></View>
          {attendance.delayReason !== "none" ? <View style={styles.customerBadge}><ThemedText style={styles.customerText}>Motivo: {DELAY_REASON_LABELS[attendance.delayReason]}</ThemedText></View> : null}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 20, marginBottom: 22 },
  glowLayer: { position: "absolute", top: 10, left: 10, right: 10, bottom: 10, borderRadius: 30 },
  surface: { borderRadius: 30, paddingHorizontal: 22, paddingVertical: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.24, shadowRadius: 22, elevation: 8 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12 },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  liveDot: { width: 12, height: 12, borderRadius: 6 },
  liveLabel: { color: "#EAF8FF", fontSize: 13, fontWeight: "900", letterSpacing: 1 },
  livePill: { backgroundColor: "rgba(255,255,255,0.10)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  livePillText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800", letterSpacing: 0.6 },
  mainRow: { flexDirection: SCREEN_WIDTH > 900 ? "row" : "column", gap: 18, justifyContent: "space-between" },
  mainInfo: { flex: 1 },
  licensePlate: { color: "#FFFFFF", fontSize: SCREEN_WIDTH > 900 ? 44 : 34, fontWeight: "900", letterSpacing: 1.5, marginBottom: 10 },
  vehicleModel: { color: "#CFE8FF", fontSize: SCREEN_WIDTH > 900 ? 24 : 20, fontWeight: "700", marginBottom: 10 },
  helperText: { color: "rgba(255,255,255,0.82)", fontSize: 14, lineHeight: 22, maxWidth: 700 },
  rightColumn: { width: SCREEN_WIDTH > 900 ? 250 : "100%", gap: 10 },
  metricCard: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 18, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
  metricLabel: { color: "rgba(255,255,255,0.68)", fontSize: 12, fontWeight: "700", marginBottom: 6 },
  metricValue: { color: "#FFFFFF", fontSize: 22, fontWeight: "900" },
  progressWrapper: { marginTop: 18 },
  bottomRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 18 },
  serviceTypeBadge: { backgroundColor: "rgba(255,255,255,0.10)", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  serviceTypeText: { color: "#EAF8FF", fontSize: 13, fontWeight: "800" },
  priorityBadge: { backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  priorityText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  customerBadge: { backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  customerText: { color: "rgba(255,255,255,0.82)", fontSize: 13, fontWeight: "700" },
});
