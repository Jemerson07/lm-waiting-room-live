import { Alert, Pressable, StyleSheet, View, ActivityIndicator } from "react-native";
import { trpc } from "@/lib/trpc";
import { ThemedText } from "@/components/themed-text";

interface UserRoleManagementProps {
  currentUserId: number;
  tintColor: string;
  cardBackground: string;
  borderColor: string;
}

function formatDateTime(value: string | number | Date | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function getRoleLabel(role: string) {
  return role === "admin" ? "Administrador" : "Operador";
}

export function UserRoleManagement({ currentUserId, tintColor, cardBackground, borderColor }: UserRoleManagementProps) {
  const utils = trpc.useUtils();
  const { data: users = [], isLoading } = trpc.users.list.useQuery();
  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: async () => {
      await utils.users.list.invalidate();
      await utils.auth.me.invalidate();
    },
  });

  const handleRoleChange = async (userId: number, role: "user" | "admin", displayName: string) => {
    try {
      await updateRoleMutation.mutateAsync({ userId, role });
      Alert.alert("Perfil atualizado", `${displayName} agora é ${getRoleLabel(role).toLowerCase()}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível atualizar o papel do usuário.";
      Alert.alert("Erro", message);
    }
  };

  return (
    <View style={[styles.section, { backgroundColor: cardBackground, borderColor }]}> 
      <View style={styles.sectionHeader}>
        <View>
          <ThemedText type="subtitle" style={styles.sectionTitle}>👥 Controle de acesso</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>Promova administradores e mantenha operadores focados na rotina diária.</ThemedText>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={tintColor} />
        </View>
      ) : users.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>Nenhum usuário encontrado para gerenciamento.</ThemedText>
        </View>
      ) : (
        users.map((managedUser) => {
          const isCurrentUser = managedUser.id === currentUserId;
          const nextRole = managedUser.role === "admin" ? "user" : "admin";
          const displayName = managedUser.name || managedUser.email || managedUser.openId;

          return (
            <View key={managedUser.id} style={[styles.userCard, { borderColor }]}> 
              <View style={styles.userTopRow}>
                <View style={styles.userTextBlock}>
                  <ThemedText style={styles.userName}>{displayName}</ThemedText>
                  <ThemedText style={styles.userMeta}>{managedUser.email || managedUser.openId}</ThemedText>
                </View>
                <View style={[styles.roleBadge, { backgroundColor: managedUser.role === "admin" ? "rgba(0, 200, 83, 0.12)" : "rgba(0, 82, 163, 0.10)" }]}>
                  <ThemedText style={[styles.roleBadgeText, { color: managedUser.role === "admin" ? "#1C7C54" : "#0052A3" }]}>{getRoleLabel(managedUser.role)}</ThemedText>
                </View>
              </View>

              <View style={styles.userMetaGrid}>
                <View style={styles.metaItem}>
                  <ThemedText style={styles.metaLabel}>Último acesso</ThemedText>
                  <ThemedText style={styles.metaValue}>{formatDateTime(managedUser.lastSignedIn)}</ThemedText>
                </View>
                <View style={styles.metaItem}>
                  <ThemedText style={styles.metaLabel}>Criado em</ThemedText>
                  <ThemedText style={styles.metaValue}>{formatDateTime(managedUser.createdAt)}</ThemedText>
                </View>
              </View>

              <View style={styles.userActionsRow}>
                {isCurrentUser ? (
                  <View style={styles.currentUserHint}>
                    <ThemedText style={styles.currentUserHintText}>Sua conta não pode alterar o próprio papel.</ThemedText>
                  </View>
                ) : (
                  <Pressable
                    style={[styles.actionButton, { backgroundColor: tintColor }, updateRoleMutation.isPending && styles.actionButtonDisabled]}
                    disabled={updateRoleMutation.isPending}
                    onPress={() => handleRoleChange(managedUser.id, nextRole, displayName)}
                  >
                    <ThemedText style={styles.actionButtonText}>
                      Tornar {nextRole === "admin" ? "administrador" : "operador"}
                    </ThemedText>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  sectionSubtitle: { fontSize: 13, opacity: 0.72, lineHeight: 20 },
  loadingState: { paddingVertical: 18, alignItems: "center" },
  emptyState: { paddingVertical: 18, alignItems: "center" },
  emptyText: { fontSize: 14, opacity: 0.65 },
  userCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  userTopRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginBottom: 12 },
  userTextBlock: { flex: 1 },
  userName: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  userMeta: { fontSize: 12, opacity: 0.68 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, alignSelf: "flex-start" },
  roleBadgeText: { fontSize: 12, fontWeight: "800" },
  userMetaGrid: { flexDirection: "row", gap: 10, marginBottom: 12 },
  metaItem: { flex: 1, backgroundColor: "rgba(0,0,0,0.03)", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  metaLabel: { fontSize: 11, opacity: 0.6, marginBottom: 4, fontWeight: "600" },
  metaValue: { fontSize: 12, fontWeight: "700" },
  userActionsRow: { minHeight: 42, justifyContent: "center" },
  currentUserHint: { backgroundColor: "rgba(255, 165, 0, 0.10)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  currentUserHintText: { fontSize: 12, fontWeight: "700", color: "#A35B00" },
  actionButton: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, alignItems: "center" },
  actionButtonDisabled: { opacity: 0.6 },
  actionButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
});
