import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  start_date: z.coerce.date(),
  due_date: z.coerce.date(),
  members: z.array(z.string()).default([]),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  status: z.enum(["active", "paused", "finished"]).optional(),
});
