import { ScrollView, StyleSheet, View } from "react-native";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { isMaintenanceModeEnabled } from "@/lib/env";

export default function AdminHubSafeScreen() {
  const insets = useSafeAreaInsets();
  const enabled = isMaintenanceModeEnabled();

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: 32 }}>
        <View style={styles.hero}>
          <ThemedText type="title" style={styles.heroTitle}>Centro de comando</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Entrada premium para o fluxo novo de manutenção, com foco em UX visual, leitura rápida e expansão web/mobile.
          </ThemedText>
          <View style={[styles.stateBadge, { backgroundColor: enabled ? "#10B981" : "#F59E0B" }]}>
            <ThemedText style={styles.stateBadgeText}>{enabled ? "Supabase ativo" : "Configurar Supabase"}</ThemedText>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Atalhos principais</ThemedText>
          <ThemedText style={styles.sectionText}>Valide as novas experiências por etapa antes de substituir as tabs atuais.</ThemedText>
        </View>

        <View style={styles.grid}>
          <Link href="/maintenance-safe" asChild>
            <View style={styles.card}>
              <ThemedText style={styles.emoji}>🧰</ThemedText>
              <ThemedText type="defaultSemiBold">Painel de manutenção</ThemedText>
              <ThemedText style={styles.cardText}>Lista de ordens do Supabase com cards mais limpos e leitura melhor.</ThemedText>
            </View>
          </Link>

          <Link href="/operator-safe" asChild>
            <View style={styles.card}>
              <ThemedText style={styles.emoji}>👨‍🔧</ThemedText>
              <ThemedText type="defaultSemiBold">Fluxo do operador</ThemedText>
              <ThemedText style={styles.cardText}>UX nova para entrada, diagnóstico e avanço das ordens.</ThemedText>
            </View>
          </Link>

          <Link href="/live-safe" asChild>
            <View style={styles.card}>
              <ThemedText style={styles.emoji}>📺</ThemedText>
              <ThemedText type="defaultSemiBold">Painel TV</ThemedText>
              <ThemedText style={styles.cardText}>Tela grande por etapa de manutenção para recepção e oficina.</ThemedText>
            </View>
          </Link>

          <Link href="/(tabs)/analytics" asChild>
            <View style={styles.card}>
              <ThemedText style={styles.emoji}>📈</ThemedText>
              <ThemedText type="defaultSemiBold">Relatório atual</ThemedText>
              <ThemedText style={styles.cardText}>Continue usando os relatórios atuais enquanto a migração gerencial avança.</ThemedText>
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
  hero: { borderRadius: 26, padding: 22, backgroundColor: "#0f172a", gap: 10, marginBottom: 18 },
  heroTitle: { color: "#fff" },
  heroSubtitle: { color: "rgba(255,255,255,0.78)", lineHeight: 22 },
  stateBadge: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  stateBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  sectionHeader: { gap: 6, marginBottom: 12 },
  sectionText: { opacity: 0.72, lineHeight: 20 },
  grid: { gap: 12 },
  card: { borderRadius: 22, padding: 18, backgroundColor: "rgba(15,23,42,0.06)", gap: 8 },
  emoji: { fontSize: 28 },
  cardText: { opacity: 0.72, lineHeight: 20 },
}
