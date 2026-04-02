import * as Auth from "@/lib/auth";

type AccessFeedbackKind = "unauthorized" | "forbidden";

export type AccessFeedback = {
  kind: AccessFeedbackKind;
  title: string;
  message: string;
  timestamp: number;
};

type Listener = (feedback: AccessFeedback) => void;

type AccessErrorCode = "UNAUTHORIZED" | "FORBIDDEN" | null;

const listeners = new Set<Listener>();
let lastFeedbackKey = "";
let lastFeedbackAt = 0;

function getErrorCode(error: unknown): AccessErrorCode {
  const maybeError = error as {
    data?: { code?: string };
    shape?: { data?: { code?: string } };
    message?: string;
  };

  const code = maybeError?.data?.code || maybeError?.shape?.data?.code;
  if (code === "UNAUTHORIZED" || code === "FORBIDDEN") {
    return code;
  }

  const message = maybeError?.message?.toUpperCase?.() || "";
  if (message.includes("UNAUTHORIZED")) return "UNAUTHORIZED";
  if (message.includes("FORBIDDEN")) return "FORBIDDEN";
  return null;
}

function emitFeedback(feedback: AccessFeedback) {
  const feedbackKey = `${feedback.kind}:${feedback.title}:${feedback.message}`;
  const now = Date.now();

  if (lastFeedbackKey === feedbackKey && now - lastFeedbackAt < 2500) {
    return;
  }

  lastFeedbackKey = feedbackKey;
  lastFeedbackAt = now;

  listeners.forEach((listener) => listener(feedback));
}

async function clearLocalSession() {
  await Auth.removeSessionToken();
  await Auth.clearUserInfo();
}

export function subscribeAccessFeedback(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function handleGlobalAccessError(
  error: unknown,
  options?: {
    onUnauthorized?: () => void | Promise<void>;
  },
) {
  const code = getErrorCode(error);

  if (!code) return false;

  if (code === "UNAUTHORIZED") {
    await clearLocalSession();
    await options?.onUnauthorized?.();
    emitFeedback({
      kind: "unauthorized",
      title: "Sessão expirada",
      message: "Sua sessão expirou ou não é mais válida. Faça login novamente para continuar usando as áreas protegidas.",
      timestamp: Date.now(),
    });
    return true;
  }

  emitFeedback({
    kind: "forbidden",
    title: "Acesso negado",
    message: "Seu perfil atual não possui permissão para executar esta ação ou visualizar este conteúdo.",
    timestamp: Date.now(),
  });
  return true;
}
