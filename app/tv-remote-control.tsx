/**
 * Página de controle remoto da TV
 * Permite que o celular controle a tela Live na TV
 */

import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TVRemoteQRCode } from "@/components/tv-remote-qrcode";
import { useAttendances } from "@/hooks/use-attendances";

export default function TVRemoteControlScreen() {
  const insets = useSafeAreaInsets();
  const { attendances } = useAttendances();
  const [showQRCode, setShowQRCode] = useState(false);
  const [tvUrl, setTvUrl] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Gerar URL da tela TV
    const protocol = window.location.protocol;
    const host = window.location.host;
    const url = `${protocol}//${host}/tv-display`;
    setTvUrl(url);
  }, []);

  // Verificar conexão com TV via WebSocket
  useEffect(() => {
    const checkConnection = () => {
      // Simular verificação de conexão
      // Em produção, usar WebSocket para comunicação real
      setIsConnected(Math.random() > 0.5);
    };

    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateQRCode = () => {
    setShowQRCode(true);
  };

  const handleCopyURL = async () => {
    try {
      await navigator.clipboard.writeText(tvUrl);
      Alert.alert("Sucesso", "URL copiada para a área de transferência!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível copiar a URL");
    }
  };

  const handleOpenTV = () => {
    window.open(tvUrl, "_blank");
  };

  const stats = {
    total: attendances.length,
    arrival: attendances.filter((a) => a.status === "arrival").length,
    waiting: attendances.filter((a) => a.status === "waiting").length,
    inService: attendances.filter((a) => a.status === "in_service").length,
    completed: attendances.filter((a) => a.status === "completed").length,
  };

  if (showQRCode) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <TVRemoteQRCode tvUrl={tvUrl} onClose={() => setShowQRCode(false)} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>📱 Controle Remoto da TV</ThemedText>
          <ThemedText style={styles.subtitle}>Controle a tela Live pelo seu celular</ThemedText>
        </View>

        {/* Status de Conexão */}
        <View style={[styles.statusCard, isConnected && styles.statusConnected]}>
          <ThemedText style={styles.statusIcon}>{isConnected ? "✓" : "●"}</ThemedText>
          <View style={styles.statusContent}>
            <ThemedText style={styles.statusTitle}>
              {isConnected ? "Conectado à TV" : "Aguardando Conexão"}
            </ThemedText>
            <ThemedText style={styles.statusText}>
              {isConnected
                ? "A tela Live está sincronizada"
                : "Gere um QR Code para conectar"}
            </ThemedText>
          </View>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <ThemedText style={styles.statsTitle}>Atendimentos em Tempo Real</ThemedText>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <ThemedText style={styles.statValue}>{stats.total}</ThemedText>
              <ThemedText style={styles.statLabel}>Total</ThemedText>
            </View>
            <View style={styles.statCard}>
              <ThemedText style={[styles.statValue, { color: "#FF6B6B" }]}>
                {stats.arrival}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Chegada</ThemedText>
            </View>
            <View style={styles.statCard}>
              <ThemedText style={[styles.statValue, { color: "#FFA500" }]}>
                {stats.waiting}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Fila</ThemedText>
            </View>
            <View style={styles.statCard}>
              <ThemedText style={[styles.statValue, { color: "#4ECDC4" }]}>
                {stats.inService}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Atendendo</ThemedText>
            </View>
          </View>
        </View>

        {/* Instruções */}
        <View style={styles.instructionsCard}>
          <ThemedText style={styles.instructionsTitle}>Como Usar:</ThemedText>
          <View style={styles.instructionStep}>
            <ThemedText style={styles.stepNumber}>1</ThemedText>
            <ThemedText style={styles.stepText}>
              Clique em "Gerar QR Code" para criar um código
            </ThemedText>
          </View>
          <View style={styles.instructionStep}>
            <ThemedText style={styles.stepNumber}>2</ThemedText>
            <ThemedText style={styles.stepText}>
              Escaneie o código com a câmera do seu celular
            </ThemedText>
          </View>
          <View style={styles.instructionStep}>
            <ThemedText style={styles.stepNumber}>3</ThemedText>
            <ThemedText style={styles.stepText}>
              Clique no link para abrir a tela Live
            </ThemedText>
          </View>
          <View style={styles.instructionStep}>
            <ThemedText style={styles.stepNumber}>4</ThemedText>
            <ThemedText style={styles.stepText}>
              A tela será exibida em tempo real no seu celular
            </ThemedText>
          </View>
        </View>

        {/* URL da TV */}
        <View style={styles.urlCard}>
          <ThemedText style={styles.urlTitle}>URL da Tela Live:</ThemedText>
          <View style={styles.urlBox}>
            <ThemedText style={styles.urlText} numberOfLines={2}>
              {tvUrl}
            </ThemedText>
          </View>
        </View>

        {/* Botões de Ação */}
        <View style={styles.actionsContainer}>
          <Pressable style={styles.primaryButton} onPress={handleGenerateQRCode}>
            <ThemedText style={styles.buttonText}>📱 Gerar QR Code</ThemedText>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={handleCopyURL}>
            <ThemedText style={styles.buttonText}>📋 Copiar URL</ThemedText>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={handleOpenTV}>
            <ThemedText style={styles.buttonText}>🖥️ Abrir em Nova Aba</ThemedText>
          </Pressable>
        </View>

        {/* Dicas */}
        <View style={styles.tipsCard}>
          <ThemedText style={styles.tipsTitle}>💡 Dicas:</ThemedText>
          <ThemedText style={styles.tipText}>
            • Mantenha o celular próximo à TV para melhor sincronização
          </ThemedText>
          <ThemedText style={styles.tipText}>
            • A tela Live atualiza a cada 3 segundos
          </ThemedText>
          <ThemedText style={styles.tipText}>
            • Você pode controlar os atendimentos enquanto monitora a TV
          </ThemedText>
          <ThemedText style={styles.tipText}>
            • Use em modo landscape para melhor visualização
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3CD",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  statusConnected: {
    backgroundColor: "#D4EDDA",
  },
  statusIcon: {
    fontSize: 24,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  statusText: {
    fontSize: 12,
    opacity: 0.7,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0052A3",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  instructionsCard: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
  },
  instructionStep: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#007AFF",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "bold",
    fontSize: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  urlCard: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  urlTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  urlBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  urlText: {
    fontSize: 12,
    color: "#0052A3",
    fontFamily: "monospace",
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#34C759",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  tipsCard: {
    backgroundColor: "#F0F8FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0052A3",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 20,
    marginBottom: 6,
  },
});
