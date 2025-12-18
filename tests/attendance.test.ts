import { describe, it, expect } from "vitest";
import {
  validateLicensePlate,
  formatLicensePlate,
  getNextStatus,
  getElapsedTime,
  STATUS_PROGRESSION,
} from "../types/attendance";

describe("Attendance Utilities", () => {
  describe("validateLicensePlate", () => {
    it("should validate old format plates (ABC-1234)", () => {
      expect(validateLicensePlate("ABC-1234")).toBe(true);
      expect(validateLicensePlate("ABC1234")).toBe(true);
      expect(validateLicensePlate("XYZ-9999")).toBe(true);
    });

    it("should validate Mercosul format plates (ABC1D34)", () => {
      expect(validateLicensePlate("ABC1D34")).toBe(true);
      expect(validateLicensePlate("XYZ9A99")).toBe(true);
    });

    it("should reject invalid plates", () => {
      expect(validateLicensePlate("AB-1234")).toBe(false);
      expect(validateLicensePlate("ABCD-1234")).toBe(false);
      expect(validateLicensePlate("ABC-12345")).toBe(false);
      expect(validateLicensePlate("123-4567")).toBe(false);
      expect(validateLicensePlate("")).toBe(false);
    });
  });

  describe("formatLicensePlate", () => {
    it("should format old format plates with hyphen", () => {
      expect(formatLicensePlate("ABC1234")).toBe("ABC-1234");
      expect(formatLicensePlate("abc1234")).toBe("ABC-1234");
      expect(formatLicensePlate("ABC-1234")).toBe("ABC-1234");
    });

    it("should format Mercosul plates without hyphen", () => {
      expect(formatLicensePlate("ABC1D34")).toBe("ABC1D34");
      expect(formatLicensePlate("abc1d34")).toBe("ABC1D34");
    });

    it("should handle uppercase conversion", () => {
      expect(formatLicensePlate("abc-1234")).toBe("ABC-1234");
      expect(formatLicensePlate("xyz1a99")).toBe("XYZ1A99");
    });
  });

  describe("getNextStatus", () => {
    it("should return correct next status in progression", () => {
      expect(getNextStatus("arrival")).toBe("waiting");
      expect(getNextStatus("waiting")).toBe("in_service");
      expect(getNextStatus("in_service")).toBe("completed");
    });

    it("should return null for completed status", () => {
      expect(getNextStatus("completed")).toBe(null);
    });
  });

  describe("getElapsedTime", () => {
    const now = Date.now();

    it("should return 'Agora' for recent timestamps", () => {
      expect(getElapsedTime(now)).toBe("Agora");
      expect(getElapsedTime(now - 30000)).toBe("Agora"); // 30 seconds ago
    });

    it("should return minutes for timestamps within an hour", () => {
      expect(getElapsedTime(now - 5 * 60000)).toBe("Há 5 min");
      expect(getElapsedTime(now - 30 * 60000)).toBe("Há 30 min");
    });

    it("should return hours and minutes for timestamps within a day", () => {
      expect(getElapsedTime(now - 2 * 3600000)).toBe("Há 2h 0min");
      expect(getElapsedTime(now - 3 * 3600000 - 15 * 60000)).toBe("Há 3h 15min");
    });

    it("should return days for older timestamps", () => {
      expect(getElapsedTime(now - 24 * 3600000)).toBe("Há 1 dia");
      expect(getElapsedTime(now - 3 * 24 * 3600000)).toBe("Há 3 dias");
    });
  });

  describe("STATUS_PROGRESSION", () => {
    it("should have correct order of statuses", () => {
      expect(STATUS_PROGRESSION).toEqual([
        "arrival",
        "waiting",
        "in_service",
        "completed",
      ]);
    });

    it("should have 4 statuses", () => {
      expect(STATUS_PROGRESSION).toHaveLength(4);
    });
  });
});
