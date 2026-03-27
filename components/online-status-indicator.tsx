/**
 * Indicador de status online/offline
 * Mostra se o sistema está conectado ou trabalhando offline
 */

import React, { useEffect, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { ThemedText } from "@/components/themed-text";

export function OnlineStatusIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Animar pulsação quando offline
  useEffect(() => {
    if (!isOnline) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isOnline, pulseAnim]);

  const backgroundColor = isOnline ? "#00C853" : "#FF9800";
  const statusText = isOnline ? "Online" : "Offline";
  const icon = isOnline ? "●" : "⚠";

  return (
    <Animated.View
      style={[
        styles.container,
        !isOnline && { transform: [{ scale: pulseAnim }] },
      ]}
    >
      <View style={[styles.indicator, { backgroundColor }]}>
        <ThemedText style={styles.icon}>{icon}</ThemedText>
      </View>
      <ThemedText style={styles.text}>{statusText}</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  icon: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
});
