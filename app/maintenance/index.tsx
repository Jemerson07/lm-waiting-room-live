import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { OrderCard } from "@/components/maintenance/order-card";
import { useManagerOrders } from "@/hooks/use-maintenance";
import { env, isMaintenanceModeEnabled } from "@/lib/env";

function countByStatus(items: { current_status: string }[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item.current_status] = (acc[item.current_status] ?? 0) + 1;
    return acc;
  }, {});
}

export default function MaintenanceDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { data = [], isLoading, error, refetch } = useManagerOrders();

  if (!isMaintenanceModeEnabled()) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="title">Modo manutenção desativado</ThemedText>
        <ThemedText style={styles.info}>
          Preencha o .env com as credenciais do Supabase e ative EXPO_PUBLIC_ENABLE_SUPABASE_MAINTENANCE=true.
        </ThemedText>
      </ThemedView>
    );
  }

  const counts = countByStatus(data);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 12, paddingBottom: 32 }}
        style={styles.scroll}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <ThemedText type="title">Sistema de Manutenção</ThemedText>
            <ThemedText style={styles.info}>{env.companySlug}</ThemedText>
          </View>
          <Pressable style={styles.refreshButton} onPress={() => refetch()}>
            <ThemedText style={styles.refreshText}>Atualizar</ThemedText>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.centered}><ActivityIndicator size="large" /></View>
        ) : error ? (
          <View style={styles.errorCard}>
            <ThemedText type="subtitle">Falha ao carregar ordens</ThemedText>
            <ThemedText style={styles.info}>{String(error.message ?? error)}</ThemedText>
          </View>
        ) : (
          <>
            <View style={styles.metricsRow}>
              {[
                ["Abertas", data.length],
                ["Diagnóstico", counts.diagnostico ?? 0],
                ["Em serviço", counts.em_servico ?? 0],
                ["Entregues", counts.entregue ?? 0],
              ].map(([label, value]) => (
                <View key={label} style={styles.metricCard}>
                  <ThemedText style={styles.metricValue}>{String(value)}</ThemedText>
                  <ThemedText style={styles.metricLabel}>{label}</ThemedText>
                </View>
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle">Ordens recentes</ThemedText>
              <ThemedText style={styles.info}>Cliente, operador e prioridade</ThemedText>
            </View>

            <View style={styles.list}>
              {data.map((order) => (
                <OrderCard key={order.order_id} order={order} onPress={() => router.push(`/order/${order.order_id}`)} />
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
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  refreshButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#0f172a",
  },
  refreshText: { color: "#fff", fontWeight: "700" },
  info: { opacity: 0.7, marginTop: 6 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  errorCard: { borderRadius: 16, padding: 16, backgroundColor: "rgba(239,68,68,0.12)", gap: 8 },
  metricsRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  metricCard: {
    minWidth: 150,
    flex: 1,
    borderRadius: 18,
    padding: 16,
    backgroundColor: "rgba(59,130,246,0.10)",
  },
  metricValue: { fontSize: 28, fontWeight: "800" },
  metricLabel: { opacity: 0.75, marginTop: 6 },
  sectionHeader: { marginBottom: 14 },
  list: { gap: 12 },
}
