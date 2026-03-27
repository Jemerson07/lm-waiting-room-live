/**
 * Botão de Google Cast
 * Permite transmitir a tela Live para TVs com Chromecast
 */

import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Modal, FlatList, Alert } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useGoogleCast } from "@/hooks/use-google-cast";

export function GoogleCastButton() {
  const { isAvailable, isConnected, currentDevice, connect, disconnect, castURL } = useGoogleCast();
  const [showDeviceList, setShowDeviceList] = useState(false);
  const [mockDevices] = useState([
    { id: "1", name: "Sala de Atendimento", model: "Chromecast" },
    { id: "2", name: "Recepção", model: "Google TV" },
    { id: "3", name: "Oficina", model: "Chromecast Ultra" },
  ]);

  if (!isAvailable) {
    return null;
  }

  const handleConnect = async (deviceId: string) => {
    await connect(deviceId);
    setShowDeviceList(false);
  };

  const handleCastLive = async () => {
    const liveUrl = `${window.location.origin}/tv-display`;
    await castURL(liveUrl);
    Alert.alert("Sucesso", "Transmitindo tela Live para a TV");
  };

  return (
    <>
      {isConnected && currentDevice ? (
        <Pressable
          style={[styles.button, styles.buttonConnected]}
          onPress={() => {
            Alert.alert(
              "Conectado",
              `Transmitindo para: ${currentDevice.name}`,
              [
                { text: "Desconectar", onPress: disconnect, style: "destructive" },
                { text: "Transmitir Live", onPress: handleCastLive },
                { text: "Cancelar", style: "cancel" },
              ]
            );
          }}
        >
          <ThemedText style={styles.buttonText}>📺 {currentDevice.name}</ThemedText>
        </Pressable>
      ) : (
        <Pressable
          style={styles.button}
          onPress={() => setShowDeviceList(true)}
        >
          <ThemedText style={styles.buttonText}>📺 Transmitir para TV</ThemedText>
        </Pressable>
      )}

      <Modal
        visible={showDeviceList}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDeviceList(false)}
      >
        <ThemedView style={styles.modal}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Selecione um Dispositivo</ThemedText>
            <Pressable onPress={() => setShowDeviceList(false)}>
              <ThemedText style={styles.closeButton}>✕</ThemedText>
            </Pressable>
          </View>

          <FlatList
            data={mockDevices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={styles.deviceItem}
                onPress={() => handleConnect(item.id)}
              >
                <View style={styles.deviceInfo}>
                  <ThemedText style={styles.deviceName}>{item.name}</ThemedText>
                  <ThemedText style={styles.deviceModel}>{item.model}</ThemedText>
                </View>
                <ThemedText style={styles.deviceIcon}>→</ThemedText>
              </Pressable>
            )}
          />

          <View style={styles.modalFooter}>
            <ThemedText style={styles.infoText}>
              💡 Certifique-se de que a TV está ligada e conectada à mesma rede WiFi
            </ThemedText>
          </View>
        </ThemedView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  buttonConnected: {
    backgroundColor: "#51CF66",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
  modal: {
    flex: 1,
    paddingTop: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 24,
    fontWeight: "bold",
  },
  deviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  deviceModel: {
    fontSize: 13,
    opacity: 0.6,
  },
  deviceIcon: {
    fontSize: 18,
    opacity: 0.5,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  infoText: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 20,
  },
});
