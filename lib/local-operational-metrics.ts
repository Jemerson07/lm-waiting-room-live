import type {
  Attendance,
  AttendanceOperationalMetrics,
  CriticalAttendanceSignal,
  SlaAlertSignal,
} from "@/types/attendance";
import {
  DELAY_REASON_LABELS,
  getAttendanceElapsedMinutes,
  getAttendancePrioritySnapshot,
  getAttendanceSlaSnapshot,
} from "@/types/attendance";

const STAGE_THRESHOLDS = {
  arrival: 20,
  waiting: 45,
  in_service: 90,
} as const;

type StageStatus = keyof typeof STAGE_THRESHOLDS;

function average(values: number[]) {
  return values.length
    ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
    : 0;
}

function isStageStatus(status: Attendance["status"]): status is StageStatus {
  return status === "arrival" || status === "waiting" || status === "in_service";
}

export function buildOperationalMetrics(
  attendances: Attendance[],
): AttendanceOperationalMetrics {
  const completed = attendances.filter((item) => item.status === "completed");
  const active = attendances.filter((item) => item.status !== "completed");

  const averageArrivalMinutes = average(
    attendances
      .filter((item) => item.status === "arrival")
      .map((item) => getAttendanceElapsedMinutes(item)),
  );

  const averageWaitingMinutes = average(
    attendances
      .filter((item) => item.status === "waiting")
      .map((item) => getAttendanceElapsedMinutes(item)),
  );

  const averageInServiceMinutes = average(
    attendances
      .filter((item) => item.status === "in_service")
      .map((item) => getAttendanceElapsedMinutes(item)),
  );

  const bottleneckCandidates = [
    { stage: "arrival" as const, value: averageArrivalMinutes },
    { stage: "waiting" as const, value: averageWaitingMinutes },
    { stage: "in_service" as const, value: averageInServiceMinutes },
  ].sort((a, b) => b.value - a.value);

  const topSlaAlerts = active
    .map((item): SlaAlertSignal | null => {
      const sla = getAttendanceSlaSnapshot(item);
      if (sla.severity !== "risk" && sla.severity !== "breached") return null;

      return {
        attendanceId: item.id,
        licensePlate: item.licensePlate,
        vehicleModel: item.vehicleModel,
        serviceType: item.serviceType,
        status: item.status,
        totalElapsedMinutes: sla.elapsedMinutes,
        slaTargetMinutes: sla.targetMinutes,
        severity: sla.severity,
        delayReason: item.delayReason,
      };
    })
    .filter((item): item is SlaAlertSignal => item !== null)
    .sort((a, b) => b.totalElapsedMinutes - a.totalElapsedMinutes);

  const criticalAttendances = active
    .filter((item): item is Attendance & { status: StageStatus } =>
      isStageStatus(item.status),
    )
    .map((item): CriticalAttendanceSignal | null => {
      const elapsed = getAttendanceElapsedMinutes(item);
      const priority = getAttendancePrioritySnapshot(item);
      const thresholdMinutes = STAGE_THRESHOLDS[item.status];
      const severity =
        elapsed >= thresholdMinutes || priority.level === "critical"
          ? "critical"
          : "attention";

      if (
        elapsed < Math.round(thresholdMinutes * 0.75) &&
        priority.level === "normal"
      ) {
        return null;
      }

      return {
        attendanceId: item.id,
        licensePlate: item.licensePlate,
        vehicleModel: item.vehicleModel,
        status: item.status,
        stageDurationMinutes: elapsed,
        thresholdMinutes,
        severity,
      };
    })
    .filter((item): item is CriticalAttendanceSignal => item !== null)
    .sort((a, b) => b.stageDurationMinutes - a.stageDurationMinutes);

  return {
    averageTotalMinutesCompleted: average(
      completed.map((item) => getAttendanceElapsedMinutes(item)),
    ),
    averageArrivalMinutes,
    averageWaitingMinutes,
    averageInServiceMinutes,
    bottleneckStage: bottleneckCandidates[0]?.value
      ? bottleneckCandidates[0].stage
      : null,
    bottleneckAverageMinutes: bottleneckCandidates[0]?.value || 0,
    criticalQueueCount: criticalAttendances.length,
    criticalByStatus: {
      arrival: criticalAttendances.filter((item) => item.status === "arrival").length,
      waiting: criticalAttendances.filter((item) => item.status === "waiting").length,
      in_service: criticalAttendances.filter(
        (item) => item.status === "in_service",
      ).length,
    },
    criticalAttendances,
    completedMeasuredCount: completed.length,
    slaWithinCount: completed.filter(
      (item) => getAttendanceSlaSnapshot(item).severity === "on_track",
    ).length,
    slaBreachedCount: completed.filter(
      (item) => getAttendanceSlaSnapshot(item).severity === "breached",
    ).length,
    slaExceptionCount: attendances.filter((item) => item.slaExceptionActive).length,
    activeSlaRiskCount: active.filter(
      (item) => getAttendanceSlaSnapshot(item).severity === "risk",
    ).length,
    activeSlaBreachedCount: active.filter(
      (item) => getAttendanceSlaSnapshot(item).severity === "breached",
    ).length,
    topSlaAlerts,
  };
}

export function buildNotificationHealth() {
  return {
    totalAttempts: 0,
    successfulAttempts: 0,
    failedAttempts: 0,
    successRate: 0,
    latestFailures: [],
  };
}

export function buildDelaySummary(attendances: Attendance[]) {
  return attendances
    .filter((item) => item.delayReason !== "none")
    .map(
      (item) => `${item.licensePlate}: ${DELAY_REASON_LABELS[item.delayReason]}`,
    );
}