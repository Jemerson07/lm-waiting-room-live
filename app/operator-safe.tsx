import { ScrollView, StyleSheet, View } from "react-native";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StatusBadge } from "@/components/maintenance/status-badge";
import { useManagerOrders } from "@/hooks/use-maintenance";
import { isMaintenanceModeEnabled } from "@/lib/env";

export default function OperatorSafeScreen() {
  const insets = useSafeAreaInsets();
  const { data = [] } = useManagerOrders();
  const enabled = isMaintenanceModeEnabled();
  const recent = data.slice(0, 4);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: 32 }}>
        <View style={styles.header}>
          <ThemedText type="title">Operador • fluxo novo</ThemedText>
          <ThemedText style={styles.subtitle}>
            Etapa 2 visual: cards maiores, leitura rápida e caminho mais claro para alimentar a manutenção.
          </ThemedText>
        </View>

        <View style={styles.heroCard}>
          <ThemedText type="defaultSemiBold">Ações rápidas do operador</ThemedText>
          <ThemedText style={styles.subtle}>Check-in, diagnóstico, anexos e atualização de status em uma UX mais limpa.</ThemedText>
          <View style={styles.chipRow}>
            <View style={styles.chip}><ThemedText style={styles.chipText}>Entrada</ThemedText></View>
            <View style={styles.chip}><ThemedText style={styles.chipText}>Diagnóstico</ThemedText></View>
            <View style={styles.chip}><ThemedText style={styles.chipText}>Evidências</ThemedText></View>
          </View>
        </View>

        {!enabled ? (
          <View style={styles.warnCard}>
            <ThemedText type="defaultSemiBold">Modo manutenção desativado</ThemedText>
            <ThemedText style={styles.subtle}>Ative o Supabase no .env para testar as ordens reais.</ThemedText>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle">Ordens recentes para atendimento</ThemedText>
              <ThemedText style={styles.subtle}>Toque para abrir o detalhe da ordem.</ThemedText>
            </View>

            <View style={styles.list}>
              {recent.map((order) => (
                <Link key={order.order_id} href={`/order-safe/${order.order_id}`} asChild>
                  <View style={styles.orderCard}>
                    <View style={styles.rowTop}>
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
  header: { gap: 8, marginBottom: 16 },
  subtitle: { opacity: 0.72, lineHeight: 21 },
  heroCard: { borderRadius: 22, padding: 18, backgroundColor: "rgba(16,185,129,0.10)", gap: 10, marginBottom: 14 },
  chipRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: { backgroundColor: "rgba(15,23,42,0.08)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  chipText: { fontSize: 12, fontWeight: "700" },
  warnCard: { borderRadius: 20, padding: 16, backgroundColor: "rgba(245,158,11,0.14)", gap: 8 },
  sectionHeader: { gap: 6, marginBottom: 12 },
  subtle: { opacity: 0.72 },
  list: { gap: 12 },
  orderCard: { borderRadius: 20, padding: 16, backgroundColor: "rgba(15,23,42,0.06)", gap: 12 },
  rowTop: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  metaRow: { flexDirection: "row", gap: 12 },
  metaItem: { flex: 1, gap: 4 },
  metaLabel: { fontSize: 12, opacity: 0.65, textTransform: "uppercase" },
}
