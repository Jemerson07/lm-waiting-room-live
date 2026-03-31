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
import { ThemedText } from "./themed-text";
import type { Attendance } from "@/types/attendance";
import { STATUS_LABELS, SERVICE_TYPE_LABELS, SERVICE_TYPE_ICONS } from "@/types/attendance";
import { Colors } from "@/constants/theme";

interface VehicleCardProps {
  attendance: Attendance;
  showAnimation?: boolean;
}

export function VehicleCard({ attendance, showAnimation = false }: VehicleCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 450 });

    if (showAnimation) {
      scale.value = withRepeat(
        withSequence(withTiming(1.015, { duration: 1100 }), withTiming(1, { duration: 1100 })),
        -1,
        false,
      );
    }
  }, [opacity, scale, showAnimation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getStatusColor = (status: string) => {
    const colorScheme = "light";
    const statusKey = `status${status.charAt(0).toUpperCase() + status.slice(1).replace(/_./g, (m: string) => m[1].toUpperCase())}` as keyof typeof Colors.light;
    return Colors[colorScheme][statusKey] as string;
  };

  const statusColor = getStatusColor(attendance.status);

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <LinearGradient
        colors={["rgba(3, 19, 34, 0.86)", "rgba(7, 29, 51, 0.74)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.surface}
      >
        <View style={styles.header}>
          <View>
            <ThemedText style={[styles.licensePlate, { color: statusColor }]}>
              {attendance.licensePlate}
            </ThemedText>
            <ThemedText style={styles.vehicleModel}>{attendance.vehicleModel}</ThemedText>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <ThemedText style={styles.statusText}>{STATUS_LABELS[attendance.status]}</ThemedText>
          </View>
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

        {showAnimation ? (
          <View style={[styles.pulseBar, { backgroundColor: statusColor }]} />
        ) : null}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  surface: {
    borderRadius: 22,
    marginHorizontal: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 6,
    minHeight: Dimensions.get("window").width > 768 ? 146 : 128,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  licensePlate: {
    fontSize: Dimensions.get("window").width > 768 ? 30 : 25,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 8,
  },
  vehicleModel: {
    fontSize: Dimensions.get("window").width > 768 ? 20 : 17,
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
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
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
  pulseBar: {
    height: 4,
    borderRadius: 999,
    marginTop: 16,
    width: "100%",
  },
});
