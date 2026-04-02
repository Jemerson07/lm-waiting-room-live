import { int, index, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

const attendanceStatusValues = ["arrival", "waiting", "in_service", "completed"] as const;
const serviceTypeValues = ["tire", "corrective", "preventive"] as const;
const whatsappNotificationValues = ["none", "arrival", "waiting", "in_service", "completed"] as const;
const attendanceHistoryChangeTypeValues = ["created", "status_changed", "deleted"] as const;

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de atendimentos veiculares
 */
export const attendances = mysqlTable(
  "attendances",
  {
    id: int("id").autoincrement().primaryKey(),
    licensePlate: varchar("licensePlate", { length: 10 }).notNull(),
    vehicleModel: varchar("vehicleModel", { length: 100 }).notNull(),
    customerName: varchar("customerName", { length: 255 }),
    customerPhone: varchar("customerPhone", { length: 20 }),
    status: mysqlEnum("status", attendanceStatusValues).default("arrival").notNull(),
    serviceType: mysqlEnum("serviceType", serviceTypeValues).notNull(),
    description: text("description"),
    whatsappNotificationSent: mysqlEnum("whatsappNotificationSent", whatsappNotificationValues)
      .default("none")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    statusIdx: index("attendances_status_idx").on(table.status),
    createdAtIdx: index("attendances_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("attendances_updated_at_idx").on(table.updatedAt),
  }),
);

export type Attendance = typeof attendances.$inferSelect;
export type InsertAttendance = typeof attendances.$inferInsert;

/**
 * Histórico de mudanças de status para auditoria e governança.
 */
export const attendanceStatusHistory = mysqlTable(
  "attendance_status_history",
  {
    id: int("id").autoincrement().primaryKey(),
    attendanceId: int("attendanceId").notNull(),
    fromStatus: mysqlEnum("fromStatus", attendanceStatusValues),
    toStatus: mysqlEnum("toStatus", attendanceStatusValues).notNull(),
    changeType: mysqlEnum("changeType", attendanceHistoryChangeTypeValues).notNull(),
    changedByUserId: int("changedByUserId"),
    changedByRole: varchar("changedByRole", { length: 32 }).notNull(),
    note: text("note"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    attendanceIdx: index("attendance_history_attendance_idx").on(table.attendanceId),
    createdAtIdx: index("attendance_history_created_at_idx").on(table.createdAt),
    changeTypeIdx: index("attendance_history_change_type_idx").on(table.changeType),
  }),
);

export type AttendanceStatusHistory = typeof attendanceStatusHistory.$inferSelect;
export type InsertAttendanceStatusHistory = typeof attendanceStatusHistory.$inferInsert;
