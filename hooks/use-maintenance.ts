import { useQuery } from "@tanstack/react-query";
import {
  getCustomerOrderById,
  getManagerOrders,
  getOrderAttachments,
  getOrderTimeline,
} from "@/services/maintenance.service";
import { isMaintenanceModeEnabled } from "@/lib/env";

export function useManagerOrders() {
  return useQuery({
    queryKey: ["manager-orders"],
    queryFn: getManagerOrders,
    enabled: isMaintenanceModeEnabled(),
    refetchInterval: 5000,
  });
}

export function useCustomerOrder(orderId?: string) {
  return useQuery({
    queryKey: ["customer-order", orderId],
    queryFn: () => getCustomerOrderById(orderId ?? ""),
    enabled: Boolean(orderId) && isMaintenanceModeEnabled(),
  });
}

export function useOrderTimeline(orderId?: string) {
  return useQuery({
    queryKey: ["order-timeline", orderId],
    queryFn: () => getOrderTimeline(orderId ?? ""),
    enabled: Boolean(orderId) && isMaintenanceModeEnabled(),
    refetchInterval: 5000,
  });
}

export function useOrderAttachments(orderId?: string) {
  return useQuery({
    queryKey: ["order-attachments", orderId],
    queryFn: () => getOrderAttachments(orderId ?? ""),
    enabled: Boolean(orderId) && isMaintenanceModeEnabled(),
  });
}
