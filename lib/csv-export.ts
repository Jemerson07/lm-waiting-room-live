import type { Attendance } from "@/types/attendance";
import { STATUS_LABELS, SERVICE_TYPE_LABELS } from "@/types/attendance";

function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (stringValue.includes('"') || stringValue.includes(",") || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function toTimestamp(value: string | number | Date): number {
  if (typeof value === "number") return value;
  if (value instanceof Date) return value.getTime();
  return new Date(value).getTime();
}

function formatDate(date: string | number | Date): string {
  return new Date(toTimestamp(date)).toLocaleString("pt-BR");
}

function getClosedMinutes(createdAt: string | number | Date, updatedAt: string | number | Date): number {
  return Math.max(0, Math.round((toTimestamp(updatedAt) - toTimestamp(createdAt)) / 60000));
}

function getOpenMinutes(createdAt: string | number | Date): number {
  return Math.max(0, Math.round((Date.now() - toTimestamp(createdAt)) / 60000));
}

function getAttendanceMinutes(att: Attendance): number {
  return att.status === "completed"
    ? getClosedMinutes(att.createdAt, att.updatedAt)
    : getOpenMinutes(att.createdAt);
}

function getAttendanceTimingLabel(att: Attendance): string {
  return att.status === "completed" ? "Concluído" : "Em andamento";
}

function getAverage(values: number[]): number {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function exportAttendancesToCSV(attendances: Attendance[]): string {
  const headers = [
    "ID",
    "Placa",
    "Modelo",
    "Cliente",
    "Telefone",
    "Tipo de Serviço",
    "Status",
    "Descrição",
    "Data de Criação",
    "Data de Atualização",
    "Base do Tempo",
    "Tempo (minutos)",
  ];

  const rows = attendances.map((att) => [
    escapeCSVValue(String(att.id)),
    escapeCSVValue(att.licensePlate),
    escapeCSVValue(att.vehicleModel),
    escapeCSVValue(att.customerName || ""),
    escapeCSVValue(att.customerPhone || ""),
    escapeCSVValue(SERVICE_TYPE_LABELS[att.serviceType] || att.serviceType),
    escapeCSVValue(STATUS_LABELS[att.status] || att.status),
    escapeCSVValue(att.description || ""),
    escapeCSVValue(formatDate(att.createdAt)),
    escapeCSVValue(formatDate(att.updatedAt)),
    escapeCSVValue(getAttendanceTimingLabel(att)),
    String(getAttendanceMinutes(att)),
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

export function exportProductivityReportToCSV(attendances: Attendance[]): string {
  const total = attendances.length;
  const completedItems = attendances.filter((a) => a.status === "completed");
  const activeItems = attendances.filter((a) => a.status !== "completed");
  const completed = completedItems.length;
  const active = activeItems.length;
  const inService = attendances.filter((a) => a.status === "in_service").length;
  const waiting = attendances.filter((a) => a.status === "waiting").length;
  const arrival = attendances.filter((a) => a.status === "arrival").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const avgCompletedMinutes = getAverage(completedItems.map((a) => getClosedMinutes(a.createdAt, a.updatedAt)));
  const avgActiveMinutes = getAverage(activeItems.map((a) => getOpenMinutes(a.createdAt)));

  const tireCount = attendances.filter((a) => a.serviceType === "tire").length;
  const correctiveCount = attendances.filter((a) => a.serviceType === "corrective").length;
  const preventiveCount = attendances.filter((a) => a.serviceType === "preventive").length;

  const lines = [
    "RELATÓRIO DE PRODUTIVIDADE",
    "",
    "Data do Relatório," + formatDate(new Date()),
    "",
    "RESUMO GERAL",
    "Total de Atendimentos," + String(total),
    "Atendimentos Concluídos," + String(completed),
    "Atendimentos Ativos," + String(active),
    "Em Atendimento," + String(inService),
    "Aguardando," + String(waiting),
    "Chegada," + String(arrival),
    "Taxa de Conclusão (%)," + String(completionRate),
    "Tempo Médio Concluído (min)," + String(avgCompletedMinutes),
    "Tempo Médio Ativo (min)," + String(avgActiveMinutes),
    "",
    "DISTRIBUIÇÃO POR TIPO DE SERVIÇO",
    "Pneu," + String(tireCount),
    "Corretiva," + String(correctiveCount),
    "Preventiva," + String(preventiveCount),
    "",
    "DETALHES DOS ATENDIMENTOS",
    "",
    "ID,Placa,Modelo,Cliente,Tipo,Status,Base do Tempo,Tempo (min)",
  ];

  attendances.forEach((att) => {
    lines.push(
      [
        escapeCSVValue(String(att.id)),
        escapeCSVValue(att.licensePlate),
        escapeCSVValue(att.vehicleModel),
        escapeCSVValue(att.customerName || ""),
        escapeCSVValue(SERVICE_TYPE_LABELS[att.serviceType] || att.serviceType),
        escapeCSVValue(STATUS_LABELS[att.status] || att.status),
        escapeCSVValue(getAttendanceTimingLabel(att)),
        String(getAttendanceMinutes(att)),
      ].join(",")
    );
  });

  return lines.join("\n");
}

export function exportServiceTypeReportToCSV(attendances: Attendance[]): string {
  const serviceTypes = ["tire", "corrective", "preventive"] as const;
  const lines = [
    "RELATÓRIO POR TIPO DE SERVIÇO",
    "Data do Relatório," + formatDate(new Date()),
    "",
  ];

  serviceTypes.forEach((type) => {
    const typeAttendances = attendances.filter((a) => a.serviceType === type);
    const completedItems = typeAttendances.filter((a) => a.status === "completed");
    const activeItems = typeAttendances.filter((a) => a.status !== "completed");
    const completed = completedItems.length;
    const active = activeItems.length;
    const completionRate = typeAttendances.length > 0 ? Math.round((completed / typeAttendances.length) * 100) : 0;
    const avgCompletedMinutes = getAverage(completedItems.map((a) => getClosedMinutes(a.createdAt, a.updatedAt)));
    const avgActiveMinutes = getAverage(activeItems.map((a) => getOpenMinutes(a.createdAt)));

    lines.push(`${SERVICE_TYPE_LABELS[type]}`);
    lines.push(`Total,${String(typeAttendances.length)}`);
    lines.push(`Concluídos,${String(completed)}`);
    lines.push(`Ativos,${String(active)}`);
    lines.push(`Taxa de Conclusão (%),${String(completionRate)}`);
    lines.push(`Tempo Médio Concluído (min),${String(avgCompletedMinutes)}`);
    lines.push(`Tempo Médio Ativo (min),${String(avgActiveMinutes)}`);
    lines.push("");
  });

  return lines.join("\n");
}

export async function downloadCSV(content: string, filename: string): Promise<void> {
  if (typeof window !== "undefined") {
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(content));
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}

export function generateFilename(prefix: string): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-").split("T")[0];
  return `${prefix}_${timestamp}.csv`;
}
