import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "./themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useCompanySettings } from "@/hooks/use-company-settings";

interface LiveHeaderProps {
  currentTime: string;
  totalAttendances: number;
  completedAttendances: number;
}

export function LiveHeader({
  currentTime,
  totalAttendances,
  completedAttendances,
}: LiveHeaderProps) {
  const tintColor = useThemeColor({}, "tint");
  const { settings } = useCompanySettings();

  const completionRate =
    totalAttendances > 0
      ? Math.round((completedAttendances / totalAttendances) * 100)
      : 0;

  return (
    <View style={styles.container}>
      {/* Logo e Informações da Empresa */}
      <View style={styles.headerTop}>
        <Image
          source={require("@/assets/images/logo-lm.png")}
          style={styles.logo}
          contentFit="contain"
        />
        <View style={styles.companyInfo}>
          <ThemedText type="defaultSemiBold" style={styles.companyName}>
            {settings?.companyName || "LM Soluções de Mobilidade"}
          </ThemedText>
          <ThemedText style={styles.companySubtitle}>
            Sistema de Sala de Espera
          </ThemedText>
        </View>
      </View>

      {/* Informações de Status */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <ThemedText style={styles.statLabel}>Horário</ThemedText>
          <ThemedText style={[styles.statValue, { color: tintColor }]}>
            {currentTime}
          </ThemedText>
        </View>

        <View style={styles.statCard}>
          <ThemedText style={styles.statLabel}>Atendimentos</ThemedText>
          <ThemedText style={[styles.statValue, { color: tintColor }]}>
            {totalAttendances}
          </ThemedText>
        </View>

        <View style={styles.statCard}>
          <ThemedText style={styles.statLabel}>Concluídos</ThemedText>
          <ThemedText style={[styles.statValue, { color: "#00C853" }]}>
            {completedAttendances}
          </ThemedText>
        </View>

        <View style={styles.statCard}>
          <ThemedText style={styles.statLabel}>Taxa</ThemedText>
          <ThemedText style={[styles.statValue, { color: "#0052A3" }]}>
            {completionRate}%
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 82, 163, 0.1)",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 100,
    height: 50,
    marginRight: 16,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  companySubtitle: {
    fontSize: 12,
    opacity: 0.6,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(0, 82, 163, 0.05)",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.6,
    marginBottom: 4,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
});
