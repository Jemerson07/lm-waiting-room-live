import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMaintenanceCheckinOrder } from "@/services/maintenance-intake.service";

export function useCreateMaintenanceCheckinOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMaintenanceCheckinOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-orders"] });
    },
  });
}
