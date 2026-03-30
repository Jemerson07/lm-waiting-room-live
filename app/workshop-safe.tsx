import { ScrollView, StyleSheet, View } from "react-native";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { isMaintenanceModeEnabled } from "@/lib/env";

export default function WorkshopSafeScreen() {
  const insets = useSafeAreaInsets();
  const enabled = isMaintenanceModeEnabled();

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: 32 }}>
        <View style={styles.hero}>
          <ThemedText type="title" style={styles.heroTitle}>Mesa da oficina</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Área unificada do operador para acompanhar ordens, atualizar etapas e registrar evidências com mais rapidez e clareza visual.
          </ThemedText>
          <View style={[styles.badge, { backgroundColor: enabled ? "#10B981" : "#F59E0B" }]}>
            <ThemedText style={styles.badgeText}>{enabled ? "Fluxo novo ativo" : "Ative o modo manutenção"}</ThemedText>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Ações rápidas</ThemedText>
          <ThemedText style={styles.sectionText}>Caminho prático para operação diária no celular e na web.</ThemedText>
        </View>

        <View style={styles.grid}>
          <Link href="/operator-safe" asChild>
            <View style={styles.card}>
              <ThemedText style={styles.emoji}>📋</ThemedText>
              <ThemedText type="defaultSemiBold">Ordens em atendimento</ThemedText>
              <ThemedText style={styles.cardText}>Visualize rapidamente as ordens recentes da oficina.</ThemedText>
            </View>
          </Link>

          <Link href="/operator-actions-safe" asChild>
            <View style={styles.card}>
              <ThemedText style={styles.emoji}>🔄</ThemedText>
              <ThemedText type="defaultSemiBold">Atualizar status</ThemedText>
              <ThemedText style={styles.cardText}>Mude a etapa da manutenção e registre diagnóstico.</ThemedText>
            </View>
          </Link>

          <Link href="/attachments-safe" asChild>
            <View style={styles.card}>
              <ThemedText style={styles.emoji}>📎</ThemedText>
              <ThemedText type="defaultSemiBold">Registrar evidências</ThemedText>
              <ThemedText style={styles.cardText}>Cadastre fotos, PDFs, laudos e links da ordem.</ThemedText>
            </View>
          </Link>

          <Link href="/maintenance-safe" asChild>
            <View style={styles.card}>
              <ThemedText style={styles.emoji}>🧰</ThemedText>
              <ThemedText type="defaultSemiBold">Painel de ordens</ThemedText>
              <ThemedText style={styles.cardText}>Abra a visão geral de manutenção com cards maiores.</ThemedText>
            </View>
          </Link>
        </View>

        <View style={styles.tipsCard}>
          <ThemedText type="defaultSemiBold">Sequência ideal para o operador</ThemedText>
          <ThemedText style={styles.tip}>1. abrir ou localizar a ordem</ThemedText>
          <ThemedText style={styles.tip}>2. atualizar status conforme a etapa real</ThemedText>
          <ThemedText style={styles.tip}>3. anexar evidências da manutenção</ThemedText>
          <ThemedText style={styles.tip}>4. revisar no detalhe da ordem</ThemedText>
        </View>
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
  badge: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  sectionHeader: { gap: 6, marginBottom: 12 },
  sectionText: { opacity: 0.72, lineHeight: 20 },
  grid: { gap: 12, marginBottom: 16 },
  card: { borderRadius: 22, padding: 18, backgroundColor: "rgba(255,255,255,0.72)", gap: 8 },
  emoji: { fontSize: 28 },
  cardText: { opacity: 0.72, lineHeight: 20 },
  tipsCard: { borderRadius: 20, padding: 16, backgroundColor: "rgba(15,23,42,0.06)", gap: 8 },
  tip: { opacity: 0.82, lineHeight: 21 },
}
