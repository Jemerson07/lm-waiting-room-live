import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AttachmentList } from "@/components/maintenance/attachment-list";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useCustomerOrder, useOrderAttachments } from "@/hooks/use-maintenance";
import { isMaintenanceModeEnabled } from "@/lib/env";

export default function OrderGallerySafeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: order, isLoading: loadingOrder, error: orderError } = useCustomerOrder(id);
  const { data: attachments = [], isLoading: loadingAttachments, error: attachmentsError } = useOrderAttachments(id);

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
        <ThemedText style={styles.subtle}>{String(orderError?.message ?? "Confira o ID da ordem.")}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: 32 }}>
        <View style={styles.hero}>
          <ThemedText type="title" style={styles.heroTitle}>Galeria da ordem</ThemedText>
          <ThemedText style={styles.heroSubtitle}>{order.plate} • {order.brand} {order.model}</ThemedText>
          <ThemedText style={styles.heroSubtitle}>{order.customer_name}</ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle">Evidências registradas</ThemedText>
          <ThemedText style={styles.subtle}>Visualize os anexos técnicos, fotos, PDFs e links da manutenção.</ThemedText>
          {loadingAttachments ? (
            <ActivityIndicator />
          ) : attachmentsError ? (
            <ThemedText style={styles.subtle}>{String(attachmentsError.message ?? attachmentsError)}</ThemedText>
          ) : (
            <AttachmentList attachments={attachments} />
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
  hero: { borderRadius: 24, padding: 20, backgroundColor: "#0f172a", marginBottom: 16, gap: 8 },
  heroTitle: { color: "#fff" },
  heroSubtitle: { color: "rgba(255,255,255,0.78)", lineHeight: 21 },
  card: { borderRadius: 20, padding: 16, backgroundColor: "rgba(15,23,42,0.06)", gap: 12, marginBottom: 16 },
  subtle: { opacity: 0.72, lineHeight: 20 },
}
