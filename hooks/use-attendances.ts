import { useCallback } from "react";
import { trpc } from "@/lib/trpc";
import type { AttendanceStatus } from "@/types/attendance";

type AttendanceScope = "manage" | "live";

interface UseAttendancesOptions {
  scope?: AttendanceScope;
  enabled?: boolean;
}

export function useAttendances(options: UseAttendancesOptions = {}) {
  const { scope = "manage", enabled = true } = options;
  const utils = trpc.useUtils();

  const liveQuery = trpc.attendances.liveList.useQuery(undefined, {
    enabled: enabled && scope === "live",
    refetchInterval: scope === "live" ? 3000 : false,
  });

  const manageQuery = trpc.attendances.manageList.useQuery(undefined, {
    enabled: enabled && scope === "manage",
    refetchInterval: scope === "manage" ? 3000 : false,
    retry: false,
  });

  const query = scope === "live" ? liveQuery : manageQuery;
  const attendances = query.data ?? [];
  const loading = enabled ? query.isLoading : false;

  const invalidateAttendanceQueries = useCallback(() => {
    utils.attendances.manageList.invalidate();
    utils.attendances.liveList.invalidate();
    utils.attendances.history.invalidate();
    utils.attendances.metrics.invalidate();
  }, [utils]);

  const createMutation = trpc.attendances.create.useMutation({
    onSuccess: () => {
      invalidateAttendanceQueries();
    },
  });

  const updateStatusMutation = trpc.attendances.updateStatus.useMutation({
    onSuccess: () => {
      invalidateAttendanceQueries();
    },
  });

  const deleteMutation = trpc.attendances.delete.useMutation({
    onSuccess: () => {
      invalidateAttendanceQueries();
    },
  });

  const createAttendance = useCallback(
    async (data: {
      licensePlate: string;
      vehicleModel: string;
      serviceType: "tire" | "corrective" | "preventive";
      customerName?: string;
      customerPhone?: string;
      description?: string;
    }) => {
      await createMutation.mutateAsync(data);
    },
    [createMutation],
  );

  const updateAttendanceStatus = useCallback(
    async (id: number, status: AttendanceStatus) => {
      await updateStatusMutation.mutateAsync({ id, status });
    },
    [updateStatusMutation],
  );

  const deleteAttendance = useCallback(
    async (id: number) => {
      await deleteMutation.mutateAsync({ id });
    },
    [deleteMutation],
  );

  const reload = useCallback(() => {
    if (scope === "live") {
      utils.attendances.liveList.invalidate();
      return;
    }
    utils.attendances.manageList.invalidate();
    utils.attendances.metrics.invalidate();
  }, [scope, utils]);

  const formattedAttendances = attendances.map((att) => ({
    id: String(att.id),
    licensePlate: att.licensePlate,
    vehicleModel: att.vehicleModel,
    customerName: att.customerName ?? undefined,
    customerPhone: "customerPhone" in att ? att.customerPhone ?? undefined : undefined,
    status: att.status as AttendanceStatus,
    serviceType: att.serviceType as "tire" | "corrective" | "preventive",
    description: "description" in att ? att.description ?? undefined : undefined,
    createdAt: new Date(att.createdAt).getTime(),
    updatedAt: new Date(att.updatedAt).getTime(),
  }));

  return {
    attendances: formattedAttendances,
    loading,
    createAttendance,
    updateAttendanceStatus,
    deleteAttendance,
    reload,
  };
}
