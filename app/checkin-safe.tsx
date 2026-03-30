import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { env, isMaintenanceModeEnabled } from "@/lib/env";
import { useCreateMaintenanceCheckinOrder } from "@/hooks/use-maintenance-intake";

const PRIORITIES = ["low", "normal", "high", "urgent"];
const SERVICE_TYPES = ["corretiva", "preventiva", "pneu"];

export default function CheckinSafeScreen() {
  const insets = useSafeAreaInsets();
  const enabled = isMaintenanceModeEnabled();
  const mutation = useCreateMaintenanceCheckinOrder();

  const [customerEmail, setCustomerEmail] = useState("");
  const [plate, setPlate] = useState("");
  const [complaint, setComplaint] = useState("");
  const [priority, setPriority] = useState("normal");
  const [serviceType, setServiceType] = useState("corretiva");
  const [estimatedFinishAt, setEstimatedFinishAt] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit() {
    setFeedback(null);
    try {
      const result = await mutation.mutateAsync({
        customerEmail,
        plate,
        complaint,
        priority,
        serviceType,
        estimatedFinishAt: estimatedFinishAt.trim() || undefined,
      });
      setFeedback(`Ordem ${result.id} criada com status ${result.current_status}.`);
      setPlate("");
      setComplaint("");
      setEstimatedFinishAt("");
    } catch (error) {
      setFeedback(String((error as Error)?.message ?? error));
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: 32 }}>
        <View style={styles.hero}>
          <ThemedText type="title" style={styles.heroTitle}>Check-in da manutenção</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Abra ordens novas pelo app usando cliente, placa, queixa e prioridade, com uma experiência simples para recepção e oficina.
          </ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle">Nova ordem</ThemedText>
          <ThemedText style={styles.subtle}>Empresa: {env.companySlug}</ThemedText>

          <TextInput
            style={styles.input}
            value={customerEmail}
            onChangeText={setCustomerEmail}
            placeholder="E-mail do cliente"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            value={plate}
            onChangeText={setPlate}
            placeholder="Placa do veículo"
            placeholderTextColor="#94a3b8"
            autoCapitalize="characters"
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            value={complaint}
            onChangeText={setComplaint}
            placeholder="Queixa do cliente"
            placeholderTextColor="#94a3b8"
            multiline
            textAlignVertical="top"
          />

          <TextInput
            style={styles.input}
            value={estimatedFinishAt}
            onChangeText={setEstimatedFinishAt}
            placeholder="Previsão ISO opcional, ex: 2026-04-01T18:00:00"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
          />

          <View style={styles.block}>
            <ThemedText type="defaultSemiBold">Prioridade</ThemedText>
            <View style={styles.chipsWrap}>
              {PRIORITIES.map((item) => {
                const active = item === priority;
                return (
                  <Pressable key={item} style={[styles.chip, active && styles.chipActive]} onPress={() => setPriority(item)}>
                    <ThemedText style={[styles.chipText, active && styles.chipTextActive]}>{item}</ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.block}>
            <ThemedText type="defaultSemiBold">Tipo de serviço</ThemedText>
            <View style={styles.chipsWrap}>
              {SERVICE_TYPES.map((item) => {
                const active = item === serviceType;
                return (
                  <Pressable key={item} style={[styles.chip, active && styles.chipActive]} onPress={() => setServiceType(item)}>
                    <ThemedText style={[styles.chipText, active && styles.chipTextActive]}>{item}</ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            style={[styles.button, (!enabled || !customerEmail.trim() || !plate.trim() || !complaint.trim() || mutation.isPending) && styles.buttonDisabled]}
            disabled={!enabled || !customerEmail.trim() || !plate.trim() || !complaint.trim() || mutation.isPending}
            onPress={handleSubmit}
          >
            <ThemedText style={styles.buttonText}>{mutation.isPending ? "Abrindo ordem..." : "Abrir ordem"}</ThemedText>
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
  textArea: { minHeight: 110 },
  block: { gap: 8 },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "rgba(15,23,42,0.08)" },
  chipActive: { backgroundColor: "#0f172a" },
  chipText: { fontSize: 12, fontWeight: "700", opacity: 0.8 },
  chipTextActive: { color: "#fff", opacity: 1 },
  button: { borderRadius: 16, paddingVertical: 15, alignItems: "center", backgroundColor: "#0f172a" },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: "#fff", fontWeight: "700" },
  feedback: { lineHeight: 20, opacity: 0.82 },
}
