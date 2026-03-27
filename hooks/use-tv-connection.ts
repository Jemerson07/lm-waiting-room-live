/**
 * Hook para conexão com TV via WebSocket
 * Método simples e funcional para transmitir dados em tempo real
 */

import { useEffect, useState, useCallback, useRef } from "react";

interface TVConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  tvUrl: string;
  qrCodeUrl: string;
}

export function useTVConnection() {
  const [state, setState] = useState<TVConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    tvUrl: "",
    qrCodeUrl: "",
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Gerar URL única para TV
  const generateTVUrl = useCallback(() => {
    const baseUrl = window.location.origin;
    const tvPath = "/tv-display";
    const fullUrl = `${baseUrl}${tvPath}`;
    
    setState((prev) => ({
      ...prev,
      tvUrl: fullUrl,
      qrCodeUrl: fullUrl, // Será usado para gerar QR code
    }));

    return fullUrl;
  }, []);

  // Conectar ao WebSocket
  const connectToTV = useCallback(() => {
    if (state.isConnecting || state.isConnected) return;

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws/tv`;

      console.log("[TV Connection] Conectando a:", wsUrl);

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("[TV Connection] Conectado com sucesso");
        setState((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
        }));
      };

      wsRef.current.onmessage = (event) => {
        console.log("[TV Connection] Mensagem recebida:", event.data);
      };

      wsRef.current.onerror = (error) => {
        console.error("[TV Connection] Erro:", error);
        setState((prev) => ({
          ...prev,
          error: "Erro ao conectar com a TV",
          isConnecting: false,
        }));
      };

      wsRef.current.onclose = () => {
        console.log("[TV Connection] Desconectado");
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));

        // Tentar reconectar após 5 segundos
        reconnectTimeoutRef.current = setTimeout(() => {
          connectToTV();
        }, 5000);
      };
    } catch (error) {
      console.error("[TV Connection] Erro ao conectar:", error);
      setState((prev) => ({
        ...prev,
        error: String(error),
        isConnecting: false,
      }));
    }
  }, [state.isConnecting, state.isConnected]);

  // Desconectar
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    setState((prev) => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
    }));
  }, []);

  // Enviar dados para TV
  const sendToTV = useCallback((data: any) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("[TV Connection] WebSocket não está conectado");
      return false;
    }

    try {
      wsRef.current.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("[TV Connection] Erro ao enviar dados:", error);
      return false;
    }
  }, []);

  // Copiar URL para clipboard
  const copyUrlToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(state.tvUrl);
      return true;
    } catch (error) {
      console.error("[TV Connection] Erro ao copiar URL:", error);
      return false;
    }
  }, [state.tvUrl]);

  // Gerar URL ao montar
  useEffect(() => {
    generateTVUrl();
  }, [generateTVUrl]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    ...state,
    connectToTV,
    disconnect,
    sendToTV,
    copyUrlToClipboard,
    generateTVUrl,
  };
}

/**
 * Hook para receber dados da TV
 */
export function useTVReceiver(onDataReceived?: (data: any) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws/tv`;

      console.log("[TV Receiver] Iniciando receptor em:", wsUrl);

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("[TV Receiver] Receptor conectado");
        setIsListening(true);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("[TV Receiver] Dados recebidos:", data);
          onDataReceived?.(data);
        } catch (error) {
          console.error("[TV Receiver] Erro ao processar dados:", error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("[TV Receiver] Erro:", error);
        setIsListening(false);
      };

      wsRef.current.onclose = () => {
        console.log("[TV Receiver] Receptor desconectado");
        setIsListening(false);
      };
    } catch (error) {
      console.error("[TV Receiver] Erro ao iniciar receptor:", error);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [onDataReceived]);

  return { isListening };
}
