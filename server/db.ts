import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

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

export async function getAllAttendances() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get attendances: database not available");
    return [];
  }

  const { attendances } = await import("../drizzle/schema");
  return db.select().from(attendances);
}

export async function getPublicLiveAttendances() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get public attendances: database not available");
    return [];
  }

  const { attendances } = await import("../drizzle/schema");
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

export async function createAttendance(data: {
  licensePlate: string;
  vehicleModel: string;
  serviceType: "tire" | "corrective" | "preventive";
  customerName?: string;
  customerPhone?: string;
  description?: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { attendances } = await import("../drizzle/schema");
  return db.insert(attendances).values({
    licensePlate: data.licensePlate,
    vehicleModel: data.vehicleModel,
    serviceType: data.serviceType,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    description: data.description,
    status: "arrival",
    whatsappNotificationSent: "none",
  });
}

export async function updateAttendanceStatus(id: number, status: "arrival" | "waiting" | "in_service" | "completed") {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { attendances } = await import("../drizzle/schema");
  await db.update(attendances).set({ status }).where(eq(attendances.id, id));
}

export async function deleteAttendance(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { attendances } = await import("../drizzle/schema");
  await db.delete(attendances).where(eq(attendances.id, id));
}

export async function updateAttendanceStatusWithWhatsApp(
  id: number,
  status: "arrival" | "waiting" | "in_service" | "completed",
  sendWhatsApp: boolean = true,
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { attendances } = await import("../drizzle/schema");
  const { sendStatusNotification } = await import("./whatsapp-service");

  const result = await db.select().from(attendances).where(eq(attendances.id, id));
  const attendance = result[0];

  if (!attendance) {
    throw new Error("Attendance not found");
  }

  await db.update(attendances).set({ status }).where(eq(attendances.id, id));

  if (sendWhatsApp && attendance.customerPhone) {
    try {
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
