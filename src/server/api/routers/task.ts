import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { tasks } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const taskRouter = createTRPCRouter({
  latestTask: publicProcedure.query(async ({ ctx }) => {
    const task = await ctx.db.query.tasks.findFirst({
      orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
    });
    return task;
  }),
  getTasks: publicProcedure.query(async ({ ctx }) => {
    const tasks = await ctx.db.query.tasks.findMany({
      with: {
        assignees: true,
        attachments: true,
        reporter: true,
        parentTask: true,
      },
    });
    return tasks;
  }),

  createTask: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        startDate: z.date().optional(),
        dueDate: z.date().optional(),
        status: z.enum(["Backlog", "ToDo", "InProgress", "Review", "Hold", "Done"]).default("Backlog"),
        label: z.string().optional(),
        reporterId: z.number(),
        parentTaskId: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.insert(tasks).values(input);
      return task;
    }),

  updateTask: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db
        .update(tasks)
        .set(input)
        .where(eq(tasks.id, input.id));
      return task;
    }),

  deleteTask: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.delete(tasks).where(eq(tasks.id, input.id));
      return task;
    }),
});
