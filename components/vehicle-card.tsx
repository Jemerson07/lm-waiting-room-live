import { StyleSheet, View } from "react-native";
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
import { STATUS_LABELS } from "@/types/attendance";
import { Colors } from "@/constants/theme";

interface VehicleCardProps {
  attendance: Attendance;
  showAnimation?: boolean;
}

export function VehicleCard({ attendance, showAnimation = false }: VehicleCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animação de entrada (fade in)
    opacity.value = withTiming(1, { duration: 500 });

    // Animação de pulso para veículos em manutenção
    if (showAnimation) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        false
      );
    }
  }, [showAnimation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getStatusColor = (status: string) => {
    const colorScheme = "light";
    const statusKey = `status${status.charAt(0).toUpperCase() + status.slice(1).replace(/_./g, (m: string) => m[1].toUpperCase())}` as keyof typeof Colors.light;
    return Colors[colorScheme][statusKey] as string;
  };

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <ThemedText style={[styles.licensePlate, { color: getStatusColor(attendance.status) }]}>
            {attendance.licensePlate}
          </ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(attendance.status) }]}>
            <ThemedText style={styles.statusText}>{STATUS_LABELS[attendance.status]}</ThemedText>
          </View>
        </View>

        <ThemedText style={styles.vehicleModel}>{attendance.vehicleModel}</ThemedText>

        {attendance.customerName && (
          <ThemedText style={styles.customerName}>Cliente: {attendance.customerName}</ThemedText>
        )}
      </View>

      {showAnimation && (
        <View style={[styles.pulseIndicator, { backgroundColor: getStatusColor(attendance.status) }]} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  licensePlate: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  vehicleModel: {
    fontSize: 18,
    color: "#11181C",
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    color: "#687076",
  },
  pulseIndicator: {
    height: 4,
    width: "100%",
  },
});
