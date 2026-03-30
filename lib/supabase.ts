import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import { env } from "@/lib/env";

const webStorage = {
  getItem: (key: string) => {
    try {
      return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
    } catch {
      // noop
    }
  },
  removeItem: (key: string) => {
    try {
      if (typeof localStorage !== "undefined") localStorage.removeItem(key);
    } catch {
      // noop
    }
  },
};

const storage = Platform.OS === "web" ? webStorage : AsyncStorage;

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
});
