import { getSupabaseClient } from "@/lib/supabase";
import { isMaintenanceModeEnabled } from "@/lib/env";
import type { CustomerOrderView, MaintenanceAttachment, MaintenanceTimelineEvent, ManagerOrderView } from "@/types/maintenance";

function ensureEnabled() {
  if (!isMaintenanceModeEnabled()) {
    throw new Error("Modo manutenção desativado ou Supabase não configurado.");
  }
}

export async function getManagerOrders(): Promise<ManagerOrderView[]> {
  ensureEnabled();
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("v_manager_orders").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ManagerOrderView[];
}

export async function getCustomerOrderById(orderId: string): Promise<CustomerOrderView | null> {
  ensureEnabled();
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("v_customer_orders").select("*").eq("order_id", orderId).maybeSingle();
  if (error) throw error;
  return (data ?? null) as CustomerOrderView | null;
}

export async function getOrderTimeline(orderId: string): Promise<MaintenanceTimelineEvent[]> {
  ensureEnabled();
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("v_order_timeline").select("*").eq("order_id", orderId).order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as MaintenanceTimelineEvent[];
}

export async function getOrderAttachments(orderId: string): Promise<MaintenanceAttachment[]> {
  ensureEnabled();
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("maintenance_attachments").select("id, order_id, file_name, file_path, file_type, created_at").eq("order_id", orderId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MaintenanceAttachment[];
}
