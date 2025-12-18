/**
 * Tipos de dados para o sistema de atendimento veicular
 */

export type AttendanceStatus = "arrival" | "waiting" | "in_service" | "completed";

export interface Attendance {
  id: string;
  licensePlate: string; // Formato: ABC-1234 ou ABC1D34 (Mercosul)
  vehicleModel: string; // Ex: VW Nivus Highline
  customerName?: string; // Nome do cliente ou empresa
  status: AttendanceStatus;
  description?: string;
  createdAt: number; // Timestamp em milissegundos
  updatedAt: number; // Timestamp em milissegundos
}

export interface AttendanceFormData {
  licensePlate: string;
  vehicleModel: string;
  customerName?: string;
  description?: string;
}

// Mapeamento de status para labels em português
export const STATUS_LABELS: Record<AttendanceStatus, string> = {
  arrival: "Chegada",
  waiting: "Aguardando",
  in_service: "Em Manutenção",
  completed: "Finalizada",
};

// Ordem de progressão dos status
export const STATUS_PROGRESSION: AttendanceStatus[] = [
  "arrival",
  "waiting",
  "in_service",
  "completed",
];

// Função auxiliar para obter próximo status
export function getNextStatus(currentStatus: AttendanceStatus): AttendanceStatus | null {
  const currentIndex = STATUS_PROGRESSION.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex === STATUS_PROGRESSION.length - 1) {
    return null;
  }
  return STATUS_PROGRESSION[currentIndex + 1];
}

// Função auxiliar para validar formato de placa
export function validateLicensePlate(plate: string): boolean {
  // Formato brasileiro: ABC-1234 ou ABC1D34 (Mercosul)
  const oldFormat = /^[A-Z]{3}-?\d{4}$/i;
  const mercosulFormat = /^[A-Z]{3}\d[A-Z]\d{2}$/i;
  return oldFormat.test(plate) || mercosulFormat.test(plate);
}

// Função auxiliar para formatar placa
export function formatLicensePlate(plate: string): string {
  const cleaned = plate.replace(/[^A-Z0-9]/gi, "").toUpperCase();

  // Formato antigo: ABC-1234
  if (/^[A-Z]{3}\d{4}$/i.test(cleaned)) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }

  // Formato Mercosul: ABC1D34
  if (/^[A-Z]{3}\d[A-Z]\d{2}$/i.test(cleaned)) {
    return cleaned;
  }

  return cleaned;
}

// Função auxiliar para calcular tempo decorrido
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
