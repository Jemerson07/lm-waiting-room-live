import { and, asc, gte, inArray, lte } from "drizzle-orm";
import { attendanceStatusHistory, attendances } from "../drizzle/schema";
import { getDb } from "./db";

type StageStatus = "arrival" | "waiting" | "in_service";

type CriticalSeverity = "attention" | "critical";

const STAGE_THRESHOLDS: Record<StageStatus, number> = {
  arrival: 15,
  waiting: 30,
  in_service: 60,
};

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

export async function getOperationalMetrics(filters?: { startAt?: Date; endAt?: Date }) {
  const db = await getDb();
  if (!db) {
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
    };
  }

  const conditions = [];
  if (filters?.startAt) conditions.push(gte(attendances.createdAt, filters.startAt));
  if (filters?.endAt) conditions.push(lte(attendances.createdAt, filters.endAt));

  const attendanceRows = conditions.length
    ? await db.select().from(attendances).where(and(...conditions))
    : await db.select().from(attendances);

  if (!attendanceRows.length) {
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
    };
  }

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
  const stageBuckets: Record<StageStatus, number[]> = {
    arrival: [],
    waiting: [],
    in_service: [],
  };
  const criticalByStatus: Record<StageStatus, number> = {
    arrival: 0,
    waiting: 0,
    in_service: 0,
  };
  const criticalAttendances: Array<{
    attendanceId: string;
    licensePlate: string;
    vehicleModel: string;
    status: StageStatus;
    stageDurationMinutes: number;
    thresholdMinutes: number;
    severity: CriticalSeverity;
  }> = [];

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
        const endTimestamp = nextEntry
          ? toTimestamp(nextEntry.createdAt)
          : attendance.status === toStatus
            ? now
            : updatedAtTs;

        if (toStatus === "completed" && completedAtTimestamp === null) {
          completedAtTimestamp = currentEntryTime;
        }

        if (isTrackedStage) {
          const durationMinutes = diffMinutes(currentEntryTime, endTimestamp);
          stageBuckets[toStatus].push(durationMinutes);

          if (attendance.status === toStatus) {
            currentStageDurationMinutes = durationMinutes;
          }
        }
      });

      if (attendance.status === "completed") {
        totalCompletedMinutes.push(diffMinutes(createdAtTs, completedAtTimestamp ?? updatedAtTs));
      }
    } else {
      if (attendance.status === "completed") {
        totalCompletedMinutes.push(diffMinutes(createdAtTs, updatedAtTs));
      }

      if (attendance.status === "arrival" || attendance.status === "waiting" || attendance.status === "in_service") {
        currentStageDurationMinutes = diffMinutes(updatedAtTs, now);
      }
    }

    if (attendance.status === "arrival" || attendance.status === "waiting" || attendance.status === "in_service") {
      const thresholdMinutes = STAGE_THRESHOLDS[attendance.status];
      if (currentStageDurationMinutes >= thresholdMinutes) {
        criticalByStatus[attendance.status] += 1;
        criticalAttendances.push({
          attendanceId: String(attendance.id),
          licensePlate: attendance.licensePlate,
          vehicleModel: attendance.vehicleModel,
          status: attendance.status,
          stageDurationMinutes: currentStageDurationMinutes,
          thresholdMinutes,
          severity: getSeverity(currentStageDurationMinutes, thresholdMinutes),
        });
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
  };
}
