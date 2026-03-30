import { ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBadge } from "@/components/maintenance/status-badge";
import { ServiceFlowOverview } from "@/components/maintenance/service-flow-overview";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useManagerOrders } from "@/hooks/use-maintenance";
import { env, isMaintenanceModeEnabled } from "@/lib/env";

export default function LoungePremiumSafeScreen() {
  const insets = useSafeAreaInsets();
  const enabled = isMaintenanceModeEnabled();
  const { data = [] } = useManagerOrders();

  const counts = data.reduce<Record<string, number>>((acc, item) => {
    const key = String(item.current_status);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const visible = data.filter((item) => !["entregue"].includes(String(item.current_status))).slice(0, 6);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: 32 }}>
        <LinearGradient colors={["#0f172a", "#1e293b", "#111827"]} style={styles.hero}>
          <ThemedText type="title" style={styles.heroTitle}>Painel premium da manutenção</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Apresentação pensada para sala de espera, descanso ou TV da oficina, com leitura clara à distância e visual mais elegante.
          </ThemedText>
          <View style={styles.heroMetaRow}>
            <View style={styles.heroPill}><ThemedText style={styles.heroPillText}>{env.companySlug}</ThemedText></View>
            <View style={styles.heroPill}><ThemedText style={styles.heroPillText}>{enabled ? "ao vivo" : "configuração pendente"}</ThemedText></View>
          </View>
        </LinearGradient>

        {!enabled ? (
          <View style={styles.stateCard}>
            <ThemedText type="defaultSemiBold">Ative o modo manutenção</ThemedText>
            <ThemedText style={styles.subtle}>Preencha o .env e ligue a integração para usar a apresentação real da oficina.</ThemedText>
          </View>
        ) : (
          <>
            <View style={styles.metricsRow}>
              <View style={styles.metricCard}><ThemedText style={styles.metricValue}>{String(data.length)}</ThemedText><ThemedText style={styles.metricLabel}>Veículos no fluxo</ThemedText></View>
              <View style={styles.metricCard}><ThemedText style={styles.metricValue}>{String(counts.em_servico ?? 0)}</ThemedText><ThemedText style={styles.metricLabel}>Em serviço</ThemedText></View>
              <View style={styles.metricCard}><ThemedText style={styles.metricValue}>{String(counts.teste_final ?? 0)}</ThemedText><ThemedText style={styles.metricLabel}>Teste final</ThemedText></View>
              <View style={styles.metricCard}><ThemedText style={styles.metricValue}>{String(counts.finalizada ?? 0)}</ThemedText><ThemedText style={styles.metricLabel}>Finalizadas</ThemedText></View>
            </View>

            <View style={styles.contentGrid}>
              <View style={styles.leftColumn}>
                <View style={styles.panel}>
                  <ThemedText type="subtitle">Curso do atendimento</ThemedText>
                  <ThemedText style={styles.subtle}>Cada etapa mostra quantos veículos estão no processo da oficina.</ThemedText>
                  <ServiceFlowOverview counts={counts} />
                </View>
              </View>

              <View style={styles.rightColumn}>
                <View style={styles.panel}>
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
                    {!visible.length ? <ThemedText style={styles.subtle}>Nenhum veículo em exibição no momento.</ThemedText> : null}
                  </View>
                </View>
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
  hero: { borderRadius: 30, padding: 24, gap: 12, marginBottom: 16 },
  heroTitle: { color: "#fff" },
  heroSubtitle: { color: "rgba(255,255,255,0.84)", lineHeight: 24 },
  heroMetaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  heroPill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "rgba(255,255,255,0.12)" },
  heroPillText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  stateCard: { borderRadius: 20, padding: 16, backgroundColor: "rgba(148,163,184,0.12)", gap: 8 },
  metricsRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },
  metricCard: { minWidth: 150, flex: 1, borderRadius: 22, padding: 18, backgroundColor: "rgba(255,255,255,0.82)", gap: 6 },
  metricValue: { fontSize: 30, fontWeight: "800" },
  metricLabel: { opacity: 0.72, lineHeight: 18 },
  contentGrid: { gap: 16 },
  leftColumn: { gap: 16 },
  rightColumn: { gap: 16 },
  panel: { borderRadius: 24, padding: 18, backgroundColor: "rgba(15,23,42,0.06)", gap: 12, marginBottom: 16 },
  subtle: { opacity: 0.72, lineHeight: 20 },
  list: { gap: 10 },
  orderCard: { borderRadius: 18, padding: 14, backgroundColor: "rgba(255,255,255,0.76)" },
  topRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
}
