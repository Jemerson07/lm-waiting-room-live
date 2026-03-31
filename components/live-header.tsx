import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "./themed-text";
import { useCompanySettings } from "@/hooks/use-company-settings";

interface LiveHeaderProps {
  totalAttendances: number;
  completedAttendances: number;
}

export function LiveHeader({ totalAttendances, completedAttendances }: LiveHeaderProps) {
  const { settings } = useCompanySettings();
  const activeAttendances = Math.max(totalAttendances - completedAttendances, 0);

  return (
    <View style={styles.container}>
      <View style={styles.heroSurface}>
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <Image
              source={require("@/assets/images/logo-lm.png")}
              style={styles.logo}
              contentFit="contain"
            />
            <View style={styles.brandText}>
              <ThemedText style={styles.companyName}>
                {settings?.companyName || "LM Soluções de Mobilidade"}
              </ThemedText>
              <ThemedText style={styles.companySubtitle}>Sala de espera • monitoramento ao vivo</ThemedText>
            </View>
          </View>

          <View style={styles.liveBadge}>
            <ThemedText style={styles.liveBadgeText}>AO VIVO</ThemedText>
          </View>
        </View>

        <View style={styles.titleBlock}>
          <ThemedText style={styles.title}>Painel de Atendimento</ThemedText>
          <ThemedText style={styles.subtitle}>
            Acompanhe os veículos em tempo real com uma visualização mais limpa para TV, desktop e mobile.
          </ThemedText>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <ThemedText style={styles.metricValue}>{totalAttendances}</ThemedText>
            <ThemedText style={styles.metricLabel}>Total no dia</ThemedText>
          </View>

          <View style={styles.metricCard}>
            <ThemedText style={styles.metricValue}>{activeAttendances}</ThemedText>
            <ThemedText style={styles.metricLabel}>Em andamento</ThemedText>
          </View>

          <View style={styles.metricCard}>
            <ThemedText style={styles.metricValue}>{completedAttendances}</ThemedText>
            <ThemedText style={styles.metricLabel}>Concluídos</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  heroSurface: {
    backgroundColor: "rgba(3, 18, 33, 0.52)",
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  brandRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 104,
    height: 52,
    marginRight: 12,
  },
  brandText: {
    flex: 1,
  },
  companyName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  companySubtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
  },
  liveBadge: {
    backgroundColor: "rgba(0, 194, 133, 0.18)",
    borderColor: "rgba(0, 194, 133, 0.36)",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  liveBadgeText: {
    color: "#8DFFD0",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  titleBlock: {
    marginTop: 18,
    marginBottom: 18,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 780,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  metricCard: {
    minWidth: 120,
    flexGrow: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  metricValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  metricLabel: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 12,
    fontWeight: "600",
  },
});
