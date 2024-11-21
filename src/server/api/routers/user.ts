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
});
