import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState, useCallback } from "react";
import { Image } from "expo-image";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { NivusBackground } from "@/components/nivus-background";
import { VehicleCard } from "@/components/vehicle-card";
import { useAttendances } from "@/hooks/use-attendances";
import { useCompanySettings } from "@/hooks/use-company-settings";
import type { AttendanceStatus } from "@/types/attendance";
import { STATUS_LABELS } from "@/types/attendance";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const STATUS_MESSAGES: Record<AttendanceStatus, string> = {
  arrival: "Seu veículo chegou! Estamos preparando o atendimento",
  waiting: "Em breve iniciaremos o atendimento do seu veículo",
  in_service: "Seu veículo está sendo atendido agora",
  completed: "Atendimento concluído! Obrigado pela confiança",
};

export default function TVModeScreen() {
  const insets = useSafeAreaInsets();
  const { attendances, loading, reload } = useAttendances();
  const { settings } = useCompanySettings();
  const [refreshing, setRefreshing] = useState(false);
  const dimensions = useWindowDimensions();

  // Atualização automática a cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      reload();
    }, 3000);

    return () => clearInterval(interval);
  }, [reload]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  // Agrupar atendimentos por status
  const groupedAttendances: Record<AttendanceStatus, typeof attendances> = {
    arrival: attendances.filter((a) => a.status === "arrival"),
    waiting: attendances.filter((a) => a.status === "waiting"),
    in_service: attendances.filter((a) => a.status === "in_service"),
    completed: attendances.filter((a) => a.status === "completed"),
  };

  const isLandscape = dimensions.width > dimensions.height;

  return (
    <ThemedView style={styles.container}>
      {/* Background animado com imagem do VW Nivus */}
      <NivusBackground />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isLandscape ? styles.scrollContentLandscape : styles.scrollContentPortrait,
          {
            paddingTop: isLandscape ? 20 : Math.max(insets.top, 20) + 20,
            paddingBottom: Math.max(insets.bottom, 20) + 20,
          },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />
        }
      >
        {/* Header - Maior em modo TV */}
        <View style={[styles.header, isLandscape && styles.headerLandscape]}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/logo-lm.png")}
              style={[styles.logo, isLandscape && styles.logoLandscape]}
              contentFit="contain"
            />
          </View>
          <View style={styles.headerInfo}>
            <ThemedText
              type="title"
              style={[styles.companyName, isLandscape && styles.companyNameLandscape]}
            >
              {settings.companyName}
            </ThemedText>
            <ThemedText
              style={[styles.subtitle, isLandscape && styles.subtitleLandscape]}
            >
              Sistema de Sala de Espera Veicular
            </ThemedText>
          </View>
        </View>

        {/* Seções por Status - Maior em modo TV */}
        {(["arrival", "waiting", "in_service", "completed"] as AttendanceStatus[]).map(
          (status) => {
            const items = groupedAttendances[status];
            if (items.length === 0) return null;

            return (
              <View
                key={status}
                style={[
                  styles.section,
                  isLandscape && styles.sectionLandscape,
                ]}
              >
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <ThemedText
                      style={[
                        styles.sectionTitle,
                        isLandscape && styles.sectionTitleLandscape,
                      ]}
                    >
                      {STATUS_LABELS[status]}
                    </ThemedText>
                    <View style={styles.badge}>
                      <ThemedText style={styles.badgeText}>{items.length}</ThemedText>
                    </View>
                  </View>
                  <ThemedText
                    style={[
                      styles.sectionMessage,
                      isLandscape && styles.sectionMessageLandscape,
                    ]}
                  >
                    {STATUS_MESSAGES[status]}
                  </ThemedText>
                </View>

                <View
                  style={[
                    styles.vehiclesContainer,
                    isLandscape && styles.vehiclesContainerLandscape,
                  ]}
                >
                  {items.map((attendance) => (
                    <View
                      key={attendance.id}
                      style={[
                        styles.vehicleWrapper,
                        isLandscape && styles.vehicleWrapperLandscape,
                      ]}
                    >
                      <VehicleCard attendance={attendance} />
                    </View>
                  ))}
                </View>
              </View>
            );
          }
        )}

        {attendances.length === 0 && (
          <View style={styles.emptyState}>
            <ThemedText style={[styles.emptyText, isLandscape && styles.emptyTextLandscape]}>
              Nenhum atendimento no momento
            </ThemedText>
            <ThemedText
              style={[styles.emptySubtext, isLandscape && styles.emptySubtextLandscape]}
            >
              Aguardando novos veículos...
            </ThemedText>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={[styles.footerText, isLandscape && styles.footerTextLandscape]}>
            Sistema de Atendimento Veicular • {settings.companyName}
          </ThemedText>
          <ThemedText
            style={[styles.footerSubtext, isLandscape && styles.footerSubtextLandscape]}
          >
            Atualização automática a cada 3 segundos
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  scrollContentPortrait: {},
  scrollContentLandscape: {
    paddingHorizontal: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    flexDirection: "column",
  },
  headerLandscape: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 120,
    height: 60,
  },
  logoLandscape: {
    width: 180,
    height: 90,
    marginBottom: 0,
    marginRight: 32,
  },
  headerInfo: {
    alignItems: "center",
  },
  companyName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  companyNameLandscape: {
    fontSize: 48,
    textAlign: "left",
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitleLandscape: {
    fontSize: 20,
    textAlign: "left",
  },
  section: {
    marginBottom: 32,
  },
  sectionLandscape: {
    marginBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: 12,
  },
  sectionTitleLandscape: {
    fontSize: 32,
  },
  badge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionMessage: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
    fontStyle: "italic",
  },
  sectionMessageLandscape: {
    fontSize: 18,
  },
  vehiclesContainer: {
    paddingHorizontal: 0,
  },
  vehiclesContainerLandscape: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  vehicleWrapper: {
    marginBottom: 16,
  },
  vehicleWrapperLandscape: {
    width: "48%",
    marginBottom: 0,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyTextLandscape: {
    fontSize: 32,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.7,
    textAlign: "center",
  },
  emptySubtextLandscape: {
    fontSize: 18,
  },
  footer: {
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 0,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.6,
    textAlign: "center",
    marginBottom: 4,
  },
  footerTextLandscape: {
    fontSize: 16,
  },
  footerSubtext: {
    fontSize: 10,
    color: "#FFFFFF",
    opacity: 0.5,
    textAlign: "center",
  },
  footerSubtextLandscape: {
    fontSize: 14,
  },
});
