/**
 * Componente de notificação de conclusão para tela TV
 * Mostra mensagem quando um atendimento é finalizado
 */

import React, { useEffect, useState } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { ThemedText } from "@/components/themed-text";

interface CompletionNotificationProps {
  customerName: string;
  licensePlate: string;
  isVisible: boolean;
  onHide: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function CompletionNotification({
  customerName,
  licensePlate,
  isVisible,
  onHide,
}: CompletionNotificationProps) {
  const [slideAnim] = useState(new Animated.Value(-300));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isVisible) {
      // Animar entrada
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide após 5 segundos
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -300,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide();
        });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, slideAnim, opacityAnim, onHide]);

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <ThemedText style={styles.icon}>✓</ThemedText>
        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>Atendimento Concluído!</ThemedText>
          <ThemedText style={styles.message}>
            O veículo {licensePlate} do {customerName || "cliente"} foi concluído
          </ThemedText>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 80,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00C853",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
});
