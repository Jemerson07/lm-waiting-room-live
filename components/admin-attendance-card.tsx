import { Pressable, StyleSheet, View } from "react-native";
import { StatusProgressTrack } from "@/components/status-progress-track";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import type { Attendance, AttendanceStatus } from "@/types/attendance";
import {
  DELAY_REASON_LABELS,
  SERVICE_TYPE_ICONS,
  SERVICE_TYPE_LABELS,
  SLA_SEVERITY_LABELS,
  STATUS_LABELS,
  getAttendanceSlaSnapshot,
  getElapsedTime,
  getNextStatus,
} from "@/types/attendance";

interface AdminAttendanceCardProps {
  attendance: Attendance;
  cardBackground: string;
  borderColor: string;
  tintColor: string;
  onAdvance: () => void;
  onViewHistory: () => void;
  onManageGovernance: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
}

type PriorityMeta = { label: string; helper: string; backgroundColor: string; textColor: string };

function getStatusColor(status: AttendanceStatus): string {
  const colorScheme = "light";
  return Colors[colorScheme][`status${status.charAt(0).toUpperCase() + status.slice(1).replace(/_./g, (m) => m[1].toUpperCase())}` as keyof typeof Colors.light] as string;
}

function getElapsedMinutes(createdAt: string | number | Date): number {
  const createdTimestamp = createdAt instanceof Date ? createdAt.getTime() : Number(new Date(createdAt));
  return Math.max(0, Math.round((Date.now() - createdTimestamp) / 60000));
}

function getPriorityMeta(attendance: Attendance): PriorityMeta {
  const elapsedMinutes = getElapsedMinutes(attendance.createdAt);
  if (attendance.slaExceptionActive) {
    return { label: "Exceção de SLA", helper: attendance.slaExceptionReason || "Este atendimento foi marcado como exceção operacional.", backgroundColor: "rgba(123, 31, 162, 0.12)", textColor: "#7B1FA2" };
  }
  if (attendance.status === "completed") {
    return { label: "Histórico", helper: "Atendimento finalizado e preservado para análise.", backgroundColor: "rgba(0, 200, 83, 0.10)", textColor: "#1C7C54" };
  }
  if (attendance.status === "in_service") {
    return { label: "Alta atenção", helper: "Veículo em execução agora. Priorize o acompanhamento até a conclusão.", backgroundColor: "rgba(255, 107, 0, 0.12)", textColor: "#B54708" };
  }
  if (attendance.status === "waiting" && elapsedMinutes >= 30) {
    return { label: "Fila longa", helper: "Tempo de espera acima de 30 minutos. Vale revisar a fila.", backgroundColor: "rgba(255, 165, 0, 0.12)", textColor: "#A35B00" };
  }
  if (attendance.status === "arrival" && elapsedMinutes <= 15) {
    return { label: "Entrada recente", helper: "Novo veículo no fluxo. Boa hora para triagem rápida.", backgroundColor: "rgba(0, 145, 234, 0.12)", textColor: "#005B9F" };
  }
  return { label: "Acompanhar", helper: "Fluxo normal do atendimento. Siga a evolução conforme o status.", backgroundColor: "rgba(92, 107, 192, 0.12)", textColor: "#3749A6" };
}

