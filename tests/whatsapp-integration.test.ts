import { describe, it, expect } from "vitest";

describe("WhatsApp Integration", () => {
  it("should have Twilio credentials configured", () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    expect(accountSid).toBeDefined();
    expect(authToken).toBeDefined();
    expect(whatsappNumber).toBeDefined();

    // Validate format
    expect(accountSid).toMatch(/^AC[a-z0-9]{32}$/i);
    expect(authToken?.length).toBeGreaterThan(20);
    expect(whatsappNumber).toMatch(/^\+\d{1,3}\s?\d{1,14}$/);
  });

  it("should format phone numbers correctly", () => {
    const formatPhoneNumber = (phone: string): string => {
      // Remove non-numeric characters except +
      const cleaned = phone.replace(/[^\d+]/g, "");
      // Ensure it starts with +
      return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
    };

    expect(formatPhoneNumber("11987654321")).toBe("+11987654321");
    expect(formatPhoneNumber("+55 11 98765-4321")).toBe("+5511987654321");
    expect(formatPhoneNumber("(11) 9 8765-4321")).toBe("+11987654321");
  });

  it("should create valid WhatsApp message templates", () => {
    const templates = {
      arrival: (licensePlate: string, customerName: string) =>
        `Olá ${customerName}! 👋\n\nSeu veículo *${licensePlate}* chegou! Estamos preparando o atendimento. ⏳`,
      waiting: (licensePlate: string, customerName: string) =>
        `Olá ${customerName}! 📋\n\nSeu veículo *${licensePlate}* está na fila. Em breve iniciaremos o atendimento.`,
      in_service: (licensePlate: string, customerName: string) =>
        `Olá ${customerName}! 🔧\n\nSeu veículo *${licensePlate}* está sendo atendido agora.`,
      completed: (licensePlate: string, customerName: string) =>
        `Olá ${customerName}! ✅\n\nAtendimento do veículo *${licensePlate}* concluído! Obrigado pela confiança. 🙏`,
    };

    const message = templates.arrival("ABC-1234", "João");
    expect(message).toContain("ABC-1234");
    expect(message).toContain("João");
    expect(message.length).toBeGreaterThan(0);
    expect(message.length).toBeLessThan(1000); // WhatsApp limit
  });
});
