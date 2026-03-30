import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBadge } from "@/components/maintenance/status-badge";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useCustomerOrdersByEmail } from "@/hooks/use-customer-portal";
import { env, isMaintenanceModeEnabled } from "@/lib/env";

function formatDate(value?: string | null) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return value;
  }
}

export default function CustomerOrdersSafeScreen() {
  const insets = useSafeAreaInsets();
  const enabled = isMaintenanceModeEnabled();
  const [emailInput, setEmailInput] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const { data = [], isLoading, error } = useCustomerOrdersByEmail(submittedEmail);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: 32 }}>
        <View style={styles.hero}>
          <ThemedText type="title" style={styles.heroTitle}>Portal do cliente</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Consulte ordens da manutenção usando o e-mail do cliente, com uma experiência mais simples para app e web.
          </ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle">Buscar ordens</ThemedText>
          <ThemedText style={styles.subtle}>Empresa: {env.companySlug}</ThemedText>
          <TextInput
            style={styles.input}
            value={emailInput}
            onChangeText={setEmailInput}
            placeholder="E-mail do cliente"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Pressable
            style={[styles.button, (!enabled || !emailInput.trim()) && styles.buttonDisabled]}
            disabled={!enabled || !emailInput.trim()}
            onPress={() => setSubmittedEmail(emailInput.trim())}
          >
            <ThemedText style={styles.buttonText}>Buscar ordens</ThemedText>
          </Pressable>
        </View>

        {submittedEmail ? (
          <View style={styles.card}>
            <ThemedText type="subtitle">Resultados</ThemedText>
            {isLoading ? (
              <ThemedText style={styles.subtle}>Carregando ordens...</ThemedText>
            ) : error ? (
              <ThemedText style={styles.subtle}>{String(error.message ?? error)}</ThemedText>
            ) : !data.length ? (
              <ThemedText style={styles.subtle}>Nenhuma ordem encontrada para este e-mail.</ThemedText>
            ) : (
              <View style={styles.list}>
                {data.map((order) => (
                  <View key={order.order_id} style={styles.orderCard}>
                    <View style={styles.topRow}>
                      <View style={{ flex: 1, gap: 4 }}>
                        <ThemedText type="subtitle">{order.plate}</ThemedText>
                        <ThemedText style={styles.subtle}>{order.brand} {order.model}</ThemedText>
                        <ThemedText style={styles.subtle}>Criada em {formatDate(order.created_at)}</ThemedText>
                      </View>
                      <StatusBadge status={String(order.current_status)} />
                    </View>

                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}><ThemedText style={styles.metaLabel}>Serviço</ThemedText><ThemedText>{String(order.service_type)}</ThemedText></View>
                      <View style={styles.metaItem}><ThemedText style={styles.metaLabel}>Prioridade</ThemedText><ThemedText>{String(order.priority)}</ThemedText></View>
                    </View>

                    <View style={styles.linksRow}>
                      <Link href={`/order-safe/${order.order_id}`} asChild>
                        <View style={styles.linkCard}><ThemedText style={styles.linkText}>Acompanhar</ThemedText></View>
                      </Link>
                      <Link href={`/order-center-safe/${order.order_id}`} asChild>
                        <View style={styles.linkCard}><ThemedText style={styles.linkText}>Central da ordem</ThemedText></View>
                      </Link>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : null}
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
  subtle: { opacity: 0.72, lineHeight: 20 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.28)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  button: { borderRadius: 16, paddingVertical: 15, alignItems: "center", backgroundColor: "#0f172a" },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: "#fff", fontWeight: "700" },
  list: { gap: 12 },
  orderCard: { borderRadius: 20, padding: 16, backgroundColor: "rgba(255,255,255,0.72)", gap: 12 },
  topRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  metaRow: { flexDirection: "row", gap: 12 },
  metaItem: { flex: 1, gap: 4 },
  metaLabel: { fontSize: 12, opacity: 0.65, textTransform: "uppercase" },
  linksRow: { flexDirection: "row", gap: 10 },
  linkCard: { flex: 1, borderRadius: 14, paddingVertical: 12, alignItems: "center", backgroundColor: "#0f172a" },
  linkText: { color: "#fff", fontWeight: "700" },
}
