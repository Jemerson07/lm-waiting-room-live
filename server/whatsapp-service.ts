import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

// Inicializar cliente Twilio
const client = twilio(accountSid, authToken);

export interface WhatsAppMessage {
  to: string;
  body: string;
  mediaUrl?: string;
}

export interface WhatsAppResponse {
  success: boolean;
  messageSid?: string;
  error?: string;
}

/**
 * Formata número de telefone para o padrão internacional
 */
export function formatPhoneNumber(phone: string): string {
  // Remove caracteres especiais exceto +
  const cleaned = phone.replace(/[^\d+]/g, "");

  // Se não começar com +, adiciona
  if (!cleaned.startsWith("+")) {
    // Se começar com 55 (Brasil), mantém como está
    if (cleaned.startsWith("55")) {
      return `+${cleaned}`;
    }
    // Caso contrário, assume Brasil
    return `+55${cleaned}`;
  }

  return cleaned;
}

/**
 * Envia mensagem WhatsApp via Twilio
 */
export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
): Promise<WhatsAppResponse> {
  try {
    if (!accountSid || !authToken || !twilioWhatsappNumber) {
      return {
        success: false,
        error: "Credenciais do Twilio não configuradas",
      };
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Validar formato de telefone
    if (!formattedPhone.match(/^\+\d{1,3}\d{1,14}$/)) {
      return {
        success: false,
        error: "Formato de telefone inválido",
      };
    }

    // Validar comprimento da mensagem (WhatsApp tem limite)
    if (message.length > 4096) {
      return {
        success: false,
        error: "Mensagem muito longa (máximo 4096 caracteres)",
      };
    }

    const response = await client.messages.create({
      from: `whatsapp:${twilioWhatsappNumber}`,
      to: `whatsapp:${formattedPhone}`,
      body: message,
    });

    console.log(`[WhatsApp] Mensagem enviada para ${formattedPhone}:`, response.sid);

    return {
      success: true,
      messageSid: response.sid,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[WhatsApp] Erro ao enviar mensagem:", errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Templates de mensagens por status
 */
export const messageTemplates = {
  arrival: (licensePlate: string, customerName?: string) => {
    const greeting = customerName ? `Olá ${customerName}! 👋` : "Olá! 👋";
    return `${greeting}\n\nSeu veículo *${licensePlate}* chegou! Estamos preparando o atendimento. ⏳`;
  },

  waiting: (licensePlate: string, customerName?: string) => {
    const greeting = customerName ? `Olá ${customerName}! 📋` : "Olá! 📋";
    return `${greeting}\n\nSeu veículo *${licensePlate}* está na fila. Em breve iniciaremos o atendimento.`;
  },

  in_service: (licensePlate: string, customerName?: string) => {
    const greeting = customerName ? `Olá ${customerName}! 🔧` : "Olá! 🔧";
    return `${greeting}\n\nSeu veículo *${licensePlate}* está sendo atendido agora.`;
  },

  completed: (licensePlate: string, customerName?: string) => {
    const greeting = customerName ? `Olá ${customerName}! ✅` : "Olá! ✅";
    return `${greeting}\n\nAtendimento do veículo *${licensePlate}* concluído! Obrigado pela confiança. 🙏`;
  },
};

/**
 * Envia notificação de status via WhatsApp
 */
export async function sendStatusNotification(
  phoneNumber: string,
  status: "arrival" | "waiting" | "in_service" | "completed",
  licensePlate: string,
  customerName?: string
): Promise<WhatsAppResponse> {
  const template = messageTemplates[status];
  const message = template(licensePlate, customerName);

  return sendWhatsAppMessage(phoneNumber, message);
}
