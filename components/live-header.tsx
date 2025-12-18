import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "./themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useCompanySettings } from "@/hooks/use-company-settings";

interface LiveHeaderProps {
  totalAttendances: number;
  completedAttendances: number;
}

export function LiveHeader({
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

      {/* Informações de Status - Apenas na Admin */}
      {/* Removido da tela Live para melhor visibilidade do background */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 82, 163, 0.1)",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  logo: {
    width: 90,
    height: 45,
    marginRight: 12,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 1,
  },
  companySubtitle: {
    fontSize: 11,
    opacity: 0.6,
  },

});
