import { desc, eq, leftJoin } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  attendanceStatusHistory,
  attendances,
  InsertUser,
  notificationLogs,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

type DbAttendanceStatus = "arrival" | "waiting" | "in_service" | "completed";
type AttendanceHistoryChangeType = "created" | "status_changed" | "deleted" | "governance_updated";
type AttendanceHistoryActorRole = "system" | "operator" | "admin";
type DelayReason =
  | "none"
  | "customer_unavailable"
  | "parts_wait"
  | "approval_pending"
  | "high_demand"
  | "diagnosis_extended"
  | "system_issue"
  | "other";

type HistoryActor = {
  userId?: number;
  role: AttendanceHistoryActorRole;
};

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

async function recordAttendanceHistory(input: {
  attendanceId: number;
  fromStatus?: DbAttendanceStatus | null;
  toStatus: DbAttendanceStatus;
  changeType: AttendanceHistoryChangeType;
  actor?: HistoryActor;
  note?: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.insert(attendanceStatusHistory).values({
    attendanceId: input.attendanceId,
    fromStatus: input.fromStatus ?? null,
    toStatus: input.toStatus,
    changeType: input.changeType,
    changedByUserId: input.actor?.userId,
    changedByRole: input.actor?.role ?? "system",
    note: input.note,
  });
}

async function recordNotificationLog(input: {
  attendanceId: number;
  status: DbAttendanceStatus;
  phoneNumber?: string;
  success: boolean;
  providerMessageSid?: string;
  errorMessage?: string;
  actor?: HistoryActor;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.insert(notificationLogs).values({
    attendanceId: input.attendanceId,
    channel: "whatsapp",
    status: input.status,
    phoneNumber: input.phoneNumber,
    success: input.success,
    providerMessageSid: input.providerMessageSid,
    errorMessage: input.errorMessage,
    triggeredByUserId: input.actor?.userId,
    triggeredByRole: input.actor?.role ?? "system",
  });
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user by id: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return [];
  }

  return db
    .select({
      id: users.id,
      openId: users.openId,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      lastSignedIn: users.lastSignedIn,
      loginMethod: users.loginMethod,
    })
    .from(users)
    .orderBy(desc(users.lastSignedIn), desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const currentUser = await getUserById(userId);
  if (!currentUser) {
    throw new Error("User not found");
  }

  if (currentUser.openId === ENV.ownerOpenId && role !== "admin") {
    throw new Error("Owner role cannot be changed");
  }

  await db.update(users).set({ role }).where(eq(users.id, userId));
  return getUserById(userId);
}

export async function getAllAttendances() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get attendances: database not available");
    return [];
  }

  return db.select().from(attendances);
}

export async function getAttendanceHistory(attendanceId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get attendance history: database not available");
    return [];
  }

  return db
    .select({
      id: attendanceStatusHistory.id,
      attendanceId: attendanceStatusHistory.attendanceId,
      fromStatus: attendanceStatusHistory.fromStatus,
      toStatus: attendanceStatusHistory.toStatus,
      changeType: attendanceStatusHistory.changeType,
      changedByUserId: attendanceStatusHistory.changedByUserId,
      changedByRole: attendanceStatusHistory.changedByRole,
      changedByName: users.name,
      changedByEmail: users.email,
      note: attendanceStatusHistory.note,
      createdAt: attendanceStatusHistory.createdAt,
    })
    .from(attendanceStatusHistory)
    .leftJoin(users, eq(attendanceStatusHistory.changedByUserId, users.id))
    .where(eq(attendanceStatusHistory.attendanceId, attendanceId))
    .orderBy(desc(attendanceStatusHistory.createdAt), desc(attendanceStatusHistory.id));
}

export async function getNotificationLogs(filters?: { startAt?: Date; endAt?: Date; onlyFailures?: boolean }) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get notification logs: database not available");
    return [];
  }

  const rows = await db
    .select({
      id: notificationLogs.id,
      attendanceId: notificationLogs.attendanceId,
      channel: notificationLogs.channel,
      status: notificationLogs.status,
      phoneNumber: notificationLogs.phoneNumber,
      success: notificationLogs.success,
      providerMessageSid: notificationLogs.providerMessageSid,
      errorMessage: notificationLogs.errorMessage,
      triggeredByUserId: notificationLogs.triggeredByUserId,
      triggeredByRole: notificationLogs.triggeredByRole,
      triggeredByName: users.name,
      triggeredByEmail: users.email,
      createdAt: notificationLogs.createdAt,
    })
    .from(notificationLogs)
    .leftJoin(users, eq(notificationLogs.triggeredByUserId, users.id))
    .orderBy(desc(notificationLogs.createdAt), desc(notificationLogs.id));

  return rows.filter((row) => {
    const createdAt = row.createdAt ? new Date(row.createdAt).getTime() : Date.now();
    if (filters?.startAt && createdAt < filters.startAt.getTime()) return false;
    if (filters?.endAt && createdAt > filters.endAt.getTime()) return false;
    if (filters?.onlyFailures && row.success) return false;
    return true;
  });
}

export async function getNotificationHealthSummary(filters?: { startAt?: Date; endAt?: Date }) {
  const rows = await getNotificationLogs(filters);
  const totalAttempts = rows.length;
  const successfulAttempts = rows.filter((row) => row.success).length;
  const failedAttempts = totalAttempts - successfulAttempts;
  const successRate = totalAttempts > 0 ? Math.round((successfulAttempts / totalAttempts) * 100) : 0;
  const latestFailures = rows.filter((row) => !row.success).slice(0, 6);

  return {
    totalAttempts,
    successfulAttempts,
    failedAttempts,
    successRate,
    latestFailures,
  };
}

