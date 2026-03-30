import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { env, isMaintenanceModeEnabled } from "@/lib/env";
import { useRegisterMaintenanceAttachment } from "@/hooks/use-maintenance-attachments";

export default function AttachmentsSafeScreen() {
  const insets = useSafeAreaInsets();
  const enabled = isMaintenanceModeEnabled();
  const mutation = useRegisterMaintenanceAttachment();
  const [orderId, setOrderId] = useState("");
  const [fileName, setFileName] = useState("");
  const [filePath, setFilePath] = useState("");
  const [fileType, setFileType] = useState("image/jpeg");
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit() {
    setFeedback(null);
    try {
      const result = await mutation.mutateAsync({
        orderId: orderId.trim(),
        fileName,
        filePath,
        fileType,
      });
      setFeedback(`Anexo ${result.file_name} registrado com sucesso.`);
      setFileName("");
      setFilePath("");
    } catch (error) {
      setFeedback(String((error as Error)?.message ?? error));
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: 32 }}>
        <View style={styles.hero}>
          <ThemedText type="title" style={styles.heroTitle}>Anexos • evidências</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Registre fotos, laudos, PDFs e links da manutenção com uma tela organizada para operação web e mobile.
          </ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle">Registrar anexo</ThemedText>
          <ThemedText style={styles.subtle}>Empresa: {env.companySlug}</ThemedText>

          <TextInput
            style={styles.input}
            value={orderId}
            onChangeText={setOrderId}
            placeholder="ID da ordem"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            value={fileName}
            onChangeText={setFileName}
            placeholder="Nome do arquivo"
            placeholderTextColor="#94a3b8"
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            value={filePath}
            onChangeText={setFilePath}
            placeholder="URL pública ou caminho do arquivo no storage"
            placeholderTextColor="#94a3b8"
            multiline
            textAlignVertical="top"
          />

          <TextInput
            style={styles.input}
            value={fileType}
            onChangeText={setFileType}
            placeholder="Tipo MIME, ex: image/jpeg"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
          />

          <Pressable
            style={[styles.button, (!enabled || !orderId.trim() || !fileName.trim() || !filePath.trim() || mutation.isPending) && styles.buttonDisabled]}
            disabled={!enabled || !orderId.trim() || !fileName.trim() || !filePath.trim() || mutation.isPending}
            onPress={handleSubmit}
          >
            <ThemedText style={styles.buttonText}>{mutation.isPending ? "Registrando..." : "Salvar anexo"}</ThemedText>
          </Pressable>

          {feedback ? <ThemedText style={styles.feedback}>{feedback}</ThemedText> : null}
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle">Boas práticas</ThemedText>
          <View style={styles.list}>
            <ThemedText style={styles.item}>• use nomes claros, ex: foto-freios.jpg</ThemedText>
            <ThemedText style={styles.item}>• prefira caminho padronizado por ordem</ThemedText>
            <ThemedText style={styles.item}>• registre PDFs de orçamento, laudos e imagens</ThemedText>
            <ThemedText style={styles.item}>• depois valide em `/order-safe/ID_DA_ORDEM`</ThemedText>
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
  subtle: { opacity: 0.72 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.28)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  textArea: { minHeight: 110 },
  button: { borderRadius: 16, paddingVertical: 15, alignItems: "center", backgroundColor: "#0f172a" },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: "#fff", fontWeight: "700" },
  feedback: { lineHeight: 20, opacity: 0.82 },
  list: { gap: 8 },
  item: { lineHeight: 21, opacity: 0.82 },
}
