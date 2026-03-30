import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { env, isMaintenanceModeEnabled, isSupabaseConfigured } from "@/lib/env";

export default function SettingsSafeScreen() {
  const insets = useSafeAreaInsets();
  const configured = isSupabaseConfigured();
  const enabled = isMaintenanceModeEnabled();

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: 32 }}>
        <View style={styles.hero}>
          <ThemedText type="title" style={styles.heroTitle}>Configuração • sistema novo</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Tela de apoio para validar ambiente, integração e leitura operacional antes de substituir as telas antigas.
          </ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle">Status da integração</ThemedText>
          <View style={styles.row}><ThemedText style={styles.label}>Supabase configurado</ThemedText><ThemedText>{configured ? "Sim" : "Não"}</ThemedText></View>
          <View style={styles.row}><ThemedText style={styles.label}>Modo manutenção ativo</ThemedText><ThemedText>{enabled ? "Sim" : "Não"}</ThemedText></View>
          <View style={styles.row}><ThemedText style={styles.label}>Empresa</ThemedText><ThemedText>{env.companySlug}</ThemedText></View>
          <View style={styles.row}><ThemedText style={styles.label}>App</ThemedText><ThemedText>{env.appName}</ThemedText></View>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle">Checklist de ativação</ThemedText>
          <View style={styles.list}>
            <ThemedText style={styles.item}>1. Criar `.env` a partir de `.env.example`</ThemedText>
            <ThemedText style={styles.item}>2. Preencher `EXPO_PUBLIC_SUPABASE_URL`</ThemedText>
            <ThemedText style={styles.item}>3. Preencher `EXPO_PUBLIC_SUPABASE_ANON_KEY`</ThemedText>
            <ThemedText style={styles.item}>4. Definir `EXPO_PUBLIC_ENABLE_SUPABASE_MAINTENANCE=true`</ThemedText>
            <ThemedText style={styles.item}>5. Validar as rotas `/maintenance-safe`, `/operator-safe`, `/live-safe`, `/manager-safe`</ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  hero: { borderRadius: 24, padding: 20, backgroundColor: "#0f172a", marginBottom: 16 },
  heroTitle: { color: "#fff" },
  heroSubtitle: { color: "rgba(255,255,255,0.78)", marginTop: 8, lineHeight: 22 },
  card: { borderRadius: 20, padding: 16, backgroundColor: "rgba(15,23,42,0.06)", gap: 12, marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "rgba(148,163,184,0.18)" },
  label: { opacity: 0.75 },
  list: { gap: 10 },
  item: { lineHeight: 21, opacity: 0.82 },
}
