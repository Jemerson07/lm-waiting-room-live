export type MaintenanceStatus =
  | "checkin"
  | "diagnostico"
  | "aprovacao"
  | "em_servico"
  | "teste_final"
  | "finalizada"
  | "entregue";

export type MaintenancePriority = "low" | "normal" | "high" | "urgent";

export type MaintenanceServiceType =
  | "tire"
  | "corrective"
  | "preventive"
  | "pneu"
  | "corretiva"
  | "preventiva"
  | string;

export interface ManagerOrderView {
  order_id: string;
  company_id: string;
  branch_id: string;
  customer_name: string;
  email: string;
  plate: string;
  brand: string;
  model: string;
  year?: number | null;
  operator_name?: string | null;
  current_status: MaintenanceStatus | string;
  service_type: MaintenanceServiceType;
  priority: MaintenancePriority | string;
  complaint?: string | null;
  diagnosis?: string | null;
  estimated_finish_at?: string | null;
  finished_at?: string | null;
  delivered_at?: string | null;
  created_at: string;
}

export interface CustomerOrderView {
  order_id: string;
  company_id: string;
  branch_id: string;
  customer_id: string;
  customer_name: string;
  email: string;
  vehicle_id: string;
  plate: string;
  brand: string;
  model: string;
  year?: number | null;
  current_status: MaintenanceStatus | string;
  service_type: MaintenanceServiceType;
  priority: MaintenancePriority | string;
  complaint?: string | null;
  diagnosis?: string | null;
  estimated_finish_at?: string | null;
  finished_at?: string | null;
  delivered_at?: string | null;
  created_at: string;
}

export interface MaintenanceTimelineEvent {
  id: string;
  order_id: string;
  customer_id?: string;
  email?: string;
  event_type: string;
  old_status?: string | null;
  new_status?: string | null;
  note?: string | null;
  public_to_customer: boolean;
  created_at: string;
}

export interface MaintenanceAttachment {
  id: string;
  order_id: string;
  file_name: string;
  file_path: string;
  file_type?: string | null;
  created_at: string;
}

export const MAINTENANCE_STATUS_LABELS: Record<string, string> = {
  checkin: "Check-in",
  diagnostico: "Diagnóstico",
  aprovacao: "Aprovação",
  em_servico: "Em serviço",
  teste_final: "Teste final",
  finalizada: "Finalizada",
  entregue: "Entregue",
};

export const MAINTENANCE_STATUS_COLORS: Record<string, string> = {
  checkin: "#3B82F6",
  diagnostico: "#8B5CF6",
  aprovacao: "#F59E0B",
  em_servico: "#10B981",
  teste_final: "#06B6D4",
  finalizada: "#22C55E",
  entregue: "#64748B",
};
