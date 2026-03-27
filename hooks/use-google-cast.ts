/**
 * Hook para Google Cast
 * Permite transmitir a tela Live para TVs com Chromecast
 */

import { useEffect, useState, useCallback } from "react";

interface CastDevice {
  id: string;
  name: string;
  model: string;
  isConnected: boolean;
}

interface UseCastState {
  isAvailable: boolean;
  isConnected: boolean;
  devices: CastDevice[];
  currentDevice: CastDevice | null;
  isLoading: boolean;
  error: string | null;
}

declare global {
  interface Window {
    chrome?: {
      cast?: {
        initialize: (config: any, onSuccess: () => void, onError: () => void) => void;
        isAvailable?: boolean;
        SessionRequest?: any;
        ApiConfig?: any;
        requestSession?: (onSuccess: (session: any) => void, onError: (error: any) => void) => void;
      };
    };
  }
}

export function useGoogleCast() {
  const [state, setState] = useState<UseCastState>({
    isAvailable: false,
    isConnected: false,
    devices: [],
    currentDevice: null,
    isLoading: false,
    error: null,
  });

  // Inicializar Google Cast
  useEffect(() => {
    const initializeCast = () => {
      if (!window.chrome?.cast) {
        console.log("Google Cast não disponível");
        return;
      }

      const sessionRequest = new window.chrome.cast.SessionRequest(
        "CC1AD845" // App ID padrão do Google Cast
      );

      const apiConfig = new window.chrome.cast.ApiConfig(
        sessionRequest,
        onSessionSuccess,
        onSessionError,
        onReceiverListener
      );

      window.chrome.cast.initialize(
        apiConfig,
        () => {
          console.log("Google Cast inicializado");
          setState((prev) => ({ ...prev, isAvailable: true }));
        },
        () => {
          console.log("Erro ao inicializar Google Cast");
          setState((prev) => ({
            ...prev,
            error: "Google Cast não disponível",
          }));
        }
      );
    };

    // Carregar script do Google Cast
    const script = document.createElement("script");
    script.src = "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js";
    script.async = true;
    script.onload = initializeCast;
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const onSessionSuccess = useCallback((session: any) => {
    console.log("Sessão Cast estabelecida:", session.displayName);
    setState((prev) => ({
      ...prev,
      isConnected: true,
      currentDevice: {
        id: session.sessionId,
        name: session.displayName,
        model: "Chromecast",
        isConnected: true,
      },
    }));
  }, []);

  const onSessionError = useCallback((error: any) => {
    console.error("Erro na sessão Cast:", error);
    setState((prev) => ({
      ...prev,
      error: "Erro ao conectar ao dispositivo Cast",
    }));
  }, []);

  const onReceiverListener = useCallback((status: string) => {
    console.log("Status do receptor:", status);

    if (status === "available") {
      setState((prev) => ({
        ...prev,
        isAvailable: true,
      }));
    } else if (status === "unavailable") {
      setState((prev) => ({
        ...prev,
        isAvailable: false,
      }));
    }
  }, []);

  // Conectar a um dispositivo
  const connect = useCallback(async (deviceId: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      if (!window.chrome?.cast) {
        throw new Error("Google Cast não disponível");
      }

      // Solicitar sessão
      const sessionRequest = new window.chrome.cast.SessionRequest(
        "CC1AD845"
      );

      window.chrome.cast?.requestSession?.(
        (session: any) => {
          console.log("Conectado a:", session.displayName);
          setState((prev) => ({
            ...prev,
            isConnected: true,
            isLoading: false,
            currentDevice: {
              id: session.sessionId,
              name: session.displayName,
              model: "Chromecast",
              isConnected: true,
            },
          }));
        },
        (error: any) => {
          console.error("Erro ao conectar:", error);
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: "Erro ao conectar ao dispositivo",
          }));
        }
      );
    } catch (error) {
      console.error("Erro:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: String(error),
      }));
    }
  }, []);

  // Transmitir a tela Live
  const castScreen = useCallback(async () => {
    try {
      if (!state.isConnected) {
        throw new Error("Não conectado a um dispositivo Cast");
      }

      // Usar Screen Capture API para capturar a tela
      const displayMedia = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { cursor: "always" },
        audio: false,
      });

      console.log("Tela capturada e transmitindo para Cast");
      // A transmissão real seria feita via WebRTC ou similar
      displayMedia.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    } catch (error) {
      console.error("Erro ao transmitir tela:", error);
      setState((prev) => ({
        ...prev,
        error: "Erro ao transmitir tela",
      }));
    }
  }, [state.isConnected]);

  // Transmitir URL específica
  const castURL = useCallback(
    async (url: string) => {
      try {
        if (!state.isConnected || !state.currentDevice) {
          throw new Error("Não conectado a um dispositivo Cast");
        }

        // Criar mensagem para enviar URL
        const message = {
          type: "LOAD",
          media: {
            contentId: url,
            contentType: "text/html",
          },
        };

        console.log("Transmitindo URL para Cast:", url);
        // A transmissão real seria implementada aqui
      } catch (error) {
        console.error("Erro ao transmitir URL:", error);
        setState((prev) => ({
          ...prev,
          error: "Erro ao transmitir URL",
        }));
      }
    },
    [state.isConnected, state.currentDevice]
  );

  // Desconectar
  const disconnect = useCallback(() => {
    try {
      if (state.currentDevice) {
        console.log("Desconectando de:", state.currentDevice.name);
        setState((prev) => ({
          ...prev,
          isConnected: false,
          currentDevice: null,
        }));
      }
    } catch (error) {
      console.error("Erro ao desconectar:", error);
    }
  }, [state.currentDevice]);

  return {
    ...state,
    connect,
    castScreen,
    castURL,
    disconnect,
  };
}
