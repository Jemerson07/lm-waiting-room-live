import { supabase } from "./supabase";

const DEFAULT_COMPANY_SLUG = process.env.EXPO_PUBLIC_COMPANY_SLUG || "minha-oficina";

export async function getActiveCompany() {
  const primary = await supabase
    .from("companies")
    .select("id, name, slug, active")
    .eq("slug", DEFAULT_COMPANY_SLUG)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (primary.error) throw primary.error;
  if (primary.data) return primary.data;

  const fallback = await supabase
    .from("companies")
    .select("id, name, slug, active")
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (fallback.error) throw fallback.error;
  if (!fallback.data) throw new Error("Empresa ativa não encontrada");
  return fallback.data;
}

export async function getCompanySettings(companyId: string) {
  const response = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", companyId)
    .limit(1)
    .maybeSingle();

  if (response.error) throw response.error;
  return response.data;
}

export async function getDefaultBranch(companyId: string) {
  const response = await supabase
    .from("branches")
    .select("id, name")
    .eq("company_id", companyId)
    .eq("active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (response.error) throw response.error;
  return response.data;
}
