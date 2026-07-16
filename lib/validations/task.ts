import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  description: z.string().optional(),
  project_id: z.string().min(1),
  column_id: z.string().min(1),
  assignee_id: z.string().min(1),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  due_date: z.coerce.date().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  assignee_id: z.string().min(1).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  due_date: z.coerce.date().optional(),
});

export const moveTaskSchema = z.object({
  column_id: z.string().min(1),
  order: z.number().int().min(0),
});
