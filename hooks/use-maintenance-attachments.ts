import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerMaintenanceAttachment } from "@/services/maintenance-attachments.service";

export function useRegisterMaintenanceAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerMaintenanceAttachment,
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["order-attachments", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["customer-order", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["manager-orders"] });
    },
  });
}