export function AdminAttendanceCard({ attendance, cardBackground, borderColor, tintColor, onAdvance, onViewHistory, onManageGovernance, onDelete, canDelete = false }: AdminAttendanceCardProps) {
  const nextStatus = getNextStatus(attendance.status);
  const isCompleted = !nextStatus;
  const statusColor = getStatusColor(attendance.status);
  const priority = getPriorityMeta(attendance);
  const sla = getAttendanceSlaSnapshot(attendance);
  const updatedLabel = new Date(Number(attendance.updatedAt)).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
      <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <ThemedText type="subtitle" style={styles.licensePlate}>{attendance.licensePlate}</ThemedText>
            <ThemedText style={styles.vehicleModel}>{attendance.vehicleModel}</ThemedText>
          </View>
          <View style={styles.cardHeaderRight}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}><ThemedText style={styles.statusBadgeText}>{STATUS_LABELS[attendance.status]}</ThemedText></View>
            <ThemedText style={styles.elapsedTime}>{getElapsedTime(attendance.createdAt)}</ThemedText>
          </View>
        </View>

        <View style={styles.progressWrapper}><StatusProgressTrack status={attendance.status} accentColor={statusColor} compact /></View>

        <View style={[styles.priorityPanel, { backgroundColor: priority.backgroundColor }]}>
          <ThemedText style={[styles.priorityTitle, { color: priority.textColor }]}>{priority.label}</ThemedText>
          <ThemedText style={styles.priorityHelper}>{priority.helper}</ThemedText>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.serviceTypeBadge}><ThemedText style={styles.serviceTypeText}>{SERVICE_TYPE_ICONS[attendance.serviceType]} {SERVICE_TYPE_LABELS[attendance.serviceType]}</ThemedText></View>
          <View style={[styles.slaChip, { backgroundColor: sla.severity === "breached" ? "rgba(179,38,30,0.12)" : sla.severity === "risk" ? "rgba(181,71,8,0.12)" : sla.severity === "exempt" ? "rgba(123,31,162,0.12)" : "rgba(0,200,83,0.12)" }]}>
            <ThemedText style={[styles.slaChipText, { color: sla.severity === "breached" ? "#B3261E" : sla.severity === "risk" ? "#B54708" : sla.severity === "exempt" ? "#7B1FA2" : "#1C7C54" }]}>{SLA_SEVERITY_LABELS[sla.severity]}</ThemedText>
          </View>
          {attendance.customerName ? <View style={styles.customerChip}><ThemedText style={styles.customerChipText}>Cliente: {attendance.customerName}</ThemedText></View> : null}
          {attendance.delayReason !== "none" ? <View style={styles.delayChip}><ThemedText style={styles.delayChipText}>{DELAY_REASON_LABELS[attendance.delayReason]}</ThemedText></View> : null}
          {!canDelete ? <View style={styles.permissionChip}><ThemedText style={styles.permissionChipText}>Exclusão: admin</ThemedText></View> : null}
        </View>

        {attendance.description ? <ThemedText style={styles.description} numberOfLines={2}>{attendance.description}</ThemedText> : null}
        {attendance.operationalNote ? <View style={styles.noteSurface}><ThemedText style={styles.noteTitle}>Nota operacional</ThemedText><ThemedText style={styles.noteText} numberOfLines={3}>{attendance.operationalNote}</ThemedText></View> : null}

        <View style={styles.infoRow}>
          <View style={styles.infoItem}><ThemedText style={styles.infoLabel}>Tempo total</ThemedText><ThemedText style={styles.infoValue}>{getElapsedTime(attendance.createdAt)}</ThemedText></View>
          <View style={styles.infoItem}><ThemedText style={styles.infoLabel}>Meta SLA</ThemedText><ThemedText style={styles.infoValue}>{sla.targetMinutes} min</ThemedText></View>
          <View style={styles.infoItem}><ThemedText style={styles.infoLabel}>Atualizado às</ThemedText><ThemedText style={styles.infoValue}>{updatedLabel}</ThemedText></View>
        </View>

        {isCompleted ? <View style={styles.historyHint}><ThemedText style={styles.historyHintText}>Atendimento concluído e mantido no histórico do sistema.</ThemedText></View> : null}

        <View style={styles.cardActions}>
          <Pressable style={[styles.primaryActionButton, { backgroundColor: isCompleted ? "#A0A7B4" : tintColor }, isCompleted && styles.actionButtonDisabled]} onPress={onAdvance} disabled={isCompleted}>
            <ThemedText style={styles.primaryActionText}>{nextStatus ? `Avançar para ${STATUS_LABELS[nextStatus]}` : "Concluído"}</ThemedText>
          </Pressable>
          <Pressable style={[styles.secondaryButton, { borderColor }]} onPress={onManageGovernance}><ThemedText style={styles.secondaryButtonText}>SLA</ThemedText></Pressable>
          <Pressable style={[styles.secondaryButton, { borderColor }]} onPress={onViewHistory}><ThemedText style={styles.secondaryButtonText}>Histórico</ThemedText></Pressable>
          {canDelete && onDelete ? <Pressable style={({ pressed }) => [styles.deleteButton, { backgroundColor: pressed ? "rgba(255, 59, 48, 0.08)" : "transparent", borderColor: "rgba(255, 59, 48, 0.45)" }]} onPress={onDelete}><ThemedText style={styles.deleteButtonText}>Remover</ThemedText></Pressable> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, marginBottom: 16, overflow: "hidden", flexDirection: "row", borderWidth: 1 },
  statusIndicator: { width: 5 },
  cardContent: { flex: 1, padding: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginBottom: 10 },
  cardHeaderLeft: { flex: 1 },
  cardHeaderRight: { alignItems: "flex-end", gap: 8 },
  licensePlate: { fontSize: 22, fontWeight: "800" },
  vehicleModel: { fontSize: 15, opacity: 0.84 },
  elapsedTime: { fontSize: 12, opacity: 0.65, fontWeight: "600" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  statusBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  progressWrapper: { marginBottom: 12 },
  priorityPanel: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  priorityTitle: { fontSize: 13, fontWeight: "800", marginBottom: 4 },
  priorityHelper: { fontSize: 12, lineHeight: 18, opacity: 0.82 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  serviceTypeBadge: { alignSelf: "flex-start", backgroundColor: "rgba(0, 102, 204, 0.1)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  serviceTypeText: { fontSize: 12, fontWeight: "700", color: "#0066CC" },
  slaChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  slaChipText: { fontSize: 12, fontWeight: "800" },
  customerChip: { backgroundColor: "rgba(0, 0, 0, 0.05)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  customerChipText: { fontSize: 12, fontWeight: "600", opacity: 0.8 },
  delayChip: { backgroundColor: "rgba(255, 165, 0, 0.12)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  delayChipText: { fontSize: 12, fontWeight: "700", color: "#A35B00" },
  permissionChip: { backgroundColor: "rgba(255, 107, 0, 0.10)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  permissionChipText: { fontSize: 12, fontWeight: "700", color: "#B54708" },
  description: { fontSize: 14, opacity: 0.72, marginBottom: 12 },
  noteSurface: { backgroundColor: "rgba(0,0,0,0.035)", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  noteTitle: { fontSize: 11, fontWeight: "700", opacity: 0.66, marginBottom: 4 },
  noteText: { fontSize: 13, lineHeight: 19, opacity: 0.8 },
  infoRow: { flexDirection: "row", gap: 10, marginBottom: 12, flexWrap: "wrap" },
  infoItem: { flex: 1, minWidth: 92, backgroundColor: "rgba(0, 0, 0, 0.035)", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  infoLabel: { fontSize: 11, opacity: 0.62, marginBottom: 4, fontWeight: "600" },
  infoValue: { fontSize: 13, fontWeight: "700" },
  historyHint: { backgroundColor: "rgba(0, 200, 83, 0.08)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 12 },
  historyHintText: { fontSize: 12, color: "#1C7C54", fontWeight: "700" },
  cardActions: { flexDirection: "row", gap: 10, alignItems: "center", flexWrap: "wrap" },
  primaryActionButton: { flex: 1, minWidth: 180, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, minHeight: 44, justifyContent: "center", alignItems: "center" },
  actionButtonDisabled: { opacity: 0.9 },
  primaryActionText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700", textAlign: "center" },
  secondaryButton: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, minHeight: 44, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.02)" },
  secondaryButtonText: { fontSize: 13, fontWeight: "700" },
  deleteButton: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, minHeight: 44, justifyContent: "center", alignItems: "center" },
  deleteButtonText: { fontSize: 13, fontWeight: "700", color: "#FF3B30" },
});
