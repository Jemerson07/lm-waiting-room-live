import { and, asc, gte, inArray, lte } from "drizzle-orm";
import { attendanceStatusHistory, attendances } from "../drizzle/schema";
import { getDb } from "./db";

type StageStatus = "arrival" | "waiting" | "in_service";
type ServiceType = "tire" | "corrective" | "preventive";
type DelayReason = "none" | "customer_unavailable" | "parts_wait" | "approval_pending" | "high_demand" | "diagnosis_extended" | "system_issue" | "other";
type CriticalSeverity = "attention" | "critical";
type SlaSeverity = "risk" | "breached";

const STAGE_THRESHOLDS: Record<StageStatus, number> = { arrival: 15, waiting: 30, in_service: 60 };
const SERVICE_SLA_TARGETS: Record<ServiceType, number> = { tire: 120, preventive: 180, corrective: 240 };

function toTimestamp(value: string | number | Date | null | undefined): number {
  if (!value) return Date.now();
  if (typeof value === "number") return value;
  if (value instanceof Date) return value.getTime();
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : new Date(value).getTime();
}

function diffMinutes(start: number, end: number) {
  return Math.max(0, Math.round((end - start) / 60000));
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getSeverity(durationMinutes: number, thresholdMinutes: number): CriticalSeverity {
  return durationMinutes >= thresholdMinutes * 2 ? "critical" : "attention";
}

function getSlaTargetMinutes(serviceType: ServiceType) {
  return SERVICE_SLA_TARGETS[serviceType];
}

function getSlaSeverity(totalElapsedMinutes: number, slaTargetMinutes: number): SlaSeverity | null {
  if (totalElapsedMinutes >= slaTargetMinutes) return "breached";
  if (totalElapsedMinutes >= Math.round(slaTargetMinutes * 0.8)) return "risk";
  return null;
}

function emptyMetrics() {
  return {
    averageTotalMinutesCompleted: 0,
    averageArrivalMinutes: 0,
    averageWaitingMinutes: 0,
    averageInServiceMinutes: 0,
    bottleneckStage: null,
    bottleneckAverageMinutes: 0,
    criticalQueueCount: 0,
    criticalByStatus: { arrival: 0, waiting: 0, in_service: 0 },
    criticalAttendances: [],
    completedMeasuredCount: 0,
    slaWithinCount: 0,
    slaBreachedCount: 0,
    slaExceptionCount: 0,
    activeSlaRiskCount: 0,
    activeSlaBreachedCount: 0,
    topSlaAlerts: [],
  };
}

export async function getOperationalMetrics(filters?: { startAt?: Date; endAt?: Date }) {
  const db = await getDb();
  if (!db) return emptyMetrics();

  const conditions = [];
  if (filters?.startAt) conditions.push(gte(attendances.createdAt, filters.startAt));
  if (filters?.endAt) conditions.push(lte(attendances.createdAt, filters.endAt));

  const attendanceRows = conditions.length
    ? await db.select().from(attendances).where(and(...conditions))
    : await db.select().from(attendances);

  if (!attendanceRows.length) return emptyMetrics();

  const attendanceIds = attendanceRows.map((attendance) => attendance.id);
  const historyRows = await db
    .select()
    .from(attendanceStatusHistory)
    .where(inArray(attendanceStatusHistory.attendanceId, attendanceIds))
    .orderBy(asc(attendanceStatusHistory.createdAt), asc(attendanceStatusHistory.id));

  const historyByAttendance = new Map<number, typeof historyRows>();
  historyRows.forEach((entry) => {
    const bucket = historyByAttendance.get(entry.attendanceId) ?? [];
    bucket.push(entry);
    historyByAttendance.set(entry.attendanceId, bucket);
  });

  const now = Date.now();
  const totalCompletedMinutes: number[] = [];
  const stageBuckets: Record<StageStatus, number[]> = { arrival: [], waiting: [], in_service: [] };
  const criticalByStatus: Record<StageStatus, number> = { arrival: 0, waiting: 0, in_service: 0 };
  const criticalAttendances: Array<{ attendanceId: string; licensePlate: string; vehicleModel: string; status: StageStatus; stageDurationMinutes: number; thresholdMinutes: number; severity: CriticalSeverity; }> = [];
  const topSlaAlerts: Array<{ attendanceId: string; licensePlate: string; vehicleModel: string; serviceType: ServiceType; status: "arrival" | "waiting" | "in_service" | "completed"; totalElapsedMinutes: number; slaTargetMinutes: number; severity: SlaSeverity; delayReason: DelayReason; }> = [];

  let slaWithinCount = 0;
  let slaBreachedCount = 0;
  let slaExceptionCount = 0;
  let activeSlaRiskCount = 0;
  let activeSlaBreachedCount = 0;

  attendanceRows.forEach((attendance) => {
    const history = historyByAttendance.get(attendance.id) ?? [];
    const createdAtTs = toTimestamp(attendance.createdAt);
    const updatedAtTs = toTimestamp(attendance.updatedAt);
    let currentStageDurationMinutes = 0;
    let completedAtTimestamp: number | null = null;

    if (history.length > 0) {
      history.forEach((entry, index) => {
        const toStatus = entry.toStatus;
        const isTrackedStage = toStatus === "arrival" || toStatus === "waiting" || toStatus === "in_service";
        const currentEntryTime = toTimestamp(entry.createdAt);
        const nextEntry = history[index + 1];
        const endTimestamp = nextEntry ? toTimestamp(nextEntry.createdAt) : attendance.status === toStatus ? now : updatedAtTs;
        if (toStatus === "completed" && completedAtTimestamp === null) completedAtTimestamp = currentEntryTime;
        if (isTrackedStage) {
          const durationMinutes = diffMinutes(currentEntryTime, endTimestamp);
          stageBuckets[toStatus].push(durationMinutes);
          if (attendance.status === toStatus) currentStageDurationMinutes = durationMinutes;
        }
      });
      if (attendance.status === "completed") totalCompletedMinutes.push(diffMinutes(createdAtTs, completedAtTimestamp ?? updatedAtTs));
    } else {
      if (attendance.status === "completed") totalCompletedMinutes.push(diffMinutes(createdAtTs, updatedAtTs));
      if (attendance.status === "arrival" || attendance.status === "waiting" || attendance.status === "in_service") {
        currentStageDurationMinutes = diffMinutes(updatedAtTs, now);
      }
    }

    if (attendance.status === "arrival" || attendance.status === "waiting" || attendance.status === "in_service") {
      const thresholdMinutes = STAGE_THRESHOLDS[attendance.status];
      if (currentStageDurationMinutes >= thresholdMinutes) {
        criticalByStatus[attendance.status] += 1;
        criticalAttendances.push({ attendanceId: String(attendance.id), licensePlate: attendance.licensePlate, vehicleModel: attendance.vehicleModel, status: attendance.status, stageDurationMinutes: currentStageDurationMinutes, thresholdMinutes, severity: getSeverity(currentStageDurationMinutes, thresholdMinutes) });
      }
    }

    const endTimestamp = attendance.status === "completed" ? completedAtTimestamp ?? updatedAtTs : now;
    const totalElapsedMinutes = diffMinutes(createdAtTs, endTimestamp);
    const slaTargetMinutes = getSlaTargetMinutes(attendance.serviceType);
    if (attendance.slaExceptionActive) {
      slaExceptionCount += 1;
    } else if (attendance.status === "completed") {
      if (totalElapsedMinutes <= slaTargetMinutes) slaWithinCount += 1;
      else slaBreachedCount += 1;
    } else {
      const slaSeverity = getSlaSeverity(totalElapsedMinutes, slaTargetMinutes);
      if (slaSeverity === "risk") activeSlaRiskCount += 1;
      if (slaSeverity === "breached") activeSlaBreachedCount += 1;
      if (slaSeverity) {
        topSlaAlerts.push({ attendanceId: String(attendance.id), licensePlate: attendance.licensePlate, vehicleModel: attendance.vehicleModel, serviceType: attendance.serviceType, status: attendance.status, totalElapsedMinutes, slaTargetMinutes, severity: slaSeverity, delayReason: attendance.delayReason });
      }
    }
  });

  const averageArrivalMinutes = average(stageBuckets.arrival);
  const averageWaitingMinutes = average(stageBuckets.waiting);
  const averageInServiceMinutes = average(stageBuckets.in_service);
  const stageAverages: Array<{ stage: StageStatus; averageMinutes: number }> = [
    { stage: "arrival", averageMinutes: averageArrivalMinutes },
    { stage: "waiting", averageMinutes: averageWaitingMinutes },
    { stage: "in_service", averageMinutes: averageInServiceMinutes },
  ];
  const bottleneck = [...stageAverages].sort((a, b) => b.averageMinutes - a.averageMinutes)[0];

  return {
    averageTotalMinutesCompleted: average(totalCompletedMinutes),
    averageArrivalMinutes,
    averageWaitingMinutes,
    averageInServiceMinutes,
    bottleneckStage: bottleneck?.averageMinutes ? bottleneck.stage : null,
    bottleneckAverageMinutes: bottleneck?.averageMinutes ?? 0,
    criticalQueueCount: criticalAttendances.length,
    criticalByStatus,
    criticalAttendances: criticalAttendances.sort((a, b) => b.stageDurationMinutes - a.stageDurationMinutes).slice(0, 6),
    completedMeasuredCount: totalCompletedMinutes.length,
    slaWithinCount,
    slaBreachedCount,
    slaExceptionCount,
    activeSlaRiskCount,
    activeSlaBreachedCount,
    topSlaAlerts: topSlaAlerts.sort((a, b) => {
      if (a.severity !== b.severity) return a.severity === "breached" ? -1 : 1;
      return (b.totalElapsedMinutes - b.slaTargetMinutes) - (a.totalElapsedMinutes - a.slaTargetMinutes);
    }).slice(0, 6),
  };
}
