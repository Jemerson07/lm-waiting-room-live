import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QuickLinkCard } from "@/components/maintenance/quick-link-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useManagerOrders } from "@/hooks/use-maintenance";
import { isMaintenanceModeEnabled } from "@/lib/env";

function buildCounts(statuses: string[]) {
  return statuses.reduce<Record<string, number>>((acc, current) => {
    acc[current] = (acc[current] ?? 0) + 1;
    return acc;
  }, {});
}

export default function ManagerHomeScreen() {
  const insets = useSafeAreaInsets();
  const { data = [], isLoading } = useManagerOrders();
  const enabled = isMaintenanceModeEnabled();
  const counts = buildCounts(data.map((item) => String(item.current_status)));

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: 32 }}>
        <View style={styles.header}>
          <ThemedText type="title">Área do gerente</ThemedText>
          <ThemedText style={styles.info}>
            Visão rápida de ordens, métricas e atalhos para supervisão da oficina.
          </ThemedText>
        </View>

        {!enabled ? (
          <View style={styles.alertCard}>
            <ThemedText type="defaultSemiBold">Integração Supabase desativada</ThemedText>
            <ThemedText style={styles.info}>Ative o modo manutenção no .env para usar os painéis novos.</ThemedText>
          </View>
        ) : isLoading ? (
          <View style={styles.loaderWrap}><ActivityIndicator size="large" /></View>
        ) : (
          <>
            <View style={styles.metricGrid}>
              {[
                ["Ordens", data.length],
                ["Em serviço", counts.em_servico ?? 0],
                ["Finalizadas", counts.finalizada ?? 0],
                ["Entregues", counts.entregue ?? 0],
              ].map(([label, value]) => (
                <View key={label} style={styles.metricCard}>
                  <ThemedText style={styles.metricValue}>{String(value)}</ThemedText>
                  <ThemedText style={styles.metricLabel}>{label}</ThemedText>
                </View>
              ))}
            </View>

            <View style={styles.linksWrap}>
              <QuickLinkCard href="/maintenance" title="Painel de ordens" description="Acompanhe o status operacional com foco em UX web e mobile." emoji="🧰" />
              <QuickLinkCard href="/(tabs)/analytics" title="Relatórios atuais" description="Use a base atual enquanto a migração do dashboard gerencial é concluída." emoji="📈" />
              <QuickLinkCard href="/(tabs)/settings" title="Configurações" description="Ajuste identidade da empresa, atualização e preferências do sistema." emoji="⚙️" />
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
  header: { gap: 8, marginBottom: 18 },
  info: { opacity: 0.72, lineHeight: 21 },
  alertCard: { borderRadius: 18, padding: 16, backgroundColor: "rgba(245, 158, 11, 0.14)", gap: 8 },
  loaderWrap: { paddingVertical: 40, alignItems: "center" },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 18 },
  metricCard: { minWidth: 140, flex: 1, borderRadius: 18, padding: 16, backgroundColor: "rgba(59,130,246,0.10)" },
  metricValue: { fontSize: 28, fontWeight: "800" },
  metricLabel: { marginTop: 6, opacity: 0.75 },
  linksWrap: { gap: 12 },
}
);