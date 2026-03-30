export type MaintenanceStatus = "checkin" | "diagnostico" | "aprovacao" | "em_servico" | "teste_final" | "finalizada" | "entregue";

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
  service_type: string;
  priority: string;
  complaint?: string | null;
  diagnosis?: string | null;
  estimated_finish_at?: string | null;
  finished_at?: string | null;
  delivered_at?: string | null;
  created_at: string;
}

export interface CustomerOrderView {
  order_id: string;
  customer_name: string;
  email: string;
  plate: string;
  brand: string;
  model: string;
  current_status: MaintenanceStatus | string;
  service_type: string;
  priority: string;
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
