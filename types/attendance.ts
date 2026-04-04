/**
 * Tipos de dados para o sistema de atendimento veicular
 */

export type AttendanceStatus = "arrival" | "waiting" | "in_service" | "completed";
export type ServiceType = "tire" | "corrective" | "preventive";
export type AttendanceHistoryChangeType = "created" | "status_changed" | "deleted" | "governance_updated";
export type AttendanceHistoryActorRole = "system" | "operator" | "admin";
export type CriticalQueueSeverity = "attention" | "critical";
export type NotificationChannel = "whatsapp";
export type DelayReason =
  | "none"
  | "customer_unavailable"
  | "parts_wait"
  | "approval_pending"
  | "high_demand"
  | "diagnosis_extended"
  | "system_issue"
  | "other";
export type SlaSeverity = "on_track" | "risk" | "breached" | "exempt";
export type OperationalPriorityLevel = "normal" | "attention" | "critical";

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
  delayReason: DelayReason;
  operationalNote?: string;
  slaExceptionActive: boolean;
  slaExceptionReason?: string;
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

export interface NotificationLogEntry {
  id: string;
  attendanceId: string;
  channel: NotificationChannel;
  status: AttendanceStatus;
  phoneNumber?: string;
  success: boolean;
  providerMessageSid?: string;
  errorMessage?: string;
  triggeredByUserId?: string;
  triggeredByRole: AttendanceHistoryActorRole;
  triggeredByName?: string;
  triggeredByEmail?: string;
  createdAt: number;
}

export interface NotificationHealthSummary {
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  successRate: number;
  latestFailures: NotificationLogEntry[];
}

export interface CriticalAttendanceSignal {
  attendanceId: string;
  licensePlate: string;
  vehicleModel: string;
  status: Extract<AttendanceStatus, "arrival" | "waiting" | "in_service">;
  stageDurationMinutes: number;
  thresholdMinutes: number;
  severity: CriticalQueueSeverity;
}

export interface SlaAlertSignal {
  attendanceId: string;
  licensePlate: string;
  vehicleModel: string;
  serviceType: ServiceType;
  status: AttendanceStatus;
  totalElapsedMinutes: number;
  slaTargetMinutes: number;
  severity: Extract<SlaSeverity, "risk" | "breached">;
  delayReason: DelayReason;
}

export interface AttendanceOperationalMetrics {
  averageTotalMinutesCompleted: number;
  averageArrivalMinutes: number;
  averageWaitingMinutes: number;
  averageInServiceMinutes: number;
  bottleneckStage: Extract<AttendanceStatus, "arrival" | "waiting" | "in_service"> | null;
  bottleneckAverageMinutes: number;
  criticalQueueCount: number;
  criticalByStatus: {
    arrival: number;
    waiting: number;
    in_service: number;
  };
  criticalAttendances: CriticalAttendanceSignal[];
  completedMeasuredCount: number;
  slaWithinCount: number;
  slaBreachedCount: number;
  slaExceptionCount: number;
  activeSlaRiskCount: number;
  activeSlaBreachedCount: number;
  topSlaAlerts: SlaAlertSignal[];
}

export interface AttendanceSlaSnapshot {
  targetMinutes: number;
  elapsedMinutes: number;
  severity: SlaSeverity;
}

export interface AttendancePrioritySnapshot {
  score: number;
  level: OperationalPriorityLevel;
  label: string;
  reason: string;
  actionLabel: string;
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
  governance_updated: "Governança",
};

export const ATTENDANCE_HISTORY_ACTOR_LABELS: Record<AttendanceHistoryActorRole, string> = {
  system: "Sistema",
  operator: "Operador",
  admin: "Administrador",
};

export const CRITICAL_QUEUE_SEVERITY_LABELS: Record<CriticalQueueSeverity, string> = {
  attention: "Atenção",
  critical: "Crítico",
};

export const DELAY_REASON_LABELS: Record<DelayReason, string> = {
  none: "Sem atraso registrado",
  customer_unavailable: "Cliente indisponível",
  parts_wait: "Aguardando peça",
  approval_pending: "Aguardando aprovação",
  high_demand: "Alta demanda operacional",
  diagnosis_extended: "Diagnóstico estendido",
  system_issue: "Falha sistêmica",
  other: "Outro motivo",
};

export const SLA_SEVERITY_LABELS: Record<SlaSeverity, string> = {
  on_track: "Dentro do SLA",
  risk: "Em risco",
  breached: "SLA estourado",
  exempt: "Exceção SLA",
};

export const PRIORITY_LEVEL_LABELS: Record<OperationalPriorityLevel, string> = {
  normal: "Fluxo normal",
  attention: "Atenção operacional",
  critical: "Prioridade máxima",
};

export const SERVICE_TYPE_SLA_TARGETS: Record<ServiceType, number> = {
  tire: 120,
  preventive: 180,
  corrective: 240,
};

export const STATUS_PROGRESSION: AttendanceStatus[] = ["arrival", "waiting", "in_service", "completed"];
export const DELAY_REASON_OPTIONS: DelayReason[] = [
  "none",
  "customer_unavailable",
  "parts_wait",
  "approval_pending",
  "high_demand",
  "diagnosis_extended",
  "system_issue",
  "other",
];

