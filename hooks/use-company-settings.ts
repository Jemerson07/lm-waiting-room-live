import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_KEY = "company_settings";

interface CompanySettings {
  companyName: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
  soundAlertsEnabled: boolean;
  notificationsEnabled?: boolean;
  autoRefreshInterval?: number;
}

const DEFAULT_SETTINGS: CompanySettings = {
  companyName: "LM Soluções de Mobilidade",
  companyEmail: "",
  companyPhone: "",
  companyAddress: "",
  soundAlertsEnabled: true,
  notificationsEnabled: true,
  autoRefreshInterval: 3,
};

export function useCompanySettings() {
  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

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

  return {
    settings,
    loading,
    saveSettings,
  };
}
