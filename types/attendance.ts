/**
 * Tipos de dados para o sistema de atendimento veicular
 */

export type AttendanceStatus = "arrival" | "waiting" | "in_service" | "completed";
export type ServiceType = "tire" | "corrective" | "preventive";
export type AttendanceHistoryChangeType = "created" | "status_changed" | "deleted";
export type AttendanceHistoryActorRole = "system" | "operator" | "admin";

export interface Attendance {
  id: string;
  licensePlate: string;
  vehicleModel: string;
  customerName?: string;
  customerPhone?: string;
  status: AttendanceStatus;
  serviceType: ServiceType;
  description?: string;
  whatsappNotificationSent?: AttendanceStatus;
  createdAt: number;
  updatedAt: number;
}

export interface AttendanceHistoryEntry {
  id: string;
  attendanceId: string;
  fromStatus?: AttendanceStatus | null;
  toStatus: AttendanceStatus;
  changeType: AttendanceHistoryChangeType;
  changedByUserId?: string;
  changedByRole: AttendanceHistoryActorRole;
  changedByName?: string;
  changedByEmail?: string;
  note?: string;
  createdAt: number;
}

export interface AttendanceFormData {
  licensePlate: string;
  vehicleModel: string;
  serviceType: ServiceType;
  customerName?: string;
  customerPhone?: string;
  description?: string;
}

export const STATUS_LABELS: Record<AttendanceStatus, string> = {
  arrival: "Chegada",
  waiting: "Aguardando",
  in_service: "Em Manutenção",
  completed: "Finalizada",
};

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  tire: "Pneu",
  corrective: "Corretiva",
  preventive: "Preventiva",
};

export const SERVICE_TYPE_ICONS: Record<ServiceType, string> = {
  tire: "🔧",
  corrective: "⚠️",
  preventive: "✓",
};

export const ATTENDANCE_HISTORY_CHANGE_LABELS: Record<AttendanceHistoryChangeType, string> = {
  created: "Criação",
  status_changed: "Mudança de status",
  deleted: "Remoção",
};

export const ATTENDANCE_HISTORY_ACTOR_LABELS: Record<AttendanceHistoryActorRole, string> = {
  system: "Sistema",
  operator: "Operador",
  admin: "Administrador",
};

export const STATUS_PROGRESSION: AttendanceStatus[] = ["arrival", "waiting", "in_service", "completed"];

export function getNextStatus(currentStatus: AttendanceStatus): AttendanceStatus | null {
  const currentIndex = STATUS_PROGRESSION.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex === STATUS_PROGRESSION.length - 1) {
    return null;
  }
  return STATUS_PROGRESSION[currentIndex + 1];
}

export function validateLicensePlate(plate: string): boolean {
  const oldFormat = /^[A-Z]{3}-?\d{4}$/i;
  const mercosulFormat = /^[A-Z]{3}\d[A-Z]\d{2}$/i;
  return oldFormat.test(plate) || mercosulFormat.test(plate);
}

export function formatLicensePlate(plate: string): string {
  const cleaned = plate.replace(/[^A-Z0-9]/gi, "").toUpperCase();

  if (/^[A-Z]{3}\d{4}$/i.test(cleaned)) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }

  if (/^[A-Z]{3}\d[A-Z]\d{2}$/i.test(cleaned)) {
    return cleaned;
  }

  return cleaned;
}

export function getElapsedTime(timestamp: number): string {
  const now = Date.now();
  const elapsed = now - timestamp;

  const minutes = Math.floor(elapsed / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `Há ${days} dia${days > 1 ? "s" : ""}`;
  }
  if (hours > 0) {
    return `Há ${hours}h ${minutes % 60}min`;
  }
  if (minutes > 0) {
    return `Há ${minutes} min`;
  }
  return "Agora";
}
