import type { AttendanceStatus, DelayReason } from "@/types/attendance";
import { supabase } from "./supabase";
import { getActiveCompany, getDefaultBranch } from "./company";

type ServiceType = "tire" | "corrective" | "preventive";

type DbStatus =
  | "checkin"
  | "diagnostico"
  | "aprovacao"
  | "aguardando_peca"
  | "em_servico"
  | "teste_final"
  | "finalizada"
  | "entregue"
  | "cancelada";

const DB_TO_APP_STATUS: Record<string, AttendanceStatus> = {
  checkin: "arrival",
  diagnostico: "waiting",
  aprovacao: "waiting",
  aguardando_peca: "waiting",
  em_servico: "in_service",
  teste_final: "in_service",
  finalizada: "completed",
  entregue: "completed",
  cancelada: "completed",
};

function normalizeServiceType(serviceType?: string | null): ServiceType {
  if (
    serviceType === "tire" ||
    serviceType === "corrective" ||
    serviceType === "preventive"
  ) {
    return serviceType;
  }
  return "preventive";
}

function mapNextDbStatus(
  _currentDbStatus: string,
  nextStatus: AttendanceStatus,
): DbStatus {
  if (nextStatus === "waiting") return "diagnostico";
  if (nextStatus === "in_service") return "em_servico";
  if (nextStatus === "completed") return "finalizada";
  return "checkin";
}

async function getCurrentAuthUserId() {
  const response = await supabase.auth.getUser();
  return response.data.user?.id ?? null;
}

async function findOrCreateCustomer(
  companyId: string,
  customerName?: string,
  customerPhone?: string,
) {
  if (customerPhone?.trim()) {
    const byPhone = await supabase
      .from("customers")
      .select("id, full_name, phone")
      .eq("company_id", companyId)
      .eq("phone", customerPhone.trim())
      .limit(1)
      .maybeSingle();

    if (byPhone.error) throw byPhone.error;
    if (byPhone.data) return byPhone.data;
  }

  if (customerName?.trim()) {
    const byName = await supabase
      .from("customers")
      .select("id, full_name, phone")
      .eq("company_id", companyId)
      .eq("full_name", customerName.trim())
      .limit(1)
      .maybeSingle();

    if (byName.error) throw byName.error;
    if (byName.data) return byName.data;
  }

  const created = await supabase
    .from("customers")
    .insert({
      company_id: companyId,
      full_name: customerName?.trim() || "Cliente da ordem",
      phone: customerPhone?.trim() || null,
    })
    .select("id, full_name, phone")
    .single();

  if (created.error) throw created.error;
  return created.data;
}

async function findOrCreateVehicle(
  companyId: string,
  customerId: string,
  licensePlate: string,
  vehicleModel: string,
) {
  const existing = await supabase
    .from("vehicles")
    .select("id, customer_id, plate, brand, model")
    .eq("company_id", companyId)
    .eq("plate", licensePlate)
    .limit(1)
    .maybeSingle();

  if (existing.error) throw existing.error;
  if (existing.data) return existing.data;

  const created = await supabase
    .from("vehicles")
    .insert({
      company_id: companyId,
      customer_id: customerId,
      plate: licensePlate,
      model: vehicleModel,
    })
    .select("id, customer_id, plate, brand, model")
    .single();

  if (created.error) throw created.error;
  return created.data;
}

export function mapOrderToAttendance(order: any) {
  return {
    id: String(order.id),
    licensePlate: order.vehicle?.plate || "-",
    vehicleModel:
      [order.vehicle?.brand, order.vehicle?.model].filter(Boolean).join(" ") ||
      order.vehicle?.model ||
      "Veículo",
    customerName: order.customer?.full_name || undefined,
    customerPhone: order.customer?.phone || undefined,
    status: DB_TO_APP_STATUS[order.current_status] || "arrival",
    serviceType: normalizeServiceType(order.service_type),
    description: order.complaint || undefined,
    whatsappNotificationSent: order.whatsapp_notification_sent || undefined,
    delayReason: (order.delay_reason as DelayReason) || "none",
    operationalNote: order.operational_note || undefined,
    slaExceptionActive: Boolean(order.sla_exception_active),
    slaExceptionReason: order.sla_exception_reason || undefined,
    createdAt: new Date(order.created_at).getTime(),
    updatedAt: new Date(order.updated_at).getTime(),
  };
}

export async function getOrders(companyId: string) {
  const ordersResponse = await supabase
    .from("maintenance_orders")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (ordersResponse.error) throw ordersResponse.error;
  const orders = ordersResponse.data ?? [];

  const customerIds = [
    ...new Set(orders.map((order) => order.customer_id).filter(Boolean)),
  ];
  const vehicleIds = [
    ...new Set(orders.map((order) => order.vehicle_id).filter(Boolean)),
  ];

  const [customersResponse, vehiclesResponse] = await Promise.all([
    customerIds.length
      ? supabase
          .from("customers")
          .select("id, full_name, phone, email")
          .in("id", customerIds)
      : Promise.resolve({ data: [], error: null } as any),
    vehicleIds.length
      ? supabase
          .from("vehicles")
          .select("id, customer_id, plate, brand, model, year, color")
          .in("id", vehicleIds)
      : Promise.resolve({ data: [], error: null } as any),
  ]);

  if (customersResponse.error) throw customersResponse.error;
  if (vehiclesResponse.error) throw vehiclesResponse.error;

  const customerMap = new Map(
    (customersResponse.data || []).map((item: any) => [item.id, item]),
  );
  const vehicleMap = new Map(
    (vehiclesResponse.data || []).map((item: any) => [item.id, item]),
  );

  return orders.map((order) => ({
    ...order,
    customer: customerMap.get(order.customer_id) || null,
    vehicle: vehicleMap.get(order.vehicle_id) || null,
  }));
}

