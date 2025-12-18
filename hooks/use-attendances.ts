import { useCallback } from "react";
import { trpc } from "@/lib/trpc";
import type { AttendanceStatus } from "@/types/attendance";

export function useAttendances() {
  const utils = trpc.useUtils();

  // Query para listar atendimentos
  const { data: attendances = [], isLoading: loading } = trpc.attendances.list.useQuery(undefined, {
    refetchInterval: 3000, // Atualizar a cada 3 segundos
  });

  // Mutation para criar atendimento
  const createMutation = trpc.attendances.create.useMutation({
    onSuccess: () => {
      utils.attendances.list.invalidate();
    },
  });

  // Mutation para atualizar status
  const updateStatusMutation = trpc.attendances.updateStatus.useMutation({
    onSuccess: () => {
      utils.attendances.list.invalidate();
    },
  });

  // Mutation para deletar atendimento
  const deleteMutation = trpc.attendances.delete.useMutation({
    onSuccess: () => {
      utils.attendances.list.invalidate();
    },
  });

  // Função para criar atendimento
  const createAttendance = useCallback(
    async (data: {
      licensePlate: string;
      vehicleModel: string;
      serviceType: "tire" | "corrective" | "preventive";
      customerName?: string;
      description?: string;
    }) => {
      await createMutation.mutateAsync(data);
    },
    [createMutation]
  );

  // Função para atualizar status
  const updateAttendanceStatus = useCallback(
    async (id: number, status: AttendanceStatus) => {
      await updateStatusMutation.mutateAsync({ id, status });
    },
    [updateStatusMutation]
  );

  // Função para deletar atendimento
  const deleteAttendance = useCallback(
    async (id: number) => {
      await deleteMutation.mutateAsync({ id });
    },
    [deleteMutation]
  );

  // Função para forçar reload
  const reload = useCallback(() => {
    utils.attendances.list.invalidate();
  }, [utils]);

  // Converter timestamps do banco para formato do tipo Attendance
  const formattedAttendances = attendances.map((att) => ({
    id: String(att.id),
    licensePlate: att.licensePlate,
    vehicleModel: att.vehicleModel,
    customerName: att.customerName ?? undefined,
    status: att.status as AttendanceStatus,
    serviceType: att.serviceType as "tire" | "corrective" | "preventive",
    description: att.description ?? undefined,
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
