import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import type { AttendanceStatus } from "@/types/attendance";

const STATUS_STEPS: AttendanceStatus[] = ["arrival", "waiting", "in_service", "completed"];
const STATUS_STEP_LABELS: Record<AttendanceStatus, string> = {
  arrival: "Chegada",
  waiting: "Aguardando",
  in_service: "Em atendimento",
  completed: "Concluído",
};
const STATUS_ORDER: Record<AttendanceStatus, number> = {
  arrival: 0,
  waiting: 1,
  in_service: 2,
  completed: 3,
};

interface StatusProgressTrackProps {
  status: AttendanceStatus;
  accentColor: string;
  compact?: boolean;
  lightText?: boolean;
}

export function StatusProgressTrack({
  status,
  accentColor,
  compact = false,
  lightText = false,
}: StatusProgressTrackProps) {
  const currentIndex = STATUS_ORDER[status];

  return (
    <View style={[styles.wrapper, compact && styles.wrapperCompact]}>
      {STATUS_STEPS.map((step, index) => {
        const isDone = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const textColor = lightText ? "rgba(255,255,255,0.88)" : "#26415D";
        const mutedTextColor = lightText ? "rgba(255,255,255,0.52)" : "rgba(38, 65, 93, 0.52)";

        return (
          <View key={step} style={styles.stepItem}>
            <View style={styles.stepTopRow}>
              <View
                style={[
                  styles.stepDot,
                  compact && styles.stepDotCompact,
                  {
                    backgroundColor: isDone ? accentColor : lightText ? "rgba(255,255,255,0.16)" : "rgba(38, 65, 93, 0.12)",
                    borderColor: isCurrent ? accentColor : isDone ? accentColor : "transparent",
                  },
                ]}
              />
              {index < STATUS_STEPS.length - 1 ? (
                <View
                  style={[
                    styles.stepLine,
                    compact && styles.stepLineCompact,
                    {
                      backgroundColor: index < currentIndex
                        ? accentColor
                        : lightText
                          ? "rgba(255,255,255,0.16)"
                          : "rgba(38, 65, 93, 0.10)",
                    },
                  ]}
                />
              ) : null}
            </View>
            <ThemedText
              style={[
                styles.stepLabel,
                compact && styles.stepLabelCompact,
                { color: isDone ? textColor : mutedTextColor, fontWeight: isCurrent ? "800" : "600" },
              ]}
              numberOfLines={1}
            >
              {STATUS_STEP_LABELS[step]}
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  wrapperCompact: {
    gap: 6,
  },
  stepItem: {
    flex: 1,
  },
  stepTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  stepDotCompact: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepLine: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    marginLeft: 6,
  },
  stepLineCompact: {
    height: 3,
  },
  stepLabel: {
    fontSize: 11,
  },
  stepLabelCompact: {
    fontSize: 10,
  },
});
