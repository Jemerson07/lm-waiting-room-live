import { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Dimensions, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { useAttendances } from "@/hooks/use-attendances";
import { useCompanySettings } from "@/hooks/use-company-settings";
import { NivusBackground } from "@/components/nivus-background";
import { STATUS_LABELS, SERVICE_TYPE_LABELS, SERVICE_TYPE_ICONS } from "@/types/attendance";
import { CompletionNotification } from "@/components/completion-notification";
import { HiddenCountBadge } from "@/components/hidden-count-badge";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const MAX_VISIBLE_ATTENDANCES = 30;

export default function TVDisplayScreen() {
  const insets = useSafeAreaInsets();
  const { attendances, loading } = useAttendances();
  const { settings: { companyName } } = useCompanySettings();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [completionNotification, setCompletionNotification] = useState<{
    customerName: string;
    licensePlate: string;
  } | null>(null);
  const [previousCompletedCount, setPreviousCompletedCount] = useState(0);

  // Atualizar hora a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Detectar quando um atendimento é finalizado
  useEffect(() => {
    const completedCount = attendances.filter((a) => a.status === "completed").length;
    
    if (completedCount > previousCompletedCount) {
      // Encontrar o atendimento que foi finalizado recentemente
      const recentlyCompleted = attendances.find(
        (a) => a.status === "completed" && 
        new Date(a.updatedAt).getTime() > Date.now() - 5000
      );
      
      if (recentlyCompleted) {
        setCompletionNotification({
          customerName: recentlyCompleted.customerName || "Cliente",
          licensePlate: recentlyCompleted.licensePlate,
        });
      }
    }
    
    setPreviousCompletedCount(completedCount);
  }, [attendances, previousCompletedCount]);

  // Ordenar atendimentos por data de criação (mais antigos primeiro)
  const sortByCreatedDate = (items: any[]) => {
    return [...items].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  };

  // Agrupar atendimentos por status (excluindo finalizados da tela)
  const groupedByStatus = {
    arrival: sortByCreatedDate(attendances.filter((a) => a.status === "arrival")),
    waiting: sortByCreatedDate(attendances.filter((a) => a.status === "waiting")),
    in_service: sortByCreatedDate(attendances.filter((a) => a.status === "in_service")),
  };

  // Calcular total de atendimentos visíveis e ocultos
  const totalVisible = groupedByStatus.arrival.length + 
                      groupedByStatus.waiting.length + 
                      groupedByStatus.in_service.length;
  const totalHidden = Math.max(0, totalVisible - MAX_VISIBLE_ATTENDANCES);
  
  // Limitar atendimentos visíveis
  const limitedArrival = groupedByStatus.arrival.slice(0, MAX_VISIBLE_ATTENDANCES);
  const limitedWaiting = groupedByStatus.waiting.slice(
    0, 
    Math.max(0, MAX_VISIBLE_ATTENDANCES - limitedArrival.length)
  );
  const limitedInService = groupedByStatus.in_service.slice(
    0,
    Math.max(0, MAX_VISIBLE_ATTENDANCES - limitedArrival.length - limitedWaiting.length)
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <NivusBackground />
      <View style={styles.overlay}>
        {/* Notificação de Conclusão */}
        {completionNotification && (
          <CompletionNotification
            customerName={completionNotification.customerName}
            licensePlate={completionNotification.licensePlate}
            isVisible={!!completionNotification}
            onHide={() => setCompletionNotification(null)}
          />
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ThemedText style={styles.companyName}>{companyName || "LM Soluções"}</ThemedText>
            <ThemedText style={styles.subtitle}>Sistema de Sala de Espera</ThemedText>
          </View>
          <ThemedText style={styles.time}>{formatTime(currentTime)}</ThemedText>
        </View>

        {/* Conteúdo Principal */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
        >
          {/* Seção: Chegada */}
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { backgroundColor: "#FF6B6B" }]}>
              <ThemedText style={styles.sectionTitle}>🚗 Chegada</ThemedText>
              <ThemedText style={styles.sectionCount}>{limitedArrival.length}</ThemedText>
            </View>
            <ScrollView style={styles.cardsContainer}>
              {limitedArrival.length === 0 ? (
                <View style={styles.emptyState}>
                  <ThemedText style={styles.emptyText}>Nenhum veículo</ThemedText>
                </View>
              ) : (
                limitedArrival.map((att) => (
                  <TVCard key={att.id} attendance={att} />
                ))
              )}
            </ScrollView>
          </View>

          {/* Seção: Fila */}
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { backgroundColor: "#FFA500" }]}>
              <ThemedText style={styles.sectionTitle}>⏳ Fila de Espera</ThemedText>
              <ThemedText style={styles.sectionCount}>{limitedWaiting.length}</ThemedText>
            </View>
            <ScrollView style={styles.cardsContainer}>
              {limitedWaiting.length === 0 ? (
                <View style={styles.emptyState}>
                  <ThemedText style={styles.emptyText}>Nenhum veículo</ThemedText>
                </View>
              ) : (
                limitedWaiting.map((att) => (
                  <TVCard key={att.id} attendance={att} />
                ))
              )}
            </ScrollView>
          </View>

          {/* Seção: Em Atendimento */}
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { backgroundColor: "#4ECDC4" }]}>
              <ThemedText style={styles.sectionTitle}>🔧 Em Atendimento</ThemedText>
              <ThemedText style={styles.sectionCount}>{limitedInService.length}</ThemedText>
            </View>
            <ScrollView style={styles.cardsContainer}>
              {limitedInService.length === 0 ? (
                <View style={styles.emptyState}>
                  <ThemedText style={styles.emptyText}>Nenhum veículo</ThemedText>
                </View>
              ) : (
                limitedInService.map((att) => (
                  <TVCard key={att.id} attendance={att} pulse />
                ))
              )}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Indicador de Ocultos */}
        {totalHidden > 0 && (
          <View style={styles.hiddenIndicator}>
            <HiddenCountBadge count={totalHidden} />
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Atendimentos: {totalVisible} visíveis {totalHidden > 0 ? `+ ${totalHidden} ocultos` : ""}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

interface TVCardProps {
  attendance: any;
  pulse?: boolean;
}

function TVCard({ attendance, pulse = false }: TVCardProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (pulse) {
      scale.value = withRepeat(
        withTiming(1.05, { duration: 1500 }),
        -1,
        true
      );
    }
  }, [pulse, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.tvCard, animatedStyle]}>
      <View style={styles.tvCardContent}>
        <ThemedText style={styles.tvLicensePlate}>{attendance.licensePlate}</ThemedText>
        <ThemedText style={styles.tvVehicleModel}>{attendance.vehicleModel}</ThemedText>

        <View style={styles.tvServiceBadge}>
          <ThemedText style={styles.tvServiceText}>
            {SERVICE_TYPE_ICONS[attendance.serviceType as keyof typeof SERVICE_TYPE_ICONS]} {SERVICE_TYPE_LABELS[attendance.serviceType as keyof typeof SERVICE_TYPE_LABELS]}
          </ThemedText>
        </View>

        {attendance.customerName && (
          <ThemedText style={styles.tvCustomerName}>{attendance.customerName}</ThemedText>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 30,
    borderBottomWidth: 3,
    borderBottomColor: "#0052A3",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  headerContent: {
    flex: 1,
  },
  companyName: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 24,
    color: "#B0C4DE",
    marginTop: 8,
  },
  time: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#0052A3",
    fontVariant: ["tabular-nums"],
  },
  scrollView: {
    flex: 1,
  },
  section: {
    width: width,
    paddingHorizontal: 40,
    paddingVertical: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 16,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  sectionCount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cardsContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 24,
    color: "#FFFFFF",
    opacity: 0.5,
  },
  tvCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  tvCardContent: {
    gap: 12,
  },
  tvLicensePlate: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#0052A3",
    letterSpacing: 2,
  },
  tvVehicleModel: {
    fontSize: 24,
    color: "#333",
    fontWeight: "600",
  },
  tvServiceBadge: {
    backgroundColor: "#E8F4F8",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  tvServiceText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0052A3",
  },
  tvCustomerName: {
    fontSize: 18,
    color: "#666",
    fontWeight: "500",
  },
  hiddenIndicator: {
    position: "absolute",
    bottom: 100,
    right: 40,
    zIndex: 100,
  },
  footer: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderTopWidth: 2,
    borderTopColor: "#0052A3",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  footerText: {
    fontSize: 18,
    color: "#B0C4DE",
    fontWeight: "600",
  },
});
