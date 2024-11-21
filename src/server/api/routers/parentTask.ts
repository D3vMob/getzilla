import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { parentTasks } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const parentTaskRouter = createTRPCRouter({
  getParentTasks: publicProcedure.query(async ({ ctx }) => {
    const parentTasks = await ctx.db.query.parentTasks.findMany({
      with: {
        subtasks: true,
        reporter: true,
      },
    });
    return parentTasks;
  }),
  createParentTask: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        status: z.enum(["Backlog", "ToDo", "InProgress", "Review", "Hold", "Done"]).default("Backlog"),
        reporterId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const parentTask = await ctx.db.insert(parentTasks).values(input);
      return parentTask;
    }),
  updateParentTask: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const parentTask = await ctx.db
        .update(parentTasks)
        .set(input)
        .where(eq(parentTasks.id, input.id));
      return parentTask;
    }),
  deleteParentTask: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const parentTask = await ctx.db
        .delete(parentTasks)
        .where(eq(parentTasks.id, input.id));
      return parentTask;
    }),
});
