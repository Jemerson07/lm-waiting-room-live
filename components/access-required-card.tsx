import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useCurrentUser } from "@/hooks/use-current-user";
import { supabase } from "@/lib/supabase";

interface AccessRequiredCardProps {
  title?: string;
  description?: string;
}

export function AccessRequiredCard({
  title = "Acesso protegido",
  description = "Faça login no ambiente administrativo para visualizar e operar esta área do sistema.",
}: AccessRequiredCardProps) {
  const { isAuthenticated, logoutLocal } = useCurrentUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const helperText = useMemo(() => {
    if (!isAuthenticated) return description;
    return "Seu usuário está autenticado, mas ainda não possui a permissão necessária para esta área.";
  }, [description, isAuthenticated]);

  const handleSignIn = async () => {
    setSubmitting(true);
    setFeedback(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      setFeedback("Login realizado com sucesso.");
      setPassword("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível fazer login.";
      setFeedback(message);
      Alert.alert("Erro de login", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.wrapper}>
      <View style={styles.iconBadge}>
        <ThemedText style={styles.iconText}>🔒</ThemedText>
      </View>

      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>

      <ThemedText style={styles.description}>{helperText}</ThemedText>

      {!isAuthenticated ? (
        <View style={styles.formBlock}>
          <TextInput
            style={styles.input}
            placeholder="Seu email"
            placeholderTextColor="#888"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Sua senha"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            style={[styles.primaryButton, submitting && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={submitting || !email.trim() || !password.trim()}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.primaryButtonText}>
                Entrar
              </ThemedText>
            )}
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.secondaryButton} onPress={logoutLocal}>
          <ThemedText style={styles.secondaryButtonText}>Sair</ThemedText>
        </Pressable>
      )}

      {feedback ? <ThemedText style={styles.feedback}>{feedback}</ThemedText> : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "rgba(0, 82, 163, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(0, 82, 163, 0.12)",
    alignItems: "center",
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 82, 163, 0.10)",
    marginBottom: 12,
  },
  iconText: { fontSize: 22 },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.76,
    textAlign: "center",
    maxWidth: 520,
    marginBottom: 16,
  },
  formBlock: {
    width: "100%",
    maxWidth: 380,
    gap: 10,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(0, 82, 163, 0.14)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: "#0052A3",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "rgba(0, 82, 163, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#0052A3",
    fontWeight: "800",
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  feedback: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    opacity: 0.78,
  },
});