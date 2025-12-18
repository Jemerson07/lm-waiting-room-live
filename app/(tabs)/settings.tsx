import { StyleSheet, View, TextInput, Switch, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";

const SETTINGS_KEY = "company_settings";

interface CompanySettings {
  companyName: string;
  soundAlertsEnabled: boolean;
}

const DEFAULT_SETTINGS: CompanySettings = {
  companyName: "LM Soluções de Mobilidade",
  soundAlertsEnabled: true,
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor({}, "cardBackground");
  const borderColor = useThemeColor({}, "border");

  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Carregar configurações ao montar
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: CompanySettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
    }
  };

  const handleCompanyNameChange = (text: string) => {
    const newSettings = { ...settings, companyName: text };
    saveSettings(newSettings);
  };

  const handleSoundToggle = (value: boolean) => {
    const newSettings = { ...settings, soundAlertsEnabled: value };
    saveSettings(newSettings);
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedText>Carregando...</ThemedText>
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
            Personalize as informações da empresa
          </ThemedText>
        </View>

        {/* Seção: Informações da Empresa */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Informações da Empresa
          </ThemedText>

          <View style={[styles.card, { backgroundColor: cardBackground }]}>
            <ThemedText style={styles.label}>Nome da Empresa</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor,
                  borderColor,
                  color: useThemeColor({}, "text"),
                },
              ]}
              value={settings.companyName}
              onChangeText={handleCompanyNameChange}
              placeholder="Digite o nome da empresa"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Seção: Preferências */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Preferências
          </ThemedText>

          <View style={[styles.card, { backgroundColor: cardBackground }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>Alertas Sonoros</ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Reproduzir som ao mudar status
                </ThemedText>
              </View>
              <Switch
                value={settings.soundAlertsEnabled}
                onValueChange={handleSoundToggle}
                trackColor={{ false: "#767577", true: tintColor }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Seção: Sobre */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Sobre
          </ThemedText>

          <View style={[styles.card, { backgroundColor: cardBackground }]}>
            <ThemedText style={styles.aboutText}>
              Sistema de Gerenciamento de Sala de Espera
            </ThemedText>
            <ThemedText style={styles.versionText}>Versão 1.0.0</ThemedText>
          </View>
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
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
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
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  aboutText: {
    fontSize: 14,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    opacity: 0.5,
  },
});
