import { ScrollView, StyleSheet, View } from "react-native";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { env, isMaintenanceModeEnabled } from "@/lib/env";

export default function GarageHubSafeScreen() {
  const insets = useSafeAreaInsets();
  const enabled = isMaintenanceModeEnabled();

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: 32 }}>
        <View style={styles.hero}>
          <ThemedText type="title" style={styles.heroTitle}>Hub da oficina</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Centro de navegação da oficina e recepção, reunindo atendimento, check-in, acompanhamento visual e gestão do fluxo diário.
          </ThemedText>
          <View style={[styles.badge, { backgroundColor: enabled ? "#10B981" : "#F59E0B" }]}>
            <ThemedText style={styles.badgeText}>{enabled ? "Modo manutenção ativo" : "Ative o modo manutenção"}</ThemedText>
          </View>
          <ThemedText style={styles.heroMini}>{env.companySlug}</ThemedText>
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Recepção e entrada</ThemedText>
          <ThemedText style={styles.sectionText}>Fluxos iniciais para abrir atendimento e orientar o cliente.</ThemedText>
        </View>

        <View style={styles.grid}>
          <Link href="/checkin-safe" asChild>
            <View style={styles.card}>
              <ThemedText style={styles.emoji}>📝</ThemedText>
              <ThemedText type="defaultSemiBold">Check-in</ThemedText>
              <ThemedText style={styles.cardText}>Abra ordens novas com cliente, placa, queixa, tipo de serviço e prioridade.</ThemedText>
            </View>
          </Link>

          <Link href="/customer-orders-safe" asChild>
            <View style={styles.card}>
              <ThemedText style={styles.emoji}>📱</ThemedText>
              <ThemedText type="defaultSemiBold">Portal do cliente</ThemedText>
              <ThemedText style={styles.cardText}>Busque ordens pelo e-mail do cliente e abra o acompanhamento.</ThemedText>
            </View>
          </Link>

          <Link href="/lounge-presentation-safe" asChild>
            <View style={styles.card}>
              <ThemedText style={styles.emoji}>🛋️</ThemedText>
              <ThemedText type="defaultSemiBold">Tela da sala de espera</ThemedText>
              <ThemedText style={styles.cardText}>Apresentação visual para recepção, descanso e acompanhamento da manutenção.</ThemedText>
            </View>
          </Link>
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Operação da oficina</ThemedText>
          <ThemedText style={styles.sectionText}>Fluxos usados pelo operador e pelo time da oficina no dia a dia.</ThemedText>
        </View>

        <View style={styles.grid}>
          <Link href="/operator-service-desk-safe" asChild>
            <View style={styles.card}>
              <ThemedText style={styles.emoji}>👨‍🔧</ThemedText>
              <ThemedText type="defaultSemiBold">Atendimento da oficina</ThemedText>
              <ThemedText style={styles.cardText}>Quantidade de veículos, prioridades e curso do atendimento dentro da oficina.</ThemedText>
            </View>
          </Link>

          <Link href="/maintenance-board-safe" asChild>
            <View style={styles.card}>
              <ThemedText style={styles.emoji}>🗃️</ThemedText>
              <ThemedText type="defaultSemiBold">Quadro com filtros</ThemedText>
              <ThemedText style={styles.cardText}>Busque ordens por placa, cliente, operador e status em uma visão mais operacional.</ThemedText>
            </View>
          </Link>

          <Link href="/workshop-safe" asChild>
            <View style={styles.card}>
              <ThemedText style={styles.emoji}>🧰</ThemedText>
              <ThemedText type="defaultSemiBold">Mesa da oficina</ThemedText>
              <ThemedText style={styles.cardText}>Atalhos rápidos para ordens, atualização de status e evidências.</ThemedText>
            </View>
          </Link>
        </View>

        <View style={styles.tipsCard}>
          <ThemedText type="defaultSemiBold">Fluxo recomendado da oficina</ThemedText>
          <ThemedText style={styles.tip}>1. recepção faz o check-in da ordem</ThemedText>
          <ThemedText style={styles.tip}>2. operador acompanha o curso do atendimento</ThemedText>
          <ThemedText style={styles.tip}>3. cliente acompanha pela sala de espera ou pelo portal</ThemedText>
          <ThemedText style={styles.tip}>4. gerente acompanha indicadores e gargalos</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  hero: { borderRadius: 28, padding: 24, backgroundColor: "#0f172a", gap: 10, marginBottom: 16 },
  heroTitle: { color: "#fff" },
  heroSubtitle: { color: "rgba(255,255,255,0.82)", lineHeight: 24 },
  heroMini: { color: "rgba(255,255,255,0.66)", fontWeight: "700" },
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
