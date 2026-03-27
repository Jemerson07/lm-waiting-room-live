/**
 * Guia de Screen Mirroring
 * Instruções para espelhar a tela do celular na TV
 */

import React, { useState } from "react";
import { View, StyleSheet, Pressable, ScrollView, Modal } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

interface ScreenMirroringGuideProps {
  visible: boolean;
  onClose: () => void;
}

export function ScreenMirroringGuide({ visible, onClose }: ScreenMirroringGuideProps) {
  const [selectedMethod, setSelectedMethod] = useState<"android" | "ios" | "samsung" | null>(null);

  const androidSteps = [
    {
      step: 1,
      title: "Abra o Painel de Controle",
      description: "Deslize para baixo a partir do topo da tela duas vezes",
      icon: "📱",
    },
    {
      step: 2,
      title: "Procure por 'Transmitir' ou 'Screen Cast'",
      description: "Pode estar em 'Conexões' ou 'Rede'",
      icon: "🔍",
    },
    {
      step: 3,
      title: "Selecione a TV",
      description: "Escolha a TV ou Chromecast disponível",
      icon: "📺",
    },
    {
      step: 4,
      title: "Confirme a Conexão",
      description: "Sua tela será transmitida para a TV",
      icon: "✓",
    },
  ];

  const iosSteps = [
    {
      step: 1,
      title: "Abra o Control Center",
      description: "Deslize para baixo a partir do canto superior direito",
      icon: "📱",
    },
    {
      step: 2,
      title: "Toque em 'Screen Mirroring'",
      description: "Procure pelo ícone de espelhamento",
      icon: "🔍",
    },
    {
      step: 3,
      title: "Selecione a TV",
      description: "Escolha o Apple TV ou AirPlay disponível",
      icon: "📺",
    },
    {
      step: 4,
      title: "Insira o Código (se solicitado)",
      description: "Digite o código exibido na TV",
      icon: "🔐",
    },
  ];

  const samsungSteps = [
    {
      step: 1,
      title: "Abra o Painel de Controle",
      description: "Deslize para baixo a partir do topo",
      icon: "📱",
    },
    {
      step: 2,
      title: "Toque em 'Smart View'",
      description: "Pode estar em 'Conexões'",
      icon: "🔍",
    },
    {
      step: 3,
      title: "Selecione a TV Samsung",
      description: "Escolha a TV disponível",
      icon: "📺",
    },
    {
      step: 4,
      title: "Confirme na TV",
      description: "Aceite a conexão na TV se solicitado",
      icon: "✓",
    },
  ];

  const StepCard = ({ step, title, description, icon }: any) => (
    <View style={styles.stepCard}>
      <View style={styles.stepNumber}>
        <ThemedText style={styles.stepNumberText}>{step}</ThemedText>
      </View>
      <View style={styles.stepContent}>
        <ThemedText style={styles.stepIcon}>{icon}</ThemedText>
        <View style={styles.stepTextContainer}>
          <ThemedText style={styles.stepTitle}>{title}</ThemedText>
          <ThemedText style={styles.stepDescription}>{description}</ThemedText>
        </View>
      </View>
    </View>
  );

  const MethodButton = ({ label, value }: any) => (
    <Pressable
      style={[
        styles.methodButton,
        selectedMethod === value && styles.methodButtonActive,
      ]}
      onPress={() => setSelectedMethod(value)}
    >
      <ThemedText
        style={[
          styles.methodButtonText,
          selectedMethod === value && styles.methodButtonTextActive,
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>📡 Screen Mirroring</ThemedText>
          <Pressable onPress={onClose}>
            <ThemedText style={styles.closeButton}>✕</ThemedText>
          </Pressable>
        </View>

        <ScrollView style={styles.content}>
          <ThemedText style={styles.subtitle}>
            Espelhe a tela do seu celular na TV sem modificar o app
          </ThemedText>

          <View style={styles.methodsContainer}>
            <MethodButton label="Android" value="android" />
            <MethodButton label="Samsung" value="samsung" />
            <MethodButton label="iOS" value="ios" />
          </View>

          {selectedMethod === "android" && (
            <View style={styles.stepsContainer}>
              <ThemedText style={styles.methodTitle}>Android - Transmitir Tela</ThemedText>
              {androidSteps.map((item, index) => (
                <StepCard key={index} {...item} />
              ))}
            </View>
          )}

          {selectedMethod === "samsung" && (
            <View style={styles.stepsContainer}>
              <ThemedText style={styles.methodTitle}>Samsung - Smart View</ThemedText>
              {samsungSteps.map((item, index) => (
                <StepCard key={index} {...item} />
              ))}
            </View>
          )}

          {selectedMethod === "ios" && (
            <View style={styles.stepsContainer}>
              <ThemedText style={styles.methodTitle}>iOS - Screen Mirroring</ThemedText>
              {iosSteps.map((item, index) => (
                <StepCard key={index} {...item} />
              ))}
            </View>
          )}

          <View style={styles.tipsContainer}>
            <ThemedText style={styles.tipsTitle}>💡 Dicas Importantes</ThemedText>
            <ThemedText style={styles.tipText}>
              • Celular e TV devem estar na mesma rede WiFi
            </ThemedText>
            <ThemedText style={styles.tipText}>
              • A TV deve suportar Miracast, AirPlay ou Smart View
            </ThemedText>
            <ThemedText style={styles.tipText}>
              • Pode haver pequeno delay na transmissão
            </ThemedText>
            <ThemedText style={styles.tipText}>
              • Notificações e alertas aparecerão na TV
            </ThemedText>
            <ThemedText style={styles.tipText}>
              • Use modo landscape para melhor visualização
            </ThemedText>
          </View>

          <View style={styles.benefitsContainer}>
            <ThemedText style={styles.benefitsTitle}>✅ Benefícios</ThemedText>
            <ThemedText style={styles.benefitText}>
              • Não precisa modificar o app
            </ThemedText>
            <ThemedText style={styles.benefitText}>
              • Funciona com qualquer app
            </ThemedText>
            <ThemedText style={styles.benefitText}>
              • Setup rápido e simples
            </ThemedText>
            <ThemedText style={styles.benefitText}>
              • Compatível com a maioria das TVs
            </ThemedText>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={styles.closeButtonLarge} onPress={onClose}>
            <ThemedText style={styles.closeButtonLargeText}>Fechar</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 28,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
    lineHeight: 20,
  },
  methodsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    alignItems: "center",
  },
  methodButtonActive: {
    backgroundColor: "#007AFF",
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  methodButtonTextActive: {
    color: "#FFFFFF",
  },
  stepsContainer: {
    marginBottom: 24,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  stepCard: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 12,
    padding: 12,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  stepContent: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  stepIcon: {
    fontSize: 24,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 18,
  },
  tipsContainer: {
    backgroundColor: "#FFF3CD",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 6,
  },
  benefitsContainer: {
    backgroundColor: "#D4EDDA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 6,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  closeButtonLarge: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  closeButtonLargeText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
