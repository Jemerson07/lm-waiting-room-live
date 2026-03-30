import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useManagerOrders } from "@/hooks/use-maintenance";
import { isMaintenanceModeEnabled } from "@/lib/env";

function groupByStatus(items: { current_status: string }[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item.current_status] = (acc[item.current_status] ?? 0) + 1;
    return acc;
  }, {});
}

export default function ManagerSafeScreen() {
  const insets = useSafeAreaInsets();
  const { data = [] } = useManagerOrders();
  const enabled = isMaintenanceModeEnabled();
  const grouped = groupByStatus(data);

  const cards = [
    { label: "Ordens totais", value: data.length, tone: "#0f172a" },
    { label: "Diagnóstico", value: grouped.diagnostico ?? 0, tone: "#8B5CF6" },
    { label: "Em serviço", value: grouped.em_servico ?? 0, tone: "#10B981" },
    { label: "Entregues", value: grouped.entregue ?? 0, tone: "#64748B" },
  ];

  const topOperators = Object.entries(
    data.reduce<Record<string, number>>((acc, item) => {
      const key = item.operator_name || "Não atribuído";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: 32 }}>
        <View style={styles.hero}>
          <ThemedText type="title" style={styles.heroTitle}>Gerente • visão nova</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Métricas rápidas, leitura operacional e base pronta para relatórios mais visuais no web e no mobile.
          </ThemedText>
        </View>

        {!enabled ? (
          <View style={styles.stateCard}>
            <ThemedText type="defaultSemiBold">Integração Supabase desativada</ThemedText>
            <ThemedText style={styles.subtle}>Ative o modo manutenção no .env para carregar a visão gerencial real.</ThemedText>
          </View>
        ) : (
          <>
            <View style={styles.grid}>
              {cards.map((card) => (
                <View key={card.label} style={[styles.metricCard, { backgroundColor: card.tone }]}>
                  <ThemedText style={styles.metricValue}>{String(card.value)}</ThemedText>
                  <ThemedText style={styles.metricLabel}>{card.label}</ThemedText>
                </View>
              ))}
            </View>

            <View style={styles.panel}>
              <ThemedText type="subtitle">Fila por status</ThemedText>
              <View style={styles.list}>
                {Object.entries(grouped).map(([status, count]) => (
                  <View key={status} style={styles.row}>
                    <ThemedText style={styles.rowLabel}>{status}</ThemedText>
                    <ThemedText type="defaultSemiBold">{String(count)}</ThemedText>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.panel}>
              <ThemedText type="subtitle">Produtividade por operador</ThemedText>
              <View style={styles.list}>
                {topOperators.length ? topOperators.map(([name, total]) => (
                  <View key={name} style={styles.row}>
                    <ThemedText style={styles.rowLabel}>{name}</ThemedText>
                    <ThemedText type="defaultSemiBold">{String(total)} ordens</ThemedText>
                  </View>
                )) : <ThemedText style={styles.subtle}>Nenhum operador encontrado.</ThemedText>}
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
  hero: { borderRadius: 24, padding: 20, backgroundColor: "#0f172a", marginBottom: 16 },
  heroTitle: { color: "#fff" },
  heroSubtitle: { color: "rgba(255,255,255,0.78)", marginTop: 8, lineHeight: 22 },
  stateCard: { borderRadius: 20, padding: 16, backgroundColor: "rgba(148,163,184,0.12)", gap: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },
  metricCard: { minWidth: 150, flex: 1, borderRadius: 20, padding: 16, gap: 6 },
  metricValue: { color: "#fff", fontSize: 30, fontWeight: "800" },
  metricLabel: { color: "rgba(255,255,255,0.85)", lineHeight: 18 },
  panel: { borderRadius: 20, padding: 16, backgroundColor: "rgba(15,23,42,0.06)", gap: 12, marginBottom: 16 },
  list: { gap: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "rgba(148,163,184,0.18)" },
  rowLabel: { opacity: 0.75 },
  subtle: { opacity: 0.72 },
}
