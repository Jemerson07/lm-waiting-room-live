import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

interface AccessRequiredCardProps {
  title?: string;
  description?: string;
}

export function AccessRequiredCard({
  title = "Acesso protegido",
  description = "Faça login no ambiente administrativo para visualizar e operar esta área do sistema.",
}: AccessRequiredCardProps) {
  return (
    <ThemedView style={styles.wrapper}>
      <View style={styles.iconBadge}>
        <ThemedText style={styles.iconText}>🔒</ThemedText>
      </View>
      <ThemedText type="subtitle" style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.description}>{description}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "rgba(0, 82, 163, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(0, 82, 163, 0.12)",
    alignItems: "center",
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 82, 163, 0.10)",
    marginBottom: 12,
  },
  iconText: { fontSize: 22 },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.76,
    textAlign: "center",
    maxWidth: 520,
  },
});
