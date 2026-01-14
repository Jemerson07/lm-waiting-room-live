import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Dimensions, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { useAttendances } from "@/hooks/use-attendances";
import { useCompanySettings } from "@/hooks/use-company-settings";
import { NivusBackground } from "@/components/nivus-background";
import { STATUS_LABELS, SERVICE_TYPE_LABELS, SERVICE_TYPE_ICONS } from "@/types/attendance";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export default function TVDisplayScreen() {
  const insets = useSafeAreaInsets();
  const { attendances, loading } = useAttendances();
  const { settings: { companyName } } = useCompanySettings();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualizar hora a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Agrupar atendimentos por status
  const groupedByStatus = {
    arrival: attendances.filter((a) => a.status === "arrival"),
    waiting: attendances.filter((a) => a.status === "waiting"),
    in_service: attendances.filter((a) => a.status === "in_service"),
    completed: attendances.filter((a) => a.status === "completed"),
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.overlay}>
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
                <ThemedText style={styles.sectionCount}>{groupedByStatus.arrival.length}</ThemedText>
              </View>
              <ScrollView style={styles.cardsContainer}>
                {groupedByStatus.arrival.length === 0 ? (
                  <View style={styles.emptyState}>
                    <ThemedText style={styles.emptyText}>Nenhum veículo</ThemedText>
                  </View>
                ) : (
                  groupedByStatus.arrival.map((att) => (
                    <TVCard key={att.id} attendance={att} />
                  ))
                )}
              </ScrollView>
            </View>

            {/* Seção: Fila */}
            <View style={styles.section}>
              <View style={[styles.sectionHeader, { backgroundColor: "#FFA500" }]}>
                <ThemedText style={styles.sectionTitle}>⏳ Fila de Espera</ThemedText>
                <ThemedText style={styles.sectionCount}>{groupedByStatus.waiting.length}</ThemedText>
              </View>
              <ScrollView style={styles.cardsContainer}>
                {groupedByStatus.waiting.length === 0 ? (
                  <View style={styles.emptyState}>
                    <ThemedText style={styles.emptyText}>Nenhum veículo</ThemedText>
                  </View>
                ) : (
                  groupedByStatus.waiting.map((att) => (
                    <TVCard key={att.id} attendance={att} />
                  ))
                )}
              </ScrollView>
            </View>

            {/* Seção: Em Atendimento */}
            <View style={styles.section}>
              <View style={[styles.sectionHeader, { backgroundColor: "#4ECDC4" }]}>
                <ThemedText style={styles.sectionTitle}>🔧 Em Atendimento</ThemedText>
                <ThemedText style={styles.sectionCount}>{groupedByStatus.in_service.length}</ThemedText>
              </View>
              <ScrollView style={styles.cardsContainer}>
                {groupedByStatus.in_service.length === 0 ? (
                  <View style={styles.emptyState}>
                    <ThemedText style={styles.emptyText}>Nenhum veículo</ThemedText>
                  </View>
                ) : (
                  groupedByStatus.in_service.map((att) => (
                    <TVCard key={att.id} attendance={att} pulse />
                  ))
                )}
              </ScrollView>
            </View>

            {/* Seção: Concluído */}
            <View style={styles.section}>
              <View style={[styles.sectionHeader, { backgroundColor: "#51CF66" }]}>
                <ThemedText style={styles.sectionTitle}>✅ Concluído</ThemedText>
                <ThemedText style={styles.sectionCount}>{groupedByStatus.completed.length}</ThemedText>
              </View>
              <ScrollView style={styles.cardsContainer}>
                {groupedByStatus.completed.length === 0 ? (
                  <View style={styles.emptyState}>
                    <ThemedText style={styles.emptyText}>Nenhum veículo</ThemedText>
                  </View>
                ) : (
                  groupedByStatus.completed.map((att) => (
                    <TVCard key={att.id} attendance={att} />
                  ))
                )}
              </ScrollView>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              Total de Atendimentos: {attendances.length}
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
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
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
    fontSize: 28,
    color: "#FFFFFF",
    opacity: 0.6,
  },
  tvCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 30,
    marginBottom: 24,
    borderLeftWidth: 8,
    borderLeftColor: "#0052A3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  tvCardContent: {
    gap: 16,
  },
  tvLicensePlate: {
    fontSize: 44,
    fontWeight: "bold",
    color: "#0052A3",
  },
  tvVehicleModel: {
    fontSize: 28,
    color: "#333",
  },
  tvServiceBadge: {
    backgroundColor: "#0052A3",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  tvServiceText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  tvCustomerName: {
    fontSize: 24,
    color: "#666",
  },
  footer: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderTopWidth: 2,
    borderTopColor: "#0052A3",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  footerText: {
    fontSize: 24,
    color: "#FFFFFF",
    textAlign: "center",
  },
});
