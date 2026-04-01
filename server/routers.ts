import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
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
  attendances: router({
    liveList: publicProcedure.query(async () => {
      return db.getPublicLiveAttendances();
    }),
    manageList: protectedProcedure.query(async () => {
      return db.getAllAttendances();
    }),
    create: protectedProcedure
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
    updateStatus: protectedProcedure
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
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAttendance(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
