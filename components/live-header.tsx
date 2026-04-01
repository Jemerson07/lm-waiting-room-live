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
  const completionRate = totalAttendances > 0 ? Math.round((completedAttendances / totalAttendances) * 100) : 0;
  const now = new Date();
  const clockLabel = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const dateLabel = now.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });

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

          <View style={styles.statusColumn}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <ThemedText style={styles.liveBadgeText}>AO VIVO</ThemedText>
            </View>
            <View style={styles.clockCard}>
              <ThemedText style={styles.clockTime}>{clockLabel}</ThemedText>
              <ThemedText style={styles.clockDate}>{dateLabel}</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.titleBlock}>
          <View style={styles.titleColumn}>
            <ThemedText style={styles.title}>Painel de Atendimento</ThemedText>
            <ThemedText style={styles.subtitle}>
              Acompanhe os veículos em tempo real com leitura otimizada para TV, desktop e mobile.
            </ThemedText>
          </View>

          <View style={styles.heroInfoPill}>
            <ThemedText style={styles.heroInfoPillValue}>{completionRate}%</ThemedText>
            <ThemedText style={styles.heroInfoPillLabel}>Taxa de conclusão</ThemedText>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <ThemedText style={styles.metricValue}>{totalAttendances}</ThemedText>
            <ThemedText style={styles.metricLabel}>Total no fluxo</ThemedText>
          </View>

          <View style={styles.metricCard}>
            <ThemedText style={styles.metricValue}>{activeAttendances}</ThemedText>
            <ThemedText style={styles.metricLabel}>Em andamento</ThemedText>
          </View>

          <View style={styles.metricCard}>
            <ThemedText style={styles.metricValue}>{completedAttendances}</ThemedText>
            <ThemedText style={styles.metricLabel}>Concluídos</ThemedText>
          </View>

          <View style={styles.metricCardWide}>
            <ThemedText style={styles.metricWideTitle}>Painel corporativo</ThemedText>
            <ThemedText style={styles.metricWideText}>
              Destaque principal do veículo em manutenção e fila secundária com leitura mais limpa para exibição contínua.
            </ThemedText>
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
    backgroundColor: "rgba(3, 18, 33, 0.58)",
    borderRadius: 30,
    paddingHorizontal: 22,
    paddingVertical: 22,
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
    alignItems: "flex-start",
    gap: 14,
  },
  brandRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 110,
    height: 56,
    marginRight: 12,
  },
  brandText: {
    flex: 1,
  },
  companyName: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 3,
  },
  companySubtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
  },
  statusColumn: {
    alignItems: "flex-end",
    gap: 10,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0, 194, 133, 0.18)",
    borderColor: "rgba(0, 194, 133, 0.36)",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#8DFFD0",
  },
  liveBadgeText: {
    color: "#8DFFD0",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  clockCard: {
    minWidth: 132,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "flex-end",
  },
  clockTime: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 3,
  },
  clockDate: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 11,
    textTransform: "capitalize",
  },
  titleBlock: {
    marginTop: 18,
    marginBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 16,
    flexWrap: "wrap",
  },
  titleColumn: {
    flex: 1,
    minWidth: 240,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 760,
  },
  heroInfoPill: {
    minWidth: 140,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  heroInfoPillValue: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 4,
  },
  heroInfoPillLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "600",
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
  metricCardWide: {
    minWidth: 220,
    flexGrow: 2,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  metricWideTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 6,
  },
  metricWideText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    lineHeight: 18,
  },
});
