import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import type { Attendance, DelayReason } from "@/types/attendance";
import { DELAY_REASON_LABELS, DELAY_REASON_OPTIONS, getAttendanceSlaSnapshot, SLA_SEVERITY_LABELS } from "@/types/attendance";

interface AttendanceGovernanceModalProps {
  visible: boolean;
  attendance: Attendance | null;
  backgroundColor: string;
  cardBackground: string;
  borderColor: string;
  tintColor: string;
  onClose: () => void;
 onSave: (input: { id: string; delayReason: DelayReason; operationalNote?: string; slaExceptionActive: boolean; slaExceptionReason?: string }) => Promise<void>;
}

export function AttendanceGovernanceModal({ visible, attendance, backgroundColor, cardBackground, borderColor, tintColor, onClose, onSave }: AttendanceGovernanceModalProps) {
  const [delayReason, setDelayReason] = useState<DelayReason>("none");
  const [operationalNote, setOperationalNote] = useState("");
  const [slaExceptionActive, setSlaExceptionActive] = useState(false);
  const [slaExceptionReason, setSlaExceptionReason] = useState("");
  const [saving, setSaving] = useState(false);
  const slaSnapshot = useMemo(() => (attendance ? getAttendanceSlaSnapshot(attendance) : null), [attendance]);

  useEffect(() => {
    if (!attendance) return;
    setDelayReason(attendance.delayReason || "none");
    setOperationalNote(attendance.operationalNote || "");
    setSlaExceptionActive(Boolean(attendance.slaExceptionActive));
    setSlaExceptionReason(attendance.slaExceptionReason || "");
  }, [attendance]);

  const handleSave = async () => {
    if (!attendance) return;
    setSaving(true);
    try {
      await onSave({
       id: attendance.id,
        delayReason,
        operationalNote: operationalNote.trim() || undefined,
        slaExceptionActive,
        slaExceptionReason: slaExceptionActive ? slaExceptionReason.trim() || undefined : undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.surface, { backgroundColor, borderColor }]}> 
          <View style={[styles.header, { borderBottomColor: borderColor }]}> 
            <View style={styles.headerTextBlock}>
              <ThemedText type="subtitle" style={styles.title}>Governança e SLA</ThemedText>
              <ThemedText style={styles.subtitle}>{attendance ? `${attendance.licensePlate} · ${attendance.vehicleModel}` : "Atualize justificativas operacionais e exceções de SLA."}</ThemedText>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}><ThemedText style={styles.closeButtonText}>✕</ThemedText></Pressable>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            {slaSnapshot ? (
              <View style={[styles.slaSurface, { backgroundColor: cardBackground, borderColor }]}> 
                <ThemedText style={styles.sectionTitle}>Status do SLA</ThemedText>
                <ThemedText style={styles.slaValue}>{SLA_SEVERITY_LABELS[slaSnapshot.severity]}</ThemedText>
                <ThemedText style={styles.slaHelper}>Decorrido {slaSnapshot.elapsedMinutes} min · alvo {slaSnapshot.targetMinutes} min</ThemedText>
              </View>
            ) : null}

            <View style={[styles.section, { backgroundColor: cardBackground, borderColor }]}> 
              <ThemedText style={styles.sectionTitle}>Motivo de atraso</ThemedText>
              <View style={styles.reasonWrap}>
                {DELAY_REASON_OPTIONS.map((reason) => {
                  const active = delayReason === reason;
                  return (
                    <Pressable
                      key={reason}
                      onPress={() => setDelayReason(reason)}
                      style={[styles.reasonChip, { borderColor }, active && { backgroundColor: tintColor, borderColor: tintColor }]}
                    >
                      <ThemedText style={[styles.reasonChipText, active && styles.reasonChipTextActive]}>{DELAY_REASON_LABELS[reason]}</ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={[styles.section, { backgroundColor: cardBackground, borderColor }]}> 
              <ThemedText style={styles.sectionTitle}>Nota operacional</ThemedText>
              <TextInput
                style={[styles.textArea, { borderColor }]}
                placeholder="Descreva contexto, bloqueio ou ação em andamento"
                placeholderTextColor="#999"
                value={operationalNote}
                onChangeText={setOperationalNote}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={[styles.section, { backgroundColor: cardBackground, borderColor }]}> 
              <View style={styles.switchRow}>
                <View style={styles.switchTextBlock}>
                  <ThemedText style={styles.sectionTitle}>Exceção de SLA</ThemedText>
                  <ThemedText style={styles.switchHelper}>Use quando o caso sair do padrão operacional e não puder ser medido pela meta normal.</ThemedText>
                </View>
                <Switch value={slaExceptionActive} onValueChange={setSlaExceptionActive} trackColor={{ false: "#ccc", true: tintColor }} thumbColor="#fff" />
              </View>

              {slaExceptionActive ? (
                <TextInput
                  style={[styles.textArea, { borderColor, marginTop: 14 }]}
                  placeholder="Explique por que este atendimento é exceção de SLA"
                  placeholderTextColor="#999"
                  value={slaExceptionReason}
                  onChangeText={setSlaExceptionReason}
                  multiline
                  textAlignVertical="top"
                />
              ) : null}
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: borderColor }]}> 
            <Pressable style={[styles.footerButton, styles.cancelButton, { borderColor }]} onPress={onClose}>
              <ThemedText style={styles.cancelText}>Cancelar</ThemedText>
            </Pressable>
            <Pressable style={[styles.footerButton, { backgroundColor: tintColor }]} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.saveText}>Salvar governança</ThemedText>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.38)", justifyContent: "flex-end" },
  surface: { minHeight: "72%", maxHeight: "92%", borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, overflow: "hidden" },
  header: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingHorizontal: 18, paddingVertical: 16, borderBottomWidth: 1 },
  headerTextBlock: { flex: 1 },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 6 },
  subtitle: { fontSize: 13, opacity: 0.72, lineHeight: 20 },
  closeButton: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.05)" },
  closeButtonText: { fontSize: 16, fontWeight: "800" },
  content: { flex: 1 },
  contentContainer: { padding: 18 },
  slaSurface: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 14 },
  slaValue: { fontSize: 22, fontWeight: "800", marginBottom: 6 },
  slaHelper: { fontSize: 13, opacity: 0.72 },
  section: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: "800", marginBottom: 10 },
  reasonWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  reasonChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  reasonChipText: { fontSize: 12, fontWeight: "700" },
  reasonChipTextActive: { color: "#FFFFFF" },
  textArea: { borderWidth: 1, borderRadius: 12, minHeight: 96, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14 },
  switchRow: { flexDirection: "row", gap: 12, justifyContent: "space-between", alignItems: "flex-start" },
  switchTextBlock: { flex: 1 },
  switchHelper: { fontSize: 12, opacity: 0.7, lineHeight: 18 },
  footer: { borderTopWidth: 1, flexDirection: "row", gap: 12, padding: 18 },
  footerButton: { flex: 1, minHeight: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cancelButton: { borderWidth: 1, backgroundColor: "transparent" },
  cancelText: { fontSize: 14, fontWeight: "700" },
  saveText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});
