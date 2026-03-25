/**
 * Funções para exportar dados em formato CSV
 */

import type { Attendance } from "@/types/attendance";
import { STATUS_LABELS, SERVICE_TYPE_LABELS } from "@/types/attendance";

/**
 * Escapar valor para CSV
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // Se contém aspas, vírgulas ou quebras de linha, envolver em aspas e escapar
  if (stringValue.includes('"') || stringValue.includes(",") || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Formatar data para string legível
 */
function formatDate(date: any): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("pt-BR");
}

/**
 * Calcular tempo decorrido em minutos
 */
function getElapsedMinutes(createdAt: any, updatedAt: any): number {
  const start = typeof createdAt === "string" ? new Date(createdAt).getTime() : createdAt.getTime();
  const end = typeof updatedAt === "string" ? new Date(updatedAt).getTime() : updatedAt.getTime();
  return Math.round((end - start) / 60000);
}

/**
 * Exportar atendimentos para CSV
 */
export function exportAttendancesToCSV(attendances: Attendance[]): string {
  // Cabeçalho
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
    "Tempo (minutos)",
  ];

  // Linhas
  const rows: string[][] = attendances.map((att) => [
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
    String(getElapsedMinutes(att.createdAt, att.updatedAt)),
  ]);

  // Combinar cabeçalho e linhas
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return csvContent;
}

/**
 * Exportar relatório de produtividade para CSV
 */
export function exportProductivityReportToCSV(attendances: Attendance[]): string {
  const total = attendances.length;
  const completed = attendances.filter((a) => a.status === "completed").length;
  const inService = attendances.filter((a) => a.status === "in_service").length;
  const waiting = attendances.filter((a) => a.status === "waiting").length;
  const arrival = attendances.filter((a) => a.status === "arrival").length;

  // Calcular tempo médio
  const completedAttendances = attendances.filter((a) => a.status === "completed");
  const avgTime: number =
    completedAttendances.length > 0
      ? Math.round(
          completedAttendances.reduce((sum, a) => {
            return sum + getElapsedMinutes(a.createdAt, a.updatedAt);
          }, 0) / completedAttendances.length
        )
      : 0;

  // Contar por tipo de serviço
  const tireCount = attendances.filter((a) => a.serviceType === "tire").length;
  const correctiveCount = attendances.filter((a) => a.serviceType === "corrective").length;
  const preventiveCount = attendances.filter((a) => a.serviceType === "preventive").length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Construir CSV
  const lines = [
    "RELATÓRIO DE PRODUTIVIDADE",
    "",
    "Data do Relatório," + formatDate(new Date()),
    "",
    "RESUMO GERAL",
    "Total de Atendimentos," + String(total),
    "Atendimentos Concluídos," + String(completed),
    "Em Atendimento," + String(inService),
    "Aguardando," + String(waiting),
    "Chegada," + String(arrival),
    "Taxa de Conclusão (%)," + String(completionRate),
    "Tempo Médio (minutos)," + String(avgTime),
    "",
    "DISTRIBUIÇÃO POR TIPO DE SERVIÇO",
    "Pneu," + String(tireCount),
    "Corretiva," + String(correctiveCount),
    "Preventiva," + String(preventiveCount),
    "",
    "DETALHES DOS ATENDIMENTOS",
  ];

  // Adicionar lista de atendimentos
  lines.push("");
  lines.push("ID,Placa,Modelo,Cliente,Tipo,Status,Tempo (min)");

  attendances.forEach((att) => {
    lines.push(
      [
        escapeCSVValue(String(att.id)),
        escapeCSVValue(att.licensePlate),
        escapeCSVValue(att.vehicleModel),
        escapeCSVValue(att.customerName || ""),
        escapeCSVValue(SERVICE_TYPE_LABELS[att.serviceType]),
        escapeCSVValue(STATUS_LABELS[att.status]),
        String(getElapsedMinutes(att.createdAt, att.updatedAt)),
      ].join(",")
    );
  });

  return lines.join("\n");
}

/**
 * Exportar relatório por tipo de serviço para CSV
 */
export function exportServiceTypeReportToCSV(attendances: Attendance[]): string {
  const serviceTypes = ["tire", "corrective", "preventive"] as const;

  const lines = [
    "RELATÓRIO POR TIPO DE SERVIÇO",
    "Data do Relatório," + formatDate(new Date()),
    "",
  ];

  serviceTypes.forEach((type) => {
    const typeAttendances = attendances.filter((a) => a.serviceType === type);
    const completed = typeAttendances.filter((a) => a.status === "completed").length;
    const avgTime: number =
      typeAttendances.length > 0
        ? Math.round(
            typeAttendances.reduce((sum, a) => {
              return sum + getElapsedMinutes(a.createdAt, a.updatedAt);
            }, 0) / typeAttendances.length
          )
        : 0;

    const completionRate =
      typeAttendances.length > 0
        ? Math.round((completed / typeAttendances.length) * 100)
        : 0;

    lines.push(`${SERVICE_TYPE_LABELS[type]}`);
    lines.push(`Total,${String(typeAttendances.length)}`);
    lines.push(`Concluídos,${String(completed)}`);
    lines.push(`Taxa de Conclusão (%),${String(completionRate)}`);
    lines.push(`Tempo Médio (minutos),${String(avgTime)}`);
    lines.push("");
  });

  return lines.join("\n");
}

/**
 * Baixar arquivo CSV
 */
export async function downloadCSV(content: string, filename: string): Promise<void> {
  // Para web
  if (typeof window !== "undefined") {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(content)
    );
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}

/**
 * Gerar nome de arquivo com timestamp
 */
export function generateFilename(prefix: string): string {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[:.]/g, "-")
    .split("T")[0];
  return `${prefix}_${timestamp}.csv`;
}
