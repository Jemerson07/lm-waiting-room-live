import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StatusBadge } from "@/components/maintenance/status-badge";
import { useManagerOrders } from "@/hooks/use-maintenance";
import { env, isMaintenanceModeEnabled } from "@/lib/env";

export default function MaintenanceSafeScreen() {
  const insets = useSafeAreaInsets();
  const { data = [], isLoading, error, refetch } = useManagerOrders();
  const enabled = isMaintenanceModeEnabled();

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: 32 }}>
        <View style={styles.header}>
          <ThemedText type="title">Manutenção completa</ThemedText>
          <ThemedText style={styles.subtitle}>
            Etapa 1 segura: leitura do Supabase sem substituir as tabs antigas.
          </ThemedText>
        </View>

        <View style={styles.heroCard}>
          <ThemedText type="defaultSemiBold">Empresa atual</ThemedText>
          <ThemedText style={styles.subtle}>{env.companySlug}</ThemedText>
          <ThemedText style={styles.subtle}>
            {enabled ? "Integração ativa e pronta para validar UX." : "Preencha o .env e ligue EXPO_PUBLIC_ENABLE_SUPABASE_MAINTENANCE=true."}
          </ThemedText>
        </View>

        {enabled ? (
          <Pressable style={styles.refreshButton} onPress={() => refetch()}>
            <ThemedText style={styles.refreshText}>Atualizar ordens</ThemedText>
          </Pressable>
        ) : null}

        {!enabled ? null : isLoading ? (
          <View style={styles.centered}><ActivityIndicator size="large" /></View>
        ) : error ? (
          <View style={styles.heroCard}>
            <ThemedText type="defaultSemiBold">Falha ao carregar</ThemedText>
            <ThemedText style={styles.subtle}>{String(error.message ?? error)}</ThemedText>
          </View>
        ) : !data.length ? (
          <View style={styles.heroCard}>
            <ThemedText type="defaultSemiBold">Nenhuma ordem encontrada</ThemedText>
            <ThemedText style={styles.subtle}>Crie ordens no Supabase e volte para testar a UX.</ThemedText>
          </View>
        ) : (
          <View style={styles.list}>
            {data.map((order) => (
              <Pressable key={order.order_id} style={styles.orderCard} onPress={() => router.push(`/order-safe/${order.order_id}`)}>
                <View style={styles.rowTop}>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="subtitle">{order.plate}</ThemedText>
                    <ThemedText style={styles.subtle}>{order.brand} {order.model}</ThemedText>
                    <ThemedText style={styles.subtle}>{order.customer_name}</ThemedText>
                  </View>
                  <StatusBadge status={String(order.current_status)} />
                </View>
                <View style={styles.metaGrid}>
                  <View style={styles.metaItem}><ThemedText style={styles.metaLabel}>Serviço</ThemedText><ThemedText>{String(order.service_type)}</ThemedText></View>
                  <View style={styles.metaItem}><ThemedText style={styles.metaLabel}>Prioridade</ThemedText><ThemedText>{String(order.priority)}</ThemedText></View>
                </View>
              </Pressable>
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
  header: { gap: 8, marginBottom: 16 },
  subtitle: { opacity: 0.72, lineHeight: 21 },
  heroCard: { borderRadius: 20, padding: 18, backgroundColor: "rgba(59,130,246,0.10)", gap: 8, marginBottom: 14 },
  subtle: { opacity: 0.72 },
  refreshButton: { borderRadius: 14, paddingVertical: 14, alignItems: "center", backgroundColor: "#0f172a", marginBottom: 16 },
  refreshText: { color: "#fff", fontWeight: "700" },
  centered: { paddingVertical: 40, alignItems: "center" },
  list: { gap: 12 },
  orderCard: { borderRadius: 20, padding: 16, backgroundColor: "rgba(15,23,42,0.06)", gap: 12 },
  rowTop: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  metaGrid: { flexDirection: "row", gap: 12 },
  metaItem: { flex: 1, gap: 4 },
  metaLabel: { fontSize: 12, opacity: 0.65, textTransform: "uppercase" },
}
