import { StyleSheet, View, ScrollView, Pressable, Alert, ActivityIndicator, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useMemo, useState } from "react";
import * as Haptics from "expo-haptics";
import { AccessRequiredCard } from "@/components/access-required-card";
import { AdminAttendanceCard } from "@/components/admin-attendance-card";
import { AdminCreateAttendanceModal } from "@/components/admin-create-attendance-modal";
import { AdminOverview } from "@/components/admin-overview";
import { AttendanceGovernanceModal } from "@/components/attendance-governance-modal";
import { AttendanceHistoryModal } from "@/components/attendance-history-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { trpc } from "@/lib/trpc";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAttendances } from "@/hooks/use-attendances";
import type { Attendance, AttendanceStatus, DelayReason } from "@/types/attendance";
import { STATUS_LABELS, SERVICE_TYPE_LABELS, getAttendancePrioritySnapshot, getNextStatus, validateLicensePlate, formatLicensePlate } from "@/types/attendance";

const STATUS_SORT_ORDER: Record<AttendanceStatus, number> = { arrival: 0, waiting: 1, in_service: 2, completed: 3 };
type StatusFeedback = { title: string; detail: string };

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor({}, "cardBackground");
  const borderColor = useThemeColor({}, "border");
  const { user, roleLabel, isAdmin, isOperator, loading: userLoading } = useCurrentUser();
  const { attendances, loading, createAttendance, updateAttendanceStatus, updateAttendanceGovernance, deleteAttendance } = useAttendances({ scope: "manage", enabled: Boolean(user && isOperator) });
  const { data: operationalMetrics } = trpc.attendances.metrics.useQuery(undefined, { enabled: Boolean(user && isOperator), retry: false, refetchInterval: 5000 });

  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedHistoryAttendance, setSelectedHistoryAttendance] = useState<Attendance | null>(null);
  const [selectedGovernanceAttendance, setSelectedGovernanceAttendance] = useState<Attendance | null>(null);
  const [licensePlate, setLicensePlate] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [serviceType, setServiceType] = useState<"tire" | "corrective" | "preventive">("preventive");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<AttendanceStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFeedback, setStatusFeedback] = useState<StatusFeedback | null>(null);

  useEffect(() => {
    if (!statusFeedback) return;
    const timeout = setTimeout(() => setStatusFeedback(null), 2800);
    return () => clearTimeout(timeout);
  }, [statusFeedback]);

  const filteredAttendances = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return attendances
      .filter((a) => selectedFilter === "all" || a.status === selectedFilter)
      .filter((a) => {
        if (!q) return true;
        const haystack = [a.licensePlate, a.vehicleModel, a.customerName || "", a.description || "", a.operationalNote || "", STATUS_LABELS[a.status] || a.status, SERVICE_TYPE_LABELS[a.serviceType] || a.serviceType].join(" ").toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => {
        const priorityDelta = getAttendancePrioritySnapshot(b).score - getAttendancePrioritySnapshot(a).score;
        if (priorityDelta !== 0) return priorityDelta;
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
    if (!licensePlate.trim()) return Alert.alert("Erro", "Por favor, informe a placa do veículo");
    if (!validateLicensePlate(licensePlate)) return Alert.alert("Erro", "Formato de placa inválido. Use ABC-1234 ou ABC1D34");
    if (!vehicleModel.trim()) return Alert.alert("Erro", "Por favor, informe o modelo do veículo");
    if (customerPhone.trim() && !/^\d{10,15}$/.test(customerPhone.replace(/\D/g, ""))) return Alert.alert("Erro", "Telefone inválido. Use apenas números (10-15 dígitos)");

    try {
      setSubmitting(true);
      await createAttendance({ licensePlate: formatLicensePlate(licensePlate), vehicleModel, serviceType, customerName: customerName.trim() || undefined, customerPhone: customerPhone.trim() || undefined, description: description.trim() || undefined });
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStatusFeedback({ title: "Atendimento criado", detail: `${formatLicensePlate(licensePlate)} entrou no fluxo operacional.` });
      Alert.alert("Sucesso!", `Atendimento criado para ${formatLicensePlate(licensePlate)}`, [{ text: "OK" }]);
      resetForm();
    } catch (error) {
      console.error("Erro ao criar atendimento:", error);
      Alert.alert("Erro", "Não foi possível criar o atendimento. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateGovernance = async (input: { id: number; delayReason: DelayReason; operationalNote?: string; slaExceptionActive: boolean; slaExceptionReason?: string }) => {
    try {
      await updateAttendanceGovernance(input);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStatusFeedback({ title: "Governança atualizada", detail: "Motivo de atraso, nota operacional ou exceção SLA foram atualizados." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível salvar a governança.";
      Alert.alert("Erro", message);
      throw error;
    }
  };

  const handleUpdateStatus = async (attendance: Attendance) => {
    const nextStatus = getNextStatus(attendance.status);
    if (!nextStatus) {
      return Alert.alert("Atendimento concluído", `O atendimento de ${attendance.licensePlate} já está finalizado e continua salvo para histórico e relatórios.`, [{ text: "OK" }]);
    }

    try {
      await updateAttendanceStatus(Number(attendance.id), nextStatus);
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setStatusFeedback({ title: `${attendance.licensePlate} avançou`, detail: `${STATUS_LABELS[attendance.status]} → ${STATUS_LABELS[nextStatus]}` });
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar o status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAttendance(Number(id));
      if (selectedHistoryAttendance?.id === id) setSelectedHistoryAttendance(null);
      if (selectedGovernanceAttendance?.id === id) setSelectedGovernanceAttendance(null);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert("Erro", "Não foi possível remover o atendimento");
    }
  };

  if (userLoading) {
    return <ThemedView style={[styles.container, { backgroundColor }]}><View style={styles.loadingContainer}><ActivityIndicator size="large" color={tintColor} /></View></ThemedView>;
  }

  if (!user) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ScrollView contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 20, paddingBottom: Math.max(insets.bottom, 20) + 20 }}>
          <View style={styles.header}><ThemedText type="title">Painel Administrativo</ThemedText><ThemedText style={styles.subtitle}>Área protegida para operação e gestão dos atendimentos</ThemedText></View>
          <AccessRequiredCard />
        </ScrollView>
      </ThemedView>
    );
  }

  if (!isOperator) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ScrollView contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 20, paddingBottom: Math.max(insets.bottom, 20) + 20 }}>
          <View style={styles.header}><ThemedText type="title">Painel Administrativo</ThemedText><ThemedText style={styles.subtitle}>Seu perfil atual não possui acesso operacional.</ThemedText></View>
          <AccessRequiredCard title="Permissão insuficiente" description="Este painel é destinado a operadores e administradores do sistema." />
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 20) + 20, paddingBottom: Math.max(insets.bottom, 20) + 80 }]}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextBlock}><ThemedText type="title">Painel Administrativo</ThemedText><ThemedText style={styles.subtitle}>Gerencie os atendimentos em tempo real</ThemedText></View>
            <View style={[styles.roleBadge, { backgroundColor: isAdmin ? "rgba(0, 200, 83, 0.12)" : "rgba(0, 82, 163, 0.10)" }]}><ThemedText style={[styles.roleBadgeText, { color: isAdmin ? "#1C7C54" : "#0052A3" }]}>{roleLabel}</ThemedText></View>
          </View>
        </View>

        {statusFeedback ? <View style={[styles.feedbackBanner, { backgroundColor: cardBackground, borderColor }]}><View style={[styles.feedbackDot, { backgroundColor: tintColor }]} /><View style={styles.feedbackTextBlock}><ThemedText style={styles.feedbackTitle}>{statusFeedback.title}</ThemedText><ThemedText style={styles.feedbackDetail}>{statusFeedback.detail}</ThemedText></View></View> : null}

        <AdminOverview attendances={attendances} operationalMetrics={operationalMetrics} selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} searchQuery={searchQuery} onSearchChange={setSearchQuery} cardBackground={cardBackground} borderColor={borderColor} tintColor={tintColor} />

        <View style={styles.listHeader}><ThemedText style={styles.listTitle}>Fila operacional priorizada</ThemedText><ThemedText style={styles.listSubtitle}>{filteredAttendances.length} atendimento(s) encontrado(s){searchQuery.trim() ? " com a busca aplicada" : ""} • ordenação por SLA, atraso e estágio do fluxo</ThemedText></View>

        {loading ? <View style={styles.loadingContainer}><ActivityIndicator size="large" color={tintColor} /></View> : filteredAttendances.length === 0 ? <View style={styles.emptyState}><ThemedText style={styles.emptyText}>Nenhum atendimento encontrado com os filtros atuais.</ThemedText></View> : filteredAttendances.map((attendance) => (
          <AdminAttendanceCard
            key={attendance.id}
            attendance={attendance}
            cardBackground={cardBackground}
            borderColor={borderColor}
            tintColor={tintColor}
            canDelete={isAdmin}
            onAdvance={() => handleUpdateStatus(attendance)}
            onViewHistory={() => setSelectedHistoryAttendance(attendance)}
            onManageGovernance={() => setSelectedGovernanceAttendance(attendance)}
            onDelete={isAdmin ? () => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert("Remover Atendimento", `Tem certeza que deseja remover o atendimento ${attendance.licensePlate}?`, [{ text: "Manter", style: "cancel" }, { text: "Remover", style: "destructive", onPress: () => handleDelete(attendance.id) }]);
            } : undefined}
          />
        ))}
      </ScrollView>

      <Pressable style={[styles.fab, { backgroundColor: tintColor, bottom: Math.max(insets.bottom, 20) + 60 }]} onPress={() => setShowNewModal(true)}><ThemedText style={styles.fabText}>+</ThemedText></Pressable>

      <AdminCreateAttendanceModal visible={showNewModal} onClose={() => setShowNewModal(false)} onSubmit={handleCreateAttendance} backgroundColor={backgroundColor} cardBackground={cardBackground} borderColor={borderColor} tintColor={tintColor} submitting={submitting} licensePlate={licensePlate} setLicensePlate={setLicensePlate} vehicleModel={vehicleModel} setVehicleModel={setVehicleModel} serviceType={serviceType} setServiceType={setServiceType} customerName={customerName} setCustomerName={setCustomerName} customerPhone={customerPhone} setCustomerPhone={setCustomerPhone} description={description} setDescription={setDescription} />

      <AttendanceHistoryModal visible={Boolean(selectedHistoryAttendance)} attendanceId={selectedHistoryAttendance?.id} licensePlate={selectedHistoryAttendance?.licensePlate} onClose={() => setSelectedHistoryAttendance(null)} backgroundColor={backgroundColor} cardBackground={cardBackground} borderColor={borderColor} tintColor={tintColor} />

      <AttendanceGovernanceModal visible={Boolean(selectedGovernanceAttendance)} attendance={selectedGovernanceAttendance} onClose={() => setSelectedGovernanceAttendance(null)} backgroundColor={backgroundColor} cardBackground={cardBackground} borderColor={borderColor} tintColor={tintColor} onSave={handleUpdateGovernance} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  header: { marginBottom: 20, paddingHorizontal: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  headerTextBlock: { flex: 1 },
  subtitle: { fontSize: 16, opacity: 0.7, marginTop: 8 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, marginTop: 4 },
  roleBadgeText: { fontSize: 12, fontWeight: "800" },
  feedbackBanner: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  feedbackDot: { width: 12, height: 12, borderRadius: 6 },
  feedbackTextBlock: { flex: 1 },
  feedbackTitle: { fontSize: 14, fontWeight: "800", marginBottom: 4 },
  feedbackDetail: { fontSize: 13, opacity: 0.72 },
  listHeader: { marginBottom: 14 },
  listTitle: { fontSize: 18, fontWeight: "700" },
  listSubtitle: { fontSize: 13, opacity: 0.65, marginTop: 4 },
  loadingContainer: { paddingVertical: 40, alignItems: "center" },
  emptyState: { paddingVertical: 60, alignItems: "center" },
  emptyText: { fontSize: 16, opacity: 0.55, textAlign: "center" },
  fab: { position: "absolute", right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center", elevation: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  fabText: { color: "#FFFFFF", fontSize: 32, fontWeight: "300" },
});
