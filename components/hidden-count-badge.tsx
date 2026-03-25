/**
 * Badge que mostra quantos atendimentos estão ocultos
 * Aparece como uma nuvem com número quando há mais de 30 atendimentos
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";

interface HiddenCountBadgeProps {
  count: number;
}

export function HiddenCountBadge({ count }: HiddenCountBadgeProps) {
  if (count <= 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.cloud}>
        <ThemedText style={styles.text}>{count}</ThemedText>
      </View>
      <ThemedText style={styles.label}>ocultos</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  cloud: {
    backgroundColor: "#FFA500",
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  text: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  label: {
    fontSize: 14,
    color: "#FFA500",
    fontWeight: "600",
  },
});
