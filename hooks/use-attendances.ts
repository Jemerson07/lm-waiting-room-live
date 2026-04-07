import { useCallback, useEffect, useState } from "react";
import type { AttendanceStatus, DelayReason } from "@/types/attendance";
import { getActiveCompany } from "@/lib/company";
import {
  createOrder,
  deleteOrder,
  getOrders,
  mapOrderToAttendance,
  updateOrderGovernance,
  updateOrderStatus,
} from "@/lib/orders";

type AttendanceScope = "manage" | "live";

interface UseAttendancesOptions {
  scope?: AttendanceScope;
  enabled?: boolean;
}

export function useAttendances(options: UseAttendancesOptions = {}) {
  const { enabled = true } = options;
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(enabled);

  const loadAttendances = useCallback(async () => {
    if (!enabled) {
      setAttendances([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const company = await getActiveCompany();
      const orders = await getOrders(company.id);
      setAttendances(orders.map(mapOrderToAttendance));
    } catch (error) {
      console.error("Erro ao carregar atendimentos:", error);
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void loadAttendances();
  }, [loadAttendances]);

  const createAttendance = useCallback(
    async (data: {
      licensePlate: string;
      vehicleModel: string;
      serviceType: "tire" | "corrective" | "preventive";
      customerName?: string;
      customerPhone?: string;
      description?: string;
    }) => {
      await createOrder(data);
      await loadAttendances();
    },
    [loadAttendances],
  );

  const updateAttendanceStatus = useCallback(
    async (id: number, status: AttendanceStatus) => {
      await updateOrderStatus(String(id), status);
      await loadAttendances();
    },
    [loadAttendances],
  );

  const updateAttendanceGovernance = useCallback(
    async (data: {
      id: number;
      delayReason: DelayReason;
      operationalNote?: string;
      slaExceptionActive: boolean;
      slaExceptionReason?: string;
    }) => {
      await updateOrderGovernance({\n        id: String(data.id),\n        delayReason: data.delayReason,\n        operationalNote: data.operationalNote,\n        slaExceptionActive: data.slaExceptionActive,\n        slaExceptionReason: data.slaExceptionReason,\n      });\n      await loadAttendances();\n    },\n    [loadAttendances],\n  );\n\n  const deleteAttendance = useCallback(\n    async (id: number) => {\n      await deleteOrder(String(id));\n      await loadAttendances();\n    },\n    [loadAttendances],\n  );\n\n  return {\n    attendances,\n    loading,\n    createAttendance,\n    updateAttendanceStatus,\n    updateAttendanceGovernance,\n    deleteAttendance,\n    reload: loadAttendances,\n  };\n}
