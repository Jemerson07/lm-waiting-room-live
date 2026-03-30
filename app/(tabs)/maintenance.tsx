import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { OrderCard } from "@/components/maintenance/order-card";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useManagerOrders } from "@/hooks/use-maintenance";
import { env, isMaintenanceModeEnabled } from "@/lib/env";

export default function MaintenanceHubScreen() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor({}, "cardBackground");
  const { data: orders = [], isLoading, error, refetch } = useManagerOrders();
  const enabled = isMaintenanceModeEnabled();

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 20) + 20,
            paddingBottom: Math.max(insets.bottom, 20) + 32,
          },
        ]}
      >
        <View style={styles.header}>
          <ThemedText type="title">Manutenção</ThemedText>
          <ThemedText style={styles.subtitle}>
            Painel pronto para integrar cliente, operador e gerente ao Supabase.
          </ThemedText>
        </View>

        <View style={[styles.infoCard, { backgroundColor: cardBackground }]}> 
          <ThemedText type="defaultSemiBold">Modo manutenção completo</ThemedText>
          <ThemedText style={styles.infoText}>
            {enabled
              ? `Integração ativa para a empresa ${env.companySlug}. As listas abaixo vêm das views v_manager_orders e v_order_timeline.`
              : "Integração Supabase ainda desativada. Preencha .env com EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY e ative EXPO_PUBLIC_ENABLE_SUPABASE_MAINTENANCE=true."}
          </ThemedText>
        </View>

        {enabled ? (
          <Pressable style={[styles.refreshButton, { backgroundColor: tintColor }]} onPress={() => refetch()}>
            <ThemedText style={styles.refreshText}>Atualizar ordens</ThemedText>
          </Pressable>
        ) : null}

        {!enabled ? null : isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={tintColor} />
          </View>
        ) : error ? (
          <View style={[styles.infoCard, { backgroundColor: cardBackground }]}> 
            <ThemedText type="defaultSemiBold">Falha ao carregar ordens</ThemedText>
            <ThemedText style={styles.infoText}>{error.message}</ThemedText>
          </View>
        ) : !orders.length ? (
          <View style={[styles.infoCard, { backgroundColor: cardBackground }]}> 
            <ThemedText type="defaultSemiBold">Nenhuma ordem encontrada</ThemedText>
            <ThemedText style={styles.infoText}>
              Crie ordens no Supabase para vê-las aqui. A tela está pronta para consumo web e mobile.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {orders.map((order) => (
              <OrderCard
                key={order.order_id}
                order={order}
                onPress={() => router.push(`/order/${order.order_id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, gap: 16 },
  header: { gap: 8 },
  subtitle: { opacity: 0.7 },
  infoCard: { borderRadius: 20, padding: 18, gap: 8 },
  infoText: { opacity: 0.72, lineHeight: 22 },
  refreshButton: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  refreshText: { color: "#FFFFFF", fontWeight: "700" },
  centered: { paddingVertical: 36, alignItems: "center" },
  ordersList: { gap: 14 },
}
);