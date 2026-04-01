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
import { AdminAttendanceCard } from "@/components/admin-attendance-card";
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
  getNextStatus,
  validateLicensePlate,
  formatLicensePlate,
} from "@/types/attendance";

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
          filteredAttendances.map((attendance) => (
            <AdminAttendanceCard
              key={attendance.id}
              attendance={attendance}
              cardBackground={cardBackground}
              borderColor={borderColor}
              tintColor={tintColor}
              onAdvance={() => handleUpdateStatus(attendance)}
              onDelete={() => {
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
            />
          ))
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
