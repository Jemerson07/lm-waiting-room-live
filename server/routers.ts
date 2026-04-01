import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, operatorProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  users: router({
    list: adminProcedure.query(async () => {
      return db.getAllUsers();
    }),
    updateRole: adminProcedure
      .input(
        z.object({
          userId: z.number(),
          role: z.enum(["user", "admin"]),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.id === input.userId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Você não pode alterar seu próprio papel." });
        }

        const updatedUser = await db.updateUserRole(input.userId, input.role);
        return { success: true, user: updatedUser };
      }),
  }),
  attendances: router({
    liveList: publicProcedure.query(async () => {
      return db.getPublicLiveAttendances();
    }),
    manageList: operatorProcedure.query(async () => {
      return db.getAllAttendances();
    }),
    create: operatorProcedure
      .input(
        z.object({
          licensePlate: z.string(),
          vehicleModel: z.string(),
          serviceType: z.enum(["tire", "corrective", "preventive"]),
          customerName: z.string().optional(),
          customerPhone: z.string().optional(),
          description: z.string().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        return db.createAttendance(input);
      }),
    updateStatus: operatorProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["arrival", "waiting", "in_service", "completed"]),
          sendWhatsApp: z.boolean().optional().default(true),
        }),
      )
      .mutation(async ({ input }) => {
        await db.updateAttendanceStatusWithWhatsApp(input.id, input.status, input.sendWhatsApp);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAttendance(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