export async function getPublicLiveAttendances() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get public attendances: database not available");
    return [];
  }

  return db
    .select({
      id: attendances.id,
      licensePlate: attendances.licensePlate,
      vehicleModel: attendances.vehicleModel,
      customerName: attendances.customerName,
      status: attendances.status,
      serviceType: attendances.serviceType,
      createdAt: attendances.createdAt,
      updatedAt: attendances.updatedAt,
    })
    .from(attendances);
}

export async function createAttendance(
  data: {
    licensePlate: string;
    vehicleModel: string;
    serviceType: "tire" | "corrective" | "preventive";
    customerName?: string;
    customerPhone?: string;
    description?: string;
  },
  actor?: HistoryActor,
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const inserted = await db
    .insert(attendances)
    .values({
      licensePlate: data.licensePlate,
      vehicleModel: data.vehicleModel,
      serviceType: data.serviceType,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      description: data.description,
      status: "arrival",
      whatsappNotificationSent: "none",
      delayReason: "none",
      slaExceptionActive: false,
    })
    .$returningId();

  const attendanceId = inserted[0]?.id;
  if (attendanceId) {
    await recordAttendanceHistory({
      attendanceId,
      fromStatus: null,
      toStatus: "arrival",
      changeType: "created",
      actor,
      note: "Atendimento criado no painel administrativo.",
    });
  }

  return inserted;
}

export async function updateAttendanceGovernance(
  id: number,
  input: {
    delayReason: DelayReason;
    operationalNote?: string;
    slaExceptionActive: boolean;
    slaExceptionReason?: string;
  },
  actor?: HistoryActor,
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(attendances).where(eq(attendances.id, id)).limit(1);
  const attendance = result[0];

  if (!attendance) {
    throw new Error("Attendance not found");
  }

  const normalizedOperationalNote = input.operationalNote?.trim() || null;
  const normalizedSlaExceptionReason = input.slaExceptionActive ? input.slaExceptionReason?.trim() || null : null;
  const changes: string[] = [];

  if (attendance.delayReason !== input.delayReason) {
    changes.push(`Motivo de atraso: ${attendance.delayReason} → ${input.delayReason}`);
  }
  if ((attendance.operationalNote || null) !== normalizedOperationalNote) {
    changes.push(normalizedOperationalNote ? "Nota operacional atualizada" : "Nota operacional removida");
  }
  if (Boolean(attendance.slaExceptionActive) !== Boolean(input.slaExceptionActive)) {
    changes.push(input.slaExceptionActive ? "Exceção de SLA ativada" : "Exceção de SLA removida");
  }
  if ((attendance.slaExceptionReason || null) !== normalizedSlaExceptionReason) {
    changes.push(normalizedSlaExceptionReason ? "Motivo da exceção SLA atualizado" : "Motivo da exceção SLA removido");
  }

  if (!changes.length) {
    return attendance;
  }

  await db
    .update(attendances)
    .set({
      delayReason: input.delayReason,
      operationalNote: normalizedOperationalNote,
      slaExceptionActive: input.slaExceptionActive,
      slaExceptionReason: normalizedSlaExceptionReason,
    })
    .where(eq(attendances.id, id));

  await recordAttendanceHistory({
    attendanceId: attendance.id,
    fromStatus: attendance.status,
    toStatus: attendance.status,
    changeType: "governance_updated",
    actor,
    note: changes.join(" • "),
  });

  const updated = await db.select().from(attendances).where(eq(attendances.id, id)).limit(1);
  return updated[0];
}

export async function deleteAttendance(id: number, actor?: HistoryActor) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(attendances).where(eq(attendances.id, id)).limit(1);
  const attendance = result[0];

  if (!attendance) {
    throw new Error("Attendance not found");
  }

  await recordAttendanceHistory({
    attendanceId: attendance.id,
    fromStatus: attendance.status,
    toStatus: attendance.status,
    changeType: "deleted",
    actor,
    note: "Atendimento removido do painel administrativo.",
  });

  await db.delete(attendances).where(eq(attendances.id, id));
}

export async function updateAttendanceStatusWithWhatsApp(
  id: number,
  status: DbAttendanceStatus,
  sendWhatsApp: boolean = true,
  actor?: HistoryActor,
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(attendances).where(eq(attendances.id, id)).limit(1);
  const attendance = result[0];

  if (!attendance) {
    throw new Error("Attendance not found");
  }

  const previousStatus = attendance.status;
  await db.update(attendances).set({ status }).where(eq(attendances.id, id));

  if (previousStatus !== status) {
    await recordAttendanceHistory({
      attendanceId: attendance.id,
      fromStatus: previousStatus,
      toStatus: status,
      changeType: "status_changed",
      actor,
      note: `Status alterado de ${previousStatus} para ${status}.`,
    });
  }

  if (sendWhatsApp && attendance.customerPhone) {
    const { sendStatusNotification } = await import("./whatsapp-service");
    const notificationResult = await sendStatusNotification(
      attendance.customerPhone,
      status,
      attendance.licensePlate,
      attendance.customerName || undefined,
    );

    await recordNotificationLog({
      attendanceId: attendance.id,
      status,
      phoneNumber: attendance.customerPhone,
      success: notificationResult.success,
      providerMessageSid: notificationResult.messageSid,
      errorMessage: notificationResult.error,
      actor,
    });

    if (notificationResult.success) {
      await db.update(attendances).set({ whatsappNotificationSent: status }).where(eq(attendances.id, id));
    } else {
      console.error("[WhatsApp] Falha registrada no log de notificações:", notificationResult.error);
    }
  }
}
