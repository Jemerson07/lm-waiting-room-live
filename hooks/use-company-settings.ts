import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const SETTINGS_KEY = "company_settings";

export interface CompanySettings {
  companyName: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
  soundAlertsEnabled: boolean;
  notificationsEnabled?: boolean;
  autoRefreshInterval?: number;
}

export const DEFAULT_SETTINGS: CompanySettings = {
  companyName: "LM Soluções de Mobilidade",
  companyEmail: "",
  companyPhone: "",
  companyAddress: "",
  soundAlertsEnabled: true,
  notificationsEnabled: true,
  autoRefreshInterval: 3,
};

export function normalizeCompanySettings(raw?: Partial<CompanySettings> | null): CompanySettings {
  return {
    companyName: raw?.companyName?.trim() || DEFAULT_SETTINGS.companyName,
    companyEmail: raw?.companyEmail?.trim() || "",
    companyPhone: raw?.companyPhone?.trim() || "",
    companyAddress: raw?.companyAddress?.trim() || "",
    soundAlertsEnabled: raw?.soundAlertsEnabled !== false,
    notificationsEnabled: raw?.notificationsEnabled !== false,
    autoRefreshInterval: Math.max(1, Number(raw?.autoRefreshInterval) || DEFAULT_SETTINGS.autoRefreshInterval || 3),
  };
}

export function useCompanySettings() {
  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        setSettings(normalizeCompanySettings(JSON.parse(stored)));
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async (newSettings: CompanySettings) => {
    const normalized = normalizeCompanySettings(newSettings);
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(normalized));
      setSettings(normalized);
      return normalized;
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      throw error;
    }
  };

  const resetSettings = async () => saveSettings(DEFAULT_SETTINGS);

  return {
    settings,
    loading,
    saveSettings,
    resetSettings,
    reloadSettings: loadSettings,
  };
}
