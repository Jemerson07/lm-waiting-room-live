import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBadge } from "@/components/maintenance/status-badge";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useManagerOrders } from "@/hooks/use-maintenance";
import { isMaintenanceModeEnabled } from "@/lib/env";

const STATUS_OPTIONS = ["todos", "checkin", "diagnostico", "aprovacao", "em_servico", "teste_final", "finalizada", "entregue"];

export default function MaintenanceBoardSafeScreen() {
  const insets = useSafeAreaInsets();
  const enabled = isMaintenanceModeEnabled();
  const { data = [] } = useManagerOrders();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  const filtered = useMemo(() => {
    return data.filter((order) => {
      const matchesStatus = statusFilter === "todos" || String(order.current_status) === statusFilter;
      const haystack = [order.plate, order.customer_name, order.brand, order.model, order.operator_name, order.complaint]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [data, query, statusFilter]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: 32 }}>
        <View style={styles.hero}>
          <ThemedText type="title" style={styles.heroTitle}>Quadro de manutenção</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Busca rápida e filtros para a operação diária da oficina, com foco em leitura clara e tomada de ação rápida.
          </ThemedText>
        </View>

        {!enabled ? (
          <View style={styles.stateCard}>
            <ThemedText type="defaultSemiBold">Ative o modo manutenção</ThemedText>
            <ThemedText style={styles.subtle}>Preencha o .env e ative a integração para usar o quadro real.</ThemedText>
          </View>
        ) : (
          <>
            <View style={styles.filterCard}>
              <TextInput
                style={styles.input}
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar por placa, cliente, operador ou serviço"
                placeholderTextColor="#94a3b8"
              />
              <View style={styles.chipsWrap}>
                {STATUS_OPTIONS.map((status) => {
                  const active = status === statusFilter;
                  return (
                    <Pressable key={status} style={[styles.chip, active && styles.chipActive]} onPress={() => setStatusFilter(status)}>
                      <ThemedText style={[styles.chipText, active && styles.chipTextActive]}>{status}</ThemedText>
                    </Pressable>
                  );
                })}
              </View>
              <ThemedText style={styles.resultText}>{filtered.length} ordem(ns) encontrada(s)</ThemedText>
            </View>

            <View style={styles.list}>
              {filtered.map((order) => (
                <Link key={order.order_id} href={`/order-center-safe/${order.order_id}`} asChild>
                  <View style={styles.orderCard}>
                    <View style={styles.topRow}>
                      <View style={{ flex: 1, gap: 4 }}>
                        <ThemedText type="subtitle">{order.plate}</ThemedText>
                        <ThemedText style={styles.subtle}>{order.brand} {order.model}</ThemedText>
                        <ThemedText style={styles.subtle}>{order.customer_name}</ThemedText>
                      </View>
                      <StatusBadge status={String(order.current_status)} />
                    </View>

                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}><ThemedText style={styles.metaLabel}>Serviço</ThemedText><ThemedText>{String(order.service_type)}</ThemedText></View>
                      <View style={styles.metaItem}><ThemedText style={styles.metaLabel}>Prioridade</ThemedText><ThemedText>{String(order.priority)}</ThemedText></View>
                    </View>

                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}><ThemedText style={styles.metaLabel}>Operador</ThemedText><ThemedText>{order.operator_name ?? "Não atribuído"}</ThemedText></View>
                      <View style={styles.metaItem}><ThemedText style={styles.metaLabel}>Cliente</ThemedText><ThemedText>{order.customer_name}</ThemedText></View>
                    </View>
                  </View>
                </Link>
              ))}
            </View>
          </>
        )}
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
  stateCard: { borderRadius: 20, padding: 16, backgroundColor: "rgba(148,163,184,0.12)", gap: 8 },
  filterCard: { borderRadius: 20, padding: 16, backgroundColor: "rgba(15,23,42,0.06)", gap: 12, marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.28)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "rgba(15,23,42,0.08)" },
  chipActive: { backgroundColor: "#0f172a" },
  chipText: { fontSize: 12, fontWeight: "700", opacity: 0.8, textTransform: "capitalize" },
  chipTextActive: { color: "#fff", opacity: 1 },
  resultText: { opacity: 0.72 },
  list: { gap: 12 },
  orderCard: { borderRadius: 22, padding: 18, backgroundColor: "rgba(255,255,255,0.72)", gap: 12 },
  topRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  subtle: { opacity: 0.72, lineHeight: 20 },
  metaRow: { flexDirection: "row", gap: 12 },
  metaItem: { flex: 1, gap: 4 },
  metaLabel: { fontSize: 12, opacity: 0.65, textTransform: "uppercase" },
}
