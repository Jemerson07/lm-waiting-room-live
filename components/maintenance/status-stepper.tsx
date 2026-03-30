import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { MAINTENANCE_STATUS_LABELS } from "@/types/maintenance";

const STEPS = [
  "checkin",
  "diagnostico",
  "aprovacao",
  "em_servico",
  "teste_final",
  "finalizada",
  "entregue",
];

export function StatusStepper({ currentStatus }: { currentStatus: string }) {
  const currentIndex = Math.max(STEPS.indexOf(currentStatus), 0);

  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const done = index <= currentIndex;
        return (
          <View key={step} style={styles.stepWrap}>
            <View style={[styles.dot, done ? styles.dotActive : styles.dotInactive]} />
            <ThemedText style={[styles.label, done ? styles.labelActive : styles.labelInactive]}>
              {MAINTENANCE_STATUS_LABELS[step] ?? step}
            </ThemedText>
            {index < STEPS.length - 1 ? (
              <View style={[styles.line, index < currentIndex ? styles.lineActive : styles.lineInactive]} />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  stepWrap: {
    position: "relative",
    paddingLeft: 24,
    minHeight: 26,
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    left: 0,
    top: 4,
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  dotActive: {
    backgroundColor: "#22C55E",
  },
  dotInactive: {
    backgroundColor: "rgba(148, 163, 184, 0.6)",
  },
  line: {
    position: "absolute",
    left: 5,
    top: 18,
    width: 2,
    height: 18,
  },
  lineActive: {
    backgroundColor: "#22C55E",
  },
  lineInactive: {
    backgroundColor: "rgba(148, 163, 184, 0.35)",
  },
  label: {
    fontSize: 13,
  },
  labelActive: {
    opacity: 1,
    fontWeight: "700",
  },
  labelInactive: {
    opacity: 0.6,
  },
}
);