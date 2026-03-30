import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBadge } from "@/components/maintenance/status-badge";
import { ServiceFlowOverview } from "@/components/maintenance/service-flow-overview";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useManagerOrders } from "@/hooks/use-maintenance";
import { env, isMaintenanceModeEnabled } from "@/lib/env";

export default function LoungePresentationSafeScreen() {
  const insets = useSafeAreaInsets();
  const enabled = isMaintenanceModeEnabled();
  const { data = [] } = useManagerOrders();

  const counts = data.reduce<Record<string, number>>((acc, item) => {
    const key = String(item.current_status);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const visible = data.filter((item) => !["entregue"].includes(String(item.current_status))).slice(0, 8);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: 32 }}>
        <View style={styles.hero}>
          <ThemedText type="title" style={styles.heroTitle}>Acompanhamento da manutenção</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Tela de apresentação para sala de espera ou descanso da oficina, mostrando o andamento do atendimento de forma clara e elegante.
          </ThemedText>
          <ThemedText style={styles.heroMini}>{env.companySlug}</ThemedText>
        </View>

        {!enabled ? (
          <View style={styles.stateCard}>
            <ThemedText type="defaultSemiBold">Ative o modo manutenção</ThemedText>
            <ThemedText style={styles.subtle}>Preencha o .env e ligue a integração para exibir o painel real da oficina.</ThemedText>
          </View>
        ) : (
          <>
            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <ThemedText style={styles.metricValue}>{String(data.length)}</ThemedText>
                <ThemedText style={styles.metricLabel}>Veículos em acompanhamento</ThemedText>
              </View>
              <View style={styles.metricCard}>
                <ThemedText style={styles.metricValue}>{String(counts.em_servico ?? 0)}</ThemedText>
                <ThemedText style={styles.metricLabel}>Em serviço</ThemedText>
              </View>
              <View style={styles.metricCard}>
                <ThemedText style={styles.metricValue}>{String(counts.finalizada ?? 0)}</ThemedText>
                <ThemedText style={styles.metricLabel}>Finalizadas</ThemedText>
              </View>
            </View>

            <View style={styles.card}>
              <ThemedText type="subtitle">Curso do atendimento da oficina</ThemedText>
              <ThemedText style={styles.subtle}>O cliente consegue entender em que fase cada veículo está dentro do processo de manutenção.</ThemedText>
              <ServiceFlowOverview counts={counts} />
            </View>

            <View style={styles.card}>
              <ThemedText type="subtitle">Veículos em andamento</ThemedText>
              <View style={styles.list}>
                {visible.map((order) => (
                  <View key={order.order_id} style={styles.orderCard}>
                    <View style={styles.topRow}>
                      <View style={{ flex: 1, gap: 4 }}>
                        <ThemedText type="subtitle">{order.plate}</ThemedText>
                        <ThemedText style={styles.subtle}>{order.brand} {order.model}</ThemedText>
                        <ThemedText style={styles.subtle}>{order.customer_name}</ThemedText>
                      </View>
                      <StatusBadge status={String(order.current_status)} />
                    </View>
                  </View>
                ))}
              </View>
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
  hero: { borderRadius: 28, padding: 24, backgroundColor: "#0f172a", gap: 10, marginBottom: 16 },
  heroTitle: { color: "#fff" },
  heroSubtitle: { color: "rgba(255,255,255,0.82)", lineHeight: 24 },
  heroMini: { color: "rgba(255,255,255,0.66)", fontWeight: "700" },
  stateCard: { borderRadius: 20, padding: 16, backgroundColor: "rgba(148,163,184,0.12)", gap: 8 },
  metricsRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },
  metricCard: { minWidth: 150, flex: 1, borderRadius: 22, padding: 18, backgroundColor: "rgba(255,255,255,0.76)", gap: 6 },
  metricValue: { fontSize: 30, fontWeight: "800" },
  metricLabel: { opacity: 0.72, lineHeight: 18 },
  card: { borderRadius: 22, padding: 18, backgroundColor: "rgba(15,23,42,0.06)", gap: 12, marginBottom: 16 },
  subtle: { opacity: 0.72, lineHeight: 20 },
  list: { gap: 10 },
  orderCard: { borderRadius: 18, padding: 14, backgroundColor: "rgba(255,255,255,0.72)" },
  topRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
}