const STATUS_PRIORITY_WEIGHTS: Record<AttendanceStatus, number> = {
  arrival: 18,
  waiting: 34,
  in_service: 48,
  completed: 0,
};

const SERVICE_PRIORITY_WEIGHTS: Record<ServiceType, number> = {
  tire: 8,
  preventive: 12,
  corrective: 20,
};

const DELAY_REASON_PRIORITY_WEIGHTS: Record<DelayReason, number> = {
  none: 0,
  customer_unavailable: 8,
  parts_wait: 12,
  approval_pending: 10,
  high_demand: 16,
  diagnosis_extended: 18,
  system_issue: 20,
  other: 10,
};

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

export function getAttendanceElapsedMinutes(attendance: Pick<Attendance, "createdAt" | "updatedAt" | "status">) {
  const endTime = attendance.status === "completed" ? attendance.updatedAt : Date.now();
  return Math.max(0, Math.round((endTime - attendance.createdAt) / 60000));
}

export function getAttendanceSlaSnapshot(attendance: Pick<Attendance, "serviceType" | "createdAt" | "updatedAt" | "status" | "slaExceptionActive">): AttendanceSlaSnapshot {
  const targetMinutes = SERVICE_TYPE_SLA_TARGETS[attendance.serviceType];
  const elapsedMinutes = getAttendanceElapsedMinutes(attendance);

  if (attendance.slaExceptionActive) {
    return { targetMinutes, elapsedMinutes, severity: "exempt" };
  }
  if (elapsedMinutes >= targetMinutes) {
    return { targetMinutes, elapsedMinutes, severity: "breached" };
  }
  if (elapsedMinutes >= Math.round(targetMinutes * 0.8)) {
    return { targetMinutes, elapsedMinutes, severity: "risk" };
  }
  return { targetMinutes, elapsedMinutes, severity: "on_track" };
}

export function getAttendancePrioritySnapshot(
  attendance: Pick<Attendance, "status" | "serviceType" | "createdAt" | "updatedAt" | "slaExceptionActive" | "delayReason">,
): AttendancePrioritySnapshot {
  const elapsedMinutes = getAttendanceElapsedMinutes(attendance);
  const sla = getAttendanceSlaSnapshot(attendance);

  if (attendance.status === "completed") {
    return {
      score: 0,
      level: "normal",
      label: "Histórico",
      reason: "Atendimento já concluído e mantido apenas para acompanhamento histórico.",
      actionLabel: "Acompanhar histórico",
    };
  }

  let score = STATUS_PRIORITY_WEIGHTS[attendance.status];
  score += SERVICE_PRIORITY_WEIGHTS[attendance.serviceType];
  score += DELAY_REASON_PRIORITY_WEIGHTS[attendance.delayReason];
  score += Math.min(Math.round(elapsedMinutes / 8), 40);

  let label = PRIORITY_LEVEL_LABELS.normal;
  let reason = attendance.status === "in_service"
    ? "Veículo em manutenção neste momento."
    : attendance.status === "waiting"
      ? "Veículo aguardando avanço do fluxo."
      : "Veículo recém-chegado no processo.";
  let actionLabel = attendance.status === "arrival"
    ? "Direcionar para triagem"
    : attendance.status === "waiting"
      ? "Puxar para atendimento"
      : "Acompanhar até concluir";

  if (sla.severity === "breached") {
    score += 150;
    label = PRIORITY_LEVEL_LABELS.critical;
    reason = "Atendimento acima do SLA total. Requer ação imediata da equipe.";
    actionLabel = attendance.status === "waiting" ? "Atender imediatamente" : "Concluir com prioridade";
  } else if (sla.severity === "risk") {
    score += 96;
    label = PRIORITY_LEVEL_LABELS.attention;
    reason = "Atendimento próximo do limite do SLA.";
    actionLabel = attendance.status === "arrival" ? "Acelerar triagem" : attendance.status === "waiting" ? "Preparar chamada" : "Evitar atraso final";
  } else if (sla.severity === "exempt") {
    score = Math.max(10, score - 42);
    label = "Exceção de SLA";
    reason = "Atendimento fora da meta padrão por decisão operacional.";
    actionLabel = attendance.status === "waiting" ? "Seguir exceção aprovada" : "Monitorar exceção";
  }

  if (attendance.delayReason !== "none") {
    const delayText = DELAY_REASON_LABELS[attendance.delayReason];
    reason = `${reason} Motivo registrado: ${delayText}.`;
    if (label === PRIORITY_LEVEL_LABELS.normal) {
      label = "Acompanhar atraso";
      actionLabel = attendance.status === "waiting" ? "Revisar bloqueio" : "Monitorar motivo";
    }
  }

  const level: OperationalPriorityLevel = score >= 170 ? "critical" : score >= 100 ? "attention" : "normal";
  if (level === "critical" && label !== "Exceção de SLA") label = PRIORITY_LEVEL_LABELS.critical;
  if (level === "attention" && label === PRIORITY_LEVEL_LABELS.normal) label = PRIORITY_LEVEL_LABELS.attention;

  return { score, level, label, reason, actionLabel };
}
