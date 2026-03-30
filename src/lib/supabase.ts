/**
 * Cliente Supabase com suporte para Web e React Native
 * Usa AsyncStorage para persistência de sessão
 */

import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import { env } from "./env";

// Configurar storage baseado na plataforma
const storage = Platform.OS === "web" ? {
  getItem: (key: string) => {
    try {
      return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, value);
      }
    } catch {
      // Ignorar erros de storage
    }
  },
  removeItem: (key: string) => {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(key);
      }
    } catch {
      // Ignorar erros de storage
    }
  },
} : AsyncStorage;

// Criar cliente Supabase
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
});

// Tipos para o banco de dados
export type Database = {
  public: {
    Tables: {
      user_company_roles: {
        Row: {
          id: string;
          user_id: string;
          company_id: string;
          branch_id: string | null;
          role: "client" | "operator" | "manager";
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_company_roles"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["user_company_roles"]["Insert"]>;
      };
      maintenance_orders: {
        Row: {
          id: string;
          company_id: string;
          branch_id: string;
          customer_id: string;
          vehicle_id: string;
          operator_id: string;
          current_status: string;
          service_type: string;
          priority: "low" | "normal" | "high" | "urgent";
          complaint: string;
          diagnosis: string | null;
          estimated_finish_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["maintenance_orders"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["maintenance_orders"]["Insert"]>;
      };
      maintenance_attachments: {
        Row: {
          id: string;
          order_id: string;
          file_url: string;
          file_name: string;
          file_type: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["maintenance_attachments"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["maintenance_attachments"]["Insert"]>;
      };
    };
  };
};
