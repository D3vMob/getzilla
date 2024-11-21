import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";

export const userRouter = createTRPCRouter({
  updateRole: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum([
          "superuser",
          "admin",
          "manager",
          "worker",
          "external_worker",
          "consultant",
          "concierge",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // First update Clerk metadata
      await (
        await clerkClient()
      ).users.updateUserMetadata(input.userId, {
        publicMetadata: {
          role: input.role,
        },
      });

      // Then update local database
      return ctx.db
        .update(users)
        .set({
          role: input.role,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, input.userId));
    }),

  createUser: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        email: z.string().email(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Set default role as worker
      await (
        await clerkClient()
      ).users.updateUserMetadata(input.userId, {
        publicMetadata: {
          role: "worker",
        },
      });
      // Create user in local database
      return ctx.db.insert(users).values({
        clerkId: input.userId,
        email: input.email,
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
        role: "worker",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }),
});
