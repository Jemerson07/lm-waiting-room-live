import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo, useState } from "react";
import * as Haptics from "expo-haptics";
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
import { searchVehicleModels } from "@/lib/vehicle-models";

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

  const {
    attendances,
    loading,
    createAttendance,
    updateAttendanceStatus,
    deleteAttendance,
  } = useAttendances();

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
  const [vehicleModelSuggestions, setVehicleModelSuggestions] = useState<string[]>([]);
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);

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

    setShowModelSuggestions(false);

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

      setShowNewModal(false);
      setLicensePlate("");
      setVehicleModel("");
      setServiceType("preventive");
      setCustomerName("");
      setCustomerPhone("");
      setDescription("");
      setVehicleModelSuggestions([]);
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

      <Modal visible={showNewModal} animationType="slide" transparent onRequestClose={() => setShowNewModal(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor,
                paddingBottom: Math.max(insets.bottom, 20) + 20,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Novo Atendimento</ThemedText>
              <Pressable onPress={() => setShowNewModal(false)}>
                <ThemedText style={styles.closeButton}>✕</ThemedText>
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Placa do Veículo *</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: cardBackground, borderColor }]}
                  value={licensePlate}
                  onChangeText={setLicensePlate}
                  placeholder="ABC-1234 ou ABC1D34"
                  placeholderTextColor="#999"
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Modelo do Veículo *</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: cardBackground, borderColor }]}
                  value={vehicleModel}
                  onChangeText={(text) => {
                    setVehicleModel(text);
                    if (text.trim()) {
                      setVehicleModelSuggestions(searchVehicleModels(text));
                      setShowModelSuggestions(true);
                    } else {
                      setShowModelSuggestions(false);
                    }
                  }}
                  onFocus={() => {
                    if (vehicleModel.trim()) {
                      setShowModelSuggestions(true);
                    }
                  }}
                  placeholder="Ex: VW Nivus Highline"
                  placeholderTextColor="#999"
                />
                {showModelSuggestions && vehicleModelSuggestions.length > 0 ? (
                  <View style={[styles.suggestionsContainer, { backgroundColor: cardBackground, borderColor }]}> 
                    <ScrollView style={styles.suggestionsList} nestedScrollEnabled>
                      {vehicleModelSuggestions.map((model, index) => (
                        <Pressable
                          key={index}
                          style={styles.suggestionItem}
                          onPress={() => {
                            setVehicleModel(model);
                            setShowModelSuggestions(false);
                          }}
                        >
                          <ThemedText style={styles.suggestionText}>{model}</ThemedText>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                ) : null}
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Tipo de Serviço *</ThemedText>
                <View style={styles.serviceTypeContainer}>
                  <Pressable
                    style={[
                      styles.serviceTypeButton,
                      { backgroundColor: cardBackground, borderColor },
                      serviceType === "tire" && { backgroundColor: tintColor, borderColor: tintColor },
                    ]}
                    onPress={() => setServiceType("tire")}
                  >
                    <ThemedText style={[styles.serviceTypeText, serviceType === "tire" && styles.serviceTypeTextActive]}>
                      🔧 Pneu
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.serviceTypeButton,
                      { backgroundColor: cardBackground, borderColor },
                      serviceType === "corrective" && { backgroundColor: tintColor, borderColor: tintColor },
                    ]}
                    onPress={() => setServiceType("corrective")}
                  >
                    <ThemedText style={[styles.serviceTypeText, serviceType === "corrective" && styles.serviceTypeTextActive]}>
                      ⚠️ Corretiva
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.serviceTypeButton,
                      { backgroundColor: cardBackground, borderColor },
                      serviceType === "preventive" && { backgroundColor: tintColor, borderColor: tintColor },
                    ]}
                    onPress={() => setServiceType("preventive")}
                  >
                    <ThemedText style={[styles.serviceTypeText, serviceType === "preventive" && styles.serviceTypeTextActive]}>
                      ✓ Preventiva
                    </ThemedText>
                  </Pressable>
                </View>
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Nome do Cliente</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: cardBackground, borderColor }]}
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="Opcional"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Telefone do Cliente (WhatsApp)</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: cardBackground, borderColor }]}
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                  placeholder="(11) 99999-9999"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
                <ThemedText style={styles.helperText}>Deixe em branco para não enviar notificações via WhatsApp</ThemedText>
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Descrição</ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: cardBackground, borderColor }]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Detalhes do atendimento (opcional)"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <Pressable
                style={[
                  styles.submitButton,
                  { backgroundColor: tintColor },
                  submitting && styles.submitButtonDisabled,
                ]}
                onPress={handleCreateAttendance}
                disabled={submitting}
              >
                {submitting ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.submitButtonText}>Criar Atendimento</ThemedText>}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
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

  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "90%" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E4E8",
  },
  closeButton: { fontSize: 24, opacity: 0.6 },
  modalScroll: { padding: 20 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
  helperText: { fontSize: 12, opacity: 0.6, marginTop: 6 },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  submitButton: { paddingVertical: 16, borderRadius: 8, alignItems: "center", marginTop: 8 },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },

  serviceTypeContainer: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  serviceTypeButton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  serviceTypeText: { fontSize: 14, fontWeight: "600" },
  serviceTypeTextActive: { color: "#FFFFFF" },
  serviceTypeBadgeAdmin: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 102, 204, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  serviceTypeTextAdmin: { fontSize: 12, fontWeight: "700", color: "#0066CC" },

  suggestionsContainer: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    marginTop: -8,
    marginHorizontal: -1,
  },
  suggestionsList: { maxHeight: 200 },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  suggestionText: { fontSize: 14 },
});
