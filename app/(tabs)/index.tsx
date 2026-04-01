import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo, useState } from "react";
import * as Haptics from "expo-haptics";
import { AdminCreateAttendanceModal } from "@/components/admin-create-attendance-modal";
import { AdminOverview } from "@/components/admin-overview";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAttendances } from "@/hooks/use-attendances";
import type { Attendance, AttendanceStatus } from "@/types/attendance";
import {
  STATUS_LABELS,
  SERVICE_TYPE_LABELS,
  SERVICE_TYPE_ICONS,
  getNextStatus,
  validateLicensePlate,
  formatLicensePlate,
  getElapsedTime,
} from "@/types/attendance";
import { Colors } from "@/constants/theme";

const STATUS_SORT_ORDER: Record<AttendanceStatus, number> = {
  arrival: 0,
  waiting: 1,
  in_service: 2,
  completed: 3,
};

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor({}, "cardBackground");
  const borderColor = useThemeColor({}, "border");

  const { attendances, loading, createAttendance, updateAttendanceStatus, deleteAttendance } =
    useAttendances();

  const [showNewModal, setShowNewModal] = useState(false);
  const [licensePlate, setLicensePlate] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [serviceType, setServiceType] = useState<"tire" | "corrective" | "preventive">("preventive");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<AttendanceStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAttendances = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return attendances
      .filter((attendance) => selectedFilter === "all" || attendance.status === selectedFilter)
      .filter((attendance) => {
        if (!normalizedQuery) return true;

        const haystack = [
          attendance.licensePlate,
          attendance.vehicleModel,
          attendance.customerName || "",
          attendance.description || "",
          STATUS_LABELS[attendance.status] || attendance.status,
          SERVICE_TYPE_LABELS[attendance.serviceType] || attendance.serviceType,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
      .sort((a, b) => {
        const statusDelta = STATUS_SORT_ORDER[a.status] - STATUS_SORT_ORDER[b.status];
        if (statusDelta !== 0) return statusDelta;
        return Number(b.updatedAt) - Number(a.updatedAt);
      });
  }, [attendances, searchQuery, selectedFilter]);

  const resetForm = () => {
    setShowNewModal(false);
    setLicensePlate("");
    setVehicleModel("");
    setServiceType("preventive");
    setCustomerName("");
    setCustomerPhone("");
    setDescription("");
  };

  const handleCreateAttendance = async () => {
    if (!licensePlate.trim()) {
      Alert.alert("Erro", "Por favor, informe a placa do veículo");
      return;
    }

    if (!validateLicensePlate(licensePlate)) {
      Alert.alert("Erro", "Formato de placa inválido. Use ABC-1234 ou ABC1D34");
      return;
    }

    if (!vehicleModel.trim()) {
      Alert.alert("Erro", "Por favor, informe o modelo do veículo");
      return;
    }

    if (customerPhone.trim() && !/^\d{10,15}$/.test(customerPhone.replace(/\D/g, ""))) {
      Alert.alert("Erro", "Telefone inválido. Use apenas números (10-15 dígitos)");
      return;
    }

    try {
      setSubmitting(true);
      await createAttendance({
        licensePlate: formatLicensePlate(licensePlate),
        vehicleModel,
        serviceType,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        description: description.trim() || undefined,
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("Sucesso!", `Atendimento criado para ${formatLicensePlate(licensePlate)}`, [{ text: "OK" }]);
      resetForm();
    } catch (error) {
      console.error("Erro ao criar atendimento:", error);
      Alert.alert("Erro", "Não foi possível criar o atendimento. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (attendance: Attendance) => {
    const nextStatus = getNextStatus(attendance.status);
    if (!nextStatus) {
      Alert.alert(
        "Atendimento concluído",
        `O atendimento de ${attendance.licensePlate} já está finalizado e continua salvo para histórico e relatórios.`,
        [{ text: "OK" }],
      );
      return;
    }

    try {
      await updateAttendanceStatus(Number(attendance.id), nextStatus);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar o status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAttendance(Number(id));
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      Alert.alert("Erro", "Não foi possível remover o atendimento");
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    const colorScheme = "light";
    return Colors[colorScheme][`status${status.charAt(0).toUpperCase() + status.slice(1).replace(/_./g, (m) => m[1].toUpperCase())}` as keyof typeof Colors.light] as string;
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 20) + 20,
            paddingBottom: Math.max(insets.bottom, 20) + 80,
          },
        ]}
      >
        <View style={styles.header}>
          <ThemedText type="title">Painel Administrativo</ThemedText>
          <ThemedText style={styles.subtitle}>Gerencie os atendimentos em tempo real</ThemedText>
        </View>

        <AdminOverview
          attendances={attendances}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          cardBackground={cardBackground}
          borderColor={borderColor}
          tintColor={tintColor}
        />

        <View style={styles.listHeader}>
          <ThemedText style={styles.listTitle}>Fila operacional</ThemedText>
          <ThemedText style={styles.listSubtitle}>
            {filteredAttendances.length} atendimento(s) encontrado(s)
            {searchQuery.trim() ? " com a busca aplicada" : ""}
          </ThemedText>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tintColor} />
          </View>
        ) : filteredAttendances.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>Nenhum atendimento encontrado com os filtros atuais.</ThemedText>
          </View>
        ) : (
          filteredAttendances.map((attendance) => {
            const nextStatus = getNextStatus(attendance.status);
            const isCompleted = !nextStatus;
            const statusColor = getStatusColor(attendance.status);

            return (
              <View key={attendance.id} style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
                <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />

                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <ThemedText type="subtitle" style={styles.licensePlate}>
                        {attendance.licensePlate}
                      </ThemedText>
                      <ThemedText style={styles.vehicleModel}>{attendance.vehicleModel}</ThemedText>
                    </View>

                    <View style={styles.cardHeaderRight}>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <ThemedText style={styles.statusBadgeText}>{STATUS_LABELS[attendance.status]}</ThemedText>
                      </View>
                      <ThemedText style={styles.elapsedTime}>{getElapsedTime(attendance.createdAt)}</ThemedText>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.serviceTypeBadgeAdmin}>
                      <ThemedText style={styles.serviceTypeTextAdmin}>
                        {SERVICE_TYPE_ICONS[attendance.serviceType]} {SERVICE_TYPE_LABELS[attendance.serviceType]}
                      </ThemedText>
                    </View>

                    {attendance.customerName ? (
                      <View style={styles.customerChip}>
                        <ThemedText style={styles.customerChipText}>Cliente: {attendance.customerName}</ThemedText>
                      </View>
                    ) : null}
                  </View>

                  {attendance.description ? (
                    <ThemedText style={styles.description} numberOfLines={2}>
                      {attendance.description}
                    </ThemedText>
                  ) : null}

                  {isCompleted ? (
                    <View style={styles.historyHint}>
                      <ThemedText style={styles.historyHintText}>
                        Atendimento concluído e mantido no histórico do sistema.
                      </ThemedText>
                    </View>
                  ) : null}

                  <View style={styles.cardActions}>
                    <Pressable
                      style={[
                        styles.primaryActionButton,
                        { backgroundColor: isCompleted ? "#A0A7B4" : tintColor },
                        isCompleted && styles.actionButtonDisabled,
                      ]}
                      onPress={() => handleUpdateStatus(attendance)}
                      disabled={isCompleted}
                    >
                      <ThemedText style={styles.primaryActionText}>
                        {nextStatus ? `Avançar para ${STATUS_LABELS[nextStatus]}` : "Concluído"}
                      </ThemedText>
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.deleteButton,
                        {
                          backgroundColor: pressed ? "rgba(255, 59, 48, 0.08)" : "transparent",
                          borderColor: "rgba(255, 59, 48, 0.45)",
                        },
                      ]}
                      onPress={() => {
                        if (Platform.OS !== "web") {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        Alert.alert(
                          "Remover Atendimento",
                          `Tem certeza que deseja remover o atendimento ${attendance.licensePlate}?`,
                          [
                            { text: "Manter", style: "cancel" },
                            {
                              text: "Remover",
                              style: "destructive",
                              onPress: () => handleDelete(attendance.id),
                            },
                          ],
                        );
                      }}
                    >
                      <ThemedText style={styles.deleteButtonText}>Remover</ThemedText>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Pressable
        style={[
          styles.fab,
          {
            backgroundColor: tintColor,
            bottom: Math.max(insets.bottom, 20) + 60,
          },
        ]}
        onPress={() => setShowNewModal(true)}
      >
        <ThemedText style={styles.fabText}>+</ThemedText>
      </Pressable>

      <AdminCreateAttendanceModal
        visible={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSubmit={handleCreateAttendance}
        backgroundColor={backgroundColor}
        cardBackground={cardBackground}
        borderColor={borderColor}
        tintColor={tintColor}
        submitting={submitting}
        licensePlate={licensePlate}
        setLicensePlate={setLicensePlate}
        vehicleModel={vehicleModel}
        setVehicleModel={setVehicleModel}
        serviceType={serviceType}
        setServiceType={setServiceType}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        description={description}
        setDescription={setDescription}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  header: { marginBottom: 20 },
  subtitle: { fontSize: 16, opacity: 0.7, marginTop: 8 },

  listHeader: { marginBottom: 14 },
  listTitle: { fontSize: 18, fontWeight: "700" },
  listSubtitle: { fontSize: 13, opacity: 0.65, marginTop: 4 },

  loadingContainer: { paddingVertical: 40, alignItems: "center" },
  emptyState: { paddingVertical: 60, alignItems: "center" },
  emptyText: { fontSize: 16, opacity: 0.55, textAlign: "center" },

  card: {
    borderRadius: 18,
    marginBottom: 16,
    overflow: "hidden",
    flexDirection: "row",
    borderWidth: 1,
  },
  statusIndicator: { width: 5 },
  cardContent: { flex: 1, padding: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginBottom: 10 },
  cardHeaderLeft: { flex: 1 },
  cardHeaderRight: { alignItems: "flex-end", gap: 8 },
  licensePlate: { fontSize: 22, fontWeight: "800" },
  elapsedTime: { fontSize: 12, opacity: 0.65, fontWeight: "600" },
  vehicleModel: { fontSize: 15, opacity: 0.84 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  customerChip: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  customerChipText: { fontSize: 12, fontWeight: "600", opacity: 0.8 },
  description: { fontSize: 14, opacity: 0.72, marginBottom: 12 },
  historyHint: {
    backgroundColor: "rgba(0, 200, 83, 0.08)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  historyHintText: { fontSize: 12, color: "#1C7C54", fontWeight: "700" },
  cardActions: { flexDirection: "row", gap: 10, alignItems: "center" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  statusBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  primaryActionButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonDisabled: { opacity: 0.9 },
  primaryActionText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700", textAlign: "center" },
  deleteButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: { fontSize: 13, fontWeight: "700", color: "#FF3B30" },

  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: { color: "#FFFFFF", fontSize: 32, fontWeight: "300" },
});
