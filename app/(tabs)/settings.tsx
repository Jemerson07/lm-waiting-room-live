import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useCompanySettings } from "@/hooks/use-company-settings";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor({}, "cardBackground");
  const borderColor = useThemeColor({}, "border");

  const { settings, loading, saveSettings } = useCompanySettings();

  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState("3");
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!loading && settings) {
      setCompanyName(settings.companyName || "");
      setCompanyEmail(settings.companyEmail || "");
      setCompanyPhone(settings.companyPhone || "");
      setCompanyAddress(settings.companyAddress || "");
      setSoundAlertsEnabled(settings.soundAlertsEnabled !== false);
      setNotificationsEnabled(settings.notificationsEnabled !== false);
      setAutoRefreshInterval(String(settings.autoRefreshInterval || 3));
    }
  }, [settings, loading]);

  const handleSaveSettings = async () => {
    if (!companyName.trim()) {
      Alert.alert("Erro", "Por favor, informe o nome da empresa");
      return;
    }

    try {
      setSaving(true);
      await saveSettings({
        companyName: companyName.trim(),
        companyEmail: companyEmail.trim(),
        companyPhone: companyPhone.trim(),
        companyAddress: companyAddress.trim(),
        soundAlertsEnabled,
        notificationsEnabled,
        autoRefreshInterval: parseInt(autoRefreshInterval) || 3,
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setHasChanges(false);
      Alert.alert("Sucesso", "Configurações salvas com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar as configurações");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Restaurar Padrões",
      "Deseja restaurar as configurações padrão?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Restaurar",
          style: "destructive",
          onPress: () => {
            setCompanyName("LM Soluções de Mobilidade");
            setCompanyEmail("");
            setCompanyPhone("");
            setCompanyAddress("");
            setSoundAlertsEnabled(true);
            setNotificationsEnabled(true);
            setAutoRefreshInterval("3");
            setHasChanges(true);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 20) + 20,
            paddingBottom: Math.max(insets.bottom, 20) + 20,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">Configurações</ThemedText>
          <ThemedText style={styles.subtitle}>
            Personalize seu sistema de atendimento
          </ThemedText>
        </View>

        {/* Seção: Informações da Empresa */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            📋 Informações da Empresa
          </ThemedText>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Nome da Empresa *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor, borderColor }]}
              value={companyName}
              onChangeText={(text) => {
                setCompanyName(text);
                setHasChanges(true);
              }}
              placeholder="Ex: LM Soluções de Mobilidade"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor, borderColor }]}
              value={companyEmail}
              onChangeText={(text) => {
                setCompanyEmail(text);
                setHasChanges(true);
              }}
              placeholder="contato@empresa.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Telefone</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor, borderColor }]}
              value={companyPhone}
              onChangeText={(text) => {
                setCompanyPhone(text);
                setHasChanges(true);
              }}
              placeholder="(11) 99999-9999"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Endereço</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor, borderColor }]}
              value={companyAddress}
              onChangeText={(text) => {
                setCompanyAddress(text);
                setHasChanges(true);
              }}
              placeholder="Rua, número, bairro, cidade"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Seção: Notificações e Alertas */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            🔔 Notificações e Alertas
          </ThemedText>

          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <ThemedText style={styles.settingTitle}>Alertas Sonoros</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Toque ao atualizar status
              </ThemedText>
            </View>
            <Switch
              value={soundAlertsEnabled}
              onValueChange={(value) => {
                setSoundAlertsEnabled(value);
                setHasChanges(true);
              }}
              trackColor={{ false: "#ccc", true: tintColor }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <ThemedText style={styles.settingTitle}>Notificações</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Receber atualizações em tempo real
              </ThemedText>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={(value) => {
                setNotificationsEnabled(value);
                setHasChanges(true);
              }}
              trackColor={{ false: "#ccc", true: tintColor }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.divider} />

          <View style={[styles.infoBox, { backgroundColor: "rgba(0, 82, 163, 0.05)" }]}>
            <ThemedText style={styles.infoText}>
              ud83dudcf1 WhatsApp: Notificau00e7u00f5es automu00e1ticas seru00e3o enviadas aos clientes quando o status do veu00edculo mudar, desde que o nu00famero de telefone seja fornecido no formulário de atendimento.
            </ThemedText>
          </View>
        </View>

        {/* Seu00e7u00e3o: Sistema */}     <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            ⚙️ Sistema
          </ThemedText>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>
              Intervalo de Atualização (segundos)
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor, borderColor }]}
              value={autoRefreshInterval}
              onChangeText={(text) => {
                setAutoRefreshInterval(text);
                setHasChanges(true);
              }}
              placeholder="3"
              placeholderTextColor="#999"
              keyboardType="number-pad"
            />
            <ThemedText style={styles.helperText}>
              Frequência de sincronização com o servidor (mínimo: 1 segundo)
            </ThemedText>
          </View>
        </View>

        {/* Seção: Sobre */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            ℹ️ Sobre
          </ThemedText>

          <View style={styles.aboutContainer}>
            <Image
              source={require("@/assets/images/logo-lm.png")}
              style={styles.logoAbout}
              contentFit="contain"
            />
            <ThemedText style={styles.appVersion}>
              LM Sala de Espera Live v1.0.0
            </ThemedText>
            <ThemedText style={styles.appDescription}>
              Sistema de gerenciamento de sala de espera veicular com sincronização
              em tempo real
            </ThemedText>
          </View>
        </View>

        {/* Botões de Ação */}
        <View style={styles.actionButtons}>
          <Pressable
            style={[
              styles.button,
              styles.resetButton,
              { borderColor: "#FF3B30" },
            ]}
            onPress={handleReset}
          >
            <ThemedText style={[styles.buttonText, { color: "#FF3B30" }]}>
              Restaurar Padrões
            </ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.button,
              styles.saveButton,
              { backgroundColor: tintColor },
              !hasChanges && styles.buttonDisabled,
            ]}
            onPress={handleSaveSettings}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>
                {hasChanges ? "💾 Salvar Alterações" : "✓ Salvo"}
              </ThemedText>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 8,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 6,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingLabel: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    opacity: 0.6,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    marginVertical: 12,
  },
  infoBox: {
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#0052A3",
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  aboutContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  logoAbout: {
    width: 120,
    height: 60,
    marginBottom: 16,
  },
  appVersion: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 13,
    opacity: 0.7,
    textAlign: "center",
  },
  actionButtons: {
    gap: 12,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  resetButton: {
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  saveButton: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
