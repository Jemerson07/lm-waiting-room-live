import * as Auth from "@/lib/auth";
import { trpc } from "@/lib/trpc";

export function useCurrentUser() {
  const { data, isLoading, refetch } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 60_000,
  });

  return {
    user: data ? { ...data, role: data.role, name: data.name ?? null } : null,
    loading: isLoading,
    isAuthenticated: Boolean(data),
    refetch,
    logoutLocal: async () => {
      await Auth.removeSessionToken();
      await Auth.clearUserInfo();
      await refetch();
    },
  };
}
