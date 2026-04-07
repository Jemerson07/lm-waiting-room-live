import { useCallback, useEffect, useState } from "react";
import type { Attendance, AttendanceStatus, DelayReason } from "@/types/attendance";
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
  const [attendances, setAttendances] = useState<Attendance[]>([]);
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
    async (id: string, status: AttendanceStatus) => {
      await updateOrderStatus(id, status);
      await loadAttendances();
    },
    [loadAttendances],
  );

  const updateAttendanceGovernance = useCallback(
    async (data: {
      id: string;
      delayReason: DelayReason;
      operationalNote?: string;
      slaExceptionActive: boolean;
      slaExceptionReason?: string;
    }) => {
      await updateOrderGovernance({
        id: data.id,
        delayReason: data.delayReason,
        operationalNote: data.operationalNote,
        slaExceptionActive: data.slaExceptionActive,
        slaExceptionReason: data.slaExceptionReason,
      });
      await loadAttendances();
    },
    [loadAttendances],
  );

  const deleteAttendance = useCallback(
    async (id: string) => {
      await deleteOrder(id);
      await loadAttendances();
    },
    [loadAttendances],
  );

  return {
    attendances,
    loading,
    createAttendance,
    updateAttendanceStatus,
    updateAttendanceGovernance,
    deleteAttendance,
    reload: loadAttendances,
  };
}