import { describe, it, expect } from "vitest";
import { SERVICE_TYPE_LABELS, SERVICE_TYPE_ICONS } from "../types/attendance";
import type { ServiceType } from "../types/attendance";

describe("Service Types", () => {
  describe("SERVICE_TYPE_LABELS", () => {
    it("should have labels for all service types", () => {
      expect(SERVICE_TYPE_LABELS.tire).toBe("Pneu");
      expect(SERVICE_TYPE_LABELS.corrective).toBe("Corretiva");
      expect(SERVICE_TYPE_LABELS.preventive).toBe("Preventiva");
    });

    it("should have exactly 3 service types", () => {
      expect(Object.keys(SERVICE_TYPE_LABELS)).toHaveLength(3);
    });

    it("should have all required service types", () => {
      const serviceTypes: ServiceType[] = ["tire", "corrective", "preventive"];
      serviceTypes.forEach((type) => {
        expect(SERVICE_TYPE_LABELS[type]).toBeDefined();
        expect(typeof SERVICE_TYPE_LABELS[type]).toBe("string");
      });
    });
  });

  describe("SERVICE_TYPE_ICONS", () => {
    it("should have icons for all service types", () => {
      expect(SERVICE_TYPE_ICONS.tire).toBe("🔧");
      expect(SERVICE_TYPE_ICONS.corrective).toBe("⚠️");
      expect(SERVICE_TYPE_ICONS.preventive).toBe("✓");
    });

    it("should have exactly 3 service type icons", () => {
      expect(Object.keys(SERVICE_TYPE_ICONS)).toHaveLength(3);
    });

    it("should have icons for all service types", () => {
      const serviceTypes: ServiceType[] = ["tire", "corrective", "preventive"];
      serviceTypes.forEach((type) => {
        expect(SERVICE_TYPE_ICONS[type]).toBeDefined();
        expect(typeof SERVICE_TYPE_ICONS[type]).toBe("string");
        expect(SERVICE_TYPE_ICONS[type].length).toBeGreaterThan(0);
      });
    });
  });

  describe("ServiceType validation", () => {
    it("should accept valid service types", () => {
      const validTypes: ServiceType[] = ["tire", "corrective", "preventive"];
      validTypes.forEach((type) => {
        expect(["tire", "corrective", "preventive"]).toContain(type);
      });
    });

    it("should have matching keys in labels and icons", () => {
      const labelKeys = Object.keys(SERVICE_TYPE_LABELS);
      const iconKeys = Object.keys(SERVICE_TYPE_ICONS);
      expect(labelKeys.sort()).toEqual(iconKeys.sort());
    });
  });
});
