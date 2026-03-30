import { useQuery } from "@tanstack/react-query";
import { isMaintenanceModeEnabled } from "@/lib/env";
import { getCustomerOrdersByEmail } from "@/services/customer-portal.service";

export function useCustomerOrdersByEmail(email?: string) {
  return useQuery({
    queryKey: ["customer-orders-by-email", email],
    queryFn: () => getCustomerOrdersByEmail(email ?? ""),
    enabled: Boolean(email?.trim()) && isMaintenanceModeEnabled(),
  });
}
