import { ScrollView, StyleSheet, View } from "react-native";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { env, isMaintenanceModeEnabled, isSupabaseConfigured } from "@/lib/env";

export default function SystemSafeScreen() {
  const insets = useSafeAreaInsets();
  const configured = isSupabaseConfigured();
  const enabled = isMaintenanceModeEnabled();

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: 32 }}>
        <View style={styles.hero}>
          <ThemedText type="title" style={styles.heroTitle}>Sistema completo de manutenção</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Hub unificado para validar a nova experiência visual do app e da web, com foco em cliente, operador, gerente, TV e configuração.
          </ThemedText>
          <View style={styles.statusRow}>
            <View style={[styles.statusChip, { backgroundColor: configured ? "rgba(16,185,129,0.16)" : "rgba(245,158,11,0.16)" }]}>
              <ThemedText style={styles.statusChipText}>{configured ? "Supabase configurado" : "Configurar Supabase"}</ThemedText>
            </View>
            <View style={[styles.statusChip, { backgroundColor: enabled ? "rgba(59,130,246,0.18)" : "rgba(148,163,184,0.18)" }]}>
              <ThemedText style={styles.statusChipText}>{enabled ? "Modo manutenção ativo" : "Modo manutenção inativo"}</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <ThemedText type="defaultSemiBold">Ambiente atual</ThemedText>
          <ThemedText style={styles.infoText}>Empresa: {env.companySlug}</ThemedText>
          <ThemedText style={styles.infoText}>Aplicação: {env.appName}</ThemedText>
          <ThemedText style={styles.infoText}>Objetivo: validar UX e operação completa sem quebrar o fluxo antigo.</ThemedText>
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Perfis e áreas</ThemedText>
          <ThemedText style={styles.sectionText}>Teste por blocos para reduzir erro e acelerar a migração visual.</ThemedText>
        </View>

        <View style={styles.grid}>
          <Link href="/customer-safe" asChild>
            <View style={styles.card}>
              <ThemedText style={styles.emoji}>📱</ThemedText>
              <ThemedText type="defaultSemiBold">Cliente</ThemedText>
              <ThemedText style={styles.cardText}>Consulta da ordem, timeline pública e visão simples para celular/web.</ThemedText>
            </View>
          </Link>

          <Link href="/operator-safe" asChild>
            <View style={styles.card}>
              <ThemedText style={styles.emoji}>👨‍🔧</ThemedText>
              <ThemedText type="defaultSemiBold">Operador</ThemedText>
              <ThemedText style={styles.cardText}>Fluxo novo para entrada, diagnóstico e atualização rápida das ordens.</ThemedText>
            </View>
          </Link>

          <Link href="/manager-safe" asChild>
            <View style={styles.card}>
              <ThemedText style={styles.emoji}>📊</ThemedText>
              <ThemedText type="defaultSemiBold">Gerente</ThemedText>
              <ThemedText style={styles.cardText}>Métricas rápidas, fila por status e produtividade por operador.</ThemedText>
            </View>
          </Link>

          <Link href="/live-safe" asChild>
            <View style={styles.card}>
              <ThemedText style={styles.emoji}>📺</ThemedText>
              <ThemedText type="defaultSemiBold">Painel TV</ThemedText>
              <ThemedText style={styles.cardText}>Experiência visual para recepção, oficina e telas grandes.</ThemedText>
            </View>
          </Link>

          <Link href="/maintenance-safe" asChild>
            <View style={styles.card}>
              <ThemedText style={styles.emoji}>🧰</ThemedText>
              <ThemedText type="defaultSemiBold">Ordens</ThemedText>
              <ThemedText style={styles.cardText}>Lista das ordens com cards maiores e leitura operacional melhor.</ThemedText>
            </View>
          </Link>

          <Link href="/settings-safe" asChild>
            <View style={styles.card}>
              <ThemedText style={styles.emoji}>⚙️</ThemedText>
              <ThemedText type="defaultSemiBold">Configuração</ThemedText>
              <ThemedText style={styles.cardText}>Checklist de ativação do ambiente e status da integração.</ThemedText>
            </View>
          </Link>
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Próxima migração recomendada</ThemedText>
          <ThemedText style={styles.sectionText}>Depois de validar esse hub, a melhor sequência é Live → Relatório → Admin.</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  hero: { borderRadius: 28, padding: 22, backgroundColor: "#0f172a", gap: 10, marginBottom: 16 },
  heroTitle: { color: "#fff" },
  heroSubtitle: { color: "rgba(255,255,255,0.78)", lineHeight: 22 },
  statusRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 6 },
  statusChip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  statusChipText: { fontSize: 12, fontWeight: "700" },
  infoCard: { borderRadius: 20, padding: 16, backgroundColor: "rgba(15,23,42,0.06)", gap: 8, marginBottom: 16 },
  infoText: { opacity: 0.76, lineHeight: 20 },
  sectionHeader: { gap: 6, marginBottom: 12 },
  sectionText: { opacity: 0.72, lineHeight: 20 },
  grid: { gap: 12, marginBottom: 16 },
  card: { borderRadius: 22, padding: 18, backgroundColor: "rgba(255,255,255,0.72)", gap: 8 },
  emoji: { fontSize: 28 },
  cardText: { opacity: 0.72, lineHeight: 20 },
}
