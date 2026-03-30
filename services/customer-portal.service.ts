import { getSupabaseClient } from "@/lib/supabase";
import { isMaintenanceModeEnabled } from "@/lib/env";
import type { CustomerOrderView } from "@/types/maintenance";

function ensureEnabled() {
  if (!isMaintenanceModeEnabled()) {
    throw new Error("Modo manutenção desativado ou Supabase não configurado.");
  }
}

export async function getCustomerOrdersByEmail(email: string): Promise<CustomerOrderView[]> {
  ensureEnabled();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("v_customer_orders")
    .select("*")
    .ilike("email", email.trim())
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CustomerOrderView[];
}
