import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { attendanceStatusHistory, attendances } from "../drizzle/schema";
import { getOperationalMetrics } from "./operational-metrics";
import { getDb } from "./db";

vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

const mockedGetDb = vi.mocked(getDb);
const NOW = new Date("2026-04-05T15:00:00.000Z");

function createMockDb({ attendanceRows, historyRows }: { attendanceRows: any[]; historyRows: any[] }) {
  return {
    select() {
      return {
        from(table: unknown) {
          if (table === attendances) {
            return {
              where: () => attendanceRows,
              then: (resolve: (value: any[]) => unknown) => Promise.resolve(resolve(attendanceRows)),
            };
          }

          if (table === attendanceStatusHistory) {
            return {
              where: () => ({
                orderBy: () => historyRows,
              }),
            };
          }

          throw new Error("Unexpected table in mock db");
        },
      };
    },
  };
}

describe("getOperationalMetrics", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("returns empty metrics when database is unavailable", async () => {
    mockedGetDb.mockResolvedValue(null as never);

    const metrics = await getOperationalMetrics();

    expect(metrics).toEqual({
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
    });
  });

  it("builds operational metrics, critical queue and SLA alerts from history", async () => {
    const attendanceRows = [
      {
        id: 1,
        licensePlate: "ABC-1234",
        vehicleModel: "Nivus",
        status: "completed",
        serviceType: "preventive",
        delayReason: "none",
        slaExceptionActive: false,
        createdAt: new Date("2026-04-05T10:00:00.000Z"),
        updatedAt: new Date("2026-04-05T12:40:00.000Z"),
      },
      {
        id: 2,
        licensePlate: "DEF-5678",
        vehicleModel: "T-Cross",
        status: "waiting",
        serviceType: "tire",
        delayReason: "parts_wait",
        slaExceptionActive: false,
        createdAt: new Date("2026-04-05T12:00:00.000Z"),
        updatedAt: new Date("2026-04-05T12:40:00.000Z"),
      },
      {
        id: 3,
        licensePlate: "GHI-9012",
        vehicleModel: "Polo",
        status: "in_service",
        serviceType: "corrective",
        delayReason: "approval_pending",
        slaExceptionActive: true,
        createdAt: new Date("2026-04-05T11:00:00.000Z"),
        updatedAt: new Date("2026-04-05T11:45:00.000Z"),
      },
      {
        id: 4,
        licensePlate: "JKL-3456",
        vehicleModel: "Virtus",
        status: "arrival",
        serviceType: "preventive",
        delayReason: "high_demand",
        slaExceptionActive: false,
        createdAt: new Date("2026-04-05T12:20:00.000Z"),
        updatedAt: new Date("2026-04-05T12:20:00.000Z"),
      },
    ];

    const historyRows = [
      { id: 1, attendanceId: 1, toStatus: "arrival", createdAt: new Date("2026-04-05T10:00:00.000Z") },
      { id: 2, attendanceId: 1, toStatus: "waiting", createdAt: new Date("2026-04-05T10:20:00.000Z") },
      { id: 3, attendanceId: 1, toStatus: "in_service", createdAt: new Date("2026-04-05T10:50:00.000Z") },
      { id: 4, attendanceId: 1, toStatus: "completed", createdAt: new Date("2026-04-05T12:40:00.000Z") },

      { id: 5, attendanceId: 2, toStatus: "arrival", createdAt: new Date("2026-04-05T12:00:00.000Z") },
      { id: 6, attendanceId: 2, toStatus: "waiting", createdAt: new Date("2026-04-05T12:10:00.000Z") },

      { id: 7, attendanceId: 3, toStatus: "arrival", createdAt: new Date("2026-04-05T11:00:00.000Z") },
      { id: 8, attendanceId: 3, toStatus: "waiting", createdAt: new Date("2026-04-05T11:10:00.000Z") },
      { id: 9, attendanceId: 3, toStatus: "in_service", createdAt: new Date("2026-04-05T11:30:00.000Z") },

      { id: 10, attendanceId: 4, toStatus: "arrival", createdAt: new Date("2026-04-05T12:20:00.000Z") },
    ];

    mockedGetDb.mockResolvedValue(createMockDb({ attendanceRows, historyRows }) as never);

    const metrics = await getOperationalMetrics();

    expect(metrics.averageTotalMinutesCompleted).toBe(160);
    expect(metrics.averageArrivalMinutes).toBe(15);
    expect(metrics.averageWaitingMinutes).toBe(40);
    expect(metrics.averageInServiceMinutes).toBe(140);
    expect(metrics.bottleneckStage).toBe("in_service");
    expect(metrics.bottleneckAverageMinutes).toBe(140);

    expect(metrics.completedMeasuredCount).toBe(1);
    expect(metrics.slaWithinCount).toBe(1);
    expect(metrics.slaBreachedCount).toBe(0);
    expect(metrics.slaExceptionCount).toBe(1);
    expect(metrics.activeSlaRiskCount).toBe(1);
    expect(metrics.activeSlaBreachedCount).toBe(0);

    expect(metrics.criticalQueueCount).toBe(3);
    expect(metrics.criticalByStatus).toEqual({ arrival: 1, waiting: 1, in_service: 1 });
    expect(metrics.criticalAttendances.map((item) => item.attendanceId)).toEqual(["3", "2", "4"]);
    expect(metrics.criticalAttendances[0]).toMatchObject({
      attendanceId: "3",
      status: "in_service",
      severity: "critical",
      stageDurationMinutes: 210,
      thresholdMinutes: 60,
    });

    expect(metrics.topSlaAlerts).toHaveLength(1);
    expect(metrics.topSlaAlerts[0]).toMatchObject({
      attendanceId: "2",
      severity: "risk",
      totalElapsedMinutes: 180,
      slaTargetMinutes: 120,
      delayReason: "parts_wait",
    });
  });

  it("sorts breached SLA alerts before risk alerts", async () => {
    const attendanceRows = [
      {
        id: 10,
        licensePlate: "MNO-7890",
        vehicleModel: "Saveiro",
        status: "waiting",
        serviceType: "tire",
        delayReason: "parts_wait",
        slaExceptionActive: false,
        createdAt: new Date("2026-04-05T11:00:00.000Z"),
        updatedAt: new Date("2026-04-05T11:10:00.000Z"),
      },
      {
        id: 11,
        licensePlate: "PQR-1122",
        vehicleModel: "Gol",
        status: "arrival",
        serviceType: "preventive",
        delayReason: "high_demand",
        slaExceptionActive: false,
        createdAt: new Date("2026-04-05T12:40:00.000Z"),
        updatedAt: new Date("2026-04-05T12:40:00.000Z"),
      },
    ];

    const historyRows = [
      { id: 1, attendanceId: 10, toStatus: "arrival", createdAt: new Date("2026-04-05T11:00:00.000Z") },
      { id: 2, attendanceId: 10, toStatus: "waiting", createdAt: new Date("2026-04-05T11:15:00.000Z") },
      { id: 3, attendanceId: 11, toStatus: "arrival", createdAt: new Date("2026-04-05T12:40:00.000Z") },
    ];

    mockedGetDb.mockResolvedValue(createMockDb({ attendanceRows, historyRows }) as never);

    const metrics = await getOperationalMetrics();

    expect(metrics.topSlaAlerts).toHaveLength(2);
    expect(metrics.topSlaAlerts[0]).toMatchObject({ attendanceId: "10", severity: "breached" });
    expect(metrics.topSlaAlerts[1]).toMatchObject({ attendanceId: "11", severity: "risk" });
  });
});
