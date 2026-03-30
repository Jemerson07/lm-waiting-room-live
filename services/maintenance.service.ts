import { supabase } from "@/lib/supabase";
import { isMaintenanceModeEnabled } from "@/lib/env";
import type {
  CustomerOrderView,
  ManagerOrderView,
  MaintenanceAttachment,
  MaintenanceTimelineEvent,
} from "@/types/maintenance";

function ensureMaintenanceMode() {
  if (!isMaintenanceModeEnabled()) {
    throw new Error(
      "Integração Supabase desativada ou não configurada. Preencha o .env e ative EXPO_PUBLIC_ENABLE_SUPABASE_MAINTENANCE.",
    );
  }
}

export async function getManagerOrders(): Promise<ManagerOrderView[]> {
  ensureMaintenanceMode();
  const { data, error } = await supabase
    .from("v_manager_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ManagerOrderView[];
}

export async function getCustomerOrderById(orderId: string): Promise<CustomerOrderView | null> {
  ensureMaintenanceMode();
  const { data, error } = await supabase
    .from("v_customer_orders")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as CustomerOrderView | null;
}

export async function getOrderTimeline(orderId: string): Promise<MaintenanceTimelineEvent[]> {
  ensureMaintenanceMode();
  const { data, error } = await supabase
    .from("v_order_timeline")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as MaintenanceTimelineEvent[];
}

export async function getOrderAttachments(orderId: string): Promise<MaintenanceAttachment[]> {
  ensureMaintenanceMode();
  const { data, error } = await supabase
    .from("maintenance_attachments")
    .select("id, order_id, file_name, file_path, file_type, created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as MaintenanceAttachment[];
}

export async function updateMaintenanceOrderStatus(orderId: string, currentStatus: string, diagnosis?: string) {
  ensureMaintenanceMode();
  const payload: Record<string, string> = { current_status: currentStatus };
  if (diagnosis) payload.diagnosis = diagnosis;

  const { data, error } = await supabase
    .from("maintenance_orders")
    .update(payload)
    .eq("id", orderId)
    .select("id, current_status, diagnosis, updated_at")
    .single();

  if (error) throw error;
  return data;
}
