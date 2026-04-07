import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatLicensePlate,
  getAttendancePrioritySnapshot,
  getAttendanceSlaSnapshot,
  getNextStatus,
  validateLicensePlate,
  type Attendance,
} from "./attendance";

const NOW = new Date("2026-04-05T15:00:00.000Z");

function buildAttendance(overrides: Partial<Attendance> = {}): Attendance {
  return {
    id: "1",
    licensePlate: "ABC-1234",
    vehicleModel: "Nivus",
    status: "arrival",
    serviceType: "preventive",
    delayReason: "none",
    slaExceptionActive: false,
    createdAt: NOW.getTime() - 60 * 60 * 1000,
    updatedAt: NOW.getTime() - 60 * 60 * 1000,
    ...overrides,
  };
}

describe("attendance flow helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("advances status in the expected order", () => {
    expect(getNextStatus("arrival")).toBe("waiting");
    expect(getNextStatus("waiting")).toBe("in_service");
    expect(getNextStatus("in_service")).toBe("completed");
    expect(getNextStatus("completed")).toBeNull();
  });

  it("validates and formats old and Mercosul license plates", () => {
    expect(validateLicensePlate("abc1234")).toBe(true);
    expect(validateLicensePlate("abc1d34")).toBe(true);
    expect(validateLicensePlate("AB-123")).toBe(false);

    expect(formatLicensePlate("abc1234")).toBe("ABC-1234");
    expect(formatLicensePlate("abc1d34")).toBe("ABC1D34");
  });

  it("marks SLA as on track, risk, breached and exempt", () => {
    const onTrack = getAttendanceSlaSnapshot(
      buildAttendance({ serviceType: "preventive", createdAt: NOW.getTime() - 120 * 60 * 1000 }),
    );
    const risk = getAttendanceSlaSnapshot(
      buildAttendance({ serviceType: "preventive", createdAt: NOW.getTime() - 145 * 60 * 1000 }),
    );
    const breached = getAttendanceSlaSnapshot(
      buildAttendance({ serviceType: "tire", createdAt: NOW.getTime() - 121 * 60 * 1000 }),
    );
    const exempt = getAttendanceSlaSnapshot(
      buildAttendance({
        serviceType: "corrective",
        createdAt: NOW.getTime() - 400 * 60 * 1000,
        slaExceptionActive: true,
      }),
    );

    expect(onTrack.severity).toBe("on_track");
    expect(risk.severity).toBe("risk");
    expect(breached.severity).toBe("breached");
    expect(exempt.severity).toBe("exempt");
  });

  it("uses updatedAt as the closing time for completed attendances", () => {
    const snapshot = getAttendanceSlaSnapshot(
      buildAttendance({
        status: "completed",
        serviceType: "tire",
        createdAt: NOW.getTime() - 200 * 60 * 1000,
        updatedAt: NOW.getTime() - 100 * 60 * 1000,
      }),
    );

    expect(snapshot.elapsedMinutes).toBe(100);
    expect(snapshot.severity).toBe("on_track");
  });

  it("returns critical priority for breached SLA cases", () => {
    const priority = getAttendancePrioritySnapshot(
      buildAttendance({
        status: "waiting",
        serviceType: "tire",
        createdAt: NOW.getTime() - 140 * 60 * 1000,
      }),
    );

    expect(priority.level).toBe("critical");
    expect(priority.label).toBe("Prioridade máxima");
    expect(priority.actionLabel).toBe("Atender imediatamente");
    expect(priority.reason).toContain("acima do SLA total");
  });

  it("returns attention priority for risk cases", () => {
    const priority = getAttendancePrioritySnapshot(
      buildAttendance({
        status: "arrival",
        serviceType: "preventive",
        createdAt: NOW.getTime() - 150 * 60 * 1000,
      }),
    );

    expect(priority.level).toBe("attention");
    expect(priority.label).toBe("Atenção operacional");
    expect(priority.actionLabel).toBe("Acelerar triagem");
  });

  it("keeps SLA exception cases out of the critical path", () => {
    const priority = getAttendancePrioritySnapshot(
      buildAttendance({
        status: "waiting",
        serviceType: "corrective",
        createdAt: NOW.getTime() - 500 * 60 * 1000,
        delayReason: "approval_pending",
        slaExceptionActive: true,
      }),
    );

    expect(priority.label).toBe("Exceção de SLA");
    expect(priority.actionLabel).toBe("Seguir exceção aprovada");
    expect(priority.reason).toContain("fora da meta padrão");
  });

  it("surfaces operational delays even when SLA is still on track", () => {
    const priority = getAttendancePrioritySnapshot(
      buildAttendance({
        status: "waiting",
        serviceType: "preventive",
        createdAt: NOW.getTime() - 90 * 60 * 1000,
        delayReason: "parts_wait",
      }),
    );

    expect(priority.label).toBe("Acompanhar atraso");
    expect(priority.actionLabel).toBe("Revisar bloqueio");
    expect(priority.reason).toContain("Aguardando peça");
  });

  it("returns historical context for completed attendances", () => {
    const priority = getAttendancePrioritySnapshot(
      buildAttendance({
        status: "completed",
        updatedAt: NOW.getTime() - 10 * 60 * 1000,
      }),
    );

    expect(priority.score).toBe(0);
    expect(priority.level).toBe("normal");
    expect(priority.label).toBe("Histórico");
    expect(priority.actionLabel).toBe("Acompanhar histórico");
  });
});
