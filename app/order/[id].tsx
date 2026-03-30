import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBadge } from "@/components/maintenance/status-badge";
import { TimelineList } from "@/components/maintenance/timeline-list";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useCustomerOrder, useOrderAttachments, useOrderTimeline } from "@/hooks/use-maintenance";
import { isMaintenanceModeEnabled } from "@/lib/env";

function formatDate(value?: string | null) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return value;
  }
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: order, isLoading: loadingOrder, error: orderError } = useCustomerOrder(id);
  const { data: timeline = [], isLoading: loadingTimeline } = useOrderTimeline(id);
  const { data: attachments = [], isLoading: loadingAttachments } = useOrderAttachments(id);

  if (!isMaintenanceModeEnabled()) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="title">Integração Supabase desativada</ThemedText>
      </ThemedView>
    );
  }

  if (loadingOrder) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (orderError || !order) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="title">Ordem não encontrada</ThemedText>
        <ThemedText style={styles.info}>{String(orderError?.message ?? "Confira o ID da ordem.")}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 12, paddingBottom: 32 }}>
        <View style={styles.hero}>
          <View style={{ flex: 1, gap: 8 }}>
            <ThemedText type="title">{order.plate}</ThemedText>
            <ThemedText style={styles.info}>{order.brand} {order.model} • {order.customer_name}</ThemedText>
            <ThemedText style={styles.info}>Criada em {formatDate(order.created_at)}</ThemedText>
          </View>
          <StatusBadge status={String(order.current_status)} />
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle">Resumo</ThemedText>
          <View style={styles.metaRow}><ThemedText style={styles.label}>Serviço</ThemedText><ThemedText>{String(order.service_type)}</ThemedText></View>
          <View style={styles.metaRow}><ThemedText style={styles.label}>Prioridade</ThemedText><ThemedText>{String(order.priority)}</ThemedText></View>
          <View style={styles.metaRow}><ThemedText style={styles.label}>Previsão</ThemedText><ThemedText>{formatDate(order.estimated_finish_at)}</ThemedText></View>
          <View style={styles.metaRow}><ThemedText style={styles.label}>Finalizada</ThemedText><ThemedText>{formatDate(order.finished_at)}</ThemedText></View>
          <View style={styles.metaRow}><ThemedText style={styles.label}>Entregue</ThemedText><ThemedText>{formatDate(order.delivered_at)}</ThemedText></View>
          {order.complaint ? <><ThemedText style={styles.labelBlock}>Queixa</ThemedText><ThemedText>{order.complaint}</ThemedText></> : null}
          {order.diagnosis ? <><ThemedText style={styles.labelBlock}>Diagnóstico</ThemedText><ThemedText>{order.diagnosis}</ThemedText></> : null}
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle">Timeline pública</ThemedText>
          {loadingTimeline ? <ActivityIndicator /> : <TimelineList events={timeline.filter((item) => item.public_to_customer)} />}
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle">Anexos</ThemedText>
          {loadingAttachments ? (
            <ActivityIndicator />
          ) : !attachments.length ? (
            <ThemedText style={styles.info}>Nenhum anexo registrado nesta ordem.</ThemedText>
          ) : (
            <View style={styles.attachmentList}>
              {attachments.map((attachment) => (
                <View key={attachment.id} style={styles.attachmentItem}>
                  <ThemedText style={styles.attachmentName}>{attachment.file_name}</ThemedText>
                  <ThemedText style={styles.info}>{attachment.file_type ?? "arquivo"}</ThemedText>
                  <ThemedText style={styles.info}>{attachment.file_path}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  hero: { flexDirection: "row", gap: 12, alignItems: "flex-start", marginBottom: 18 },
  card: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: "rgba(148, 163, 184, 0.12)",
    marginBottom: 16,
    gap: 12,
  },
  metaRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  label: { opacity: 0.65 },
  labelBlock: { opacity: 0.65, textTransform: "uppercase", fontSize: 12 },
  info: { opacity: 0.72 },
  attachmentList: { gap: 12 },
  attachmentItem: { borderRadius: 14, padding: 12, backgroundColor: "rgba(15, 23, 42, 0.06)", gap: 4 },
  attachmentName: { fontWeight: "700" },
}
