import { getSupabaseClient } from "@/lib/supabase";
import { isMaintenanceModeEnabled } from "@/lib/env";

function ensureEnabled() {
  if (!isMaintenanceModeEnabled()) {
    throw new Error("Modo manutenção desativado ou Supabase não configurado.");
  }
}

export async function updateMaintenanceOrderStatus(params: {
  orderId: string;
  currentStatus: string;
  diagnosis?: string;
}) {
  ensureEnabled();
  const supabase = getSupabaseClient();

  const payload: Record<string, string> = {
    current_status: params.currentStatus,
  };

  if (params.diagnosis?.trim()) {
    payload.diagnosis = params.diagnosis.trim();
  }

  if (params.currentStatus === "finalizada") {
    payload.finished_at = new Date().toISOString();
  }

  if (params.currentStatus === "entregue") {
    payload.delivered_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("maintenance_orders")
    .update(payload)
    .eq("id", params.orderId)
    .select("id, current_status, diagnosis, finished_at, delivered_at")
    .single();

  if (error) throw error;
  return data;
}
