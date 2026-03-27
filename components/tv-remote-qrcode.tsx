/**
 * Componente de QR Code para controle remoto da TV
 * Permite que o celular controle a tela Live na TV
 */

import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Share } from "react-native";
import { ThemedText } from "@/components/themed-text";

interface TVRemoteQRCodeProps {
  tvUrl: string;
  onClose?: () => void;
}

export function TVRemoteQRCode({ tvUrl, onClose }: TVRemoteQRCodeProps) {
  const [qrCode, setQrCode] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Gerar QR Code usando API externa
    const generateQRCode = async () => {
      try {
        const encodedUrl = encodeURIComponent(tvUrl);
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUrl}`;
        setQrCode(qrUrl);
      } catch (error) {
        console.error("Erro ao gerar QR Code:", error);
      }
    };

    generateQRCode();
  }, [tvUrl]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(tvUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Erro ao copiar link:", error);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Tela Live - LM Sala de Espera",
          text: "Acesse a tela Live da oficina",
          url: tvUrl,
        });
      } else {
        handleCopyLink();
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>📺 Controle Remoto da TV</ThemedText>
        <ThemedText style={styles.subtitle}>Escaneie o QR Code ou acesse o link</ThemedText>
      </View>

      <View style={styles.content}>
        {/* QR Code */}
        {qrCode && (
          <View style={styles.qrContainer}>
            <img src={qrCode} alt="QR Code" style={styles.qrImage} />
            <ThemedText style={styles.qrLabel}>Escaneie com seu celular</ThemedText>
          </View>
        )}

        {/* Link */}
        <View style={styles.linkContainer}>
          <ThemedText style={styles.linkLabel}>Ou acesse o link:</ThemedText>
          <View style={styles.linkBox}>
            <ThemedText style={styles.linkText} numberOfLines={2}>
              {tvUrl}
            </ThemedText>
          </View>
        </View>

        {/* Botões */}
        <View style={styles.buttons}>
          <Pressable style={styles.button} onPress={handleCopyLink}>
            <ThemedText style={styles.buttonText}>
              {copied ? "✓ Copiado!" : "📋 Copiar Link"}
            </ThemedText>
          </Pressable>

          <Pressable style={[styles.button, styles.buttonSecondary]} onPress={handleShare}>
            <ThemedText style={styles.buttonText}>📤 Compartilhar</ThemedText>
          </Pressable>
        </View>

        {/* Instruções */}
        <View style={styles.instructions}>
          <ThemedText style={styles.instructionTitle}>Como usar:</ThemedText>
          <ThemedText style={styles.instructionText}>
            1. Abra a câmera do seu celular
          </ThemedText>
          <ThemedText style={styles.instructionText}>
            2. Aponte para o QR Code
          </ThemedText>
          <ThemedText style={styles.instructionText}>
            3. Clique no link que aparecer
          </ThemedText>
          <ThemedText style={styles.instructionText}>
            4. A tela Live será exibida no seu celular
          </ThemedText>
        </View>
      </View>

      {onClose && (
        <Pressable style={styles.closeButton} onPress={onClose}>
          <ThemedText style={styles.closeButtonText}>Fechar</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: 24,
  },
  qrContainer: {
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    padding: 24,
  },
  qrImage: {
    width: 300,
    height: 300,
    borderRadius: 12,
    marginBottom: 12,
  },
  qrLabel: {
    fontSize: 14,
    color: "#666",
  },
  linkContainer: {
    gap: 8,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  linkBox: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  linkText: {
    fontSize: 12,
    color: "#0052A3",
    fontFamily: "monospace",
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonSecondary: {
    backgroundColor: "#34C759",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  instructions: {
    backgroundColor: "#F0F8FF",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0052A3",
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 20,
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
});
