import * as Auth from "@/lib/auth";
import { trpc } from "@/lib/trpc";

type AppRole = "admin" | "operator";

function normalizeRole(role: string | null | undefined): AppRole | null {
  if (!role) return null;
  return role === "admin" ? "admin" : "operator";
}

export function useCurrentUser() {
  const { data, isLoading, refetch } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 60_000,
  });

  const role = normalizeRole(data?.role);
  const isAuthenticated = Boolean(data);
  const isAdmin = role === "admin";
  const isOperator = role === "operator" || role === "admin";

  return {
    user: data ? { ...data, role, name: data.name ?? null } : null,
    role,
    roleLabel: isAdmin ? "Administrador" : isOperator ? "Operador" : null,
    loading: isLoading,
    isAuthenticated,
    isAdmin,
    isOperator,
    refetch,
    logoutLocal: async () => {
      await Auth.removeSessionToken();
      await Auth.clearUserInfo();
      await refetch();
    },
  };
}
