import "react-native-url-polyfill/auto";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

console.log("SUPABASE URL:", supabaseUrl);
console.log("SUPABASE KEY PREFIX:", supabasePublishableKey?.slice(0, 20));

if (!supabaseUrl) {
  throw new Error("Falta EXPO_PUBLIC_SUPABASE_URL no .env");
}

if (!supabasePublishableKey) {
  throw new Error("Falta EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY no .env");
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});