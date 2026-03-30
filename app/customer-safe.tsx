import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { env, isMaintenanceModeEnabled } from "@/lib/env";

export default function CustomerSafeScreen() {
  const insets = useSafeAreaInsets();
  const enabled = isMaintenanceModeEnabled();
  const [orderId, setOrderId] = useState("");

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: 32 }}>
        <View style={styles.hero}>
          <ThemedText type="title" style={styles.heroTitle}>Cliente • acompanhamento</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Tela pensada para o cliente acompanhar a manutenção pelo celular ou web com uma experiência simples e visual.
          </ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle">Consultar ordem</ThemedText>
          <ThemedText style={styles.subtle}>Informe o ID da ordem gerado no Supabase para abrir o acompanhamento.</ThemedText>

          <TextInput
            style={styles.input}
            value={orderId}
            onChangeText={setOrderId}
            placeholder="Ex: 1e5c1413-8ef2-4dba-8d25-71665e88c36e"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
          />

          <Pressable
            style={[styles.button, (!enabled || !orderId.trim()) && styles.buttonDisabled]}
            onPress={() => router.push(`/order-safe/${orderId.trim()}`)}
            disabled={!enabled || !orderId.trim()}
          >
            <ThemedText style={styles.buttonText}>Abrir acompanhamento</ThemedText>
          </Pressable>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle">O que o cliente verá</ThemedText>
          <View style={styles.list}>
            <ThemedText style={styles.item}>• status atual da manutenção</ThemedText>
            <ThemedText style={styles.item}>• timeline pública das atualizações</ThemedText>
            <ThemedText style={styles.item}>• previsão, conclusão e entrega</ThemedText>
            <ThemedText style={styles.item}>• anexos liberados para visualização</ThemedText>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle">Empresa conectada</ThemedText>
          <ThemedText style={styles.subtle}>{env.companySlug}</ThemedText>
          <ThemedText style={styles.subtle}>{enabled ? "Integração ativa para consulta do cliente." : "Ative o modo manutenção no .env para habilitar esta área."}</ThemedText>
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
  subtle: { opacity: 0.72, lineHeight: 20 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.28)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  button: { borderRadius: 16, paddingVertical: 15, alignItems: "center", backgroundColor: "#0f172a" },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: "#fff", fontWeight: "700" },
  list: { gap: 8 },
  item: { lineHeight: 21, opacity: 0.82 },
}
