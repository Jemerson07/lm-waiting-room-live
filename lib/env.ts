export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
  appName: process.env.EXPO_PUBLIC_APP_NAME ?? "LM Waiting Room Live",
  companySlug: process.env.EXPO_PUBLIC_COMPANY_SLUG ?? "minha-oficina",
  enableSupabaseMaintenance:
    (process.env.EXPO_PUBLIC_ENABLE_SUPABASE_MAINTENANCE ?? "false").toLowerCase() === "true",
};

export function isSupabaseConfigured() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function isMaintenanceModeEnabled() {
  return env.enableSupabaseMaintenance && isSupabaseConfigured();
}
