import { ScrollView, StyleSheet, View } from "react-native";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ServiceFlowOverview } from "@/components/maintenance/service-flow-overview";
import { StatusBadge } from "@/components/maintenance/status-badge";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useManagerOrders } from "@/hooks/use-maintenance";
import { env, isMaintenanceModeEnabled } from "@/lib/env";

export default function OperatorServiceDeskSafeScreen() {
  const insets = useSafeAreaInsets();
  const enabled = isMaintenanceModeEnabled();
  const { data = [] } = useManagerOrders();

  const counts = data.reduce<Record<string, number>>((acc, item) => {
    const key = String(item.current_status);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const openOrders = data.filter((item) => !["entregue"].includes(String(item.current_status)));
  const urgentOrders = data.filter((item) => ["urgent", "high"].includes(String(item.priority))).slice(0, 6);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: 32 }}>
        <View style={styles.hero}>
          <ThemedText type="title" style={styles.heroTitle}>Atendimento da oficina</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Painel do operador para controlar quantidade de veículos e todo o curso do atendimento dentro da oficina.
          </ThemedText>
          <ThemedText style={styles.heroMini}>{env.companySlug}</ThemedText>
        </View>

        {!enabled ? (
          <View style={styles.stateCard}>
            <ThemedText type="defaultSemiBold">Ative o modo manutenção</ThemedText>
            <ThemedText style={styles.subtle}>Preencha o .env e ligue a integração para usar o painel operacional real.</ThemedText>
          </View>
        ) : (
          <>
            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <ThemedText style={styles.metricValue}>{String(openOrders.length)}</ThemedText>
                <ThemedText style={styles.metricLabel}>Veículos em atendimento</ThemedText>
              </View>
              <View style={styles.metricCard}>
                <ThemedText style={styles.metricValue}>{String(counts.checkin ?? 0)}</ThemedText>
                <ThemedText style={styles.metricLabel}>Em check-in</ThemedText>
              </View>
              <View style={styles.metricCard}>
                <ThemedText style={styles.metricValue}>{String(counts.em_servico ?? 0)}</ThemedText>
                <ThemedText style={styles.metricLabel}>Em serviço</ThemedText>
              </View>
              <View style={styles.metricCard}>
                <ThemedText style={styles.metricValue}>{String(counts.teste_final ?? 0)}</ThemedText>
                <ThemedText style={styles.metricLabel}>Teste final</ThemedText>
              </View>
            </View>

            <View style={styles.card}>
              <ThemedText type="subtitle">Curso do atendimento na oficina</ThemedText>
              <ThemedText style={styles.subtle}>O operador acompanha quantos veículos estão em cada etapa do processo da manutenção.</ThemedText>
              <ServiceFlowOverview counts={counts} />
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <ThemedText type="subtitle">Prioridades do dia</ThemedText>
                <Link href="/operator-actions-safe" asChild>
                  <View style={styles.linkChip}><ThemedText style={styles.linkChipText}>Atualizar status</ThemedText></View>
                </Link>
              </View>
              <View style={styles.list}>
                {urgentOrders.map((order) => (
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
                        <View style={styles.metaItem}><ThemedText style={styles.metaLabel}>Prioridade</ThemedText><ThemedText>{String(order.priority)}</ThemedText></View>
                        <View style={styles.metaItem}><ThemedText style={styles.metaLabel}>Serviço</ThemedText><ThemedText>{String(order.service_type)}</ThemedText></View>
                      </View>
                    </View>
                  </Link>
                ))}
                {!urgentOrders.length ? <ThemedText style={styles.subtle}>Nenhuma ordem urgente ou alta no momento.</ThemedText> : null}
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
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  linkChip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#0f172a" },
  linkChipText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  list: { gap: 10 },
  orderCard: { borderRadius: 18, padding: 14, backgroundColor: "rgba(255,255,255,0.72)", gap: 10 },
  topRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  metaRow: { flexDirection: "row", gap: 12 },
  metaItem: { flex: 1, gap: 4 },
  metaLabel: { fontSize: 12, opacity: 0.65, textTransform: "uppercase" },
}
