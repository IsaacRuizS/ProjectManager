import { z } from "zod";

export const createCommentSchema = z.object({
  text: z.string().min(1, "El comentario no puede estar vacío"),
});
