import { StyleSheet, View, ScrollView, RefreshControl, Dimensions } from "react-native";
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const STATUS_MESSAGES: Record<AttendanceStatus, string> = {
  arrival: "Seu veículo chegou! Estamos preparando o atendimento",
  waiting: "Em breve iniciaremos o atendimento do seu veículo",
  in_service: "Seu veículo está sendo atendido agora",
  completed: "Atendimento concluído! Obrigado pela confiança",
};

export default function LiveScreen() {
  const insets = useSafeAreaInsets();
  const { attendances, loading, reload } = useAttendances();
  const { settings } = useCompanySettings();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualização automática a cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      reload();
      setCurrentTime(new Date());
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

  return (
    <ThemedView style={styles.container}>
      {/* Background animado com imagem do VW Nivus */}
      <NivusBackground />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 20) + 20,
            paddingBottom: Math.max(insets.bottom, 20) + 20,
          },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <ThemedText style={styles.logoText}>🚗</ThemedText>
            </View>
          </View>
          <ThemedText type="title" style={styles.companyName}>
            {settings.companyName}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Acompanhe seu veículo em tempo real
          </ThemedText>
          <ThemedText style={styles.clock}>
            {currentTime.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </ThemedText>
        </View>

        {/* Seções por Status */}
        {(["arrival", "waiting", "in_service", "completed"] as AttendanceStatus[]).map(
          (status) => {
            const items = groupedAttendances[status];
            if (items.length === 0) return null;

            return (
              <View key={status} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                      {STATUS_LABELS[status]}
                    </ThemedText>
                    <View style={styles.badge}>
                      <ThemedText style={styles.badgeText}>{items.length}</ThemedText>
                    </View>
                  </View>
                  <ThemedText style={styles.sectionMessage}>
                    {STATUS_MESSAGES[status]}
                  </ThemedText>
                </View>

                {items.map((attendance) => (
                  <VehicleCard
                    key={attendance.id}
                    attendance={attendance}
                    showAnimation={status === "in_service"}
                  />
                ))}
              </View>
            );
          }
        )}

        {/* Mensagem quando não há atendimentos */}
        {attendances.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <ThemedText type="subtitle" style={styles.emptyText}>
              Nenhum atendimento no momento
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Os veículos aparecerão aqui automaticamente
            </ThemedText>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Sistema de Atendimento Veicular • {settings.companyName}
          </ThemedText>
          <ThemedText style={styles.footerSubtext}>
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
    paddingHorizontal: 0,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  logoText: {
    fontSize: 48,
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
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center",
    marginBottom: 12,
  },
  clock: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
    opacity: 0.8,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    paddingHorizontal: 20,
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
  emptySubtext: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.7,
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.6,
    textAlign: "center",
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 10,
    color: "#FFFFFF",
    opacity: 0.5,
    textAlign: "center",
  },
});
