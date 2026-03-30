import { useLocalSearchParams, Link } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBadge } from "@/components/maintenance/status-badge";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useCustomerOrder } from "@/hooks/use-maintenance";
import { isMaintenanceModeEnabled } from "@/lib/env";

function formatDate(value?: string | null) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return value;
  }
}

export default function OrderCenterSafeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: order, isLoading, error } = useCustomerOrder(id);

  if (!isMaintenanceModeEnabled()) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="title">Integração Supabase desativada</ThemedText>
      </ThemedView>
    );
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error || !order) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="title">Ordem não encontrada</ThemedText>
        <ThemedText style={styles.subtle}>{String(error?.message ?? "Confira o ID da ordem.")}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: 32 }}>
        <View style={styles.hero}>
          <View style={{ flex: 1, gap: 8 }}>
            <ThemedText type="title" style={styles.heroTitle}>Central da ordem</ThemedText>
            <ThemedText style={styles.heroSubtitle}>{order.plate} • {order.brand} {order.model}</ThemedText>
            <ThemedText style={styles.heroSubtitle}>{order.customer_name}</ThemedText>
            <ThemedText style={styles.heroSubtitle}>Criada em {formatDate(order.created_at)}</ThemedText>
          </View>
          <StatusBadge status={String(order.current_status)} />
        </View>

        <View style={styles.summaryCard}>
          <ThemedText type="subtitle">Resumo rápido</ThemedText>
          <View style={styles.row}><ThemedText style={styles.label}>Serviço</ThemedText><ThemedText>{String(order.service_type)}</ThemedText></View>
          <View style={styles.row}><ThemedText style={styles.label}>Prioridade</ThemedText><ThemedText>{String(order.priority)}</ThemedText></View>
          <View style={styles.row}><ThemedText style={styles.label}>Previsão</ThemedText><ThemedText>{formatDate(order.estimated_finish_at)}</ThemedText></View>
          <View style={styles.row}><ThemedText style={styles.label}>Finalizada</ThemedText><ThemedText>{formatDate(order.finished_at)}</ThemedText></View>
          <View style={styles.row}><ThemedText style={styles.label}>Entregue</ThemedText><ThemedText>{formatDate(order.delivered_at)}</ThemedText></View>
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Atalhos da ordem</ThemedText>
          <ThemedText style={styles.subtle}>Abra a área específica conforme a necessidade do cliente, operador ou gerente.</ThemedText>
        </View>

        <View style={styles.grid}>
          <Link href={`/order-safe/${order.order_id}`} asChild>
            <View style={styles.card}>
              <ThemedText style={styles.emoji}>🧾</ThemedText>
              <ThemedText type="defaultSemiBold">Detalhe completo</ThemedText>
              <ThemedText style={styles.cardText}>Resumo, timeline e anexos na mesma tela.</ThemedText>
            </View>
          </Link>

          <Link href={`/order-gallery-safe/${order.order_id}`} asChild>
            <View style={styles.card}>
              <ThemedText style={styles.emoji}>🗂️</ThemedText>
              <ThemedText type="defaultSemiBold">Galeria da ordem</ThemedText>
              <ThemedText style={styles.cardText}>Lista organizada das evidências técnicas registradas.</ThemedText>
            </View>
          </Link>

          <Link href={`/order-media-safe/${order.order_id}`} asChild>
            <View style={styles.card}>
              <ThemedText style={styles.emoji}>🖼️</ThemedText>
              <ThemedText type="defaultSemiBold">Mídias e previews</ThemedText>
              <ThemedText style={styles.cardText}>Imagens com miniatura e acesso rápido a PDFs e arquivos.</ThemedText>
            </View>
          </Link>

          <Link href="/attachments-safe" asChild>
            <View style={styles.card}>
              <ThemedText style={styles.emoji}>📎</ThemedText>
              <ThemedText type="defaultSemiBold">Novo anexo</ThemedText>
              <ThemedText style={styles.cardText}>Registre mais evidências e documentos da manutenção.</ThemedText>
            </View>
          </Link>

          <Link href="/operator-actions-safe" asChild>
            <View style={styles.card}>
              <ThemedText style={styles.emoji}>🔄</ThemedText>
              <ThemedText type="defaultSemiBold">Atualizar status</ThemedText>
              <ThemedText style={styles.cardText}>Avance etapas e registre o diagnóstico da ordem.</ThemedText>
            </View>
          </Link>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  hero: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: "#0f172a",
    marginBottom: 16,
    gap: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  heroTitle: { color: "#fff" },
  heroSubtitle: { color: "rgba(255,255,255,0.78)", lineHeight: 21 },
  summaryCard: { borderRadius: 20, padding: 16, backgroundColor: "rgba(15,23,42,0.06)", gap: 12, marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  label: { opacity: 0.65 },
  sectionHeader: { gap: 6, marginBottom: 12 },
  subtle: { opacity: 0.72, lineHeight: 20 },
  grid: { gap: 12 },
  card: { borderRadius: 22, padding: 18, backgroundColor: "rgba(255,255,255,0.72)", gap: 8 },
  emoji: { fontSize: 28 },
  cardText: { opacity: 0.72, lineHeight: 20 },
}
