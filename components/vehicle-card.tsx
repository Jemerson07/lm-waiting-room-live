import { StyleSheet, View, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { StatusProgressTrack } from "@/components/status-progress-track";
import { ThemedText } from "./themed-text";
import type { Attendance } from "@/types/attendance";
import { STATUS_LABELS, SERVICE_TYPE_LABELS, SERVICE_TYPE_ICONS } from "@/types/attendance";
import { Colors } from "@/constants/theme";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface VehicleCardProps {
  attendance: Attendance;
  showAnimation?: boolean;
}

function toTimestamp(value: string | number | Date): number {
  if (typeof value === "number") return value;
  if (value instanceof Date) return value.getTime();
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : new Date(value).getTime();
}

export function VehicleCard({ attendance, showAnimation = false }: VehicleCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const glowOpacity = useSharedValue(showAnimation ? 0.45 : 0.22);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 450 });

    if (showAnimation) {
      scale.value = withRepeat(
        withSequence(withTiming(1.015, { duration: 1100 }), withTiming(1, { duration: 1100 })),
        -1,
        false,
      );
      glowOpacity.value = withRepeat(
        withSequence(withTiming(0.72, { duration: 1100 }), withTiming(0.30, { duration: 1100 })),
        -1,
        false,
      );
    } else {
      glowOpacity.value = withTiming(0.22, { duration: 400 });
    }
  }, [glowOpacity, opacity, scale, showAnimation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const getStatusColor = (status: string) => {
    const colorScheme = "light";
    const statusKey = `status${status.charAt(0).toUpperCase() + status.slice(1).replace(/_./g, (m: string) => m[1].toUpperCase())}` as keyof typeof Colors.light;
    return Colors[colorScheme][statusKey] as string;
  };

  const statusColor = getStatusColor(attendance.status);
  const updatedLabel = new Date(toTimestamp(attendance.updatedAt)).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <Animated.View style={[styles.glowLayer, { backgroundColor: statusColor }, glowStyle]} />
      <LinearGradient
        colors={["rgba(3, 19, 34, 0.88)", "rgba(7, 29, 51, 0.78)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.surface}
      >
        <View style={styles.topAccentRow}>
          <View style={styles.statusLine}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <ThemedText style={styles.statusLineText}>{STATUS_LABELS[attendance.status]}</ThemedText>
          </View>
          <ThemedText style={styles.updatedText}>Atualizado às {updatedLabel}</ThemedText>
        </View>

        <View style={styles.header}>
          <View style={styles.mainInfo}>
            <ThemedText style={[styles.licensePlate, { color: statusColor }]}>
              {attendance.licensePlate}
            </ThemedText>
            <ThemedText style={styles.vehicleModel}>{attendance.vehicleModel}</ThemedText>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <ThemedText style={styles.statusText}>{STATUS_LABELS[attendance.status]}</ThemedText>
          </View>
        </View>

        <View style={styles.progressWrapper}>
          <StatusProgressTrack status={attendance.status} accentColor={statusColor} compact lightText />
        </View>

        <View style={styles.metaRow}>
          <View style={styles.serviceTypeBadge}>
            <ThemedText style={styles.serviceTypeText}>
              {SERVICE_TYPE_ICONS[attendance.serviceType]} {SERVICE_TYPE_LABELS[attendance.serviceType]}
            </ThemedText>
          </View>

          {attendance.customerName ? (
            <View style={styles.customerBadge}>
              <ThemedText style={styles.customerName}>Cliente: {attendance.customerName}</ThemedText>
            </View>
          ) : null}
        </View>

        <View style={styles.bottomInfoRow}>
          <View style={styles.infoChip}>
            <ThemedText style={styles.infoChipLabel}>Leitura rápida</ThemedText>
            <ThemedText style={styles.infoChipText}>
              {attendance.status === "arrival"
                ? "Entrada no fluxo"
                : attendance.status === "waiting"
                  ? "Fila em andamento"
                  : "Manutenção ativa"}
            </ThemedText>
          </View>

          {showAnimation ? <View style={[styles.pulseBar, { backgroundColor: statusColor }]} /> : null}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  glowLayer: {
    position: "absolute",
    top: 8,
    left: 26,
    right: 26,
    bottom: 8,
    borderRadius: 24,
  },
  surface: {
    borderRadius: 24,
    marginHorizontal: 20,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 6,
    minHeight: SCREEN_WIDTH > 768 ? 168 : 142,
  },
  topAccentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  statusLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusLineText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  updatedText: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 11,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  mainInfo: {
    flex: 1,
  },
  licensePlate: {
    fontSize: SCREEN_WIDTH > 768 ? 30 : 25,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 8,
  },
  vehicleModel: {
    fontSize: SCREEN_WIDTH > 768 ? 20 : 17,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  progressWrapper: { marginTop: 14, marginBottom: 2 },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
    alignItems: "center",
  },
  serviceTypeBadge: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  serviceTypeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E6F0FF",
  },
  customerBadge: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  customerName: {
    fontSize: 13,
    color: "rgba(255,255,255,0.80)",
    fontWeight: "600",
  },
  bottomInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
  infoChip: {
    flexShrink: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  infoChipLabel: {
    color: "rgba(255,255,255,0.60)",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 3,
  },
  infoChipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  pulseBar: {
    flex: 1,
    height: 5,
    borderRadius: 999,
  },
});
