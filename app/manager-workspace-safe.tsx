import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useManagerOrders } from "@/hooks/use-maintenance";
import { isMaintenanceModeEnabled } from "@/lib/env";

export default function ManagerWorkspaceSafeScreen() {
  const insets = useSafeAreaInsets();
  const enabled = isMaintenanceModeEnabled();
  const { data = [] } = useManagerOrders();

  const summary = useMemo(() => {
    const grouped = data.reduce<Record<string, number>>((acc, order) => {
      const status = String(order.current_status);
      acc[status] = (acc[status] ?? 0) + 1;
      return acc;
    }, {});

    const priorities = data.reduce<Record<string, number>>((acc, order) => {
      const priority = String(order.priority);
      acc[priority] = (acc[priority] ?? 0) + 1;
      return acc;
    }, {});

    return {
      total: data.length,
      emServico: grouped.em_servico ?? 0,
      diagnostico: grouped.diagnostico ?? 0,
      finalizadas: grouped.finalizada ?? 0,
      urgentes: priorities.urgent ?? 0,
      altas: priorities.high ?? 0,
    };
  }, [data]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: 32 }}>
        <View style={styles.hero}>
          <ThemedText type="title" style={styles.heroTitle}>Mesa do gerente</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Centro gerencial para acompanhar gargalos, prioridades e acessos rápidos do sistema novo com uma experiência mais limpa para web e mobile.
          </ThemedText>
        </View>

        {!enabled ? (
          <View style={styles.stateCard}>
            <ThemedText type="defaultSemiBold">Ative o modo manutenção</ThemedText>
            <ThemedText style={styles.subtle}>Preencha o .env e ligue a integração para usar esta área com dados reais.</ThemedText>
          </View>
        ) : (
          <>
            <View style={styles.metricsGrid}>
              {[
                ["Ordens totais", summary.total, "#0f172a"],
                ["Em serviço", summary.emServico, "#10B981"],
                ["Diagnóstico", summary.diagnostico, "#8B5CF6"],
                ["Finalizadas", summary.finalizadas, "#22C55E"],
              ].map(([label, value, tone]) => (
                <View key={String(label)} style={[styles.metricCard, { backgroundColor: String(tone) }]}>
                  <ThemedText style={styles.metricValue}>{String(value)}</ThemedText>
                  <ThemedText style={styles.metricLabel}>{String(label)}</ThemedText>
                </View>
              ))}
            </View>

            <View style={styles.alertCard}>
              <ThemedText type="defaultSemiBold">Alertas gerenciais</ThemedText>
              <ThemedText style={styles.alertText}>• {summary.urgentes} ordem(ns) com prioridade urgente</ThemedText>
              <ThemedText style={styles.alertText}>• {summary.altas} ordem(ns) com prioridade alta</ThemedText>
              <ThemedText style={styles.alertText}>• {summary.emServico} ordem(ns) em serviço</ThemedText>
            </View>

            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle">Atalhos operacionais</ThemedText>
              <ThemedText style={styles.subtle}>Acesse rapidamente os módulos mais importantes da gestão.</ThemedText>
            </View>

            <View style={styles.grid}>
              <Link href="/maintenance-board-safe" asChild>
                <View style={styles.card}>
                  <ThemedText style={styles.emoji}>🗃️</ThemedText>
                  <ThemedText type="defaultSemiBold">Quadro com filtros</ThemedText>
                  <ThemedText style={styles.cardText}>Busque por placa, cliente, operador e status com leitura operacional melhor.</ThemedText>
                </View>
              </Link>

              <Link href="/manager-safe" asChild>
                <View style={styles.card}>
                  <ThemedText style={styles.emoji}>📊</ThemedText>
                  <ThemedText type="defaultSemiBold">Métricas rápidas</ThemedText>
                  <ThemedText style={styles.cardText}>Resumo por status e produtividade por operador.</ThemedText>
                </View>
              </Link>

              <Link href="/live-safe" asChild>
                <View style={styles.card}>
                  <ThemedText style={styles.emoji}>📺</ThemedText>
                  <ThemedText type="defaultSemiBold">Painel TV</ThemedText>
                  <ThemedText style={styles.cardText}>Acompanhe o fluxo visual das etapas em recepção e oficina.</ThemedText>
                </View>
              </Link>

              <Link href="/settings-safe" asChild>
                <View style={styles.card}>
                  <ThemedText style={styles.emoji}>⚙️</ThemedText>
                  <ThemedText type="defaultSemiBold">Configurações</ThemedText>
                  <ThemedText style={styles.cardText}>Valide ambiente, integração e checklist de ativação.</ThemedText>
                </View>
              </Link>
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
  hero: { borderRadius: 26, padding: 22, backgroundColor: "#0f172a", gap: 10, marginBottom: 16 },
  heroTitle: { color: "#fff" },
  heroSubtitle: { color: "rgba(255,255,255,0.78)", lineHeight: 22 },
  stateCard: { borderRadius: 20, padding: 16, backgroundColor: "rgba(148,163,184,0.12)", gap: 8 },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },
  metricCard: { minWidth: 150, flex: 1, borderRadius: 20, padding: 16, gap: 6 },
  metricValue: { color: "#fff", fontSize: 30, fontWeight: "800" },
  metricLabel: { color: "rgba(255,255,255,0.85)", lineHeight: 18 },
  alertCard: { borderRadius: 20, padding: 16, backgroundColor: "rgba(245,158,11,0.14)", gap: 8, marginBottom: 16 },
  alertText: { lineHeight: 21, opacity: 0.85 },
  sectionHeader: { gap: 6, marginBottom: 12 },
  subtle: { opacity: 0.72, lineHeight: 20 },
  grid: { gap: 12 },
  card: { borderRadius: 22, padding: 18, backgroundColor: "rgba(255,255,255,0.72)", gap: 8 },
  emoji: { fontSize: 28 },
  cardText: { opacity: 0.72, lineHeight: 20 },
}
