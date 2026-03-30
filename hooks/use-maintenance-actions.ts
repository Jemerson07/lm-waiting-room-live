import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMaintenanceOrderStatus } from "@/services/maintenance-actions.service";

export function useUpdateMaintenanceOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMaintenanceOrderStatus,
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["manager-orders"] });
      queryClient.invalidateQueries({ queryKey: ["customer-order", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["order-timeline", variables.orderId] });
    },
  });
}
