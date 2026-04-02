import { desc, eq, leftJoin } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  attendanceStatusHistory,
  attendances,
  InsertUser,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

type DbAttendanceStatus = "arrival" | "waiting" | "in_service" | "completed";
type AttendanceHistoryChangeType = "created" | "status_changed" | "deleted";
type AttendanceHistoryActorRole = "system" | "operator" | "admin";

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
    try {
      const { sendStatusNotification } = await import("./whatsapp-service");
      await sendStatusNotification(
        attendance.customerPhone,
        status,
        attendance.licensePlate,
        attendance.customerName || undefined,
      );

      await db.update(attendances).set({ whatsappNotificationSent: status }).where(eq(attendances.id, id));
    } catch (error) {
      console.error("[WhatsApp] Erro ao enviar notificacao:", error);
    }
  }
}
