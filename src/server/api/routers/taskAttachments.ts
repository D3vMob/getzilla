import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { taskAttachments } from "~/server/db/schema";

export const taskAttachmentRouter = createTRPCRouter({
    getTaskAttachments: publicProcedure.query(async ({ ctx }) => {
        const taskAttachments = await ctx.db.query.taskAttachments.findMany();
        return taskAttachments;
    }),
    createTaskAttachment: publicProcedure.input(z.object({
        taskId: z.number(),
        name: z.string(),
        url: z.string(),
    })).mutation(async ({ ctx, input }) => {
        const taskAttachment = await ctx.db.insert(taskAttachments).values(input);
        return taskAttachment;
    }),
});
