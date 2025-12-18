import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useCompanySettings } from "./use-company-settings";

// Configurar comportamento de notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  const { settings } = useCompanySettings();

  useEffect(() => {
    registerForPushNotifications();

    // Listener para notificações recebidas enquanto app está em foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("[Notifications] Received:", notification);
      }
    ) as any;

    // Listener para quando usuário toca na notificação
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("[Notifications] Response:", response);
      }
    ) as any;

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const registerForPushNotifications = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("[Notifications] Failed to get push token for push notification!");
        return;
      }

      console.log("[Notifications] Push notifications enabled");
    } catch (error) {
      console.error("[Notifications] Error registering:", error);
    }
  };

  const sendNotification = async (
    title: string,
    body: string,
    data?: Record<string, any>
  ) => {
    if (!settings?.notificationsEnabled) {
      console.log("[Notifications] Notifications disabled in settings");
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: settings?.soundAlertsEnabled ? "default" : undefined,
        },
        trigger: null, // Enviar imediatamente
      });

      console.log("[Notifications] Sent:", title);
    } catch (error) {
      console.error("[Notifications] Error sending:", error);
    }
  };

  const sendStatusChangeNotification = (
    licensePlate: string,
    status: string,
    statusLabel: string
  ) => {
    const messages: Record<string, { title: string; body: string }> = {
      arrival: {
        title: "Veículo Chegou",
        body: `${licensePlate} chegou. Estamos preparando o atendimento.`,
      },
      waiting: {
        title: "Aguardando Atendimento",
        body: `${licensePlate} está na fila. Em breve iniciaremos o atendimento.`,
      },
      in_service: {
        title: "Em Atendimento",
        body: `${licensePlate} está sendo atendido agora.`,
      },
      completed: {
        title: "Atendimento Concluído",
        body: `${licensePlate} está pronto! Obrigado pela confiança.`,
      },
    };

    const message = messages[status] || {
      title: "Atualização de Status",
      body: `${licensePlate} - ${statusLabel}`,
    };

    sendNotification(message.title, message.body, {
      licensePlate,
      status,
    });
  };

  return {
    sendNotification,
    sendStatusChangeNotification,
  };
}
