import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBadge } from "@/components/maintenance/status-badge";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useManagerOrders } from "@/hooks/use-maintenance";
import { isMaintenanceModeEnabled } from "@/lib/env";

const STATUS_ORDER = ["checkin", "diagnostico", "aprovacao", "em_servico", "teste_final", "finalizada", "entregue"];
const STATUS_MESSAGES: Record<string, string> = {
  checkin: "Recebemos o veículo e iniciamos o registro.",
  diagnostico: "Equipe validando falhas e próximos passos.",
  aprovacao: "Aguardando retorno do cliente ou gestor responsável.",
  em_servico: "Serviço em andamento na oficina.",
  teste_final: "Validação final antes da conclusão.",
  finalizada: "Serviço concluído e pronto para entrega.",
  entregue: "Veículo já liberado ao cliente.",
};

export default function LiveSafeScreen() {
  const insets = useSafeAreaInsets();
  const { data = [], isLoading, error } = useManagerOrders();
  const enabled = isMaintenanceModeEnabled();

  const grouped = STATUS_ORDER.map((status) => ({
    status,
    items: data.filter((item) => String(item.current_status) === status),
  }));

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: 32 }}>
        <View style={styles.hero}>
          <ThemedText type="title" style={styles.heroTitle}>Painel TV • manutenção</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Experiência visual pensada para recepção, oficina e acompanhamento em tela grande.
          </ThemedText>
        </View>

        {!enabled ? (
          <View style={styles.stateCard}>
            <ThemedText type="defaultSemiBold">Integração Supabase desativada</ThemedText>
            <ThemedText style={styles.subtle}>Ative o modo manutenção para exibir as ordens reais na TV.</ThemedText>
          </View>
        ) : isLoading ? (
          <View style={styles.centered}><ActivityIndicator size="large" /></View>
        ) : error ? (
          <View style={styles.stateCard}>
            <ThemedText type="defaultSemiBold">Falha ao carregar o painel</ThemedText>
            <ThemedText style={styles.subtle}>{String(error.message ?? error)}</ThemedText>
          </View>
        ) : (
          <View style={styles.columnsWrap}>
            {grouped.map((group) => (
              <View key={group.status} style={styles.column}>
                <View style={styles.columnHeader}>
                  <StatusBadge status={group.status} />
                  <ThemedText style={styles.count}>{group.items.length}</ThemedText>
                </View>
                <ThemedText style={styles.columnMessage}>{STATUS_MESSAGES[group.status]}</ThemedText>

                {!group.items.length ? (
                  <View style={styles.emptyCard}><ThemedText style={styles.subtle}>Nenhum veículo nesta etapa.</ThemedText></View>
                ) : (
                  group.items.slice(0, 6).map((order) => (
                    <View key={order.order_id} style={styles.orderCard}>
                      <ThemedText type="subtitle">{order.plate}</ThemedText>
                      <ThemedText style={styles.subtle}>{order.brand} {order.model}</ThemedText>
                      <ThemedText style={styles.customer}>{order.customer_name}</ThemedText>
                    </View>
                  ))
                )}
              </View>
            ))}
          </View>
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
  centered: { paddingVertical: 40, alignItems: "center" },
  columnsWrap: { gap: 12 },
  column: { borderRadius: 20, padding: 16, backgroundColor: "rgba(15,23,42,0.05)", gap: 12 },
  columnHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  count: { fontSize: 28, fontWeight: "800" },
  columnMessage: { opacity: 0.72, lineHeight: 20 },
  emptyCard: { borderRadius: 16, padding: 14, backgroundColor: "rgba(148,163,184,0.12)" },
  orderCard: { borderRadius: 16, padding: 14, backgroundColor: "rgba(255,255,255,0.7)", gap: 4 },
  subtle: { opacity: 0.72 },
  customer: { fontWeight: "700" },
}