export async function createOrder(input: {
  licensePlate: string;
  vehicleModel: string;
  serviceType: ServiceType;
  customerName?: string;
  customerPhone?: string;
  description?: string;
}) {
  const company = await getActiveCompany();
  const branch = await getDefaultBranch(company.id);
  const operatorId = await getCurrentAuthUserId();

  const customer = await findOrCreateCustomer(
    company.id,
    input.customerName,
    input.customerPhone,
  );
  const vehicle = await findOrCreateVehicle(
    company.id,
    customer.id,
    input.licensePlate,
    input.vehicleModel,
  );

  const created = await supabase
    .from("maintenance_orders")
    .insert({
      company_id: company.id,
      branch_id: branch?.id || null,
      customer_id: vehicle.customer_id || customer.id,
      vehicle_id: vehicle.id,
      operator_id: operatorId,
      current_status: "checkin",
      service_type: input.serviceType,
      priority: "normal",
      complaint: input.description || null,
    })
    .select("*")
    .single();

  if (created.error) throw created.error;
  return created.data;
}

export async function updateOrderStatus(
  orderId: string,
  nextStatus: AttendanceStatus,
) {
  const existing = await supabase
    .from("maintenance_orders")
    .select("id, current_status")
    .eq("id", orderId)
    .limit(1)
    .maybeSingle();

  if (existing.error) throw existing.error;
  if (!existing.data) throw new Error("Ordem não encontrada");

  const dbStatus = mapNextDbStatus(existing.data.current_status, nextStatus);
  const patch: Record<string, unknown> = { current_status: dbStatus };

  if (dbStatus === "em_servico") patch.started_at = new Date().toISOString();
  if (dbStatus === "finalizada") patch.finished_at = new Date().toISOString();
  if (dbStatus === "entregue") patch.delivered_at = new Date().toISOString();
  if (dbStatus === "cancelada") patch.canceled_at = new Date().toISOString();

  const updated = await supabase
    .from("maintenance_orders")
    .update(patch)
    .eq("id", orderId)
    .select("*")
    .single();

  if (updated.error) throw updated.error;
  return updated.data;
}

export async function updateOrderGovernance(input: {
  id: string;
  delayReason: DelayReason;
  operationalNote?: string;
  slaExceptionActive: boolean;
  slaExceptionReason?: string;
}) {
  const company = await getActiveCompany();
  const actorUserId = await getCurrentAuthUserId();

  const updated = await supabase
    .from("maintenance_orders")
    .update({
      delay_reason: input.delayReason,
      operational_note: input.operationalNote?.trim() || null,
      sla_exception_active: input.slaExceptionActive,
      sla_exception_reason: input.slaExceptionActive
        ? input.slaExceptionReason?.trim() || null
        : null,
    })
    .eq("id", input.id)
    .select("*")
    .single();

  if (updated.error) throw updated.error;

  await supabase.from("maintenance_events").insert({
    company_id: company.id,
    order_id: input.id,
    actor_user_id: actorUserId,
    event_type: "governance_updated",
    title: "Governança atualizada",
    note: [
      input.delayReason !== "none" ? `Motivo: ${input.delayReason}` : null,
      input.operationalNote?.trim()
        ? `Nota: ${input.operationalNote.trim()}`
        : null,
      input.slaExceptionActive
        ? `Exceção SLA: ${input.slaExceptionReason?.trim() || "ativa"}`
        : null,
    ]
      .filter(Boolean)
      .join(" • "),
    public_to_customer: false,
  });

  return updated.data;
}

export async function deleteOrder(orderId: string) {
  const removed = await supabase
    .from("maintenance_orders")
    .delete()
    .eq("id", orderId);

  if (removed.error) throw removed.error;
}

export async function getOrderHistory(orderId: string) {
  const eventsResponse = await supabase
    .from("maintenance_events")
    .select(
      "id, order_id, actor_user_id, event_type, title, old_status, new_status, note, created_at",
    )
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (eventsResponse.error) throw eventsResponse.error;
  const events = eventsResponse.data ?? [];

  const actorIds = [
    ...new Set(events.map((event) => event.actor_user_id).filter(Boolean)),
  ];

type ProfileRow = {
  id: string;
  full_name: string | null;
};

const profilesResponse = actorIds.length
  ? await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", actorIds)
  : ({ data: [], error: null } as { data: ProfileRow[]; error: null });

if (profilesResponse.error) throw profilesResponse.error;

const profiles = (profilesResponse.data ?? []) as ProfileRow[];

const profileMap = new Map<string, ProfileRow>(
  profiles.map((profile) => [profile.id, profile]),
);

return events.map((event) => ({
  ...event,
  actor_name: event.actor_user_id
    ? profileMap.get(String(event.actor_user_id))?.full_name ?? null
    : null,
}));
}