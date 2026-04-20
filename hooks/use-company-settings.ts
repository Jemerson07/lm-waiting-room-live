import { useState, useEffect, useCallback } from "react";
import { getActiveCompany, getCompanySettings } from "@/lib/company";
import { supabase } from "@/lib/supabase";

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
  companyName: "Jemerson Santos",
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
    setLoading(true);
    try {
      const company = await getActiveCompany();
      const stored = await getCompanySettings(company.id);
      setSettings(
        normalizeCompanySettings({
          companyName: company.name,
          companyEmail: stored?.company_email || "",
          companyPhone: stored?.company_phone || stored?.whatsapp || "",
          companyAddress: stored?.company_address || "",
          soundAlertsEnabled: stored?.sound_alerts_enabled !== false,
          notificationsEnabled: stored?.notifications_enabled !== false,
          autoRefreshInterval: stored?.auto_refresh_interval || 3,
        }),
      );
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const saveSettings = async (newSettings: CompanySettings) => {
    const normalized = normalizeCompanySettings(newSettings);
    const company = await getActiveCompany();

    const [companyResponse, settingsResponse] = await Promise.all([
      supabase.from("companies").update({ name: normalized.companyName }).eq("id", company.id),
      supabase.from("company_settings").upsert(
        {
          company_id: company.id,
          company_email: normalized.companyEmail,
          company_phone: normalized.companyPhone,
          company_address: normalized.companyAddress,
          sound_alerts_enabled: normalized.soundAlertsEnabled,
          notifications_enabled: normalized.notificationsEnabled,
          auto_refresh_interval: normalized.autoRefreshInterval,
        },
        { onConflict: "company_id" },
      ),
    ]);

    if (companyResponse.error) throw companyResponse.error;
    if (settingsResponse.error) throw settingsResponse.error;

    setSettings(normalized);
    return normalized;
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
