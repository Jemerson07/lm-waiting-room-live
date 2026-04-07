import { useCallback, useEffect, useState } from "react";
import { getActiveCompany } from "@/lib/company";
import { supabase } from "@/lib/supabase";

type AppRole = "admin" | "operator" | null;

function normalizeRole(role: string | null | undefined): AppRole {
  if (!role) return null;
  if (role === "manager") return "admin";
  if (role === "operator") return "operator";
  return null;
}

export function useCurrentUser() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
      const sessionResponse = await supabase.auth.getSession();
      const authUser = sessionResponse.data.session?.user ?? null;

      if (!authUser) {
        setUser(null);
        return;
      }

      const company = await getActiveCompany();
      const [profileResponse, roleResponse] = await Promise.all([
        supabase.from("profiles").select("full_name, phone").eq("id", authUser.id).limit(1).maybeSingle(),
        supabase
          .from("user_company_roles")
          .select("role, company_id, branch_id")
          .eq("user_id", authUser.id)
          .eq("company_id", company.id)
          .eq("active", true)
          .limit(1)
          .maybeSingle(),
      ]);

      if (profileResponse.error) throw profileResponse.error;
      if (roleResponse.error) throw roleResponse.error;

      const role = normalizeRole(roleResponse.data?.role);
      const displayName =
        profileResponse.data?.full_name ||
        authUser.user_metadata?.full_name ||
        authUser.email?.split("@")[0] ||
        "Usuário";

      setUser({
        id: authUser.id,
        openId: authUser.id,
        name: displayName,
        email: authUser.email ?? null,
        loginMethod: authUser.app_metadata?.provider ?? "supabase",
        lastSignedIn: authUser.last_sign_in_at ? new Date(authUser.last_sign_in_at) : new Date(),
        role,
      });
    } catch (error) {
      console.error("Erro ao carregar usuário atual:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
    const { data } = supabase.auth.onAuthStateChange(() => {
      void loadUser();
    });

    return () => data.subscription.unsubscribe();
  }, [loadUser]);

  const role = (user?.role as AppRole) ?? null;
  const isAuthenticated = Boolean(user);
  const isAdmin = role === "admin";
  const isOperator = role === "operator" || role === "admin";

  return {
    user,
    role,
    roleLabel: isAdmin ? "Administrador" : isOperator ? "Operador" : null,
    loading,
    isAuthenticated,
    isAdmin,
    isOperator,
    refetch: loadUser,
    logoutLocal: async () => {
      await supabase.auth.signOut();
      await loadUser();
    },
  };
}
