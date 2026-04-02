import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { trpc } from "@/lib/trpc";
import {
  ATTENDANCE_HISTORY_ACTOR_LABELS,
  ATTENDANCE_HISTORY_CHANGE_LABELS,
  STATUS_LABELS,
  type AttendanceHistoryEntry,
} from "@/types/attendance";
import { ThemedText } from "@/components/themed-text";

interface AttendanceHistoryModalProps {
  visible: boolean;
  attendanceId?: string | null;
  licensePlate?: string;
  onClose: () => void;
  backgroundColor: string;
  cardBackground: string;
  borderColor: string;
  tintColor: string;
}

function formatDateTime(timestamp: number) {
  return new Date(timestamp).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getActorLabel(entry: AttendanceHistoryEntry) {
  const baseRole = ATTENDANCE_HISTORY_ACTOR_LABELS[entry.changedByRole] || "Sistema";
  if (entry.changedByName) {
    return `${baseRole}: ${entry.changedByName}`;
  }
  if (entry.changedByEmail) {
    return `${baseRole}: ${entry.changedByEmail}`;
  }
  return baseRole;
}

function getTransitionLabel(entry: AttendanceHistoryEntry) {
  if (entry.changeType === "created") {
    return `Fluxo iniciado em ${STATUS_LABELS[entry.toStatus]}`;
  }
  if (entry.changeType === "deleted") {
    return `Atendimento removido quando estava em ${STATUS_LABELS[entry.toStatus]}`;
  }
  return `${STATUS_LABELS[entry.fromStatus || entry.toStatus]} → ${STATUS_LABELS[entry.toStatus]}`;
}

function HistoryTimelineItem({ entry, isLast, borderColor, tintColor }: { entry: AttendanceHistoryEntry; isLast: boolean; borderColor: string; tintColor: string }) {
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineRail}>
        <View style={[styles.timelineDot, { backgroundColor: tintColor }]} />
        {!isLast ? <View style={[styles.timelineLine, { backgroundColor: borderColor }]} /> : null}
      </View>

      <View style={[styles.timelineCard, { borderColor }]}> 
        <View style={styles.timelineHeader}>
          <View style={[styles.changeTypeBadge, { backgroundColor: "rgba(0, 82, 163, 0.10)" }]}>
            <ThemedText style={styles.changeTypeBadgeText}>{ATTENDANCE_HISTORY_CHANGE_LABELS[entry.changeType]}</ThemedText>
          </View>
          <ThemedText style={styles.timelineTimestamp}>{formatDateTime(entry.createdAt)}</ThemedText>
        </View>

        <ThemedText style={styles.timelineTitle}>{getTransitionLabel(entry)}</ThemedText>
        <ThemedText style={styles.timelineActor}>{getActorLabel(entry)}</ThemedText>

        {entry.note ? <ThemedText style={styles.timelineNote}>{entry.note}</ThemedText> : null}
      </View>
    </View>
  );
}

export function AttendanceHistoryModal({
  visible,
  attendanceId,
  licensePlate,
  onClose,
  backgroundColor,
  cardBackground,
  borderColor,
  tintColor,
}: AttendanceHistoryModalProps) {
  const numericAttendanceId = attendanceId ? Number(attendanceId) : NaN;
  const { data, isLoading } = trpc.attendances.history.useQuery(
    { attendanceId: numericAttendanceId },
    { enabled: visible && Number.isFinite(numericAttendanceId), retry: false },
  );

  const history: AttendanceHistoryEntry[] = (data ?? []).map((entry) => ({
    id: String(entry.id),
    attendanceId: String(entry.attendanceId),
    fromStatus: (entry.fromStatus as AttendanceHistoryEntry["fromStatus"]) ?? null,
    toStatus: entry.toStatus as AttendanceHistoryEntry["toStatus"],
    changeType: entry.changeType as AttendanceHistoryEntry["changeType"],
    changedByUserId: entry.changedByUserId ? String(entry.changedByUserId) : undefined,
    changedByRole: entry.changedByRole as AttendanceHistoryEntry["changedByRole"],
    changedByName: entry.changedByName ?? undefined,
    changedByEmail: entry.changedByEmail ?? undefined,
    note: entry.note ?? undefined,
    createdAt: new Date(entry.createdAt).getTime(),
  }));

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.surface, { backgroundColor, borderColor }]}> 
          <View style={[styles.header, { borderBottomColor: borderColor }]}> 
            <View style={styles.headerTextBlock}>
              <ThemedText type="subtitle" style={styles.title}>Histórico do Atendimento</ThemedText>
              <ThemedText style={styles.subtitle}>{licensePlate ? `Linha do tempo de ${licensePlate}` : "Rastreabilidade completa das mudanças deste atendimento."}</ThemedText>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <ThemedText style={styles.closeButtonText}>✕</ThemedText>
            </Pressable>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            {isLoading ? (
              <View style={styles.loadingState}><ActivityIndicator size="large" color={tintColor} /></View>
            ) : history.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: cardBackground, borderColor }]}>
                <ThemedText style={styles.emptyTitle}>Nenhum evento registrado</ThemedText>
                <ThemedText style={styles.emptyText}>As próximas mudanças de status passarão a aparecer aqui como trilha de auditoria.</ThemedText>
              </View>
            ) : (
              history.map((entry, index) => (
                <HistoryTimelineItem
                  key={entry.id}
                  entry={entry}
                  isLast={index === history.length - 1}
                  borderColor={borderColor}
                  tintColor={tintColor}
                />
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.38)",
    justifyContent: "flex-end",
  },
  surface: {
    minHeight: "68%",
    maxHeight: "88%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTextBlock: { flex: 1 },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 6 },
  subtitle: { fontSize: 13, opacity: 0.72, lineHeight: 20 },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  closeButtonText: { fontSize: 16, fontWeight: "800" },
  content: { flex: 1 },
  contentContainer: { paddingHorizontal: 18, paddingVertical: 18 },
  loadingState: { paddingVertical: 40, alignItems: "center" },
  emptyState: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
    alignItems: "center",
  },
  emptyTitle: { fontSize: 16, fontWeight: "800", marginBottom: 8 },
  emptyText: { fontSize: 13, opacity: 0.7, lineHeight: 20, textAlign: "center" },
  timelineItem: { flexDirection: "row", gap: 12, marginBottom: 14 },
  timelineRail: { width: 22, alignItems: "center" },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 10 },
  timelineLine: { width: 2, flex: 1, marginTop: 6, borderRadius: 999 },
  timelineCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  timelineHeader: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginBottom: 10, alignItems: "center", flexWrap: "wrap" },
  changeTypeBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  changeTypeBadgeText: { fontSize: 11, fontWeight: "800", color: "#0052A3" },
  timelineTimestamp: { fontSize: 12, opacity: 0.65, fontWeight: "700" },
  timelineTitle: { fontSize: 15, fontWeight: "800", marginBottom: 6 },
  timelineActor: { fontSize: 12, opacity: 0.72, marginBottom: 8, fontWeight: "600" },
  timelineNote: { fontSize: 12, opacity: 0.68, lineHeight: 18 },
});
