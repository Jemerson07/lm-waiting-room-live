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
import { useState } from "react";
import * as Haptics from "expo-haptics";
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
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<AttendanceStatus | "all">("all");

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

    try {
      setSubmitting(true);
      await createAttendance({
        licensePlate: formatLicensePlate(licensePlate),
        vehicleModel,
        serviceType,
        customerName: customerName.trim() || undefined,
        description: description.trim() || undefined,
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setShowNewModal(false);
      setLicensePlate("");
      setVehicleModel("");
      setServiceType("preventive");
      setCustomerName("");
      setDescription("");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível criar o atendimento");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (attendance: Attendance) => {
    const nextStatus = getNextStatus(attendance.status);
    if (!nextStatus) {
      Alert.alert(
        "Atendimento Finalizado",
        "Este atendimento já está finalizado. Deseja removê-lo?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Remover",
            style: "destructive",
            onPress: () => handleDelete(attendance.id),
          },
        ]
      );
      return;
    }

    try {
      await updateAttendanceStatus(Number(attendance.id), nextStatus);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAttendance(Number(id));
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível remover o atendimento");
    }
  };

  const filteredAttendances =
    selectedFilter === "all"
      ? attendances
      : attendances.filter((a) => a.status === selectedFilter);

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
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">Painel Administrativo</ThemedText>
          <ThemedText style={styles.subtitle}>
            Gerencie os atendimentos em tempo real
          </ThemedText>
        </View>

        {/* Filtros */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          <Pressable
            style={[
              styles.filterButton,
              { backgroundColor: cardBackground, borderColor },
              selectedFilter === "all" && { backgroundColor: tintColor, borderColor: tintColor },
            ]}
            onPress={() => setSelectedFilter("all")}
          >
            <ThemedText
              style={[
                styles.filterText,
                selectedFilter === "all" && styles.filterTextActive,
              ]}
            >
              Todos ({attendances.length})
            </ThemedText>
          </Pressable>

          {(["arrival", "waiting", "in_service", "completed"] as AttendanceStatus[]).map(
            (status) => {
              const count = attendances.filter((a) => a.status === status).length;
              return (
                <Pressable
                  key={status}
                  style={[
                    styles.filterButton,
                    { backgroundColor: cardBackground, borderColor },
                    selectedFilter === status && { backgroundColor: tintColor, borderColor: tintColor },
                  ]}
                  onPress={() => setSelectedFilter(status)}
                >
                  <ThemedText
                    style={[
                      styles.filterText,
                      selectedFilter === status && styles.filterTextActive,
                    ]}
                  >
                    {STATUS_LABELS[status]} ({count})
                  </ThemedText>
                </Pressable>
              );
            }
          )}
        </ScrollView>

        {/* Lista de Atendimentos */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tintColor} />
          </View>
        ) : filteredAttendances.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>Nenhum atendimento encontrado</ThemedText>
          </View>
        ) : (
          filteredAttendances.map((attendance) => (
            <View key={attendance.id} style={[styles.card, { backgroundColor: cardBackground }]}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: getStatusColor(attendance.status) },
                ]}
              />

              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <ThemedText type="subtitle" style={styles.licensePlate}>
                    {attendance.licensePlate}
                  </ThemedText>
                  <ThemedText style={styles.elapsedTime}>
                    {getElapsedTime(attendance.createdAt)}
                  </ThemedText>
                </View>

                <ThemedText style={styles.vehicleModel}>{attendance.vehicleModel}</ThemedText>

                <View style={styles.serviceTypeBadgeAdmin}>
                  <ThemedText style={styles.serviceTypeTextAdmin}>
                    {SERVICE_TYPE_ICONS[attendance.serviceType]} {SERVICE_TYPE_LABELS[attendance.serviceType]}
                  </ThemedText>
                </View>

                {attendance.customerName && (
                  <ThemedText style={styles.customerName}>
                    Cliente: {attendance.customerName}
                  </ThemedText>
                )}

                {attendance.description && (
                  <ThemedText style={styles.description} numberOfLines={2}>
                    {attendance.description}
                  </ThemedText>
                )}

                <View style={styles.cardActions}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(attendance.status) },
                    ]}
                  >
                    <ThemedText style={styles.statusBadgeText}>
                      {STATUS_LABELS[attendance.status]}
                    </ThemedText>
                  </View>

                  <View style={styles.actionButtons}>
                    <Pressable
                      style={[styles.actionButton, { backgroundColor: tintColor }]}
                      onPress={() => handleUpdateStatus(attendance)}
                    >
                      <ThemedText style={styles.actionButtonText}>
                        {getNextStatus(attendance.status)
                          ? `→ ${STATUS_LABELS[getNextStatus(attendance.status)!]}`
                          : "Finalizado"}
                      </ThemedText>
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.deleteButton,
                        {
                          backgroundColor: pressed ? "rgba(255, 59, 48, 0.1)" : "transparent",
                          borderColor: "#FF3B30",
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
                            { text: "Cancelar", style: "cancel" },
                            {
                              text: "Remover",
                              style: "destructive",
                              onPress: () => handleDelete(attendance.id),
                            },
                          ]
                        );
                      }}
                    >
                      <ThemedText style={[styles.deleteButtonText, { color: "#FF3B30" }]}>
                        ✗
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Botão Flutuante para Adicionar */}
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

      {/* Modal de Novo Atendimento */}
      <Modal
        visible={showNewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNewModal(false)}
      >
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
                  onChangeText={setVehicleModel}
                  placeholder="Ex: VW Nivus Highline"
                  placeholderTextColor="#999"
                />
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
                <ThemedText style={styles.label}>Descrição</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    { backgroundColor: cardBackground, borderColor },
                  ]}
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
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.submitButtonText}>Criar Atendimento</ThemedText>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  header: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 8,
  },
  filters: {
    marginBottom: 24,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.5,
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    flexDirection: "row",
  },
  statusIndicator: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  licensePlate: {
    fontSize: 20,
    fontWeight: "bold",
  },
  elapsedTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  vehicleModel: {
    fontSize: 16,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minHeight: 36,
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
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
  fabText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "300",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E4E8",
  },
  closeButton: {
    fontSize: 24,
    opacity: 0.6,
  },
  modalScroll: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  serviceTypeContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  serviceTypeButton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  serviceTypeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  serviceTypeTextActive: {
    color: "#FFFFFF",
  },
  serviceTypeBadgeAdmin: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 102, 204, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    marginBottom: 4,
  },
  serviceTypeTextAdmin: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0066CC",
  },
});
