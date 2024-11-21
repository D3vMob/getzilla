import z from "node_modules/zod/lib";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const userRouter = createTRPCRouter({
  getUsers: publicProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.query.users.findMany({
      with: {
        tasksWhereAssignee: true,
        tasksWhereAssigner: true,
        reportedTasks: true,
      },
    });
    return users;
  }),
  createUser: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        clerkId: z.string(),
        nickname: z.string().optional(),
        personalInfo: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.insert(users).values({
        ...input,
        clerkId: input.clerkId,
      });
      return user;
    }),
  updateUser: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        email: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db
        .update(users)
        .set(input)
        .where(eq(users.id, input.id));
      return user;
    }),
  deleteUser: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.delete(users).where(eq(users.id, input.id));
      return user;
    }),
  getUserById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
        with: {
          tasksWhereAssignee: true,
          tasksWhereAssigner: true,
          reportedTasks: true,
        },
      });
    }),
});
