import { getSupabaseClient } from "@/lib/supabase";
import { isMaintenanceModeEnabled } from "@/lib/env";

function ensureEnabled() {
  if (!isMaintenanceModeEnabled()) {
    throw new Error("Modo manutenção desativado ou Supabase não configurado.");
  }
}

export async function registerMaintenanceAttachment(params: {
  orderId: string;
  fileName: string;
  filePath: string;
  fileType?: string;
}) {
  ensureEnabled();
  const supabase = getSupabaseClient();

  const userResult = await supabase.auth.getUser();
  if (userResult.error) throw userResult.error;
  const userId = userResult.data.user?.id;
  if (!userId) {
    throw new Error("Usuário não autenticado para registrar anexo.");
  }

  const orderMetaResult = await supabase
    .from("maintenance_orders")
    .select("id, company_id")
    .eq("id", params.orderId)
    .single();

  if (orderMetaResult.error) throw orderMetaResult.error;

  const eventResult = await supabase
    .from("maintenance_events")
    .select("id")
    .eq("order_id", params.orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (eventResult.error) throw eventResult.error;

  const insertResult = await supabase
    .from("maintenance_attachments")
    .insert({
      company_id: orderMetaResult.data.company_id,
      order_id: params.orderId,
      event_id: eventResult.data?.id ?? null,
      uploaded_by: userId,
      file_name: params.fileName.trim(),
      file_path: params.filePath.trim(),
      file_type: params.fileType?.trim() || null,
    })
    .select("id, order_id, file_name, file_path, file_type, created_at")
    .single();

  if (insertResult.error) throw insertResult.error;
  return insertResult.data;
}
