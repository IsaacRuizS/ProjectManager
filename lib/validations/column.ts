import { z } from "zod";

export const createColumnSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  color: z.string().optional(),
});

export const updateColumnSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().optional(),
  order: z.number().int().min(0).optional(),
});
