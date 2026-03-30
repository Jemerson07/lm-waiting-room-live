import { getSupabaseClient } from "@/lib/supabase";
import { env, isMaintenanceModeEnabled } from "@/lib/env";

function ensureEnabled() {
  if (!isMaintenanceModeEnabled()) {
    throw new Error("Modo manutenção desativado ou Supabase não configurado.");
  }
}

export async function createMaintenanceCheckinOrder(params: {
  customerEmail: string;
  plate: string;
  complaint: string;
  serviceType: string;
  priority: string;
  estimatedFinishAt?: string;
}) {
  ensureEnabled();
  const supabase = getSupabaseClient();

  const userResult = await supabase.auth.getUser();
  if (userResult.error) throw userResult.error;
  const userId = userResult.data.user?.id;
  if (!userId) throw new Error("Usuário não autenticado para abrir a ordem.");

  const companyResult = await supabase
    .from("companies")
    .select("id")
    .eq("slug", env.companySlug)
    .single();
  if (companyResult.error) throw companyResult.error;

  const roleResult = await supabase
    .from("user_company_roles")
    .select("branch_id")
    .eq("user_id", userId)
    .eq("company_id", companyResult.data.id)
    .eq("active", true)
    .limit(1)
    .maybeSingle();
  if (roleResult.error) throw roleResult.error;
  if (!roleResult.data?.branch_id) {
    throw new Error("Nenhuma filial ativa encontrada para este operador.");
  }

  const customerResult = await supabase
    .from("customers")
    .select("id")
    .eq("company_id", companyResult.data.id)
    .ilike("email", params.customerEmail.trim())
    .limit(1)
    .maybeSingle();
  if (customerResult.error) throw customerResult.error;
  if (!customerResult.data?.id) {
    throw new Error("Cliente não encontrado para este e-mail.");
  }

  const vehicleResult = await supabase
    .from("vehicles")
    .select("id")
    .eq("customer_id", customerResult.data.id)
    .ilike("plate", params.plate.trim())
    .limit(1)
    .maybeSingle();
  if (vehicleResult.error) throw vehicleResult.error;
  if (!vehicleResult.data?.id) {
    throw new Error("Veículo não encontrado para esta placa.");
  }

  const insertResult = await supabase
    .from("maintenance_orders")
    .insert({
      company_id: companyResult.data.id,
      branch_id: roleResult.data.branch_id,
      customer_id: customerResult.data.id,
      vehicle_id: vehicleResult.data.id,
      operator_id: userId,
      current_status: "checkin",
      service_type: params.serviceType.trim(),
      priority: params.priority.trim(),
      complaint: params.complaint.trim(),
      estimated_finish_at: params.estimatedFinishAt || null,
    })
    .select("id, current_status, complaint, estimated_finish_at, created_at")
    .single();

  if (insertResult.error) throw insertResult.error;

  await supabase.from("maintenance_events").insert({
    company_id: companyResult.data.id,
    order_id: insertResult.data.id,
    actor_user_id: userId,
    event_type: "order_created",
    old_status: null,
    new_status: "checkin",
    note: "Ordem aberta pelo check-in do app.",
    public_to_customer: true,
  });

  return insertResult.data;
}
