import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { taskAssignees } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const taskAssigneeRouter = createTRPCRouter({
  getTaskAssignees: publicProcedure.query(async ({ ctx }) => {
    const taskAssignees = await ctx.db.query.taskAssignees.findMany();
    return taskAssignees;
  }),
  createTaskAssignee: publicProcedure
    .input(
      z.object({
        taskId: z.number(),
        userId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const taskAssignee = await ctx.db.insert(taskAssignees).values(input);
      return taskAssignee;
    }),
  updateTaskAssignee: publicProcedure
    .input(
      z.object({
        id: z.number(),
        taskId: z.number(),
        userId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const taskAssignee = await ctx.db
        .update(taskAssignees)
        .set(input)
        .where(eq(taskAssignees.id, input.id));
      return taskAssignee;
    }),
  deleteTaskAssignee: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const taskAssignee = await ctx.db
        .delete(taskAssignees)
        .where(eq(taskAssignees.id, input.id));
      return taskAssignee;
    }),
});
