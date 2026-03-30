/**
 * Configuração de variáveis de ambiente
 * Variáveis com prefixo EXPO_PUBLIC_ são expostas no cliente
 */

export const env = {
  // Supabase
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",

  // Firebase
  firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
  firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",

  // App
  appName: process.env.EXPO_PUBLIC_APP_NAME ?? "LM Sala de Espera",
  companySlug: process.env.EXPO_PUBLIC_COMPANY_SLUG ?? "lm-sala-espera",
};

// Validar variáveis obrigatórias
if (!env.supabaseUrl || !env.supabaseAnonKey) {
  console.warn(
    "⚠️ Faltam variáveis EXPO_PUBLIC_SUPABASE_URL ou EXPO_PUBLIC_SUPABASE_ANON_KEY"
  );
}

if (!env.firebaseProjectId || !env.firebaseApiKey) {
  console.warn("⚠️ Faltam variáveis Firebase para notificações");
}
