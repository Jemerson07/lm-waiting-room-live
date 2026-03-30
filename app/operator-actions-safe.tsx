import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { env, isMaintenanceModeEnabled } from "@/lib/env";
import { useUpdateMaintenanceOrderStatus } from "@/hooks/use-maintenance-actions";

const STATUS_OPTIONS = [
  "checkin",
  "diagnostico",
  "aprovacao",
  "em_servico",
  "teste_final",
  "finalizada",
  "entregue",
];

export default function OperatorActionsSafeScreen() {
  const insets = useSafeAreaInsets();
  const enabled = isMaintenanceModeEnabled();
  const mutation = useUpdateMaintenanceOrderStatus();
  const [orderId, setOrderId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("diagnostico");
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit() {
    setFeedback(null);
    try {
      const result = await mutation.mutateAsync({
        orderId: orderId.trim(),
        currentStatus: selectedStatus,
        diagnosis,
      });
      setFeedback(`Ordem atualizada para ${result.current_status}.`);
    } catch (error) {
      setFeedback(String((error as Error)?.message ?? error));
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: 32 }}>
        <View style={styles.hero}>
          <ThemedText type="title" style={styles.heroTitle}>Operador • ações rápidas</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Atualize status e diagnóstico com uma UX mais direta para operação em oficina, celular e web.
          </ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle">Atualizar ordem</ThemedText>
          <ThemedText style={styles.subtle}>Empresa: {env.companySlug}</ThemedText>

          <TextInput
            style={styles.input}
            value={orderId}
            onChangeText={setOrderId}
            placeholder="ID da ordem"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            value={diagnosis}
            onChangeText={setDiagnosis}
            placeholder="Diagnóstico ou observação"
            placeholderTextColor="#94a3b8"
            multiline
            textAlignVertical="top"
          />

          <View style={styles.statusGrid}>
            {STATUS_OPTIONS.map((status) => {
              const active = status === selectedStatus;
              return (
                <Pressable key={status} style={[styles.statusChip, active && styles.statusChipActive]} onPress={() => setSelectedStatus(status)}>
                  <ThemedText style={[styles.statusChipText, active && styles.statusChipTextActive]}>{status}</ThemedText>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={[styles.button, (!enabled || !orderId.trim() || mutation.isPending) && styles.buttonDisabled]}
            disabled={!enabled || !orderId.trim() || mutation.isPending}
            onPress={handleSubmit}
          >
            <ThemedText style={styles.buttonText}>{mutation.isPending ? "Atualizando..." : "Salvar atualização"}</ThemedText>
          </Pressable>

          {feedback ? <ThemedText style={styles.feedback}>{feedback}</ThemedText> : null}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  hero: { borderRadius: 24, padding: 20, backgroundColor: "#0f172a", marginBottom: 16 },
  heroTitle: { color: "#fff" },
  heroSubtitle: { color: "rgba(255,255,255,0.78)", marginTop: 8, lineHeight: 22 },
  card: { borderRadius: 20, padding: 16, backgroundColor: "rgba(15,23,42,0.06)", gap: 12, marginBottom: 16 },
  subtle: { opacity: 0.72 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.28)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  textArea: { minHeight: 120 },
  statusGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statusChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(15,23,42,0.08)",
  },
  statusChipActive: { backgroundColor: "#0f172a" },
  statusChipText: { fontSize: 12, fontWeight: "700", opacity: 0.8 },
  statusChipTextActive: { color: "#fff", opacity: 1 },
  button: { borderRadius: 16, paddingVertical: 15, alignItems: "center", backgroundColor: "#0f172a" },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: "#fff", fontWeight: "700" },
  feedback: { lineHeight: 20, opacity: 0.82 },
}
